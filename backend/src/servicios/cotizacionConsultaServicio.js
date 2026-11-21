import { Op } from "sequelize";
import { sequelize } from "../config/baseDatos.js";
import {
  Cotizacion,
  VentanaConfigurada,
  Despiece,
  Usuario,
} from "../modelos/index.js";
import {
  verificarModificable,
  validarTransicion,
} from "./cotizacionEstadoServicio.js";
import { ErrorHttp, leerId } from "./errorHttp.js";

const ESTADOS_SOLICITUD = ["Pendiente", "En Revisión"];
const ROLES_FABRICA = ["Fabricante", "Administrador"];

const aNumero = (valor) =>
  valor === null || valor === undefined ? null : Number(valor);

function vistaCliente(cotizacion) {
  return {
    id_cotizacion: cotizacion.id_cotizacion,
    numero_orden: cotizacion.numero_orden,
    estado: cotizacion.estado,
    fecha_creacion: cotizacion.fecha_creacion,
    precio_final:
      cotizacion.estado === "Respondida"
        ? aNumero(cotizacion.precio_final)
        : null,
  };
}

function datosVentana(ventana) {
  return {
    ancho_mm: aNumero(ventana.ancho_mm),
    alto_mm: aNumero(ventana.alto_mm),
    tipo_perfil: ventana.tipo_perfil,
    color_perfil: ventana.color_perfil,
    tipo_vidrio: ventana.tipo_vidrio,
    cantidad: ventana.cantidad,
  };
}

function vistaClienteDetalle(cotizacion) {
  return {
    ...vistaCliente(cotizacion),
    ventanas: cotizacion.ventanas.map(datosVentana),
  };
}

function vistaFabrica(cotizacion) {
  return {
    id_cotizacion: cotizacion.id_cotizacion,
    numero_orden: cotizacion.numero_orden,
    id_cliente: cotizacion.id_cliente,
    id_fabricante: cotizacion.id_fabricante,
    estado: cotizacion.estado,
    congelado: cotizacion.congelado,
    fecha_creacion: cotizacion.fecha_creacion,
    costo_neto: aNumero(cotizacion.costo_neto),
    margen_aplicado: aNumero(cotizacion.margen_aplicado),
    precio_final: aNumero(cotizacion.precio_final),
    mano_obra: aNumero(cotizacion.mano_obra),
    instalacion: aNumero(cotizacion.instalacion),
    ventanas: cotizacion.ventanas.map((ventana) => ({
      ...datosVentana(ventana),
      despiece: ventana.despiece
        ? {
            cortes_json: ventana.despiece.cortes_json,
            superficie_vidrio_m2: aNumero(
              ventana.despiece.superficie_vidrio_m2,
            ),
            merma_aplicada: aNumero(ventana.despiece.merma_aplicada),
          }
        : null,
    })),
  };
}

export async function listarMias(idCliente) {
  const cotizaciones = await Cotizacion.findAll({
    where: { id_cliente: idCliente },
    order: [["fecha_creacion", "DESC"]],
  });
  return cotizaciones.map(vistaCliente);
}

export async function obtenerCotizacion(idTexto, usuario) {
  const id = leerId(idTexto);
  const cotizacion = await Cotizacion.findByPk(id, {
    include: [
      {
        model: VentanaConfigurada,
        as: "ventanas",
        include: [{ model: Despiece, as: "despiece" }],
      },
    ],
    order: [
      [
        { model: VentanaConfigurada, as: "ventanas" },
        "id_configuracion",
        "ASC",
      ],
    ],
  });
  if (!cotizacion) {
    throw new ErrorHttp(404, "Cotizacion no encontrada");
  }

  if (ROLES_FABRICA.includes(usuario.rol)) {
    return vistaFabrica(cotizacion);
  }
  if (cotizacion.id_cliente !== Number(usuario.id)) {
    throw new ErrorHttp(404, "Cotizacion no encontrada");
  }
  return vistaClienteDetalle(cotizacion);
}

export async function listarSolicitudes(estado) {
  if (estado !== undefined && !ESTADOS_SOLICITUD.includes(estado)) {
    throw new ErrorHttp(400, "El estado debe ser Pendiente o En Revisión");
  }
  const cotizaciones = await Cotizacion.findAll({
    where: { estado: estado ?? { [Op.in]: ESTADOS_SOLICITUD } },
    include: [{ model: Usuario, as: "cliente", attributes: ["nombre"] }],
    order: [["fecha_creacion", "ASC"]],
  });
  return cotizaciones.map((cotizacion) => ({
    id_cotizacion: cotizacion.id_cotizacion,
    numero_orden: cotizacion.numero_orden,
    estado: cotizacion.estado,
    fecha_creacion: cotizacion.fecha_creacion,
    id_cliente: cotizacion.id_cliente,
    cliente: cotizacion.cliente ? cotizacion.cliente.nombre : null,
  }));
}

export async function iniciarRevision(idTexto, usuario) {
  const id = leerId(idTexto);
  return sequelize.transaction(async (transaccion) => {
    const cotizacion = await Cotizacion.findByPk(id, {
      transaction: transaccion,
      lock: transaccion.LOCK.UPDATE,
    });
    if (!cotizacion) {
      throw new ErrorHttp(404, "Cotizacion no encontrada");
    }

    try {
      verificarModificable(cotizacion);
      validarTransicion(cotizacion.estado, "En Revisión");
    } catch (error) {
      throw new ErrorHttp(409, error.message);
    }

    await cotizacion.update(
      { estado: "En Revisión", id_fabricante: usuario.id },
      { transaction: transaccion },
    );
    return {
      id_cotizacion: cotizacion.id_cotizacion,
      numero_orden: cotizacion.numero_orden,
      estado: cotizacion.estado,
    };
  });
}
