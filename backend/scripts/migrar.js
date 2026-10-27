// Aplica en orden las migraciones SQL de database/migraciones
// que todavía no se han aplicado en esta base de datos.
// Uso: npm run db:migrar
import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const carpeta = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "database",
  "migraciones"
);
const cliente = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function migrar() {
  await cliente.connect();

  // Tabla de control: anota qué migraciones ya se aplicaron
  await cliente.query(`
    CREATE TABLE IF NOT EXISTS migraciones_aplicadas (
      nombre VARCHAR(255) PRIMARY KEY,
      fecha  TIMESTAMP NOT NULL DEFAULT NOW()
    )`);

  const { rows } = await cliente.query("SELECT nombre FROM migraciones_aplicadas");
  const aplicadas = new Set(rows.map((fila) => fila.nombre));

  const archivos = (await readdir(carpeta))
    .filter((archivo) => archivo.endsWith(".sql"))
    .sort();

  let nuevas = 0;
  for (const archivo of archivos) {
    if (aplicadas.has(archivo)) continue;

    const sql = await readFile(path.join(carpeta, archivo), "utf8");
    try {
      // Todo o nada: si falla una línea, no queda nada a medias
      await cliente.query("BEGIN");
      await cliente.query(sql);
      await cliente.query("INSERT INTO migraciones_aplicadas (nombre) VALUES ($1)", [archivo]);
      await cliente.query("COMMIT");
      console.log(`Aplicada: ${archivo}`);
      nuevas++;
    } catch (error) {
      await cliente.query("ROLLBACK");
      console.error(`Error en ${archivo}: ${error.message}`);
      process.exitCode = 1;
      return;
    }
  }

  if (nuevas === 0) console.log("La base de datos ya está al día.");
}

migrar()
  .catch((error) => {
    console.error(`No se pudo migrar: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => cliente.end());
