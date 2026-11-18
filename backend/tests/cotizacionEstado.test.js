import {
  verificarModificable,
  validarTransicion,
} from "../src/servicios/cotizacionEstadoServicio.js";

describe("U06 - cotizacion congelada", () => {
  test("una cotizacion no congelada se puede modificar", () => {
    expect(() =>
      verificarModificable({ estado: "Pendiente", congelado: false }),
    ).not.toThrow();
  });

  test("una cotizacion en revision no congelada se puede modificar", () => {
    expect(() =>
      verificarModificable({ estado: "En Revisión", congelado: false }),
    ).not.toThrow();
  });

  test("una cotizacion congelada no se puede modificar", () => {
    expect(() =>
      verificarModificable({ estado: "Respondida", congelado: true }),
    ).toThrow("La cotizacion esta congelada y no se puede modificar");
  });

  test("cotizacion null lanza error", () => {
    expect(() => verificarModificable(null)).toThrow(
      "La cotizacion no es valida",
    );
  });

  test("cotizacion como texto lanza error", () => {
    expect(() => verificarModificable("congelada")).toThrow(
      "La cotizacion no es valida",
    );
  });

  test("Pendiente puede pasar a En Revisión", () => {
    expect(() => validarTransicion("Pendiente", "En Revisión")).not.toThrow();
  });

  test("En Revisión puede pasar a Respondida", () => {
    expect(() => validarTransicion("En Revisión", "Respondida")).not.toThrow();
  });

  test("Pendiente no puede saltar a Respondida", () => {
    expect(() => validarTransicion("Pendiente", "Respondida")).toThrow(
      "No se puede pasar de Pendiente a Respondida",
    );
  });

  test("Respondida no puede volver a Pendiente", () => {
    expect(() => validarTransicion("Respondida", "Pendiente")).toThrow(
      "No se puede pasar de Respondida a Pendiente",
    );
  });

  test("En Revisión no puede volver a Pendiente", () => {
    expect(() => validarTransicion("En Revisión", "Pendiente")).toThrow(
      "No se puede pasar de En Revisión a Pendiente",
    );
  });

  test("un estado actual desconocido lanza error", () => {
    expect(() => validarTransicion("Cancelada", "Respondida")).toThrow(
      "El estado actual no es valido",
    );
  });

  test("un estado actual raro como constructor lanza error", () => {
    expect(() => validarTransicion("constructor", "Respondida")).toThrow(
      "El estado actual no es valido",
    );
  });
});
