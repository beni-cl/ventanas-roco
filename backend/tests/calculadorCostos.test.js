import {
  calcularCostoNeto,
  calcularPrecioFinal,
  calcularCostoMateriales,
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

describe("calcularCostoMateriales", () => {
  test("suma cantidad por precio de cada linea", () => {
    const lineas = [
      { cantidad: 2, precio_costo: 10000.5 },
      { cantidad: 3, precio_costo: 5000 },
    ];
    expect(calcularCostoMateriales(lineas)).toBe(35001);
  });

  test("acepta cantidad y precio como texto, como los entrega la base", () => {
    const lineas = [
      { cantidad: "5.80", precio_costo: "6000.00" },
      { cantidad: 1.99, precio_costo: "15000" },
    ];
    expect(calcularCostoMateriales(lineas)).toBe(64650);
  });

  test("un solo material", () => {
    expect(calcularCostoMateriales([{ cantidad: 1, precio_costo: 85000 }])).toBe(85000);
  });

  test("redondea a 2 decimales y evita errores de coma flotante", () => {
    const lineas = [
      { cantidad: 0.1, precio_costo: 3 },
      { cantidad: 0.2, precio_costo: 3 },
    ];
    expect(calcularCostoMateriales(lineas)).toBe(0.9);
  });

  test("precio 0 se acepta", () => {
    expect(calcularCostoMateriales([{ cantidad: 1, precio_costo: 0 }])).toBe(0);
  });

  test("el resultado alimenta a calcularCostoNeto: prototipo 154250", () => {
    const materiales = calcularCostoMateriales([{ cantidad: 1, precio_costo: 85000 }]);
    expect(calcularCostoNeto(materiales, 35000, 30000)).toBe(154250);
  });

  test("lista vacia lanza error", () => {
    expect(() => calcularCostoMateriales([])).toThrow("Debe haber al menos un material");
  });

  test("materiales que no son lista lanzan error", () => {
    expect(() => calcularCostoMateriales("perfil")).toThrow("Los materiales deben ser una lista");
  });

  test("materiales undefined lanzan error", () => {
    expect(() => calcularCostoMateriales(undefined)).toThrow("Los materiales deben ser una lista");
  });

  test("una linea null lanza error indicando cual", () => {
    expect(() => calcularCostoMateriales([null])).toThrow("Material 1: los datos no son validos");
  });

  test("cantidad 0 lanza error", () => {
    expect(() => calcularCostoMateriales([{ cantidad: 0, precio_costo: 5 }])).toThrow(
      "Material 1: la cantidad debe ser un numero mayor que 0"
    );
  });

  test("cantidad con texto invalido indica la linea 2", () => {
    const lineas = [
      { cantidad: 1, precio_costo: 5 },
      { cantidad: "abc", precio_costo: 5 },
    ];
    expect(() => calcularCostoMateriales(lineas)).toThrow(
      "Material 2: la cantidad debe ser un numero mayor que 0"
    );
  });

  test("precio negativo lanza error", () => {
    expect(() => calcularCostoMateriales([{ cantidad: 1, precio_costo: -5 }])).toThrow(
      "Material 1: el precio debe ser un numero mayor o igual a 0"
    );
  });

  test("precio vacio lanza error", () => {
    expect(() => calcularCostoMateriales([{ cantidad: 1, precio_costo: "" }])).toThrow(
      "Material 1: el precio debe ser un numero mayor o igual a 0"
    );
  });

  test("precio null lanza error", () => {
    expect(() => calcularCostoMateriales([{ cantidad: 1, precio_costo: null }])).toThrow(
      "Material 1: el precio debe ser un numero mayor o igual a 0"
    );
  });

  test("precio con texto invalido lanza error", () => {
    expect(() => calcularCostoMateriales([{ cantidad: 1, precio_costo: "abc" }])).toThrow(
      "Material 1: el precio debe ser un numero mayor o igual a 0"
    );
  });
});
