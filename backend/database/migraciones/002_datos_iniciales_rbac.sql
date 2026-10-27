-- 002_datos_iniciales_rbac.sql
-- Carga los 3 roles, los 8 permisos y la matriz RBAC del informe.

INSERT INTO roles (nombre, descripcion) VALUES
  ('Cliente',       'Configura ventanas, solicita cotizaciones y revisa las propias'),
  ('Fabricante',    'Revisa solicitudes, costea, ajusta márgenes y gestiona el inventario'),
  ('Administrador', 'Gestiona usuarios, roles y el catálogo de series y materiales');

INSERT INTO permisos (codigo, descripcion) VALUES
  ('COTIZACION_SOLICITAR',        'Configurar ventana y solicitar cotización'),
  ('COTIZACION_VER_PROPIAS',      'Ver el estado de sus propias cotizaciones'),
  ('DESPIECE_VER',                'Ver despiece técnico y fórmulas'),
  ('COSTOS_VER',                  'Ver costos netos, mermas y precios de insumos'),
  ('COTIZACION_AJUSTAR_CONGELAR', 'Modificar márgenes y congelar cotizaciones'),
  ('INVENTARIO_EDITAR',           'Modificar precios del inventario'),
  ('CATALOGO_GESTIONAR',          'Activar o desactivar series y materiales del catálogo'),
  ('USUARIOS_GESTIONAR',          'Gestionar usuarios y asignar roles');

-- Matriz de permisos: cada fila dice "este rol tiene este permiso"
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM (VALUES
  ('Cliente',       'COTIZACION_SOLICITAR'),
  ('Cliente',       'COTIZACION_VER_PROPIAS'),
  ('Fabricante',    'DESPIECE_VER'),
  ('Fabricante',    'COSTOS_VER'),
  ('Fabricante',    'COTIZACION_AJUSTAR_CONGELAR'),
  ('Fabricante',    'INVENTARIO_EDITAR'),
  ('Administrador', 'CATALOGO_GESTIONAR'),
  ('Administrador', 'USUARIOS_GESTIONAR')
) AS matriz (rol, permiso)
JOIN roles r    ON r.nombre = matriz.rol
JOIN permisos p ON p.codigo = matriz.permiso;
