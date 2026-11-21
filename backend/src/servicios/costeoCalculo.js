import { calcularCostoMateriales } from "./calculadorCostosEngine.js";

export function promedioPrecios(materiales) {
  if (!Array.isArray(materiales) || materiales.length === 0) {
    throw new Error("No hay materiales para promediar el precio");
  }
  let suma = 0;
  for (const material of materiales) {
    const valor = material?.precio_costo;
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
