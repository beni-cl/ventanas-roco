-- 001_esquema_inicial.sql
-- Crea las 11 tablas del modelo Entidad-Relación de Ventanas Roco.
-- La auditoría (logs_auditoria) no está aquí: se guarda en archivos JSON.

-- ========== Usuarios y seguridad (RBAC) ==========

CREATE TABLE roles (
  id_rol       SERIAL PRIMARY KEY,
  nombre       VARCHAR(20)  NOT NULL UNIQUE
               CHECK (nombre IN ('Cliente', 'Fabricante', 'Administrador')),
  descripcion  VARCHAR(150)
);

CREATE TABLE permisos (
  id_permiso   SERIAL PRIMARY KEY,
  codigo       VARCHAR(50)  NOT NULL UNIQUE,
  descripcion  VARCHAR(150) NOT NULL
);

-- Tabla intermedia N a M: qué permisos tiene cada rol
CREATE TABLE rol_permiso (
  id_rol      INT NOT NULL REFERENCES roles (id_rol) ON DELETE CASCADE,
  id_permiso  INT NOT NULL REFERENCES permisos (id_permiso) ON DELETE CASCADE,
  PRIMARY KEY (id_rol, id_permiso)
);

CREATE TABLE usuarios (
  id_usuario      SERIAL PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  email           VARCHAR(100) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,          -- hash BCrypt, nunca la contraseña
  id_rol          INT NOT NULL REFERENCES roles (id_rol),
  telefono        VARCHAR(20),                    -- solo Cliente
  direccion       VARCHAR(150),                   -- solo Cliente
  especialidad    VARCHAR(60),                    -- solo Fabricante
  fecha_registro  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========== Catálogo e inventario ==========

CREATE TABLE series (
  id_serie       SERIAL PRIMARY KEY,
  nombre         VARCHAR(60) NOT NULL UNIQUE,
  tipo_material  VARCHAR(20) NOT NULL CHECK (tipo_material IN ('Aluminio', 'PVC')),
  activa         BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE materiales_inventario (
  id_material    SERIAL PRIMARY KEY,
  id_serie       INT REFERENCES series (id_serie),  -- opcional
  nombre_insumo  VARCHAR(100)  NOT NULL,
  categoria      VARCHAR(30)   NOT NULL
                 CHECK (categoria IN ('PerfilAluminio', 'PerfilPVC', 'Vidrio', 'Accesorio')),
  precio_costo   DECIMAL(10,2) NOT NULL CHECK (precio_costo >= 0),
  unidad_medida  VARCHAR(20)   NOT NULL
                 CHECK (unidad_medida IN ('MetroLineal', 'MetroCuadrado', 'Unidad')),
  activo         BOOLEAN NOT NULL DEFAULT TRUE
);

-- ========== Cotizaciones ==========

CREATE TABLE cotizaciones (
  id_cotizacion    SERIAL PRIMARY KEY,
  numero_orden     VARCHAR(20) NOT NULL UNIQUE,
  id_cliente       INT NOT NULL REFERENCES usuarios (id_usuario),
  id_fabricante    INT REFERENCES usuarios (id_usuario),  -- se asigna al revisar
  estado           VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
                   CHECK (estado IN ('Pendiente', 'En Revisión', 'Respondida')),
  costo_neto       DECIMAL(10,2),
  margen_aplicado  DECIMAL(5,2),
  precio_final     DECIMAL(10,2),
  congelado        BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_creacion   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ventanas_configuradas (
  id_configuracion  SERIAL PRIMARY KEY,
  id_cotizacion     INT NOT NULL REFERENCES cotizaciones (id_cotizacion) ON DELETE CASCADE,
  alto_mm           DECIMAL(8,2) NOT NULL CHECK (alto_mm BETWEEN 500 AND 3000),
  ancho_mm          DECIMAL(8,2) NOT NULL CHECK (ancho_mm BETWEEN 500 AND 3000),
  tipo_perfil       VARCHAR(30) NOT NULL,
  color_perfil      VARCHAR(30) NOT NULL,
  tipo_vidrio       VARCHAR(40) NOT NULL,
  cantidad          INT NOT NULL CHECK (cantidad >= 1)
);

CREATE TABLE despieces (
  id_despiece           SERIAL PRIMARY KEY,
  id_configuracion      INT NOT NULL UNIQUE
                        REFERENCES ventanas_configuradas (id_configuracion) ON DELETE CASCADE,
  cortes_json           JSONB NOT NULL,           -- dato no estructurado
  superficie_vidrio_m2  DECIMAL(8,2) NOT NULL,
  merma_aplicada        DECIMAL(5,2) NOT NULL
);

-- Tabla intermedia N a M entre despieces e insumos
CREATE TABLE despiece_material (
  id_detalle   SERIAL PRIMARY KEY,
  id_despiece  INT NOT NULL REFERENCES despieces (id_despiece) ON DELETE CASCADE,
  id_material  INT NOT NULL REFERENCES materiales_inventario (id_material),
  cantidad     DECIMAL(10,2) NOT NULL CHECK (cantidad > 0),
  costo_linea  DECIMAL(10,2) NOT NULL
);

-- ========== Avisos ==========

CREATE TABLE notificaciones (
  id_notificacion  SERIAL PRIMARY KEY,
  id_usuario       INT NOT NULL REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
  mensaje          VARCHAR(255) NOT NULL,
  fecha_envio      TIMESTAMP NOT NULL DEFAULT NOW(),
  leida            BOOLEAN NOT NULL DEFAULT FALSE
);
