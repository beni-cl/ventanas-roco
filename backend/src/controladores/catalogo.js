// Rutas PÚBLICAS (sin token): /api/catalogo/series y /api/catalogo/materiales
// IMPORTANTE: aquí nunca se muestra precio_costo. Eso solo lo ve el Fabricante.
import { Router } from "express";
import { Op } from "sequelize";
import { Material, Serie } from "../modelos/index.js";

const router = Router();

router.get("/series", async (req, res) => {
  const series = await Serie.findAll({
    where: { activa: true },
    attributes: ["id_serie", "nombre", "tipo_material"],
    order: [["nombre", "ASC"]],
  });
  res.json(series);
});

router.get("/materiales", async (req, res) => {
  // Solo materiales activos, y que no pertenezcan a una serie desactivada
  const inactivas = await Serie.findAll({ where: { activa: false }, attributes: ["id_serie"] });
  const idsInactivas = inactivas.map((serie) => serie.id_serie);

  const filtro = { activo: true };
  if (idsInactivas.length > 0) {
    filtro[Op.or] = [{ id_serie: null }, { id_serie: { [Op.notIn]: idsInactivas } }];
  }

  const materiales = await Material.findAll({
    where: filtro,
    // Lista blanca: precio_costo NO está aquí a propósito
    attributes: ["id_material", "id_serie", "nombre_insumo", "categoria", "unidad_medida"],
    order: [
      ["categoria", "ASC"],
      ["nombre_insumo", "ASC"],
    ],
  });
  res.json(materiales);
});

export default router;
