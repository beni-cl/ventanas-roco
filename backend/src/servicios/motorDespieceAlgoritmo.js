import { REGLAS } from "./reglasFabricacion.js";

// Se valida si es un numero y si esta dentro del rango
export function validarMedidas(ancho, alto) {
  if (!Number.isFinite(ancho)) {
    throw new Error("El valor del ancho no es un numero");
  }

  if (ancho < REGLAS.medidaMinimaMm || ancho > REGLAS.medidaMaximaMm) {
    throw new Error(
      `El ancho debe estar entre ${REGLAS.medidaMinimaMm} y ${REGLAS.medidaMaximaMm} mm`,
    );
  }

  if (!Number.isFinite(alto)) {
    throw new Error("El valor del alto no es un numero");
  }

  if (alto < REGLAS.medidaMinimaMm || alto > REGLAS.medidaMaximaMm) {
    throw new Error(
      `El alto debe estar entre ${REGLAS.medidaMinimaMm} y ${REGLAS.medidaMaximaMm} mm`,
    );
  }
}

export function calcularDespiece(ancho, alto, material) {
  validarMedidas(ancho, alto);
  if (REGLAS.descuentoHuecoMm[material] === undefined) {
    throw new Error("Solo se acepta PVC o Aluminio");
  }

  //Se busca el material que es y se aplica descuento
  const descuento = REGLAS.descuentoHuecoMm[material];
  const anchoFinal = ancho - descuento;
  const altoFinal = alto - descuento;

  //aqui se calcula el vidrio y se redondea a 2 decimales
  const vidrioM2 = (anchoFinal / 1000) * (altoFinal / 1000);
  const vidrioRedondeado = Math.round(vidrioM2 * 100) / 100;

  //aqui se calcula el perfil y redondea a 2 decimales
  const perfilMm = 2 * anchoFinal + 2 * altoFinal;
  const perfilM = Math.round((perfilMm / 1000) * 100) / 100;

  return {
    perfiles: [
      { pieza: "Horizontal", cantidad: 2, longitud_mm: anchoFinal },
      { pieza: "Vertical", cantidad: 2, longitud_mm: altoFinal },
    ],
    metros_lineales: perfilM,
    superficie_vidrio_m2: vidrioRedondeado,
  };
}
