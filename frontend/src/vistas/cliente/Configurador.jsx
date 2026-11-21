import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../servicios/api';
import { REGLAS_VENTANA } from '../../config/constantes';

export function Configurador() {
  const [series, setSeries] = useState([]);
  const [serie, setSerie] = useState('');
  const [vidrio, setVidrio] = useState('Termopanel DVH (4-12-4 Aislante)');
  const [color, setColor] = useState('Mate Natural');
  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('');
  const [cantidad, setCantidad] = useState(1);

  const [errorValidacion, setErrorValidacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ordenCreada, setOrdenCreada] = useState(null);

  useEffect(() => {
    api.getSeries()
      .then((lista) => {
        setSeries(lista);
        if (lista.length > 0) setSerie(lista[0].nombre);
      })
      .catch(() => setErrorValidacion('No se pudieron cargar las series disponibles.'));
  }, []);

  const validarMedidas = () => {
    const anchoNum = Number(ancho);
    const altoNum = Number(alto);

    if (
      !anchoNum ||
      anchoNum < REGLAS_VENTANA.ANCHO_MIN_MM ||
      anchoNum > REGLAS_VENTANA.ANCHO_MAX_MM
    ) {
      return `El ancho debe estar entre ${REGLAS_VENTANA.ANCHO_MIN_MM} mm y ${REGLAS_VENTANA.ANCHO_MAX_MM} mm.`;
    }

    if (
      !altoNum ||
      altoNum < REGLAS_VENTANA.ALTO_MIN_MM ||
      altoNum > REGLAS_VENTANA.ALTO_MAX_MM
    ) {
      return `El alto debe estar entre ${REGLAS_VENTANA.ALTO_MIN_MM} mm y ${REGLAS_VENTANA.ALTO_MAX_MM} mm.`;
    }

    if (Number(cantidad) < 1) {
      return 'La cantidad mínima es 1 unidad.';
    }

    return '';
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setErrorValidacion('');
    setOrdenCreada(null);

    const mensajeError = validarMedidas();
    if (mensajeError) {
      setErrorValidacion(mensajeError);
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await api.crearCotizacion({
        serie,
        vidrio,
        color,
        ancho: Number(ancho),
        alto: Number(alto),
        cantidad: Number(cantidad),
      });

      setOrdenCreada(respuesta);
      setAncho('');
      setAlto('');
      setCantidad(1);
    } catch (err) {
      setErrorValidacion(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Diseña y Cotiza tu Ventana</h1>
        <p className="text-slate-500 text-sm mt-1">
          Selecciona los componentes e ingresa las dimensiones en milímetros (mm) para generar tu solicitud.
        </p>
      </div>

      {errorValidacion && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorValidacion}</span>
        </div>
      )}

      {ordenCreada && (
        <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
          <div className="flex items-center gap-2 font-bold text-base">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span>¡Solicitud enviada correctamente!</span>
          </div>
          <p className="text-sm">
            Número de orden: <strong className="font-mono">{ordenCreada.numeroOrden}</strong> — Estado:{' '}
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {ordenCreada.estado || 'Pendiente'}
            </span>
          </p>
          <Link
            to="/mis-cotizaciones"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-900 hover:underline pt-1"
          >
            Ver en Mis Cotizaciones <ArrowRight size={15} />
          </Link>
        </div>
      )}

      <form onSubmit={manejarSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Material / Serie */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Material del Perfil</label>
          <select
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            className="w-full border-slate-300 rounded-xl p-3 bg-slate-50 border focus:ring-2 focus:ring-blue-900 outline-none text-sm transition"
          >
            {series.map((s) => (
              <option key={s.id} value={s.nombre}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Vidrio */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Cristal</label>
          <select
            value={vidrio}
            onChange={(e) => setVidrio(e.target.value)}
            className="w-full border-slate-300 rounded-xl p-3 bg-slate-50 border focus:ring-2 focus:ring-blue-900 outline-none text-sm transition"
          >
            <option value="Monolítico Incoloro 4mm">Monolítico Incoloro 4mm</option>
            <option value="Termopanel DVH (4-12-4 Aislante)">Termopanel DVH (4-12-4 Aislante)</option>
            <option value="Laminado de Seguridad 6mm">Laminado de Seguridad 6mm</option>
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Color / Acabado</label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full border-slate-300 rounded-xl p-3 bg-slate-50 border focus:ring-2 focus:ring-blue-900 outline-none text-sm transition"
          >
            <option value="Mate Natural">Mate Natural</option>
            <option value="Blanco Electroestático">Blanco Electroestático</option>
            <option value="Negro Anodizado">Negro Anodizado</option>
            <option value="Folio Madera (PVC)">Folio Madera (PVC)</option>
          </select>
        </div>

        {/* Ancho (mm) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Ancho Total (mm)</label>
          <input
            type="number"
            value={ancho}
            onChange={(e) => setAncho(e.target.value)}
            placeholder="Ej: 1200"
            className="w-full border-slate-300 rounded-xl p-3 bg-slate-50 border focus:ring-2 focus:ring-blue-900 outline-none text-sm transition"
          />
          <span className="text-xs text-slate-400 mt-1 block">
            Rango permitido: {REGLAS_VENTANA.ANCHO_MIN_MM} mm a {REGLAS_VENTANA.ANCHO_MAX_MM} mm
          </span>
        </div>

        {/* Alto (mm) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Alto Total (mm)</label>
          <input
            type="number"
            value={alto}
            onChange={(e) => setAlto(e.target.value)}
            placeholder="Ej: 1000"
            className="w-full border-slate-300 rounded-xl p-3 bg-slate-50 border focus:ring-2 focus:ring-blue-900 outline-none text-sm transition"
          />
          <span className="text-xs text-slate-400 mt-1 block">
            Rango permitido: {REGLAS_VENTANA.ALTO_MIN_MM} mm a {REGLAS_VENTANA.ALTO_MAX_MM} mm
          </span>
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad de Unidades</label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-full border-slate-300 rounded-xl p-3 bg-slate-50 border focus:ring-2 focus:ring-blue-900 outline-none text-sm transition"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-2">
          <button
            type="submit"
            disabled={enviando}
            className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Send size={16} />
            <span>{enviando ? 'Enviando...' : 'Enviar Solicitud de Cotización'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}