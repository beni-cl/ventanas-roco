import request from "supertest";
import { Op } from "sequelize";
import { crearApp } from "../src/crearApp.js";
import {
  Cotizacion,
  VentanaConfigurada,
  Despiece,
  Rol,
  Usuario,
  sequelize,
} from "../src/modelos/index.js";
import { hashearPassword } from "../src/servicios/autenticacion.js";
import { leerAuditoria } from "../src/servicios/auditoria.js";

process.env.JWT_SECRET ??= "clave_de_prueba_no_usar_en_produccion";

const app = crearApp();
const SUFIJO = "@cotizaciones.roco.test";
const PASSWORD = "Clave1234";
const emailCliente = `cliente${SUFIJO}`;
const emailOtroCliente = `otro${SUFIJO}`;
const emailFabricante = `fabricante${SUFIJO}`;

const ventana = () => ({
  anchoMm: 1780,
  altoMm: 1120,
  material: "Aluminio",
  tipoPerfil: "Aluminio Corredera Línea 25",
  colorPerfil: "Blanco",
  tipoVidrio: "Termopanel",
  cantidad: 2,
});

let tokenCliente;
let tokenOtro;
let tokenFabricante;
let idCliente;
let idFabricante;
let idPrincipal;
let idParaRevisar;

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

function solicitar(token, ventanas = [ventana()], extra = {}) {
  return request(app)
    .post("/api/cotizaciones")
    .set(conToken(token))
    .send({ ventanas, ...extra });
}

async function limpiar() {
  const usuarios = await Usuario.findAll({
    where: { email: { [Op.like]: `%${SUFIJO}` } },
  });
  const idsUsuarios = usuarios.map((u) => u.id_usuario);
  if (idsUsuarios.length === 0) return;

  const cotizaciones = await Cotizacion.findAll({
    where: { id_cliente: { [Op.in]: idsUsuarios } },
  });
  const idsCotizaciones = cotizaciones.map((c) => c.id_cotizacion);
  if (idsCotizaciones.length > 0) {
    const ventanas = await VentanaConfigurada.findAll({
      where: { id_cotizacion: { [Op.in]: idsCotizaciones } },
    });
    const idsVentanas = ventanas.map((v) => v.id_configuracion);
    if (idsVentanas.length > 0) {
      await Despiece.destroy({
        where: { id_configuracion: { [Op.in]: idsVentanas } },
      });
    }
    await VentanaConfigurada.destroy({
      where: { id_cotizacion: { [Op.in]: idsCotizaciones } },
    });
    await Cotizacion.destroy({
      where: { id_cotizacion: { [Op.in]: idsCotizaciones } },
    });
  }
  await Usuario.destroy({ where: { id_usuario: { [Op.in]: idsUsuarios } } });
}

beforeAll(async () => {
  await limpiar();
  const cliente = await crearUsuario(
    "Cliente de Prueba",
    emailCliente,
    "Cliente",
  );
  await crearUsuario("Otro Cliente", emailOtroCliente, "Cliente");
  const fabricante = await crearUsuario(
    "Fabricante de Prueba",
    emailFabricante,
    "Fabricante",
  );
  idCliente = cliente.id_usuario;
  idFabricante = fabricante.id_usuario;

  tokenCliente = await iniciarSesion(emailCliente);
  tokenOtro = await iniciarSesion(emailOtroCliente);
  tokenFabricante = await iniciarSesion(emailFabricante);

  idPrincipal = (await solicitar(tokenCliente)).body.id_cotizacion;
  idParaRevisar = (await solicitar(tokenCliente)).body.id_cotizacion;
});

afterAll(async () => {
  await limpiar();
  await sequelize.close();
});

describe("POST /api/cotizaciones", () => {
  test("un cliente con sesion crea una cotizacion Pendiente", async () => {
    const respuesta = await solicitar(tokenCliente);
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.numero_orden).toMatch(/^COT-\d{4}-\d{5}$/);
    expect(respuesta.body.estado).toBe("Pendiente");
  });

  test("sin token responde 401", async () => {
    const respuesta = await request(app)
      .post("/api/cotizaciones")
      .send({ ventanas: [ventana()] });
    expect(respuesta.status).toBe(401);
  });

  test("un fabricante no puede solicitar cotizaciones (403)", async () => {
    const respuesta = await solicitar(tokenFabricante);
    expect(respuesta.status).toBe(403);
  });

  test("con una lista de ventanas vacia responde 400", async () => {
    const respuesta = await solicitar(tokenCliente, []);
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toBe("Debe haber al menos una ventana");
  });

  test("si una ventana es invalida no se guarda nada", async () => {
    const antes = await Cotizacion.count({ where: { id_cliente: idCliente } });
    const mala = { ...ventana(), anchoMm: 100 };
    const respuesta = await solicitar(tokenCliente, [ventana(), mala]);
    const despues = await Cotizacion.count({
      where: { id_cliente: idCliente },
    });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toMatch(/^Ventana 2:/);
    expect(despues).toBe(antes);
  });

  test("ignora estado, precio y cliente que el cliente intente enviar", async () => {
    const respuesta = await solicitar(tokenCliente, [ventana()], {
      estado: "Respondida",
      precio_final: 1,
      costo_neto: 1,
      congelado: true,
      id_cliente: 999999,
    });
    expect(respuesta.status).toBe(201);
    expect(respuesta.body.estado).toBe("Pendiente");

    const guardada = await Cotizacion.findByPk(respuesta.body.id_cotizacion);
    expect(guardada.precio_final).toBeNull();
    expect(guardada.costo_neto).toBeNull();
    expect(guardada.congelado).toBe(false);
    expect(guardada.id_cliente).toBe(idCliente);
  });
});

describe("GET /api/cotizaciones/mias", () => {
  test("el cliente ve sus cotizaciones", async () => {
    const respuesta = await request(app)
      .get("/api/cotizaciones/mias")
      .set(conToken(tokenCliente));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.some((c) => c.id_cotizacion === idPrincipal)).toBe(
      true,
    );
  });

  test("otro cliente no ve las cotizaciones ajenas", async () => {
    const respuesta = await request(app)
      .get("/api/cotizaciones/mias")
      .set(conToken(tokenOtro));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual([]);
  });

  test("no muestra precio ni costos mientras no este Respondida", async () => {
    const respuesta = await request(app)
      .get("/api/cotizaciones/mias")
      .set(conToken(tokenCliente));
    const cotizacion = respuesta.body.find(
      (c) => c.id_cotizacion === idPrincipal,
    );
    expect(cotizacion.precio_final).toBeNull();
    expect(cotizacion.costo_neto).toBeUndefined();
    expect(cotizacion.margen_aplicado).toBeUndefined();
  });

  test("un fabricante no tiene acceso a esta lista (403)", async () => {
    const respuesta = await request(app)
      .get("/api/cotizaciones/mias")
      .set(conToken(tokenFabricante));
    expect(respuesta.status).toBe(403);
  });

  test("sin token responde 401", async () => {
    const respuesta = await request(app).get("/api/cotizaciones/mias");
    expect(respuesta.status).toBe(401);
  });
});

describe("GET /api/cotizaciones/:id", () => {
  test("el dueño ve sus ventanas pero no despiece ni costos", async () => {
    const respuesta = await request(app)
      .get(`/api/cotizaciones/${idPrincipal}`)
      .set(conToken(tokenCliente));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.ventanas).toHaveLength(1);
    expect(respuesta.body.ventanas[0].ancho_mm).toBe(1780);
    expect(respuesta.body.ventanas[0].despiece).toBeUndefined();
    expect(respuesta.body.costo_neto).toBeUndefined();
  });

  test("otro cliente recibe 404 (no se revela que existe)", async () => {
    const respuesta = await request(app)
      .get(`/api/cotizaciones/${idPrincipal}`)
      .set(conToken(tokenOtro));
    expect(respuesta.status).toBe(404);
  });

  test("el fabricante ve despiece y campos de costos", async () => {
    const respuesta = await request(app)
      .get(`/api/cotizaciones/${idPrincipal}`)
      .set(conToken(tokenFabricante));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.ventanas[0].despiece.superficie_vidrio_m2).toBe(1.99);
    expect(respuesta.body).toHaveProperty("costo_neto");
    expect(respuesta.body).toHaveProperty("margen_aplicado");
  });

  test("un id que no es numero responde 400", async () => {
    const respuesta = await request(app)
      .get("/api/cotizaciones/abc")
      .set(conToken(tokenCliente));
    expect(respuesta.status).toBe(400);
  });

  test("un id que no existe responde 404", async () => {
    const respuesta = await request(app)
      .get("/api/cotizaciones/999999")
      .set(conToken(tokenCliente));
    expect(respuesta.status).toBe(404);
  });
});

describe("GET /api/fabricante/solicitudes", () => {
  test("el fabricante ve las solicitudes pendientes sin precios", async () => {
    const respuesta = await request(app)
      .get("/api/fabricante/solicitudes")
      .set(conToken(tokenFabricante));
    expect(respuesta.status).toBe(200);
    const solicitud = respuesta.body.find(
      (s) => s.id_cotizacion === idPrincipal,
    );
    expect(solicitud.estado).toBe("Pendiente");
    expect(solicitud.cliente).toBe("Cliente de Prueba");
    expect(solicitud.precio_final).toBeUndefined();
  });

  test("un cliente no puede ver las solicitudes (403)", async () => {
    const respuesta = await request(app)
      .get("/api/fabricante/solicitudes")
      .set(conToken(tokenCliente));
    expect(respuesta.status).toBe(403);
  });

  test("un estado que no corresponde responde 400", async () => {
    const respuesta = await request(app)
      .get("/api/fabricante/solicitudes?estado=Respondida")
      .set(conToken(tokenFabricante));
    expect(respuesta.status).toBe(400);
  });

  test("sin token responde 401", async () => {
    const respuesta = await request(app).get("/api/fabricante/solicitudes");
    expect(respuesta.status).toBe(401);
  });
});

describe("PUT /api/cotizaciones/:id/revisar", () => {
  test("el fabricante pasa la cotizacion a En Revisión y queda asignado", async () => {
    const respuesta = await request(app)
      .put(`/api/cotizaciones/${idParaRevisar}/revisar`)
      .set(conToken(tokenFabricante));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.estado).toBe("En Revisión");

    const guardada = await Cotizacion.findByPk(idParaRevisar);
    expect(guardada.estado).toBe("En Revisión");
    expect(guardada.id_fabricante).toBe(idFabricante);
  });

  test("revisar dos veces la misma cotizacion responde 409", async () => {
    const respuesta = await request(app)
      .put(`/api/cotizaciones/${idParaRevisar}/revisar`)
      .set(conToken(tokenFabricante));
    expect(respuesta.status).toBe(409);
    expect(respuesta.body.error).toBeDefined();
  });

  test("un cliente no puede revisar (403)", async () => {
    const respuesta = await request(app)
      .put(`/api/cotizaciones/${idPrincipal}/revisar`)
      .set(conToken(tokenCliente));
    expect(respuesta.status).toBe(403);
  });

  test("una cotizacion que no existe responde 404", async () => {
    const respuesta = await request(app)
      .put("/api/cotizaciones/999999/revisar")
      .set(conToken(tokenFabricante));
    expect(respuesta.status).toBe(404);
  });

  test("un id invalido responde 400", async () => {
    const respuesta = await request(app)
      .put("/api/cotizaciones/abc/revisar")
      .set(conToken(tokenFabricante));
    expect(respuesta.status).toBe(400);
  });
  describe("PUT /api/cotizaciones/:id/enviar", () => {
    let idPendiente;
    let idEnRevision;
    let idEnRevision2;
    let idSerieMala;
    let idVidrioMalo;

    const revisar = (id) =>
      request(app)
        .put(`/api/cotizaciones/${id}/revisar`)
        .set(conToken(tokenFabricante));
    const enviar = (id, cuerpo, token = tokenFabricante) =>
      request(app)
        .put(`/api/cotizaciones/${id}/enviar`)
        .set(conToken(token))
        .send(cuerpo);
    const cuerpoBueno = {
      margen_aplicado: 30,
      mano_obra: 50000,
      instalacion: 30000,
    };

    beforeAll(async () => {
      idPendiente = (await solicitar(tokenCliente)).body.id_cotizacion;
      idEnRevision = (await solicitar(tokenCliente)).body.id_cotizacion;
      idEnRevision2 = (await solicitar(tokenCliente)).body.id_cotizacion;
      idSerieMala = (
        await solicitar(tokenCliente, [
          { ...ventana(), tipoPerfil: "Serie Inexistente" },
        ])
      ).body.id_cotizacion;
      idVidrioMalo = (
        await solicitar(tokenCliente, [
          { ...ventana(), tipoVidrio: "Vidrio Inventado" },
        ])
      ).body.id_cotizacion;
      for (const id of [
        idEnRevision,
        idEnRevision2,
        idSerieMala,
        idVidrioMalo,
      ]) {
        await revisar(id);
      }
    });

    test("un cliente no puede enviar precios (403)", async () => {
      const respuesta = await enviar(idEnRevision, cuerpoBueno, tokenCliente);
      expect(respuesta.status).toBe(403);
    });

    test("sin token responde 401", async () => {
      const respuesta = await request(app)
        .put(`/api/cotizaciones/${idEnRevision}/enviar`)
        .send(cuerpoBueno);
      expect(respuesta.status).toBe(401);
    });

    test("una cotizacion que no esta En Revisión no se puede enviar (409)", async () => {
      const respuesta = await enviar(idPendiente, cuerpoBueno);
      expect(respuesta.status).toBe(409);
      expect(respuesta.body.error).toBe(
        "No se puede pasar de Pendiente a Respondida",
      );
    });

    test("el fabricante envia y el servidor calcula costo y precio", async () => {
      const respuesta = await enviar(idEnRevision, cuerpoBueno);
      expect(respuesta.status).toBe(200);
      expect(respuesta.body.estado).toBe("Respondida");
      expect(respuesta.body.congelado).toBe(true);
      expect(respuesta.body.costo_neto).toBeCloseTo(291199.1, 2);
      expect(respuesta.body.precio_final).toBeCloseTo(378558.83, 2);
      expect(respuesta.body.margen_aplicado).toBe(30);
    });

    test("el cliente ve el precio final pero no el costo ni el margen", async () => {
      const lista = await request(app)
        .get("/api/cotizaciones/mias")
        .set(conToken(tokenCliente));
      const cotizacion = lista.body.find(
        (c) => c.id_cotizacion === idEnRevision,
      );
      expect(cotizacion.estado).toBe("Respondida");
      expect(cotizacion.precio_final).toBeCloseTo(378558.83, 2);
      expect(cotizacion.costo_neto).toBeUndefined();

      const detalle = await request(app)
        .get(`/api/cotizaciones/${idEnRevision}`)
        .set(conToken(tokenCliente));
      expect(detalle.body.precio_final).toBeCloseTo(378558.83, 2);
      expect(detalle.body.margen_aplicado).toBeUndefined();
    });

    test("una cotizacion Respondida queda congelada y no se envia de nuevo (409)", async () => {
      const respuesta = await enviar(idEnRevision, { margen_aplicado: 5 });
      expect(respuesta.status).toBe(409);
      expect(respuesta.body.error).toBe(
        "La cotizacion esta congelada y no se puede modificar",
      );
    });

    test("rechaza un margen negativo (400)", async () => {
      const respuesta = await enviar(idPendiente, {
        ...cuerpoBueno,
        margen_aplicado: -5,
      });
      expect(respuesta.status).toBe(400);
    });

    test("rechaza si falta el margen (400)", async () => {
      const respuesta = await enviar(idPendiente, { mano_obra: 1000 });
      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error).toBe("margen_aplicado es obligatorio");
    });

    test("rechaza un margen que no es numero (400)", async () => {
      const respuesta = await enviar(idPendiente, {
        ...cuerpoBueno,
        margen_aplicado: "abc",
      });
      expect(respuesta.status).toBe(400);
    });

    test("rechaza un margen mayor a 999.99 (400)", async () => {
      const respuesta = await enviar(idPendiente, {
        ...cuerpoBueno,
        margen_aplicado: 1000,
      });
      expect(respuesta.status).toBe(400);
    });

    test("rechaza una mano de obra negativa (400)", async () => {
      const respuesta = await enviar(idPendiente, {
        ...cuerpoBueno,
        mano_obra: -1,
      });
      expect(respuesta.status).toBe(400);
    });

    test("un cuerpo invalido no cambia la cotizacion", async () => {
      await enviar(idPendiente, { margen_aplicado: -5 });
      const guardada = await Cotizacion.findByPk(idPendiente);
      expect(guardada.estado).toBe("Pendiente");
      expect(guardada.congelado).toBe(false);
      expect(guardada.precio_final).toBeNull();
    });

    test("registra la auditoria con usuario, accion y estados", async () => {
      const dia = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Santiago",
      }).format(new Date());
      const registro = leerAuditoria(dia).find(
        (r) =>
          r.id_usuario === idFabricante &&
          r.estado_posterior.estado === "Respondida" &&
          Math.abs(r.estado_posterior.precio_final - 378558.83) < 0.01,
      );
      expect(registro).toBeDefined();
      expect(registro.accion).toBe("UPDATE_COTIZACION_PRECIO");
      expect(registro.estado_anterior.estado).toBe("En Revisión");
      expect(registro.estado_anterior.precio_final).toBeNull();
    });

    test("ignora un precio_final o costo_neto enviado por el fabricante", async () => {
      const respuesta = await enviar(idEnRevision2, {
        margen_aplicado: 10,
        mano_obra: 0,
        instalacion: 0,
        precio_final: 1,
        costo_neto: 1,
      });
      expect(respuesta.status).toBe(200);
      expect(respuesta.body.costo_neto).toBeGreaterThan(1000);
      expect(respuesta.body.precio_final).toBeCloseTo(
        respuesta.body.costo_neto * 1.1,
        1,
      );
    });

    test("con una serie que no esta en el catalogo responde 422 y no cambia nada", async () => {
      const respuesta = await enviar(idSerieMala, cuerpoBueno);
      expect(respuesta.status).toBe(422);
      const guardada = await Cotizacion.findByPk(idSerieMala);
      expect(guardada.estado).toBe("En Revisión");
      expect(guardada.congelado).toBe(false);
    });

    test("con un vidrio que no esta en el inventario responde 422", async () => {
      const respuesta = await enviar(idVidrioMalo, cuerpoBueno);
      expect(respuesta.status).toBe(422);
      expect(respuesta.body.error).toMatch(/vidrio/);
    });

    test("una cotizacion que no existe responde 404", async () => {
      const respuesta = await enviar(999999, cuerpoBueno);
      expect(respuesta.status).toBe(404);
    });

    test("un id invalido responde 400", async () => {
      const respuesta = await enviar("abc", cuerpoBueno);
      expect(respuesta.status).toBe(400);
    });
  });
});
