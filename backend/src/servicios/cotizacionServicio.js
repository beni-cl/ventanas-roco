import { sequelize } from "../config/baseDatos.js";
import { QueryTypes } from "sequelize";
import { Cotizacion, VentanaConfigurada, Despiece } from "../modelos/index.js";
import { REGLAS } from "./reglasFabricacion.js";

// Guarda una cotizacion completa (cotizacion + ventanas + despieces) en UNA transaccion:
// si algo falla en el medio, no queda nada a medias en la base.
// "ventanas" debe venir ya validada por prepararVentanas.
export async function guardarCotizacion(idCliente, ventanas) {
  return sequelize.transaction(async (transaccion) => {
    // Pedimos el siguiente id a la secuencia para armar el numero de orden antes de insertar
    const [fila] = await sequelize.query(
      "SELECT nextval(pg_get_serial_sequence('cotizaciones', 'id_cotizacion')) AS id",
      { type: QueryTypes.SELECT, transaction: transaccion },
    );
    const idCotizacion = Number(fila.id);
    const anio = new Date().getFullYear();
    const numeroOrden = `COT-${anio}-${String(idCotizacion).padStart(5, "0")}`;

    const cotizacion = await Cotizacion.create(
      {
        id_cotizacion: idCotizacion,
        numero_orden: numeroOrden,
        id_cliente: idCliente,
        estado: "Pendiente",
      },
      { transaction: transaccion },
    );

    for (const ventana of ventanas) {
      const configuracion = await VentanaConfigurada.create(
        {
          id_cotizacion: idCotizacion,
          alto_mm: ventana.altoMm,
          ancho_mm: ventana.anchoMm,
          tipo_perfil: ventana.tipoPerfil,
          color_perfil: ventana.colorPerfil,
          tipo_vidrio: ventana.tipoVidrio,
          cantidad: ventana.cantidad,
        },
        { transaction: transaccion },
      );

      await Despiece.create(
        {
          id_configuracion: configuracion.id_configuracion,
          cortes_json: {
            perfiles: ventana.despiece.perfiles,
            metros_lineales: ventana.despiece.metros_lineales,
          },
          superficie_vidrio_m2: ventana.despiece.superficie_vidrio_m2,
          merma_aplicada: REGLAS.mermaPorcentaje,
        },
        { transaction: transaccion },
      );
    }

    return {
      id_cotizacion: cotizacion.id_cotizacion,
      numero_orden: cotizacion.numero_orden,
      estado: cotizacion.estado,
    };
  });
}
