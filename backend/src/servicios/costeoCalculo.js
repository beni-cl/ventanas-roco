import { calcularCostoMateriales } from "./calculadorCostosEngine.js";

// Promedio simple del precio de los perfiles de una serie (marco y hoja). PROVISORIO:
// con los precios reales de Gerardo habria que cobrar cada pieza con su perfil.
export function promedioPrecios(materiales) {
  if (!Array.isArray(materiales) || materiales.length === 0) {
    throw new Error("No hay materiales para promediar el precio");
  }
  let suma = 0;
  for (const material of materiales) {
    const valor = material?.precio_costo;
    // Number(null) da 0 y Number("") da 0: se revisan antes para que no pasen como "gratis"
    if (valor === null || valor === undefined || valor === "") {
      throw new Error("El precio de un material no es valido");
    }
    const precio = Number(valor);
    if (!Number.isFinite(precio) || precio < 0) {
      throw new Error("El precio de un material no es valido");
    }
    suma += precio;
  }
  return suma / materiales.length;
}

// Costo de materiales de toda la cotizacion: perfil (metros x precio) + vidrio (m2 x precio),
// multiplicado por la cantidad de cada ventana. Todavia SIN merma: la agrega calcularCostoNeto.
export function calcularCostoMaterialesVentanas(ventanas) {
  if (!Array.isArray(ventanas) || ventanas.length === 0) {
    throw new Error("La cotizacion no tiene ventanas");
  }
  const lineas = [];
  for (const ventana of ventanas) {
    if (ventana === null || typeof ventana !== "object") {
      throw new Error("Los datos de la ventana no son validos");
    }
    const cantidad = Number(ventana.cantidad);
    lineas.push({
      cantidad: Number(ventana.metros_lineales) * cantidad,
      precio_costo: ventana.precio_perfil_metro,
    });
    lineas.push({
      cantidad: Number(ventana.superficie_vidrio_m2) * cantidad,
      precio_costo: ventana.precio_vidrio_m2,
    });
  }
  return calcularCostoMateriales(lineas);
}