import {
  limpiarDatosCliente,
  construirDatosDeEnvio,
} from "../src/servicios/precioSeguroServicio.js";

describe("U05 - precio calculado solo en el servidor", () => {
  test("elimina precio, costo, margen, estado y congelado que mande el cliente", () => {
    const datos = {
      ventanas: [{ anchoMm: 1780, altoMm: 1120 }],
      costo_neto: 1,
      margen_aplicado: 99,
      precio_final: 1,
      congelado: true,
      estado: "Respondida",
    };
    expect(limpiarDatosCliente(datos)).toEqual({
      ventanas: [{ anchoMm: 1780, altoMm: 1120 }],
    });
  });

  test("conserva los datos legitimos sin cambios", () => {
    const datos = { ventanas: [{ anchoMm: 1780, altoMm: 1120 }] };
    expect(limpiarDatosCliente(datos)).toEqual(datos);
  });

  test("no modifica el objeto original", () => {
    const datos = { ventanas: [], precio_final: 1 };
    limpiarDatosCliente(datos);
    expect(datos.precio_final).toBe(1);
  });

  test("datos null lanzan error", () => {
    expect(() => limpiarDatosCliente(null)).toThrow(
      "Los datos de la cotizacion no son validos",
    );
  });

  test("datos como texto lanzan error", () => {
    expect(() => limpiarDatosCliente("precio_final: 1")).toThrow(
      "Los datos de la cotizacion no son validos",
    );
  });

  test("datos como lista lanzan error", () => {
    expect(() => limpiarDatosCliente([])).toThrow(
      "Los datos de la cotizacion no son validos",
    );
  });

  test("el envio calcula el precio con el costo guardado, 154250 con 20% da 185100", () => {
    const guardada = { costo_neto: "154250.00" };
    expect(construirDatosDeEnvio(guardada, 20)).toEqual({
      costo_neto: 154250,
      margen_aplicado: 20,
      precio_final: 185100,
      estado: "Respondida",
      congelado: true,
    });
  });

  test("un precio_final manipulado en la cotizacion se ignora al enviar", () => {
    const guardada = { costo_neto: "154250.00", precio_final: 1 };
    expect(construirDatosDeEnvio(guardada, 20).precio_final).toBe(185100);
  });

  test("costo neto guardado undefined lanza error", () => {
    expect(() => construirDatosDeEnvio({}, 20)).toThrow(
      "El costo neto no es un numero",
    );
  });

  test("margen negativo lanza error al enviar", () => {
    expect(() =>
      construirDatosDeEnvio({ costo_neto: "154250.00" }, -5),
    ).toThrow("El margen no puede ser negativo");
  });

  test("margen como texto lanza error al enviar", () => {
    expect(() =>
      construirDatosDeEnvio({ costo_neto: "154250.00" }, "20"),
    ).toThrow("El margen no es un numero");
  });
});


