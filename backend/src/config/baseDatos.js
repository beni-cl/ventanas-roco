import { Sequelize } from "sequelize";

// Conexión a PostgreSQL usando la dirección del archivo .env
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});