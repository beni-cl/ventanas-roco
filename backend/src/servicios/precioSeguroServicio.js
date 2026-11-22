import { calcularPrecioFinal } from "./calculadorCostosEngine.js";

const CAMPOS_QUE_EL_CLIENTE_NO_PUEDE_ENVIAR = [
  "costo_neto",
  "margen_aplicado",
  "precio_final",
  "congelado",
  "estado",
];

export function limpiarDatosCliente(datosCliente) {
  if (
    datosCliente === null ||
    typeof datosCliente !== "object" ||
    Array.isArray(datosCliente)
  ) {
    throw new Error("Los datos de la cotizacion no son validos");
  }

  const datosLimpios = { ...datosCliente };
  for (const campo of CAMPOS_QUE_EL_CLIENTE_NO_PUEDE_ENVIAR) {
    delete datosLimpios[campo];
  }
  return datosLimpios;
}

export function construirDatosDeEnvio(cotizacionGuardada, margenPorcentaje) {
  const costoNeto = Number(cotizacionGuardada.costo_neto);

  return {
    costo_neto: costoNeto,
    margen_aplicado: margenPorcentaje,
    precio_final: calcularPrecioFinal(costoNeto, margenPorcentaje),
    estado: "Respondida",
    congelado: true,
  };
}
