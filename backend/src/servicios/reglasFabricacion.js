// Reglas de fabricación: valores que pueden cambiar cuando el fabricante confirme.
// Se cambian aquí, no dentro de las fórmulas.
export const REGLAS = {
  medidaMinimaMm: 500,
  medidaMaximaMm: 3000,


  // Descuento por material. Pendiente de confirmar: si la medida del cliente es la del hueco.
  descuentoHuecoMm: {
    Aluminio: 2,
    PVC: 5,
  },

  //El porcentaje de merma es de 5%
  mermaPorcentaje:5,
};
