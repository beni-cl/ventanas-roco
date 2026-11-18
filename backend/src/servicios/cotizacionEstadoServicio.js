const TRANSICIONES_PERMITIDAS = {
  "Pendiente": ["En Revisión"],
  "En Revisión": ["Respondida"],
  "Respondida": [],
};

export function verificarModificable(cotizacion) {
  if (cotizacion === null || typeof cotizacion !== "object" || Array.isArray(cotizacion)) {
    throw new Error("La cotizacion no es valida");
  }
  if (cotizacion.congelado === true) {
    throw new Error("La cotizacion esta congelada y no se puede modificar");
  }
}

export function validarTransicion(estadoActual, estadoNuevo) {
  if (!Object.hasOwn(TRANSICIONES_PERMITIDAS, estadoActual)) {
    throw new Error("El estado actual no es valido");
  }
  if (!TRANSICIONES_PERMITIDAS[estadoActual].includes(estadoNuevo)) {
    throw new Error(`No se puede pasar de ${estadoActual} a ${estadoNuevo}`);
  }
}