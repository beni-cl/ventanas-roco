import fs from "node:fs";
import path from "node:path";

const CARPETA_POR_DEFECTO = path.join(process.cwd(), "logs");
const ZONA_HORARIA = "America/Santiago";

const ACCIONES_VALIDAS = [
  "UPDATE_COTIZACION_PRECIO",
  "UPDATE_INVENTARIO_PRECIO",
];

function esObjeto(valor) {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}

function fechaEnChile(fecha) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  }).formatToParts(fecha);

  const valor = (tipo) => partes.find((parte) => parte.type === tipo).value;
  const dia = `${valor("year")}-${valor("month")}-${valor("day")}`;
  const hora = `${valor("hour")}:${valor("minute")}:${valor("second")}`;
  const diferencia = valor("timeZoneName").replace("GMT", "");

  return { dia, fechaIso: `${dia}T${hora}${diferencia}` };
}

function rutaDelDia(carpeta, dia) {
  return path.join(carpeta, `auditoria-${dia}.json`);
}

function leerArchivoDelDia(ruta) {
  if (!fs.existsSync(ruta)) {
    return [];
  }
  try {
    const registros = JSON.parse(fs.readFileSync(ruta, "utf-8"));
    if (!Array.isArray(registros)) {
      throw new Error("no es una lista");
    }
    return registros;
  } catch {
    throw new Error("El archivo de auditoria esta danado");
  }
}

export function registrarAuditoria(
  datos,
  carpeta = CARPETA_POR_DEFECTO,
  fechaActual = new Date(),
) {
  if (!esObjeto(datos)) {
    throw new Error("Los datos de auditoria no son validos");
  }
  if (!Number.isInteger(datos.id_usuario) || datos.id_usuario <= 0) {
    throw new Error("El id de usuario debe ser un entero mayor que 0");
  }
  if (!ACCIONES_VALIDAS.includes(datos.accion)) {
    throw new Error("La accion de auditoria no es valida");
  }
  if (typeof datos.ip !== "string" || datos.ip.trim() === "") {
    throw new Error("La ip es obligatoria");
  }
  if (!esObjeto(datos.estado_anterior) || !esObjeto(datos.estado_posterior)) {
    throw new Error("Los estados anterior y posterior deben ser objetos");
  }
  if (!(fechaActual instanceof Date) || Number.isNaN(fechaActual.getTime())) {
    throw new Error("La fecha no es valida");
  }

    const { dia, fechaIso } = fechaEnChile(fechaActual);

  fs.mkdirSync(carpeta, { recursive: true });
  const ruta = rutaDelDia(carpeta, dia);
  const registros = leerArchivoDelDia(ruta);

  const registro = {
    id_log: `LOG-${dia.replaceAll("-", "")}-${registros.length + 1}`,
    id_usuario: datos.id_usuario,
    fecha: fechaIso,
    ip: datos.ip,
    accion: datos.accion,
    estado_anterior: datos.estado_anterior,
    estado_posterior: datos.estado_posterior,
  };

  registros.push(registro);
  fs.writeFileSync(ruta, JSON.stringify(registros, null, 2), "utf-8");
  return registro;
}

export function leerAuditoria(dia, carpeta = CARPETA_POR_DEFECTO) {
  if (typeof dia !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
    throw new Error("La fecha debe tener el formato AAAA-MM-DD");
  }
  return leerArchivoDelDia(rutaDelDia(carpeta, dia));
}
