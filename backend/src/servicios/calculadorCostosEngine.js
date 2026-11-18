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
