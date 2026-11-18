import {
  calcularCostoNeto,
  calcularPrecioFinal,
} from "../src/servicios/calculadorCostosEngine.js";

//CALCULO DE COSTOS U03 y 04

test("costo neto del prototipo: materiales 85.000 con merma 5%, mano de obra 35.000 e instalación 30.000", () => {
  expect(calcularCostoNeto(85000, 35000, 30000)).toBe(154250);
});

test("calcularCostoNeto lanza error si la mano de obra es negativa", () => {
  expect(() => calcularCostoNeto(85000, -2000, 30000)).toThrow();
});

test("calcularCostoNeto lanza error si la instalación es texto", () => {
  expect(() => calcularCostoNeto(85000, 35000, "texto")).toThrow();
});

test("calcularCostoNeto lanza error si los materiales son undefined", () => {
  expect(() => calcularCostoNeto(undefined, 35000, 30000)).toThrow();
});

test("calcularCostoNeto acepta mano de obra en 0", () => {
  expect(() => calcularCostoNeto(85000, 0, 30000)).not.toThrow();
});

describe("U04 - calcularPrecioFinal", () => {
  test("prototipo: 154250 con 20% de margen da 185100", () => {
    expect(calcularPrecioFinal(154250, 20)).toBe(185100);
  });

  test("margen 0 devuelve el mismo costo neto", () => {
    expect(calcularPrecioFinal(154250, 0)).toBe(154250);
  });

  test("costo neto 0 devuelve 0", () => {
    expect(calcularPrecioFinal(0, 20)).toBe(0);
  });

  test("resultado con decimales se redondea a 2 decimales", () => {
    expect(calcularPrecioFinal(99.99, 15)).toBe(114.99);
  });

  test("margen con decimales se aplica bien", () => {
    expect(calcularPrecioFinal(1000, 12.5)).toBe(1125);
  });

  test("costo neto como texto lanza error", () => {
    expect(() => calcularPrecioFinal("154250", 20)).toThrow(
      "El costo neto no es un numero",
    );
  });

  test("costo neto undefined lanza error", () => {
    expect(() => calcularPrecioFinal(undefined, 20)).toThrow(
      "El costo neto no es un numero",
    );
  });

  test("costo neto negativo lanza error", () => {
    expect(() => calcularPrecioFinal(-1, 20)).toThrow(
      "El costo neto no puede ser negativo",
    );
  });

  test("margen como texto lanza error", () => {
    expect(() => calcularPrecioFinal(154250, "20")).toThrow(
      "El margen no es un numero",
    );
  });

  test("margen undefined lanza error", () => {
    expect(() => calcularPrecioFinal(154250, undefined)).toThrow(
      "El margen no es un numero",
    );
  });

  test("margen negativo lanza error", () => {
    expect(() => calcularPrecioFinal(154250, -5)).toThrow(
      "El margen no puede ser negativo",
    );
  });
});
