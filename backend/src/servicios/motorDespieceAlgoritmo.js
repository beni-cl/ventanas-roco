import { REGLAS } from "./reglasFabricacion.js";

export function validarMedidas(ancho, alto) {
  if (!Number.isFinite(ancho)) {
    throw new Error("El valor del ancho no es un numero");
  }

  if (ancho < REGLAS.medidaMinimaMm || ancho > REGLAS.medidaMaximaMm) {
    throw new Error(`El ancho debe estar entre ${REGLAS.medidaMinimaMm} y ${REGLAS.medidaMaximaMm} mm`);
  }
    
  if (!Number.isFinite(alto)) {
    throw new Error("El valor del alto no es un numero");
  }

  if (alto < REGLAS.medidaMinimaMm || alto > REGLAS.medidaMaximaMm) {
    throw new Error(`El alto debe estar entre ${REGLAS.medidaMinimaMm} y ${REGLAS.medidaMaximaMm} mm`);
  }
}
