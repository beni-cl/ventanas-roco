// Crea el primer Administrador del sistema.
// Uso: npm run admin:crear
// La contraseña NO está en el código: se pide al ejecutar (no se ve al escribir)
// o se lee de ADMIN_PASSWORD en el .env. Lo mismo con ADMIN_NOMBRE y ADMIN_EMAIL.
import "dotenv/config";
import readline from "node:readline";
import { Rol, Usuario, sequelize } from "../src/modelos/index.js";
import { hashearPassword } from "../src/servicios/autenticacion.js";
import {
  emailValido,
  limpiarTexto,
  MENSAJE_PASSWORD,
  passwordValida,
} from "../src/servicios/validaciones.js";

// Una sola interfaz de lectura para todas las preguntas.
// Las líneas se guardan en una fila, así no se pierden si llegan todas juntas.
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
const lineas = [];
const esperando = [];
let ocultar = false;

rl.on("line", (linea) => (esperando.length ? esperando.shift()(linea) : lineas.push(linea)));
rl.on("close", () => esperando.splice(0).forEach((resolver) => resolver("")));

// Cuando "ocultar" está activo no se muestra lo que se escribe (la contraseña)
const escribirOriginal = rl._writeToOutput?.bind(rl);
rl._writeToOutput = (cadena) => {
  if (!ocultar) escribirOriginal?.(cadena);
};

function preguntar(texto, { oculto = false } = {}) {
  process.stdout.write(texto);
  ocultar = oculto;
  return new Promise((resolver) => {
    const recibir = (respuesta) => {
      ocultar = false;
      if (oculto) process.stdout.write("\n");
      resolver(respuesta);
    };
    if (lineas.length) recibir(lineas.shift());
    else esperando.push(recibir);
  });
}

async function crearAdministrador() {
  const nombre = limpiarTexto(process.env.ADMIN_NOMBRE || (await preguntar("Nombre: ")));
  const email = limpiarTexto(process.env.ADMIN_EMAIL || (await preguntar("Correo: "))).toLowerCase();
  const password = process.env.ADMIN_PASSWORD || (await preguntar("Contraseña: ", { oculto: true }));

  if (!nombre || nombre.length > 100) throw new Error("El nombre es obligatorio (máximo 100 caracteres)");
  if (!emailValido(email)) throw new Error("El correo no es válido");
  if (!passwordValida(password)) throw new Error(MENSAJE_PASSWORD);

  const rol = await Rol.findOne({ where: { nombre: "Administrador" } });
  if (!rol) throw new Error("No existe el rol Administrador. Ejecuta primero: npm run db:migrar");

  if (await Usuario.findOne({ where: { email } })) {
    throw new Error("Ya existe un usuario con ese correo");
  }

  await Usuario.create({
    nombre,
    email,
    password_hash: await hashearPassword(password),
    id_rol: rol.id_rol,
  });
  console.log(`Administrador creado: ${email}`);
}

crearAdministrador()
  .catch((error) => {
    console.error(`No se pudo crear el administrador: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
    return sequelize.close();
  });
