// Límite de peticiones (express-rate-limit).
// En las pruebas automáticas (NODE_ENV=test) se desactivan, salvo que se pida lo contrario.
import { rateLimit } from "express-rate-limit";

export function crearLimitador({ ventanaMs, maximo, mensaje, soloFallidas = false, siempre = false }) {
  return rateLimit({
    windowMs: ventanaMs,
    limit: maximo,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests: soloFallidas,
    skip: () => !siempre && process.env.NODE_ENV === "test",
    handler: (req, res) => res.status(429).json({ error: mensaje }),
  });
}

// General: 100 peticiones por minuto por persona (IP)
export const limitadorGeneral = crearLimitador({
  ventanaMs: 60 * 1000,
  maximo: 100,
  mensaje: "Demasiadas peticiones. Espera un minuto e inténtalo de nuevo",
});

// Login: más estricto. Solo cuentan los intentos fallidos (10 cada 15 minutos)
export const limitadorLogin = crearLimitador({
  ventanaMs: 15 * 60 * 1000,
  maximo: 10,
  soloFallidas: true,
  mensaje: "Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo",
});

// Registro: 20 cuentas nuevas por hora por IP
export const limitadorRegistro = crearLimitador({
  ventanaMs: 60 * 60 * 1000,
  maximo: 20,
  mensaje: "Demasiados registros desde tu conexión. Inténtalo más tarde",
});
