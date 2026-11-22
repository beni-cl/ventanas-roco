import { prepararVentanas } from "../src/servicios/cotizacionVentanas.js";

const ventanaValida = () => ({
  anchoMm: 1780,
  altoMm: 1120,
  material: "Aluminio",
  tipoPerfil: "Aluminio Corredera Línea 25",
  colorPerfil: "Blanco",
  tipoVidrio: "Termopanel",
  cantidad: 2,
});

describe("prepararVentanas - caso valido", () => {
  test("devuelve una ventana preparada con su despiece", () => {
    const resultado = prepararVentanas([ventanaValida()]);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].despiece).toBeDefined();
  });

  test("conserva medidas, textos y cantidad", () => {
    const [v] = prepararVentanas([ventanaValida()]);
    expect(v.anchoMm).toBe(1780);
    expect(v.altoMm).toBe(1120);
    expect(v.material).toBe("Aluminio");
    expect(v.tipoPerfil).toBe("Aluminio Corredera Línea 25");
    expect(v.colorPerfil).toBe("Blanco");
    expect(v.tipoVidrio).toBe("Termopanel");
    expect(v.cantidad).toBe(2);
  });

  test("calcula el despiece correcto para 1780 x 1120 Aluminio", () => {
    const [v] = prepararVentanas([ventanaValida()]);
    expect(v.despiece.metros_lineales).toBe(5.79);
    expect(v.despiece.superficie_vidrio_m2).toBe(1.99);
  });

  test("acepta varias ventanas y mantiene el orden", () => {
    const segunda = {
      ...ventanaValida(),
      anchoMm: 1000,
      altoMm: 1000,
      material: "PVC",
      cantidad: 1,
    };
    const resultado = prepararVentanas([ventanaValida(), segunda]);
    expect(resultado).toHaveLength(2);
    expect(resultado[0].cantidad).toBe(2);
    expect(resultado[1].material).toBe("PVC");
  });

  test("recorta los espacios sobrantes de los textos", () => {
    const ventana = {
      ...ventanaValida(),
      tipoPerfil: "  Aluminio Corredera Línea 25  ",
      colorPerfil: " Blanco ",
    };
    const [v] = prepararVentanas([ventana]);
    expect(v.tipoPerfil).toBe("Aluminio Corredera Línea 25");
    expect(v.colorPerfil).toBe("Blanco");
  });

  test("no modifica la lista original", () => {
    const entrada = [ventanaValida()];
    const copia = JSON.stringify(entrada);
    prepararVentanas(entrada);
    expect(JSON.stringify(entrada)).toBe(copia);
  });
});

describe("prepararVentanas - lista de ventanas", () => {
  test("rechaza si no es una lista", () => {
    expect(() => prepararVentanas({})).toThrow(
      "Las ventanas deben ser una lista",
    );
  });

  test("rechaza una lista vacia", () => {
    expect(() => prepararVentanas([])).toThrow(
      "Debe haber al menos una ventana",
    );
  });

  test("rechaza mas de 50 ventanas", () => {
    const muchas = Array.from({ length: 51 }, ventanaValida);
    expect(() => prepararVentanas(muchas)).toThrow(
      "No se pueden cotizar mas de 50 ventanas a la vez",
    );
  });

  test("rechaza un elemento null", () => {
    expect(() => prepararVentanas([null])).toThrow(
      "Ventana 1: los datos no son validos",
    );
  });

  test("rechaza un elemento que no es objeto", () => {
    expect(() => prepararVentanas(["texto"])).toThrow(
      "Ventana 1: los datos no son validos",
    );
  });
});

describe("prepararVentanas - textos", () => {
  test("rechaza tipoPerfil vacio", () => {
    const ventana = { ...ventanaValida(), tipoPerfil: "   " };
    expect(() => prepararVentanas([ventana])).toThrow(
      "Ventana 1: tipoPerfil es obligatorio",
    );
  });

  test("rechaza tipoPerfil de mas de 30 caracteres", () => {
    const ventana = { ...ventanaValida(), tipoPerfil: "A".repeat(31) };
    expect(() => prepararVentanas([ventana])).toThrow(
      "Ventana 1: tipoPerfil no puede superar 30 caracteres",
    );
  });

  test("rechaza colorPerfil faltante", () => {
    const ventana = { ...ventanaValida() };
    delete ventana.colorPerfil;
    expect(() => prepararVentanas([ventana])).toThrow(
      "Ventana 1: colorPerfil es obligatorio",
    );
  });

  test("rechaza tipoVidrio de mas de 40 caracteres", () => {
    const ventana = { ...ventanaValida(), tipoVidrio: "V".repeat(41) };
    expect(() => prepararVentanas([ventana])).toThrow(
      "Ventana 1: tipoVidrio no puede superar 40 caracteres",
    );
  });

  test("rechaza tipoPerfil que no es texto", () => {
    const ventana = { ...ventanaValida(), tipoPerfil: 123 };
    expect(() => prepararVentanas([ventana])).toThrow(
      "Ventana 1: tipoPerfil es obligatorio",
    );
  });
});

describe("prepararVentanas - cantidad", () => {
  test("rechaza cantidad 0", () => {
    const ventana = { ...ventanaValida(), cantidad: 0 };
    expect(() => prepararVentanas([ventana])).toThrow(
      "Ventana 1: la cantidad debe ser un entero entre 1 y 1000",
    );
  });

  test("rechaza cantidad decimal", () => {
    const ventana = { ...ventanaValida(), cantidad: 1.5 };
    expect(() => prepararVentanas([ventana])).toThrow(
      "la cantidad debe ser un entero",
    );
  });

  test("rechaza cantidad en texto", () => {
    const ventana = { ...ventanaValida(), cantidad: "2" };
    expect(() => prepararVentanas([ventana])).toThrow(
      "la cantidad debe ser un entero",
    );
  });

  test("rechaza cantidad mayor a 1000", () => {
    const ventana = { ...ventanaValida(), cantidad: 1001 };
    expect(() => prepararVentanas([ventana])).toThrow(
      "la cantidad debe ser un entero",
    );
  });
});

describe("prepararVentanas - errores del motor", () => {
  test("antepone el numero de ventana al error del motor (medida fuera de rango)", () => {
    const ventana = { ...ventanaValida(), anchoMm: 100 };
    expect(() => prepararVentanas([ventana])).toThrow(/^Ventana 1:/);
  });

  test("indica el numero correcto cuando falla la segunda ventana", () => {
    const mala = { ...ventanaValida(), altoMm: 99999 };
    expect(() => prepararVentanas([ventanaValida(), mala])).toThrow(
      /^Ventana 2:/,
    );
  });

  test("rechaza un material que no existe", () => {
    const ventana = { ...ventanaValida(), material: "Madera" };
    expect(() => prepararVentanas([ventana])).toThrow(/^Ventana 1:/);
  });
});
