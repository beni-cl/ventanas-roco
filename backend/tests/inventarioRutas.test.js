import request from "supertest";
import { Op } from "sequelize";
import { crearApp } from "../src/crearApp.js";
import { Material, Rol, Usuario, sequelize } from "../src/modelos/index.js";
import { hashearPassword } from "../src/servicios/autenticacion.js";
import { leerAuditoria } from "../src/servicios/auditoria.js";

process.env.JWT_SECRET ??= "clave_de_prueba_no_usar_en_produccion";

const app = crearApp();
const SUFIJO = "@inventario.roco.test";
const PASSWORD = "Clave1234";
const emailCliente = `cliente${SUFIJO}`;
const emailFabricante = `fabricante${SUFIJO}`;

let tokenCliente;
let tokenFabricante;
let idFabricante;
let idAccesorio;
let precioOriginal;

async function crearUsuario(nombre, email, nombreRol) {
  const rol = await Rol.findOne({ where: { nombre: nombreRol } });
  return Usuario.create({
    nombre,
    email,
    password_hash: await hashearPassword(PASSWORD),
    id_rol: rol.id_rol,
  });
}

async function iniciarSesion(email) {
  const respuesta = await request(app)
    .post("/api/auth/login")
    .send({ email, password: PASSWORD });
  return respuesta.body.token;
}

const conToken = (token) => ({ Authorization: `Bearer ${token}` });

const editar = (token, id, cuerpo) =>
  request(app).put(`/api/inventario/${id}`).set(conToken(token)).send(cuerpo);

const precioGuardado = async () =>
  Number((await Material.findByPk(idAccesorio)).precio_costo);

const diaDeHoy = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(
    new Date(),
  );

async function limpiar() {
  await Usuario.destroy({ where: { email: { [Op.like]: `%${SUFIJO}` } } });
}

beforeAll(async () => {
  await limpiar();
  await crearUsuario("Cliente Inventario", emailCliente, "Cliente");
  const fabricante = await crearUsuario(
    "Fabricante Inventario",
    emailFabricante,
    "Fabricante",
  );
  idFabricante = fabricante.id_usuario;
  tokenCliente = await iniciarSesion(emailCliente);
  tokenFabricante = await iniciarSesion(emailFabricante);

  const accesorio = await Material.findOne({
    where: { categoria: "Accesorio", activo: true },
    order: [["id_material", "ASC"]],
  });
  if (!accesorio) {
    throw new Error("El catalogo no tiene ningun accesorio activo para probar");
  }
  idAccesorio = accesorio.id_material;
  precioOriginal = Number(accesorio.precio_costo);
});

afterAll(async () => {
  await Material.update(
    { precio_costo: precioOriginal },
    { where: { id_material: idAccesorio } },
  );
  await limpiar();
  await sequelize.close();
});

describe("GET /api/inventario", () => {
  test("sin token responde 401", async () => {
    const respuesta = await request(app).get("/api/inventario");
    expect(respuesta.status).toBe(401);
  });

  test("un cliente no puede ver los precios y recibe 403", async () => {
    const respuesta = await request(app)
      .get("/api/inventario")
      .set(conToken(tokenCliente));
    expect(respuesta.status).toBe(403);
    expect(respuesta.body.error).toBeDefined();
  });

  test("el fabricante recibe la lista con precio numerico", async () => {
    const respuesta = await request(app)
      .get("/api/inventario")
      .set(conToken(tokenFabricante));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.length).toBeGreaterThan(0);
    for (const material of respuesta.body) {
      expect(typeof material.id_material).toBe("number");
      expect(typeof material.nombre_insumo).toBe("string");
      expect(typeof material.precio_costo).toBe("number");
    }
  });

  test("la lista incluye el material que se usa en las pruebas", async () => {
    const respuesta = await request(app)
      .get("/api/inventario")
      .set(conToken(tokenFabricante));
    const encontrado = respuesta.body.find(
      (m) => m.id_material === idAccesorio,
    );
    expect(encontrado).toBeDefined();
    expect(encontrado.precio_costo).toBe(precioOriginal);
  });
});

describe("PUT /api/inventario/:id", () => {
  test("sin token responde 401", async () => {
    const respuesta = await request(app)
      .put(`/api/inventario/${idAccesorio}`)
      .send({ precio_costo: 1000 });
    expect(respuesta.status).toBe(401);
  });

  test("un cliente no puede editar y recibe 403 sin cambiar el precio", async () => {
    const antes = await precioGuardado();
    const respuesta = await editar(tokenCliente, idAccesorio, {
      precio_costo: 1,
    });
    expect(respuesta.status).toBe(403);
    expect(await precioGuardado()).toBe(antes);
  });

  test("el fabricante actualiza el precio y se redondea a 2 decimales", async () => {
    const respuesta = await editar(tokenFabricante, idAccesorio, {
      precio_costo: 1234.567,
    });
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.id_material).toBe(idAccesorio);
    expect(respuesta.body.precio_costo).toBe(1234.57);
    expect(await precioGuardado()).toBe(1234.57);
  });

  test("acepta el precio como texto numerico", async () => {
    const respuesta = await editar(tokenFabricante, idAccesorio, {
      precio_costo: "2500",
    });
    expect(respuesta.status).toBe(200);
    expect(await precioGuardado()).toBe(2500);
  });

  test("el nuevo precio aparece en el listado del fabricante", async () => {
    await editar(tokenFabricante, idAccesorio, { precio_costo: 3100 });
    const respuesta = await request(app)
      .get("/api/inventario")
      .set(conToken(tokenFabricante));
    const encontrado = respuesta.body.find(
      (m) => m.id_material === idAccesorio,
    );
    expect(encontrado.precio_costo).toBe(3100);
  });

  test("registra la auditoria con el precio anterior y el nuevo", async () => {
    await editar(tokenFabricante, idAccesorio, { precio_costo: 4000 });
    const respuesta = await editar(tokenFabricante, idAccesorio, {
      precio_costo: 4321.09,
    });
    expect(respuesta.status).toBe(200);

    const registro = leerAuditoria(diaDeHoy()).find(
      (r) =>
        r.accion === "UPDATE_INVENTARIO_PRECIO" &&
        r.id_usuario === idFabricante &&
        r.estado_posterior.id_material === idAccesorio &&
        r.estado_posterior.precio_costo === 4321.09,
    );
    expect(registro).toBeDefined();
    expect(registro.estado_anterior.precio_costo).toBe(4000);
  });

  test.each([
    ["negativo", -5],
    ["de texto", "abc"],
    ["vacio", ""],
    ["nulo", null],
    ["ausente", undefined],
    ["booleano", true],
    ["mayor al maximo", 100000000],
  ])("rechaza un precio %s con 400 y no cambia el valor", async (_, valor) => {
    const antes = await precioGuardado();
    const respuesta = await editar(tokenFabricante, idAccesorio, {
      precio_costo: valor,
    });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toBeDefined();
    expect(await precioGuardado()).toBe(antes);
  });

  test("un material que no existe responde 404", async () => {
    const respuesta = await editar(tokenFabricante, 2147483647, {
      precio_costo: 1000,
    });
    expect(respuesta.status).toBe(404);
  });

  test("un id que no es un numero responde 400", async () => {
    const respuesta = await editar(tokenFabricante, "abc", {
      precio_costo: 1000,
    });
    expect(respuesta.status).toBe(400);
  });
});

describe("Catalogo publico", () => {
  test("sigue sin exponer el precio de costo", async () => {
    const respuesta = await request(app).get("/api/catalogo/materiales");
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.length).toBeGreaterThan(0);
    for (const material of respuesta.body) {
      expect(material).not.toHaveProperty("precio_costo");
    }
  });
});
