const API_URL = import.meta.env.VITE_API_URL || "/api";

const INVENTARIO_SIMULADO = false;

const adaptarMaterial = (m) => ({
  id: m.id_material,
  nombre: m.nombre_insumo,
  unidad: m.unidad_medida,
});

const adaptarInventario = (m) => ({
  ...adaptarMaterial(m),
  precio: Number(m.precio_costo),
});

const mockMateriales = [
  {
    id: 1,
    nombre: "Perfil Marco Serie 20 (barra 6m)",
    unidad: "barra",
    precio: 18500,
  },
  {
    id: 2,
    nombre: "Cristal Termopanel DVH 4-12-4",
    unidad: "m2",
    precio: 28500,
  },
  {
    id: 3,
    nombre: "Kit Rodamientos + Cierre Central",
    unidad: "kit",
    precio: 9800,
  },
];

const VIDRIOS = [
  { front: "Monolítico Incoloro 4mm", catalogo: "Vidrio float incoloro 4 mm" },
  {
    front: "Termopanel DVH (4-12-4 Aislante)",
    catalogo: "Termopanel (DVH) 4+12+4 mm",
  },
  { front: "Laminado de Seguridad 6mm", catalogo: "Vidrio laminado 6 mm" },
];

const vidrioACatalogo = (nombre) =>
  VIDRIOS.find((v) => v.front === nombre)?.catalogo ?? nombre;
const vidrioAFront = (nombre) =>
  VIDRIOS.find((v) => v.catalogo === nombre)?.front ?? nombre;

const materialDeSerie = (nombreSerie) =>
  String(nombreSerie).toUpperCase().startsWith("PVC") ? "PVC" : "Aluminio";

const aFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-CA", {
        timeZone: "America/Santiago",
      })
    : "";

function adaptarSerie(serie) {
  return {
    id: serie.id_serie,
    nombre: serie.nombre,
    descripcion: `Perfiles de ${serie.tipo_material}`,
    tipoMaterial: serie.tipo_material,
  };
}

function adaptarDespiece(ventana) {
  const despiece = ventana?.despiece;
  if (!despiece) return null;
  const perfiles = despiece.cortes_json?.perfiles ?? [];
  return {
    cortes: perfiles.map(
      (p) => `${p.cantidad}x ${p.pieza}: ${p.longitud_mm} mm`,
    ),
    vidrio: `${despiece.superficie_vidrio_m2} m² de ${vidrioAFront(ventana.tipo_vidrio)}`,
    accesorios:
      "No incluidos en el costeo (pendiente de definir con el taller)",
  };
}

function adaptarCostos(costeo) {
  if (!costeo || costeo.error) {
    return {
      perfiles: 0,
      vidrio: 0,
      accesorios: 0,
      mermaPorcentaje: 0,
      mermaMonto: 0,
      costoNeto: 0,
      error: costeo?.error ?? null,
    };
  }
  return {
    perfiles: costeo.perfiles,
    vidrio: costeo.vidrio,
    accesorios: costeo.accesorios,
    mermaPorcentaje: costeo.merma_porcentaje,
    mermaMonto: costeo.merma_monto,
    costoNeto: costeo.costo_neto,
    error: null,
  };
}

function adaptarCotizacion(c) {
  const ventana = c.ventanas?.[0] ?? {};
  const resultado = {
    id: c.id_cotizacion,
    numeroOrden: c.numero_orden,
    fecha: aFecha(c.fecha_creacion),
    estado: c.estado,
    serie: ventana.tipo_perfil,
    vidrio: vidrioAFront(ventana.tipo_vidrio),
    color: ventana.color_perfil,
    ancho: ventana.ancho_mm,
    alto: ventana.alto_mm,
    cantidad: ventana.cantidad,
    precioFinal: c.precio_final ?? null,
    cliente: c.cliente,
    ventanas: c.ventanas,
  };
  if (c.margen_aplicado !== undefined && c.margen_aplicado !== null) {
    resultado.margen = c.margen_aplicado;
  }
  if (ventana.despiece) {
    resultado.despiece = adaptarDespiece(ventana);
  }
  if (c.costeo !== undefined) {
    resultado.costos = adaptarCostos(c.costeo);
  }
  return resultado;
}

async function request(endpoint, options = {}) {
  const token = sessionStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && !endpoint.startsWith("/auth/")) {
    sessionStorage.clear();
    window.location.href = "/login";
    throw new Error("Sesión vencida. Por favor inicia sesión nuevamente.");
  }
  if (!response.ok) {
    throw new Error(data.error || "Error en la comunicación con el servidor");
  }
  return data;
}

export const api = {
  login: async (email, password) => {
    const respuesta = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return {
      token: respuesta.token,
      nombre: respuesta.usuario.nombre,
      rol: respuesta.usuario.rol,
    };
  },

  registro: async (datos) => {
    const respuesta = await request("/auth/registro", {
      method: "POST",
      body: JSON.stringify(datos),
    });
    return { mensaje: "Usuario creado", ...respuesta };
  },

  getSeries: async () => {
    const series = await request("/catalogo/series");
    return series.map(adaptarSerie);
  },

  getMateriales: async () => {
    if (INVENTARIO_SIMULADO) {
      return mockMateriales.map(({ id, nombre, unidad }) => ({
        id,
        nombre,
        unidad,
      }));
    }
    return (await request("/catalogo/materiales")).map(adaptarMaterial);
  },

  crearCotizacion: async (payload) => {
    const cuerpo = {
      ventanas: [
        {
          anchoMm: payload.ancho,
          altoMm: payload.alto,
          material: materialDeSerie(payload.serie),
          tipoPerfil: payload.serie,
          colorPerfil: payload.color,
          tipoVidrio: vidrioACatalogo(payload.vidrio),
          cantidad: payload.cantidad,
        },
      ],
    };
    const respuesta = await request("/cotizaciones", {
      method: "POST",
      body: JSON.stringify(cuerpo),
    });
    return {
      id: respuesta.id_cotizacion,
      numeroOrden: respuesta.numero_orden,
      estado: respuesta.estado,
    };
  },

  getMisCotizaciones: async () => {
    const lista = await request("/cotizaciones/mias");
    return lista.map(adaptarCotizacion);
  },

  getSolicitudesFabricante: async (estado = "") => {
    const query = estado ? `?estado=${encodeURIComponent(estado)}` : "";
    const lista = await request(`/fabricante/solicitudes${query}`);
    return lista.map(adaptarCotizacion);
  },

  getCotizacionDetalle: async (id) => {
    const cotizacion = await request(`/cotizaciones/${id}`);
    return adaptarCotizacion(cotizacion);
  },

  marcarEnRevision: async (id) => {
    const respuesta = await request(`/cotizaciones/${id}/revisar`, {
      method: "PUT",
    });
    return {
      id: respuesta.id_cotizacion,
      numeroOrden: respuesta.numero_orden,
      estado: respuesta.estado,
    };
  },

  enviarCotizacionRespondida: async (id, margen) => {
    const respuesta = await request(`/cotizaciones/${id}/enviar`, {
      method: "PUT",
      body: JSON.stringify({ margen_aplicado: margen }),
    });
    return {
      id: respuesta.id_cotizacion,
      numeroOrden: respuesta.numero_orden,
      estado: respuesta.estado,
      precioFinal: respuesta.precio_final,
      margen: respuesta.margen_aplicado,
      congelado: respuesta.congelado,
    };
  },

  getInventario: async () => {
    if (INVENTARIO_SIMULADO) return mockMateriales;
    return (await request("/inventario")).map(adaptarInventario);
  },

  actualizarPrecioMaterial: async (id, precio) => {
    if (INVENTARIO_SIMULADO) {
      const material = mockMateriales.find((m) => m.id === Number(id));
      if (material) material.precio = Number(precio);
      return material;
    }
    const material = await request(`/inventario/${id}`, {
      method: "PUT",
      body: JSON.stringify({ precio_costo: Number(precio) }),
    });
    return adaptarInventario(material);
  },
};
