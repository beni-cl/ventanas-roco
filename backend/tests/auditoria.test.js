import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { registrarAuditoria, leerAuditoria } from "../src/servicios/auditoria.js";

const DATOS_VALIDOS = {
  id_usuario: 2,
  accion: "UPDATE_COTIZACION_PRECIO",
  ip: "190.100.20.15",
  estado_anterior: { estado: "En Revisión", precio_final: null, congelado: false },
  estado_posterior: { estado: "Respondida", precio_final: 185100, congelado: true },
};

const DIA_1 = new Date("2026-11-20T13:30:00Z");
const DIA_2 = new Date("2026-11-21T13:30:00Z");

describe("I06 - auditoria en archivos JSON", () => {
  let carpeta;

  beforeEach(() => {
    carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "auditoria-"));
  });

  afterEach(() => {
    fs.rmSync(carpeta, { recursive: true, force: true });
  });

  test("registra un cambio con todos los campos y el id del dia", () => {
    const registro = registrarAuditoria(DATOS_VALIDOS, carpeta, DIA_1);
    expect(registro).toEqual({
      id_log: "LOG-20261120-1",
      id_usuario: 2,
      fecha: "2026-11-20T13:30:00.000Z",
      ip: "190.100.20.15",
      accion: "UPDATE_COTIZACION_PRECIO",
      estado_anterior: { estado: "En Revisión", precio_final: null, congelado: false },
      estado_posterior: { estado: "Respondida", precio_final: 185100, congelado: true },
    });
  });

  test("el segundo registro del mismo dia lleva el numero 2", () => {
    registrarAuditoria(DATOS_VALIDOS, carpeta, DIA_1);
    const segundo = registrarAuditoria(DATOS_VALIDOS, carpeta, DIA_1);
    expect(segundo.id_log).toBe("LOG-20261120-2");
  });

  test("los registros quedan guardados en el archivo del dia", () => {
    registrarAuditoria(DATOS_VALIDOS, carpeta, DIA_1);
    registrarAuditoria(DATOS_VALIDOS, carpeta, DIA_1);
    expect(leerAuditoria("2026-11-20", carpeta)).toHaveLength(2);
  });

  test("un dia distinto usa otro archivo y reinicia el numero", () => {
    registrarAuditoria(DATOS_VALIDOS, carpeta, DIA_1);
    const otroDia = registrarAuditoria(DATOS_VALIDOS, carpeta, DIA_2);
    expect(otroDia.id_log).toBe("LOG-20261121-1");
    expect(leerAuditoria("2026-11-20", carpeta)).toHaveLength(1);
  });

  test("acepta la accion de inventario", () => {
    const datos = { ...DATOS_VALIDOS, accion: "UPDATE_INVENTARIO_PRECIO" };
    expect(() => registrarAuditoria(datos, carpeta, DIA_1)).not.toThrow();
  });

  test("leer un dia sin archivo devuelve lista vacia", () => {
    expect(leerAuditoria("2026-11-22", carpeta)).toEqual([]);
  });

  test("datos null lanzan error", () => {
    expect(() => registrarAuditoria(null, carpeta, DIA_1)).toThrow(
      "Los datos de auditoria no son validos"
    );
  });

  test("id de usuario como texto lanza error", () => {
    expect(() => registrarAuditoria({ ...DATOS_VALIDOS, id_usuario: "2" }, carpeta, DIA_1)).toThrow(
      "El id de usuario debe ser un entero mayor que 0"
    );
  });

  test("id de usuario 0 lanza error", () => {
    expect(() => registrarAuditoria({ ...DATOS_VALIDOS, id_usuario: 0 }, carpeta, DIA_1)).toThrow(
      "El id de usuario debe ser un entero mayor que 0"
    );
  });

  test("accion desconocida lanza error", () => {
    expect(() => registrarAuditoria({ ...DATOS_VALIDOS, accion: "BORRAR_TODO" }, carpeta, DIA_1)).toThrow(
      "La accion de auditoria no es valida"
    );
  });

  test("ip vacia lanza error", () => {
    expect(() => registrarAuditoria({ ...DATOS_VALIDOS, ip: "  " }, carpeta, DIA_1)).toThrow(
      "La ip es obligatoria"
    );
  });

  test("estado anterior null lanza error", () => {
    expect(() => registrarAuditoria({ ...DATOS_VALIDOS, estado_anterior: null }, carpeta, DIA_1)).toThrow(
      "Los estados anterior y posterior deben ser objetos"
    );
  });

  test("fecha invalida lanza error", () => {
    expect(() => registrarAuditoria(DATOS_VALIDOS, carpeta, new Date("no es fecha"))).toThrow(
      "La fecha no es valida"
    );
  });

  test("archivo danado lanza error y no se sobrescribe", () => {
    const ruta = path.join(carpeta, "auditoria-2026-11-20.json");
    fs.writeFileSync(ruta, "{roto");
    expect(() => registrarAuditoria(DATOS_VALIDOS, carpeta, DIA_1)).toThrow(
      "El archivo de auditoria esta danado"
    );
    expect(fs.readFileSync(ruta, "utf-8")).toBe("{roto");
  });

  test("leer con una fecha en formato incorrecto lanza error", () => {
    expect(() => leerAuditoria("20-11-2026", carpeta)).toThrow(
      "La fecha debe tener el formato AAAA-MM-DD"
    );
  });
});