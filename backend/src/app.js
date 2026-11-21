import "dotenv/config";
import { crearApp } from "./crearApp.js";

// Sin JWT_SECRET no se puede firmar tokens: mejor fallar al encender que a medio uso
if (!process.env.JWT_SECRET) {
  console.error("Falta JWT_SECRET. Agrégalo a backend/.env (mira .env.example).");
  process.exit(1);
}

const app = crearApp();
const PUERTO = process.env.PORT || 8080;

app.listen(PUERTO, () => {
  console.log(`Servidor en http://localhost:${PUERTO}`);
  console.log(`Prueba: http://localhost:${PUERTO}/api/salud`);
});
