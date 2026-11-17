import { validarMedidas } from "../src/servicios/motorDespieceAlgoritmo.js";

//.toBe(valor): la función devuelve el valor exacto que esperas.
//.toThrow(): la función lanza error con datos que el sistema no debe aceptar.
//.not.toThrow(): la función no lanza error con datos que sí debe aceptar.
//atrapa si el sistema lanza error o no y compara con lo que se espera

//Pruebas del Ancho

test("validarMedidas lanza error si el ancho es menor a 500", () => {
  expect(() => validarMedidas(20, 1120)).toThrow();
});

test("validarMedidas lanza error si el ancho es 499", () => {
  expect(() => validarMedidas(499, 1120)).toThrow();
});

test("validarMedidas no lanza error si el ancho es 500 (límite inferior)", () => {
  expect(() => validarMedidas(500, 1120)).not.toThrow();
});

test("validarMedidas lanza error si el ancho es texto", () => {
  expect(() => validarMedidas("abc", 1120)).toThrow("no es un numero");
});

test("validarMedidas lanza error si el ancho es undefined", () => {
  expect(() => validarMedidas(undefined, 1120)).toThrow();
});

test("validarMedidas no lanza error si el ancho es 3000 (límite superior)", () => {
  expect(() => validarMedidas(3000, 1120)).not.toThrow();
});

test("validarMedidas lanza error si el ancho es 3001", () => {
  expect(() => validarMedidas(3001, 1120)).toThrow("debe estar entre 500 y 3000 mm");
});

test("validarMedidas lanza error si el ancho es negativo", () => {
  expect(() => validarMedidas(-2345, 1120)).toThrow();
});

test("validarMedidas lanza error si el ancho es 0", () => {
  expect(() => validarMedidas(0, 1120)).toThrow();
});

test("validarMedidas lanza error si el ancho es nulo", () => {
  expect(() => validarMedidas(null, 1120)).toThrow();
});

test("validarMedidas lanza error si el ancho es texto vacío", () => {
  expect(() => validarMedidas("", 1120)).toThrow();
});

test("validarMedidas lanza error si el ancho es un número escrito como texto", () => {
  expect(() => validarMedidas("1500", 1120)).toThrow();
});



// Pruebas del alto

test("validarMedidas lanza error si el alto es menor a 500", () => {
  expect(() => validarMedidas(1780, 50)).toThrow();
});

test("validarMedidas lanza error si el alto es 499", () => {
  expect(() => validarMedidas(1230, 499)).toThrow();
});

test("validarMedidas no lanza error si el alto es 500 (límite inferior)", () => {
  expect(() => validarMedidas(1000, 500)).not.toThrow();
});

test("validarMedidas lanza error si el alto es texto", () => {
  expect(() => validarMedidas(1234, "abc")).toThrow("no es un numero");
});

test("validarMedidas lanza error si el alto es undefined", () => {
  expect(() => validarMedidas(1234, undefined)).toThrow();
});

test("validarMedidas no lanza error si el alto es 3000 (límite superior)", () => {
  expect(() => validarMedidas(2000, 3000)).not.toThrow();
});

test("validarMedidas lanza error si el alto es 3001", () => {
  expect(() => validarMedidas(2345, 3001)).toThrow("debe estar entre 500 y 3000 mm");
});

test("validarMedidas lanza error si el alto es negativo", () => {
  expect(() => validarMedidas(1780, -1000)).toThrow();
});

test("validarMedidas lanza error si el alto es 0", () => {
  expect(() => validarMedidas(1780, 0)).toThrow();
});

test("validarMedidas lanza error si el alto es nulo", () => {
  expect(() => validarMedidas(1780, null)).toThrow();
});

test("validarMedidas lanza error si el alto es texto vacío", () => {
  expect(() => validarMedidas(1780, "")).toThrow();
});

test("validarMedidas lanza error si el alto es un número escrito como texto", () => {
  expect(() => validarMedidas(1780, "1500")).toThrow();
});

// Pruebas de aceptacion

test("validarMedidas no lanza error si el ancho tiene decimales", () => {
  expect(() => validarMedidas(2233.5, 1120)).not.toThrow();
});

test("validarMedidas no lanza error si el alto tiene decimales", () => {
  expect(() => validarMedidas(1780, 1120.5)).not.toThrow();
});

test("validarMedidas no lanza error con medidas del prototipo (1780 x 1120)", () => {
  expect(() => validarMedidas(1780, 1120)).not.toThrow();
});

