ALTER TABLE cotizaciones
  ALTER COLUMN fecha_creacion TYPE TIMESTAMPTZ
  USING fecha_creacion AT TIME ZONE 'UTC';