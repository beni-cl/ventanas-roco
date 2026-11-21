import {
  promedioPrecios,
  calcularCostoMaterialesVentanas,
} from "../src/servicios/costeoCalculo.js";

const ventanaBase = () => ({
  cantidad: 2,
  metros_lineales: 5.79,
  superficie_vidrio_m2: 1.99,
  precio_perfil_metro: 4000,
  precio_vidrio_m2: 38900,
});

describe("promedioPrecios", () => {
  test("promedia los precios de los perfiles de una serie", () => {
    expect(
      promedioPrecios([{ precio_costo: 4200 }, { precio_costo: 3800 }]),
    ).toBe(4000);
  });

  test("acepta precios en texto, como llegan de la base de datos", () => {
    expect(
      promedioPrecios([
        { precio_costo: "4200.00" },
        { precio_costo: "3800.00" },
      ]),
    ).toBe(4000);
  });

  test("rechaza una lista vacia", () => {
    expect(() => promedioPrecios([])).toThrow(
      "No hay materiales para promediar el precio",
    );
  });

  test("rechaza un precio nulo (no lo toma como 0)", () => {
    expect(() => promedioPrecios([{ precio_costo: null }])).toThrow(/precio/);
  });

  test("rechaza un precio negativo", () => {
    expect(() => promedioPrecios([{ precio_costo: -1 }])).toThrow(/precio/);
  });
});

describe("calcularCostoMaterialesVentanas", () => {
  test("suma perfil y vidrio de una ventana multiplicados por la cantidad", () => {
    expect(calcularCostoMaterialesVentanas([ventanaBase()])).toBeCloseTo(
      201142,
      2,
    );
  });

  test("con cantidad 1 el costo es la mitad", () => {
    expect(
      calcularCostoMaterialesVentanas([{ ...ventanaBase(), cantidad: 1 }]),
    ).toBeCloseTo(100571, 2);
  });

  test("suma varias ventanas", () => {
    const unaVentana = { ...ventanaBase(), cantidad: 1 };
    expect(
      calcularCostoMaterialesVentanas([unaVentana, unaVentana]),
    ).toBeCloseTo(201142, 2);
  });

  test("acepta medidas y precios en texto", () => {
    const ventana = {
      cantidad: "1",
      metros_lineales: "5.79",
      superficie_vidrio_m2: "1.99",
      precio_perfil_metro: "4000.00",
      precio_vidrio_m2: "38900.00",
    };
    expect(calcularCostoMaterialesVentanas([ventana])).toBeCloseTo(100571, 2);
  });

  test("rechaza una lista vacia", () => {
    expect(() => calcularCostoMaterialesVentanas([])).toThrow(
      "La cotizacion no tiene ventanas",
    );
  });

  test("rechaza si no es una lista", () => {
    expect(() => calcularCostoMaterialesVentanas("x")).toThrow(
      "La cotizacion no tiene ventanas",
    );
  });

  test("rechaza un precio de vidrio faltante", () => {
    const ventana = { ...ventanaBase(), precio_vidrio_m2: undefined };
    expect(() => calcularCostoMaterialesVentanas([ventana])).toThrow(/precio/);
  });

  test("rechaza una ventana nula", () => {
    expect(() => calcularCostoMaterialesVentanas([null])).toThrow(
      "Los datos de la ventana no son validos",
    );
  });
});
