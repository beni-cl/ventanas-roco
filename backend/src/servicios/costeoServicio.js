import { Op } from "sequelize";
import {
  Material,
  Serie,
  VentanaConfigurada,
  Despiece,
} from "../modelos/index.js";
import { ErrorHttp } from "./errorHttp.js";
import {
  calcularCostoMaterialesVentanas,
  calcularDesgloseVentanas,
  promedioPrecios,
} from "./costeoCalculo.js";

const CATEGORIAS_PERFIL = ["PerfilAluminio", "PerfilPVC"];

const escaparLike = (texto) => texto.replace(/[\\%_]/g, "\\$&");

async function cargarDatosDeCosteo(idCotizacion, transaccion) {
  const ventanas = await VentanaConfigurada.findAll({
    where: { id_cotizacion: idCotizacion },
    include: [{ model: Despiece, as: "despiece" }],
    order: [["id_configuracion", "ASC"]],
    transaction: transaccion,
  });
  if (ventanas.length === 0) {
    throw new ErrorHttp(422, "La cotizacion no tiene ventanas");
  }

  const datos = [];
  for (const [indice, ventana] of ventanas.entries()) {
    const numero = indice + 1;
    if (!ventana.despiece) {
      throw new ErrorHttp(
        422,
        `Ventana ${numero}: no tiene despiece calculado`,
      );
    }

    const serie = await Serie.findOne({
      where: { nombre: ventana.tipo_perfil },
      transaction: transaccion,
    });
    if (!serie) {
      throw new ErrorHttp(
        422,
        `Ventana ${numero}: la serie "${ventana.tipo_perfil}" no existe en el catalogo`,
      );
    }

    const perfiles = await Material.findAll({
      where: {
        id_serie: serie.id_serie,
        categoria: { [Op.in]: CATEGORIAS_PERFIL },
        activo: true,
      },
      transaction: transaccion,
    });
    if (perfiles.length === 0) {
      throw new ErrorHttp(
        422,
        `Ventana ${numero}: la serie "${serie.nombre}" no tiene perfiles con precio`,
      );
    }

    const vidrio = await Material.findOne({
      where: {
        categoria: "Vidrio",
        activo: true,
        nombre_insumo: { [Op.iLike]: `%${escaparLike(ventana.tipo_vidrio)}%` },
      },
      order: [["id_material", "ASC"]],
      transaction: transaccion,
    });
    if (!vidrio) {
      throw new ErrorHttp(
        422,
        `Ventana ${numero}: no hay un vidrio "${ventana.tipo_vidrio}" en el inventario`,
      );
    }

    datos.push({
      cantidad: ventana.cantidad,
      metros_lineales: ventana.despiece.cortes_json?.metros_lineales,
      superficie_vidrio_m2: ventana.despiece.superficie_vidrio_m2,
      precio_perfil_metro: promedioPrecios(perfiles),
      precio_vidrio_m2: vidrio.precio_costo,
    });
  }
  return datos;
}

export async function calcularMaterialesDeCotizacion(
  idCotizacion,
  transaccion,
) {
  const datos = await cargarDatosDeCosteo(idCotizacion, transaccion);
  return calcularCostoMaterialesVentanas(datos);
}

export async function calcularDesgloseDeCotizacion(idCotizacion, transaccion) {
  const datos = await cargarDatosDeCosteo(idCotizacion, transaccion);
  return {
    ...calcularDesgloseVentanas(datos),
    total: calcularCostoMaterialesVentanas(datos),
  };
}
