import { sequelize } from "../config/baseDatos.js";
import { Cotizacion } from "../modelos/index.js";
import { calcularCostoNeto } from "./calculadorCostosEngine.js";
import { construirDatosDeEnvio } from "./precioSeguroServicio.js";
import {
  verificarModificable,
  validarTransicion,
} from "./cotizacionEstadoServicio.js";
import { registrarAuditoria } from "./auditoria.js";
import { calcularMaterialesDeCotizacion } from "./costeoServicio.js";
import { ErrorHttp, leerId } from "./errorHttp.js";

const MAX_MARGEN = 999.99;
const MAX_DINERO = 99999999.99;

const redondear = (numero) => Math.round(numero * 100) / 100;
const aNumero = (valor) =>
  valor === null || valor === undefined ? null : Number(valor);

function leerNumero(valor, nombre, { obligatorio, maximo }) {
  const vacio =
    valor === undefined ||
    valor === null ||
    (typeof valor === "string" && valor.trim() === "");
  if (vacio) {
    if (obligatorio) {
      throw new ErrorHttp(400, `${nombre} es obligatorio`);
    }
    return 0;
  }
  const numero =
    typeof valor === "number"
      ? valor
      : typeof valor === "string"
        ? Number(valor)
        : NaN;
  if (!Number.isFinite(numero)) {
    throw new ErrorHttp(400, `${nombre} debe ser un numero`);
  }
  if (numero < 0) {
    throw new ErrorHttp(400, `${nombre} no puede ser negativo`);
  }
  if (numero > maximo) {
    throw new ErrorHttp(400, `${nombre} no puede superar ${maximo}`);
  }
  return redondear(numero);
}

function resumen(cotizacion) {
  return {
    estado: cotizacion.estado,
    costo_neto: aNumero(cotizacion.costo_neto),
    margen_aplicado: aNumero(cotizacion.margen_aplicado),
    precio_final: aNumero(cotizacion.precio_final),
    mano_obra: aNumero(cotizacion.mano_obra),
    instalacion: aNumero(cotizacion.instalacion),
    congelado: cotizacion.congelado,
  };
}

export async function enviarRespuesta(idTexto, usuario, datos, ip) {
  const id = leerId(idTexto);
  if (datos === null || typeof datos !== "object" || Array.isArray(datos)) {
    throw new ErrorHttp(400, "Los datos del envio no son validos");
  }
  const margen = leerNumero(datos.margen_aplicado, "margen_aplicado", {
    obligatorio: true,
    maximo: MAX_MARGEN,
  });
  const manoObra = leerNumero(datos.mano_obra, "mano_obra", {
    obligatorio: false,
    maximo: MAX_DINERO,
  });
  const instalacion = leerNumero(datos.instalacion, "instalacion", {
    obligatorio: false,
    maximo: MAX_DINERO,
  });

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
      validarTransicion(cotizacion.estado, "Respondida");
    } catch (error) {
      throw new ErrorHttp(409, error.message);
    }

    const anterior = resumen(cotizacion);

    let envio;
    try {
      const materiales = await calcularMaterialesDeCotizacion(id, transaccion);
      const costoNeto = redondear(
        calcularCostoNeto(materiales, manoObra, instalacion),
      );
      envio = construirDatosDeEnvio({ costo_neto: costoNeto }, margen);
    } catch (error) {
      if (error instanceof ErrorHttp) {
        throw error;
      }
      throw new ErrorHttp(422, error.message);
    }
    if (envio.costo_neto > MAX_DINERO || envio.precio_final > MAX_DINERO) {
      throw new ErrorHttp(
        422,
        "El precio calculado supera el maximo permitido",
      );
    }

    await cotizacion.update(
      { ...envio, mano_obra: manoObra, instalacion, id_fabricante: usuario.id },
      { transaction: transaccion },
    );

    registrarAuditoria({
      id_usuario: Number(usuario.id),
      accion: "UPDATE_COTIZACION_PRECIO",
      ip: ip || "desconocida",
      estado_anterior: anterior,
      estado_posterior: resumen(cotizacion),
    });

    return {
      id_cotizacion: cotizacion.id_cotizacion,
      numero_orden: cotizacion.numero_orden,
      ...resumen(cotizacion),
    };
  });
}
