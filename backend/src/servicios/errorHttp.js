export class ErrorHttp extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.name = "ErrorHttp";
    this.estado = estado;
  }
}

const MAX_ID = 2147483647; 

export function leerId(valor) {
  const texto = String(valor);
  const numero = Number(texto);
  if (!/^\d+$/.test(texto) || numero < 1 || numero > MAX_ID) {
    throw new ErrorHttp(400, "El id de la cotizacion no es valido");
  }
  return numero;
}


export function responderError(res, error) {
  if (error instanceof ErrorHttp) {
    return res.status(error.estado).json({ error: error.message });
  }
  console.error(error.message);
  return res.status(500).json({ error: "Error interno del servidor" });
}