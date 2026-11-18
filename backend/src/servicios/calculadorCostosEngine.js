import { REGLAS } from "./reglasFabricacion.js";

export function calcularCostoNeto(materiales, manoObra, instalacion) {
  if (!Number.isFinite(materiales) || materiales < 0) {
    throw new Error("Los datos en materiales no son validos");
  }

  if (!Number.isFinite(manoObra) || manoObra < 0) {
    throw new Error("Los datos en mano de obra no son validos");
  }

  if (!Number.isFinite(instalacion) || instalacion < 0) {
    throw new Error("Los datos en instalacion no son validos");
  }

  const merma = (materiales * REGLAS.mermaPorcentaje) / 100;
  const materialesConMerma = materiales + merma;
  return materialesConMerma + manoObra + instalacion;
}

export function calcularPrecioFinal(costoNeto, margenPorcentaje) {
  if (!Number.isFinite(costoNeto)) {
    throw new Error("El costo neto no es un numero");
  }
  if (costoNeto < 0) {
    throw new Error("El costo neto no puede ser negativo");
  }
  if (!Number.isFinite(margenPorcentaje)) {
    throw new Error("El margen no es un numero");
  }
  if (margenPorcentaje < 0) {
    throw new Error("El margen no puede ser negativo");
  }

  const precio = costoNeto * (1 + margenPorcentaje / 100);
  return Math.round(precio * 100) / 100;
}


function convertirANumero(valor) {
  if (typeof valor === "number") {
    return valor;
  }
  if (typeof valor === "string" && valor.trim() !== "") {
    return Number(valor);
  }
  return NaN;
}

export function calcularCostoMateriales(lineas) {
  if (!Array.isArray(lineas)) {
    throw new Error("Los materiales deben ser una lista");
  }
  if (lineas.length === 0) {
    throw new Error("Debe haber al menos un material");
  }

  let total = 0;
  for (const [indice, linea] of lineas.entries()) {
    const numero = indice + 1;

    if (linea === null || typeof linea !== "object") {
      throw new Error(`Material ${numero}: los datos no son validos`);
    }

    const cantidad = convertirANumero(linea.cantidad);
    const precio = convertirANumero(linea.precio_costo);

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      throw new Error(`Material ${numero}: la cantidad debe ser un numero mayor que 0`);
    }
    if (!Number.isFinite(precio) || precio < 0) {
      throw new Error(`Material ${numero}: el precio debe ser un numero mayor o igual a 0`);
    }

    total += cantidad * precio;
  }

  return Math.round(total * 100) / 100;
}