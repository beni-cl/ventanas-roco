// Rutas: /api/auth/registro, /api/auth/login, /api/auth/yo
import { Router } from "express";
import { UniqueConstraintError } from "sequelize";
import { Rol, Usuario } from "../modelos/index.js";
import {
  compararPassword,
  crearToken,
  hashearPassword,
  HASH_FALSO,
} from "../servicios/autenticacion.js";
import {
  emailValido,
  limpiarTexto,
  MENSAJE_PASSWORD,
  passwordValida,
} from "../servicios/validaciones.js";
import { verificarToken } from "../middleware/verificarToken.js";
import { limitadorLogin, limitadorRegistro } from "../middleware/limitadores.js";

const router = Router();

// Datos que sí se pueden mostrar de un usuario. NUNCA incluye password_hash.
function datosUsuario(usuario, nombreRol) {
  return {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: nombreRol,
    telefono: usuario.telefono,
    direccion: usuario.direccion,
    fecha_registro: usuario.fecha_registro,
  };
}

// ---------- POST /api/auth/registro ----------
// Cualquiera crea una cuenta, pero SIEMPRE queda como Cliente.
// Si llega "rol" (u otro campo extra) en el cuerpo, se ignora.
router.post("/registro", limitadorRegistro, async (req, res) => {
  const cuerpo = req.body ?? {};
  const nombre = limpiarTexto(cuerpo.nombre);
  const email = limpiarTexto(cuerpo.email).toLowerCase();
  const { password } = cuerpo;
  const telefono = limpiarTexto(cuerpo.telefono) || null;
  const direccion = limpiarTexto(cuerpo.direccion) || null;

  if (!nombre || nombre.length > 100) {
    return res.status(400).json({ error: "El nombre es obligatorio (máximo 100 caracteres)" });
  }
  if (!emailValido(email)) {
    return res.status(400).json({ error: "El correo no es válido" });
  }
  if (!passwordValida(password)) {
    return res.status(400).json({ error: MENSAJE_PASSWORD });
  }
  if (telefono && telefono.length > 20) {
    return res.status(400).json({ error: "El teléfono es demasiado largo (máximo 20 caracteres)" });
  }
  if (direccion && direccion.length > 150) {
    return res.status(400).json({ error: "La dirección es demasiado larga (máximo 150 caracteres)" });
  }

  // El rol lo decide el servidor, no la pantalla
  const rolCliente = await Rol.findOne({ where: { nombre: "Cliente" } });
  if (!rolCliente) throw new Error("No existe el rol Cliente. ¿Se ejecutó npm run db:migrar?");

  try {
    const usuario = await Usuario.create({
      nombre,
      email,
      password_hash: await hashearPassword(password),
      id_rol: rolCliente.id_rol,
      telefono,
      direccion,
    });
    res.status(201).json(datosUsuario(usuario, rolCliente.nombre));
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(400).json({ error: "Ya existe una cuenta con ese correo" });
    }
    throw error;
  }
});

// ---------- POST /api/auth/login ----------
// Si falla, el mensaje es SIEMPRE el mismo para no darle pistas a nadie.
const ERROR_LOGIN = "Correo o contraseña incorrectos";

router.post("/login", limitadorLogin, async (req, res) => {
  const cuerpo = req.body ?? {};
  const email = limpiarTexto(cuerpo.email).toLowerCase();
  const { password } = cuerpo;

  if (!email || typeof password !== "string" || !password) {
    return res.status(400).json({ error: "Debes enviar correo y contraseña" });
  }

  const usuario = await Usuario.findOne({
    where: { email },
    include: { model: Rol, as: "rol" },
  });

  // Se compara siempre (aunque el correo no exista) para que tarde lo mismo
  const coincide = await compararPassword(password, usuario ? usuario.password_hash : HASH_FALSO);

  if (!usuario || !coincide) {
    return res.status(401).json({ error: ERROR_LOGIN });
  }

  const datos = datosUsuario(usuario, usuario.rol.nombre);
  const token = crearToken(datos);
  res.json({
    token,
    usuario: { id_usuario: datos.id_usuario, nombre: datos.nombre, email: datos.email, rol: datos.rol },
  });
});

// ---------- GET /api/auth/yo ----------
router.get("/yo", verificarToken, async (req, res) => {
  const usuario = await Usuario.findByPk(req.usuario.id, {
    include: { model: Rol, as: "rol" },
  });
  if (!usuario) {
    return res.status(401).json({ error: "Sesión inválida o vencida" });
  }
  res.json(datosUsuario(usuario, usuario.rol.nombre));
});

export default router;
