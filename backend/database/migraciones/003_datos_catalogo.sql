-- 003_datos_catalogo.sql
-- Carga las series y los materiales que se muestran en el catálogo.
-- DATOS DE EJEMPLO: reemplazar por los reales de Gerardo con una migración
-- nueva (por ejemplo 004_actualiza_catalogo.sql). No editar este archivo.

-- ========== Series ==========
INSERT INTO series (nombre, tipo_material) VALUES
  ('Aluminio Corredera Línea 25', 'Aluminio'),
  ('Aluminio Corredera Línea 32', 'Aluminio'),
  ('Aluminio Proyectante Línea 42', 'Aluminio'),
  ('PVC Corredera 60', 'PVC'),
  ('PVC Europeo 70', 'PVC');

-- ========== Materiales ==========
-- precio_costo en pesos chilenos (CLP). El público NO ve esta columna.
INSERT INTO materiales_inventario
  (id_serie, nombre_insumo, categoria, precio_costo, unidad_medida)
SELECT s.id_serie, m.nombre_insumo, m.categoria, m.precio_costo, m.unidad_medida
FROM (VALUES
  -- Perfiles de aluminio
  ('Aluminio Corredera Línea 25',   'Perfil marco Línea 25',          'PerfilAluminio', 4200.00, 'MetroLineal'),
  ('Aluminio Corredera Línea 25',   'Perfil hoja Línea 25',           'PerfilAluminio', 3800.00, 'MetroLineal'),
  ('Aluminio Corredera Línea 32',   'Perfil marco Línea 32',          'PerfilAluminio', 5400.00, 'MetroLineal'),
  ('Aluminio Corredera Línea 32',   'Perfil hoja Línea 32',           'PerfilAluminio', 4900.00, 'MetroLineal'),
  ('Aluminio Proyectante Línea 42', 'Perfil marco Línea 42',          'PerfilAluminio', 6100.00, 'MetroLineal'),
  ('Aluminio Proyectante Línea 42', 'Perfil hoja Línea 42',           'PerfilAluminio', 5600.00, 'MetroLineal'),
  -- Perfiles de PVC
  ('PVC Corredera 60',              'Perfil marco PVC 60',            'PerfilPVC',      6800.00, 'MetroLineal'),
  ('PVC Corredera 60',              'Perfil hoja PVC 60',             'PerfilPVC',      6200.00, 'MetroLineal'),
  ('PVC Europeo 70',                'Perfil marco PVC 70',            'PerfilPVC',      8900.00, 'MetroLineal'),
  ('PVC Europeo 70',                'Perfil hoja PVC 70',             'PerfilPVC',      8300.00, 'MetroLineal'),
  -- Vidrios (sin serie: sirven para todas)
  (NULL,                            'Vidrio float incoloro 4 mm',     'Vidrio',        11500.00, 'MetroCuadrado'),
  (NULL,                            'Vidrio float incoloro 5 mm',     'Vidrio',        14200.00, 'MetroCuadrado'),
  (NULL,                            'Vidrio laminado 6 mm',           'Vidrio',        26500.00, 'MetroCuadrado'),
  (NULL,                            'Termopanel (DVH) 4+12+4 mm',     'Vidrio',        38900.00, 'MetroCuadrado'),
  -- Accesorios
  (NULL,                            'Cierre de embutir',              'Accesorio',      3200.00, 'Unidad'),
  (NULL,                            'Juego de rodamientos',           'Accesorio',      4500.00, 'Unidad'),
  (NULL,                            'Felpa de hermeticidad',          'Accesorio',       450.00, 'MetroLineal'),
  (NULL,                            'Burlete de vidrio',              'Accesorio',       600.00, 'MetroLineal'),
  (NULL,                            'Escuadra de unión',              'Accesorio',       800.00, 'Unidad'),
  (NULL,                            'Manilla proyectante',            'Accesorio',      5900.00, 'Unidad')
) AS m (serie, nombre_insumo, categoria, precio_costo, unidad_medida)
LEFT JOIN series s ON s.nombre = m.serie;
