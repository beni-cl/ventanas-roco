import { calcularCostoNeto } from "../src/servicios/calculadorCostosEngine.js";

//CALCULO DE COSTOS U03

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