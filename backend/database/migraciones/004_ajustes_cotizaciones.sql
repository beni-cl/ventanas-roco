
ALTER TABLE cotizaciones
    ADD COLUMN IF NOT EXISTS mano_obra   DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (mano_obra >= 0),
    ADD COLUMN IF NOT EXISTS instalacion DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (instalacion >= 0);


CREATE INDEX IF NOT EXISTS idx_cotizaciones_id_cliente ON cotizaciones (id_cliente);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_id_fabricante ON cotizaciones (id_fabricante);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones (estado);
CREATE INDEX IF NOT EXISTS idx_ventanas_id_cotizacion ON ventanas_configuradas (id_cotizacion);
CREATE INDEX IF NOT EXISTS idx_despiece_material_id_despiece ON despiece_material (id_despiece);