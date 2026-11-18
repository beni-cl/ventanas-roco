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


