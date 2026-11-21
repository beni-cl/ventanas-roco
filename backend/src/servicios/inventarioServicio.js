import { sequelize } from "../config/baseDatos.js";
import { Material } from "../modelos/index.js";
import { registrarAuditoria } from "./auditoria.js";
import { ErrorHttp, leerId } from "./errorHttp.js";

const MAX_PRECIO = 99999999.99;

const aNumero = (valor) =>
  valor === null || valor === undefined ? null : Number(valor);

function formatear(material) {
  return {
    id_material: material.id_material,
    id_serie: material.id_serie,
    nombre_insumo: material.nombre_insumo,
    categoria: material.categoria,
    unidad_medida: material.unidad_medida,
    precio_costo: aNumero(material.precio_costo),
  };
}

function leerPrecio(datos) {
  if (datos === null || typeof datos !== "object" || Array.isArray(datos)) {
    throw new ErrorHttp(400, "Los datos no son validos");
  }
  const valor = datos.precio_costo;
  const vacio =
    valor === undefined ||
    valor === null ||
    (typeof valor === "string" && valor.trim() === "");
  if (vacio) {
    throw new ErrorHttp(400, "precio_costo es obligatorio");
  }
  const numero =
    typeof valor === "number"
      ? valor
      : typeof valor === "string"
        ? Number(valor)
        : NaN;
  if (!Number.isFinite(numero)) {
    throw new ErrorHttp(400, "precio_costo debe ser un numero");
  }
  if (numero < 0) {
    throw new ErrorHttp(400, "precio_costo no puede ser negativo");
  }
  if (numero > MAX_PRECIO) {
    throw new ErrorHttp(400, `precio_costo no puede superar ${MAX_PRECIO}`);
  }
  return Math.round(numero * 100) / 100;
}

export async function listarInventario() {
  const materiales = await Material.findAll({
    where: { activo: true },
    order: [
      ["categoria", "ASC"],
      ["nombre_insumo", "ASC"],
    ],
  });
  return materiales.map(formatear);
}

export async function actualizarPrecio(idTexto, usuario, datos, ip) {
  const id = leerId(idTexto);
  const precio = leerPrecio(datos);

  return sequelize.transaction(async (transaccion) => {
    const material = await Material.findByPk(id, {
      transaction: transaccion,
      lock: transaccion.LOCK.UPDATE,
    });
    if (!material || !material.activo) {
      throw new ErrorHttp(404, "Material no encontrado");
    }

    const anterior = {
      id_material: material.id_material,
      nombre_insumo: material.nombre_insumo,
      precio_costo: aNumero(material.precio_costo),
    };

    await material.update(
      { precio_costo: precio },
      { transaction: transaccion },
    );

    registrarAuditoria({
      id_usuario: Number(usuario.id),
      accion: "UPDATE_INVENTARIO_PRECIO",
      ip: ip || "desconocida",
      estado_anterior: anterior,
      estado_posterior: {
        id_material: material.id_material,
        nombre_insumo: material.nombre_insumo,
        precio_costo: aNumero(material.precio_costo),
      },
    });

    return formatear(material);
  });
}
