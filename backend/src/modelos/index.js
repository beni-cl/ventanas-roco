// Modelos Sequelize: una "ficha" por cada tabla del modelo Entidad-Relación.
// Los nombres de columnas son los mismos que en las migraciones SQL.
// OJO: Sequelize entrega los DECIMAL como texto ("4200.00"). Usar Number() al calcular.
import { DataTypes } from "sequelize";
import { sequelize } from "../config/baseDatos.js";

// Opciones comunes: las tablas no tienen created_at/updated_at de Sequelize
const base = { timestamps: false, freezeTableName: true };

// ========== Usuarios y seguridad (RBAC) ==========

export const Rol = sequelize.define(
  "Rol",
  {
    id_rol: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    descripcion: DataTypes.STRING(150),
  },
  { ...base, tableName: "roles" }
);

export const Permiso = sequelize.define(
  "Permiso",
  {
    id_permiso: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    descripcion: { type: DataTypes.STRING(150), allowNull: false },
  },
  { ...base, tableName: "permisos" }
);

export const RolPermiso = sequelize.define(
  "RolPermiso",
  {
    id_rol: { type: DataTypes.INTEGER, primaryKey: true },
    id_permiso: { type: DataTypes.INTEGER, primaryKey: true },
  },
  { ...base, tableName: "rol_permiso" }
);

export const Usuario = sequelize.define(
  "Usuario",
  {
    id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    id_rol: { type: DataTypes.INTEGER, allowNull: false },
    telefono: DataTypes.STRING(20),
    direccion: DataTypes.STRING(150),
    especialidad: DataTypes.STRING(60),
    fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { ...base, tableName: "usuarios" }
);

// ========== Catálogo e inventario ==========

export const Serie = sequelize.define(
  "Serie",
  {
    id_serie: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    tipo_material: { type: DataTypes.STRING(20), allowNull: false },
    activa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { ...base, tableName: "series" }
);

export const Material = sequelize.define(
  "Material",
  {
    id_material: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_serie: DataTypes.INTEGER,
    nombre_insumo: { type: DataTypes.STRING(100), allowNull: false },
    categoria: { type: DataTypes.STRING(30), allowNull: false },
    precio_costo: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // SOLO Fabricante
    unidad_medida: { type: DataTypes.STRING(20), allowNull: false },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { ...base, tableName: "materiales_inventario" }
);

// ========== Cotizaciones ==========

export const Cotizacion = sequelize.define(
  "Cotizacion",
  {
    id_cotizacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero_orden: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    id_cliente: { type: DataTypes.INTEGER, allowNull: false },
    id_fabricante: DataTypes.INTEGER,
    estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Pendiente" },
    costo_neto: DataTypes.DECIMAL(10, 2),
    margen_aplicado: DataTypes.DECIMAL(5, 2),
    precio_final: DataTypes.DECIMAL(10, 2),
    congelado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { ...base, tableName: "cotizaciones" }
);

export const VentanaConfigurada = sequelize.define(
  "VentanaConfigurada",
  {
    id_configuracion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_cotizacion: { type: DataTypes.INTEGER, allowNull: false },
    alto_mm: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
    ancho_mm: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
    tipo_perfil: { type: DataTypes.STRING(30), allowNull: false },
    color_perfil: { type: DataTypes.STRING(30), allowNull: false },
    tipo_vidrio: { type: DataTypes.STRING(40), allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
  },
  { ...base, tableName: "ventanas_configuradas" }
);

export const Despiece = sequelize.define(
  "Despiece",
  {
    id_despiece: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_configuracion: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    cortes_json: { type: DataTypes.JSONB, allowNull: false }, // dato no estructurado
    superficie_vidrio_m2: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
    merma_aplicada: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  },
  { ...base, tableName: "despieces" }
);

export const DespieceMaterial = sequelize.define(
  "DespieceMaterial",
  {
    id_detalle: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_despiece: { type: DataTypes.INTEGER, allowNull: false },
    id_material: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    costo_linea: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  { ...base, tableName: "despiece_material" }
);

// ========== Avisos ==========

export const Notificacion = sequelize.define(
  "Notificacion",
  {
    id_notificacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_usuario: { type: DataTypes.INTEGER, allowNull: false },
    mensaje: { type: DataTypes.STRING(255), allowNull: false },
    fecha_envio: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    leida: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { ...base, tableName: "notificaciones" }
);

// ========== Relaciones (las flechas del modelo E-R) ==========

// RBAC: roles <-> permisos (N a M) y usuarios -> rol
Rol.belongsToMany(Permiso, { through: RolPermiso, foreignKey: "id_rol", otherKey: "id_permiso", as: "permisos" });
Permiso.belongsToMany(Rol, { through: RolPermiso, foreignKey: "id_permiso", otherKey: "id_rol", as: "roles" });
Rol.hasMany(Usuario, { foreignKey: "id_rol", as: "usuarios" });
Usuario.belongsTo(Rol, { foreignKey: "id_rol", as: "rol" });

// Catálogo: una serie tiene muchos materiales
Serie.hasMany(Material, { foreignKey: "id_serie", as: "materiales" });
Material.belongsTo(Serie, { foreignKey: "id_serie", as: "serie" });

// Cotizaciones: cliente y fabricante son usuarios
Usuario.hasMany(Cotizacion, { foreignKey: "id_cliente", as: "cotizaciones" });
Cotizacion.belongsTo(Usuario, { foreignKey: "id_cliente", as: "cliente" });
Cotizacion.belongsTo(Usuario, { foreignKey: "id_fabricante", as: "fabricante" });

// Cotización -> ventanas -> despiece (1 a 1) -> materiales usados (N a M)
Cotizacion.hasMany(VentanaConfigurada, { foreignKey: "id_cotizacion", as: "ventanas" });
VentanaConfigurada.belongsTo(Cotizacion, { foreignKey: "id_cotizacion", as: "cotizacion" });
VentanaConfigurada.hasOne(Despiece, { foreignKey: "id_configuracion", as: "despiece" });
Despiece.belongsTo(VentanaConfigurada, { foreignKey: "id_configuracion", as: "ventana" });
Despiece.hasMany(DespieceMaterial, { foreignKey: "id_despiece", as: "detalles" });
DespieceMaterial.belongsTo(Despiece, { foreignKey: "id_despiece", as: "despiece" });
Material.hasMany(DespieceMaterial, { foreignKey: "id_material", as: "usos" });
DespieceMaterial.belongsTo(Material, { foreignKey: "id_material", as: "material" });

// Notificaciones
Usuario.hasMany(Notificacion, { foreignKey: "id_usuario", as: "notificaciones" });
Notificacion.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" });

export { sequelize };
