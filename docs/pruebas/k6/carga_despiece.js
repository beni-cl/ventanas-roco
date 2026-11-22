import http from "k6/http";
import { check } from "k6";

const BASE = __ENV.BASE_URL || "https://ventanas-roco.onrender.com";
const CABECERAS = { headers: { "Content-Type": "application/json" } };
const CUERPO = JSON.stringify({
  anchoMm: 1780,
  altoMm: 1120,
  material: "Aluminio",
});

export const options = {
  scenarios: {
    carga: {
      executor: "constant-arrival-rate",
      rate: 60,
      timeUnit: "1m",
      duration: "1m",
      preAllocatedVUs: 5,
      maxVUs: 10,
      exec: "carga",
      tags: { escenario: "carga" },
    },
    estres: {
      executor: "constant-arrival-rate",
      rate: 150,
      timeUnit: "1m",
      duration: "1m",
      startTime: "90s",
      preAllocatedVUs: 10,
      maxVUs: 20,
      exec: "estres",
      tags: { escenario: "estres" },
    },
  },
  thresholds: {
    "http_req_failed{escenario:carga}": ["rate<0.01"],
    "http_req_duration{escenario:carga}": ["p(95)<3000"],
    "checks{escenario:estres}": ["rate==1"],
  },
};

export function setup() {
  http.get(`${BASE}/api/salud`, { timeout: "120s" });
}

export function carga() {
  const res = http.post(`${BASE}/api/despiece/calcular`, CUERPO, CABECERAS);
  check(res, {
    "responde 200": (r) => r.status === 200,
    "trae el corte de 1778 mm": (r) => r.body.includes("1778"),
  });
}

export function estres() {
  const res = http.post(`${BASE}/api/despiece/calcular`, CUERPO, CABECERAS);
  check(res, {
    "responde 200 o 429": (r) => r.status === 200 || r.status === 429,
    "sin errores 5xx": (r) => r.status < 500,
  });
}