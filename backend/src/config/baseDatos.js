import "dotenv/config";
import { Sequelize } from "sequelize";

// Conexión a PostgreSQL usando la dirección del archivo .env.
// En internet (DATABASE_SSL=true) la conexión se hace con SSL.
const usarSsl = process.env.DATABASE_SSL === "true";

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: usarSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
});
