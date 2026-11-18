import {
  validarMedidas,
  calcularDespiece,
} from "../src/servicios/motorDespieceAlgoritmo.js";

//.toBe(valor): la función devuelve el valor exacto que esperas.
//.toThrow(): la función lanza error con datos que el sistema no debe aceptar.
//.not.toThrow(): la función no lanza error con datos que sí debe aceptar.
//atrapa si el sistema lanza error o no y compara con lo que se espera

//PRUEBAS DE VALIDACION DE MEDIDAS U01

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
  expect(() => validarMedidas(3001, 1120)).toThrow(
    "debe estar entre 500 y 3000 mm",
  );
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

test("validarMedidas no lanza error si el ancho tiene decimales", () => {
  expect(() => validarMedidas(2233.5, 1120)).not.toThrow();
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
  expect(() => validarMedidas(2345, 3001)).toThrow(
    "debe estar entre 500 y 3000 mm",
  );
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

test("validarMedidas no lanza error si el alto tiene decimales", () => {
  expect(() => validarMedidas(1780, 1120.5)).not.toThrow();
});

// Pruebas de aceptacion

test("validarMedidas no lanza error con medidas del prototipo (1780 x 1120)", () => {
  expect(() => validarMedidas(1780, 1120)).not.toThrow();
});

//PRUEBAS DE DESPIECE U02

// Calcular piezas

test("calcularDespiece devuelve 1.99 m² de vidrio para 1780 x 1120", () => {
  const resultado = calcularDespiece(1780, 1120, "Aluminio");
  expect(resultado.superficie_vidrio_m2).toBe(1.99);
});

test("calcularDespiece devuelve 5.79 m de perfil para 1780 x 1120", () => {
  const resultado = calcularDespiece(1780, 1120, "Aluminio");
  expect(resultado.metros_lineales).toBe(5.79);
});

test("calcularDespiece devuelve 2 horizontales de 1778mm", () => {
  const resultado = calcularDespiece(1780, 1120, "Aluminio");
  expect(resultado.perfiles[0]).toEqual({
    pieza: "Horizontal",
    cantidad: 2,
    longitud_mm: 1778,
  });
});

test("calcularDespiece devuelve 2 verticales de 1118 mm", () => {
  const resultado = calcularDespiece(1780, 1120, "Aluminio");
  expect(resultado.perfiles[1]).toEqual({
    pieza: "Vertical",
    cantidad: 2,
    longitud_mm: 1118,
  });
});

//validar medidas del despiece

// Validar Ancho

test("calcularDespiece lanza error si el ancho es 499", () => {
  expect(() => calcularDespiece(499, 1120, "Aluminio")).toThrow();
});

test("calcularDespiece lanza error si el ancho es 3001", () => {
  expect(() => calcularDespiece(3001, 1120, "Aluminio")).toThrow();
});

//Validar alto

test("calcularDespiece lanza error si el alto es 499 ", () => {
  expect(() => calcularDespiece(1234, 499, "Aluminio")).toThrow();
});

test("calcularDespiece lanza error si el alto es 3001", () => {
  expect(() => calcularDespiece(2000, 3001, "Aluminio")).toThrow();
});

//Validar material y aluminio

test("calcularDespiece lanza error si el material es Madera", () => {
  expect(() => calcularDespiece(1780, 1120, "Madera")).toThrow("Solo se acepta PVC o Aluminio");
});

test("calcularDespiece lanza error si el material es undefined", () => {
  expect(() => calcularDespiece(1780, 1120, undefined)).toThrow("Solo se acepta PVC o Aluminio");
});

test("calcularDespiece lanza error si el material es aluminio", () => {
  expect(() => calcularDespiece(1780, 1120, "aluminio")).toThrow("Solo se acepta PVC o Aluminio");
});

test("calcularDespiece no lanza error si el material es Aluminio", () => {
  expect(() => calcularDespiece(1780, 1120, "Aluminio")).not.toThrow();
});

test("calcularDespiece calcula con la medida mínima (500 x 500) en Aluminio", () => {
  const resultado = calcularDespiece(500, 500, "Aluminio");
  expect(resultado.metros_lineales).toBe(1.99);
  expect(resultado.superficie_vidrio_m2).toBe(0.25);
});

test("calcularDespiece calcula con la medida máxima (3000 x 3000) en Aluminio", () => {
  const resultado = calcularDespiece(3000, 3000, "Aluminio");
  expect(resultado.metros_lineales).toBe(11.99);
  expect(resultado.superficie_vidrio_m2).toBe(8.99);
});

// validar PVC

test("calcularDespiece devuelve 1.98 m² de vidrio para 1780 x 1120 en PVC", () => {
  const resultado = calcularDespiece(1780, 1120, "PVC");
  expect(resultado.superficie_vidrio_m2).toBe(1.98);
});

test("calcularDespiece devuelve 5.78 m de perfil para 1780 x 1120 en PVC", () => {
  const resultado = calcularDespiece(1780, 1120, "PVC");
  expect(resultado.metros_lineales).toBe(5.78);
});

test("calcularDespiece devuelve 2 horizontales de 1775 mm en PVC", () => {
  const resultado = calcularDespiece(1780, 1120, "PVC");
  expect(resultado.perfiles[0]).toEqual({
    pieza: "Horizontal",
    cantidad: 2,
    longitud_mm: 1775,
  });
});

test("calcularDespiece devuelve 2 verticales de 1115 mm en PVC", () => {
  const resultado = calcularDespiece(1780, 1120, "PVC");
  expect(resultado.perfiles[1]).toEqual({
    pieza: "Vertical",
    cantidad: 2,
    longitud_mm: 1115,
  });
});

test("calcularDespiece no lanza error si el material es PVC", () => {
  expect(() => calcularDespiece(1780, 1120, "PVC")).not.toThrow();
});
