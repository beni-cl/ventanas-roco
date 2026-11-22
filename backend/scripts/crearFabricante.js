import "dotenv/config";
import { Rol, Usuario, sequelize } from "../src/modelos/index.js";
import { hashearPassword } from "../src/servicios/autenticacion.js";
import { emailValido, passwordValida, MENSAJE_PASSWORD } from "../src/servicios/validaciones.js";

const [nombre, email, password] = process.argv.slice(2);

try {
  if (!nombre || !emailValido(email)) {
    throw new Error('Uso: node scripts/crearFabricante.js "Nombre" correo@ejemplo.cl Clave1234');
  }
  if (!passwordValida(password)) {
    throw new Error(MENSAJE_PASSWORD);
  }
  const existente = await Usuario.findOne({ where: { email } });
  if (existente) {
    throw new Error("Ya existe un usuario con ese correo");
  }
  const rol = await Rol.findOne({ where: { nombre: "Fabricante" } });
  await Usuario.create({
    nombre,
    email,
    password_hash: await hashearPassword(password),
    id_rol: rol.id_rol,
  });
  console.log(`Fabricante creado: ${email}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}