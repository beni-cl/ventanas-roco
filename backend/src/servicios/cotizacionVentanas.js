import { calcularDespiece } from "./motorDespieceAlgoritmo.js";

const MAX_TIPO_PERFIL = 30;
const MAX_COLOR_PERFIL = 30;
const MAX_TIPO_VIDRIO = 40;

const MAX_VENTANAS = 50;
const MAX_CANTIDAD = 1000;

function validarTexto(valor, nombre, maximo, numero) {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new Error(`Ventana ${numero}: ${nombre} es obligatorio`);
  }
  const limpio = valor.trim();
  if (limpio.length > maximo) {
    throw new Error(
      `Ventana ${numero}: ${nombre} no puede superar ${maximo} caracteres`,
    );
  }
  return limpio;
}

export function prepararVentanas(ventanas) {
  if (!Array.isArray(ventanas)) {
    throw new Error("Las ventanas deben ser una lista");
  }
  if (ventanas.length === 0) {
    throw new Error("Debe haber al menos una ventana");
  }
  if (ventanas.length > MAX_VENTANAS) {
    throw new Error(
      `No se pueden cotizar mas de ${MAX_VENTANAS} ventanas a la vez`,
    );
  }

  return ventanas.map((ventana, indice) => {
    const numero = indice + 1;

    if (
      ventana === null ||
      typeof ventana !== "object" ||
      Array.isArray(ventana)
    ) {
      throw new Error(`Ventana ${numero}: los datos no son validos`);
    }

    const tipoPerfil = validarTexto(
      ventana.tipoPerfil,
      "tipoPerfil",
      MAX_TIPO_PERFIL,
      numero,
    );
    const colorPerfil = validarTexto(
      ventana.colorPerfil,
      "colorPerfil",
      MAX_COLOR_PERFIL,
      numero,
    );
    const tipoVidrio = validarTexto(
      ventana.tipoVidrio,
      "tipoVidrio",
      MAX_TIPO_VIDRIO,
      numero,
    );

    const { cantidad } = ventana;
    if (
      !Number.isInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > MAX_CANTIDAD
    ) {
      throw new Error(
        `Ventana ${numero}: la cantidad debe ser un entero entre 1 y ${MAX_CANTIDAD}`,
      );
    }

    let despiece;
    try {
      despiece = calcularDespiece(
        ventana.anchoMm,
        ventana.altoMm,
        ventana.material,
      );
    } catch (error) {
      throw new Error(`Ventana ${numero}: ${error.message}`);
    }

    return {
      anchoMm: ventana.anchoMm,
      altoMm: ventana.altoMm,
      tipoPerfil,
      material: ventana.material,
      colorPerfil,
      tipoVidrio,
      cantidad,
      despiece,
    };
  });
}
