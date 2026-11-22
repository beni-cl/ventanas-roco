// Pruebas de seguridad y catálogo (T09). Sirven como resultados del plan de pruebas del informe.
// Usan la base de datos del .env (DATABASE_URL) y borran al terminar los usuarios que crean.
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { crearApp } from "../src/crearApp.js";
import { Rol, Usuario, sequelize } from "../src/modelos/index.js";
import { hashearPassword } from "../src/servicios/autenticacion.js";
import { verificarToken } from "../src/middleware/verificarToken.js";
import { verificarPermiso } from "../src/middleware/verificarPermiso.js";
import { manejarErrores } from "../src/middleware/errores.js";
import { crearLimitador } from "../src/middleware/limitadores.js";

process.env.JWT_SECRET ??= "clave_de_prueba_no_usar_en_produccion";

const app = crearApp();
const SUFIJO = "@prueba.roco.test";
const PASSWORD_BUENA = "Clave1234";
const correoCliente = `cliente${SUFIJO}`;
const correoFabricante = `fabricante${SUFIJO}`;

// Mini-aplicación con una ruta que exige COSTOS_VER (para probar los dos guardias)
const appGuardias = express();
appGuardias.get("/costos", verificarToken, verificarPermiso("COSTOS_VER"), (req, res) =>
  res.json({ ok: true, usuario: req.usuario })
);
appGuardias.use(manejarErrores);

async function iniciarSesion(email, password = PASSWORD_BUENA) {
  const respuesta = await request(app).post("/api/auth/login").send({ email, password });
  return respuesta.body.token;
}

beforeAll(async () => {
  await Usuario.destroy({ where: { email: { [Op.like]: `%${SUFIJO}` } } });
  const rolFabricante = await Rol.findOne({ where: { nombre: "Fabricante" } });
  await Usuario.create({
    nombre: "Fabricante de Prueba",
    email: correoFabricante,
    password_hash: await hashearPassword(PASSWORD_BUENA),
    id_rol: rolFabricante.id_rol,
  });
});

afterAll(async () => {
  await Usuario.destroy({ where: { email: { [Op.like]: `%${SUFIJO}` } } });
  await sequelize.close();
});

describe("Registro", () => {
  test('registrarse con "rol": "Administrador" igual crea un Cliente', async () => {
    const respuesta = await request(app)
      .post("/api/auth/registro")
      .send({ nombre: "Cliente Prueba", email: correoCliente, password: PASSWORD_BUENA, rol: "Administrador" });
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.rol).toBe("Cliente");

    const guardado = await Usuario.findOne({ where: { email: correoCliente }, include: { model: Rol, as: "rol" } });
    expect(guardado.rol.nombre).toBe("Cliente");
  });

  test("una contraseña débil se rechaza (400)", async () => {
    for (const password of ["corta1", "sololetrasaqui", "123456789", ""]) {
      const respuesta = await request(app)
        .post("/api/auth/registro")
        .send({ nombre: "Débil", email: `debil${SUFIJO}`, password });
      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error).toBeDefined();
    }
  });

  test("un correo repetido o inválido se rechaza (400)", async () => {
    const repetido = await request(app)
      .post("/api/auth/registro")
      .send({ nombre: "Otro", email: correoCliente.toUpperCase(), password: PASSWORD_BUENA });
    expect(repetido.status).toBe(400);

    const invalido = await request(app)
      .post("/api/auth/registro")
      .send({ nombre: "Otro", email: "esto-no-es-correo", password: PASSWORD_BUENA });
    expect(invalido.status).toBe(400);
  });
});

describe("Login", () => {
  test("contraseña mala → 401 con mensaje genérico (igual que correo inexistente)", async () => {
    const mala = await request(app).post("/api/auth/login").send({ email: correoCliente, password: "Equivocada99" });
    const inexistente = await request(app).post("/api/auth/login").send({ email: `nadie${SUFIJO}`, password: "Equivocada99" });
    expect(mala.status).toBe(401);
    expect(inexistente.status).toBe(401);
    expect(mala.body).toEqual({ error: "Correo o contraseña incorrectos" });
    expect(inexistente.body).toEqual(mala.body);
  });

  test("login correcto → entrega un token que dura 8 horas y lleva solo id, correo y rol", async () => {
    const respuesta = await request(app).post("/api/auth/login").send({ email: correoCliente, password: PASSWORD_BUENA });
    expect(respuesta.status).toBe(200);
    expect(typeof respuesta.body.token).toBe("string");
    expect(respuesta.body.usuario.rol).toBe("Cliente");

    const datos = jwt.decode(respuesta.body.token);
    expect(Object.keys(datos).sort()).toEqual(["email", "exp", "iat", "id", "rol"]);
    expect(datos.exp - datos.iat).toBe(8 * 60 * 60);
  });

  test("GET /api/auth/yo devuelve el usuario conectado", async () => {
    const token = await iniciarSesion(correoCliente);
    const respuesta = await request(app).get("/api/auth/yo").set("Authorization", `Bearer ${token}`);
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.email).toBe(correoCliente);
  });
});

describe("Guardias (middleware)", () => {
  test("ruta protegida sin token → 401", async () => {
    const respuesta = await request(appGuardias).get("/costos");
    expect(respuesta.status).toBe(401);
    expect(respuesta.body.error).toBeDefined();
  });

  test("token falso, alterado o vencido → 401", async () => {
    const falso = await request(appGuardias).get("/costos").set("Authorization", "Bearer abc.def.ghi");
    expect(falso.status).toBe(401);

    const firmadoConOtraClave = jwt.sign({ id: 1, email: "x@x.cl", rol: "Fabricante" }, "otra-clave");
    const ajeno = await request(appGuardias).get("/costos").set("Authorization", `Bearer ${firmadoConOtraClave}`);
    expect(ajeno.status).toBe(401);

    const vencido = jwt.sign({ id: 1, email: "x@x.cl", rol: "Fabricante" }, process.env.JWT_SECRET, { expiresIn: -10 });
    const respuesta = await request(appGuardias).get("/costos").set("Authorization", `Bearer ${vencido}`);
    expect(respuesta.status).toBe(401);
  });

  test("Cliente en una ruta que pide COSTOS_VER → 403", async () => {
    const token = await iniciarSesion(correoCliente);
    const respuesta = await request(appGuardias).get("/costos").set("Authorization", `Bearer ${token}`);
    expect(respuesta.status).toBe(403);
  });

  test("Fabricante en esa misma ruta → 200", async () => {
    const token = await iniciarSesion(correoFabricante);
    const respuesta = await request(appGuardias).get("/costos").set("Authorization", `Bearer ${token}`);
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.usuario.rol).toBe("Fabricante");
  });
});

describe("Que no se filtre información privada", () => {
  test("ninguna respuesta trae password_hash", async () => {
    const registro = await request(app)
      .post("/api/auth/registro")
      .send({ nombre: "Segundo Cliente", email: `segundo${SUFIJO}`, password: PASSWORD_BUENA });
    const login = await request(app).post("/api/auth/login").send({ email: correoCliente, password: PASSWORD_BUENA });
    const yo = await request(app).get("/api/auth/yo").set("Authorization", `Bearer ${login.body.token}`);

    for (const respuesta of [registro, login, yo]) {
      expect(JSON.stringify(respuesta.body)).not.toMatch(/password/i);
    }
  });

  test("el catálogo público funciona sin token y no trae precio_costo", async () => {
    const series = await request(app).get("/api/catalogo/series");
    const materiales = await request(app).get("/api/catalogo/materiales");
    expect(series.status).toBe(200);
    expect(materiales.status).toBe(200);
    expect(series.body.length).toBeGreaterThan(0);
    expect(materiales.body.length).toBeGreaterThan(0);
    expect(JSON.stringify(series.body)).not.toMatch(/precio|costo/i);
    expect(JSON.stringify(materiales.body)).not.toMatch(/precio|costo/i);
  });
});

describe("Límite de peticiones y errores", () => {
  test("el límite devuelve 429 al pasarse del máximo", async () => {
    const appLimitada = express();
    appLimitada.use(crearLimitador({ ventanaMs: 60000, maximo: 3, mensaje: "Demasiadas peticiones", siempre: true }));
    appLimitada.get("/", (req, res) => res.json({ ok: true }));

    for (let i = 0; i < 3; i++) expect((await request(appLimitada).get("/")).status).toBe(200);
    const bloqueada = await request(appLimitada).get("/");
    expect(bloqueada.status).toBe(429);
    expect(bloqueada.body).toEqual({ error: "Demasiadas peticiones" });
  });

  test("ruta inexistente → 404 y JSON mal escrito → 400, siempre con { error }", async () => {
    const noExiste = await request(app).get("/api/no-existe");
    expect(noExiste.status).toBe(404);
    expect(noExiste.body.error).toBeDefined();

    const malJson = await request(app).post("/api/auth/login").set("Content-Type", "application/json").send("{esto no es json");
    expect(malJson.status).toBe(400);
    expect(malJson.body.error).toBeDefined();
  });

  test("un error interno muestra un mensaje simple, sin detalles", async () => {
    const appConFallo = express();
    appConFallo.get("/falla", () => {
      throw new Error("detalle secreto: contraseña de la base de datos");
    });
    appConFallo.use(manejarErrores);
    const respuesta = await request(appConFallo).get("/falla");
    expect(respuesta.status).toBe(500);
    expect(JSON.stringify(respuesta.body)).not.toMatch(/secreto/);
  });
});
