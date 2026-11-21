import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Cpu,
  Calculator,
  CheckCircle2,
  Lock,
  AlertCircle,
  Ruler,
  Layers,
  Wrench,
} from 'lucide-react';
import { api } from '../../servicios/api';
import { EtiquetaEstado } from '../../componentes/EtiquetaEstado';
import { ESTADOS_COTIZACION } from '../../config/constantes';

export function CosteoDetalle() {
  const { id } = useParams();
  const [cotizacion, setCotizacion] = useState(null);
  const [margen, setMargen] = useState(35);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeOk, setMensajeOk] = useState('');

  useEffect(() => {
    async function cargarYMarcarRevision() {
      try {
        let data = await api.getCotizacionDetalle(id);
        if (!data) throw new Error('No se encontró la solicitud.');

        // Regla: al abrir una solicitud pendiente, pasa a "En Revisión"
        if (data.estado === ESTADOS_COTIZACION.PENDIENTE) {
          const actualizada = await api.marcarEnRevision(id);
          data = { ...data, ...actualizada, estado: ESTADOS_COTIZACION.EN_REVISION };
        }

        if (data.margen !== undefined) {
          setMargen(data.margen);
        }
        setCotizacion(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargarYMarcarRevision();
  }, [id]);

  if (cargando) {
    return <div className="text-center py-12 text-slate-500">Cargando motor de despiece y costeo...</div>;
  }

  if (error || !cotizacion) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
        <AlertCircle size={18} />
        <span>{error || 'Solicitud no encontrada.'}</span>
      </div>
    );
  }

  const estaBloqueada = cotizacion.estado === ESTADOS_COTIZACION.RESPONDIDA;

  // Datos de despiece y costos (con respaldo por si algún mock recién creado aún no trae despiece del backend)
  const despiece = cotizacion.despiece || {
    cortes: [
      `2x Marco Horizontal: ${cotizacion.ancho} mm`,
      `2x Marco Vertical: ${cotizacion.alto} mm`,
      `4x Traslapo Hojas: ${Math.max(0, cotizacion.alto - 46)} mm`,
    ],
    vidrio: `2x Paños estimados según ${cotizacion.vidrio}`,
    accesorios: '4 Rodamientos, 1 Cierre Central, Felpa aislante',
  };

  const costos = cotizacion.costos || {
    perfiles: 32400,
    vidrio: 28000,
    accesorios: 9800,
    mermaPorcentaje: 8,
    mermaMonto: 5616,
    costoNeto: 75816,
  };

  const precioFinalCalculado = estaBloqueada && cotizacion.precioFinal
    ? cotizacion.precioFinal
    : Math.round(costos.costoNeto * (1 + (Number(margen) || 0) / 100));

  const manejarEnviarCotizacion = async () => {
    if (estaBloqueada) return;
    setEnviando(true);
    setError('');
    try {
      const resp = await api.enviarCotizacionRespondida(id, Number(margen));
      setCotizacion((prev) => ({
        ...prev,
        ...resp,
        estado: ESTADOS_COTIZACION.RESPONDIDA,
        precioFinal: resp?.precioFinal ?? precioFinalCalculado,
      }));
      setMensajeOk('Cotización respondida y enviada al cliente. Esta orden ahora está bloqueada.');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navegación superior */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <Link
          to="/fabricante/dashboard"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Volver a Solicitudes
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-blue-900">{cotizacion.numeroOrden}</span>
          <EtiquetaEstado estado={cotizacion.estado} />
        </div>
      </div>

      {estaBloqueada && (
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-sm flex items-center gap-2.5">
          <Lock size={18} className="text-emerald-400 shrink-0" />
          <span>
            Esta cotización ya fue <strong>Respondida</strong> al cliente y se encuentra bloqueada en modo solo lectura.
          </span>
        </div>
      )}

      {mensajeOk && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{mensajeOk}</span>
        </div>
      )}

      {/* Panel Dual: Despiece Técnico + Costeo Financiero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2/3): Despiece Automático */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Cpu size={20} className="text-blue-900" />
              Despiece Técnico de Taller
            </h2>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
              {cotizacion.serie} · {cotizacion.ancho} x {cotizacion.alto} mm (Cant: {cotizacion.cantidad})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cortes de Perfiles */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 flex items-center gap-1.5">
                <Ruler size={15} className="text-blue-900" /> Cortes de Perfilería
              </h3>
              <ul className="font-mono text-xs space-y-2 text-slate-700">
                {despiece.cortes.map((corte, idx) => (
                  <li key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200">
                    {corte}
                  </li>
                ))}
              </ul>
            </div>

            {/* Vidrio y Accesorios */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs uppercase font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                  <Layers size={15} className="text-blue-900" /> Paños de Cristal
                </h3>
                <p className="font-mono text-xs bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                  {despiece.vidrio}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs uppercase font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                  <Wrench size={15} className="text-blue-900" /> Accesorios e Insumos
                </h3>
                <p className="font-mono text-xs bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                  {despiece.accesorios}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha (1/3): Costeo y Margen */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="font-bold text-lg text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Calculator size={20} className="text-emerald-600" />
              Costeo y Margen
            </h2>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Costo Perfiles:</span>
                <span className="font-semibold text-slate-800">${costos.perfiles.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Costo Vidrio:</span>
                <span className="font-semibold text-slate-800">${costos.vidrio.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Accesorios y Felpas:</span>
                <span className="font-semibold text-slate-800">${costos.accesorios.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-amber-700">
                <span>Merma ({costos.mermaPorcentaje}%):</span>
                <span className="font-semibold">+${costos.mermaMonto.toLocaleString('es-CL')}</span>
              </div>

              <div className="bg-slate-100 p-3 rounded-xl flex justify-between font-bold text-slate-900 text-sm mt-3">
                <span>Costo Neto:</span>
                <span>${costos.costoNeto.toLocaleString('es-CL')} CLP</span>
              </div>

              {/* Input de Margen (deshabilitado si está bloqueada) */}
              <div className="pt-4">
                <label className="block font-sans text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Margen de Ganancia Taller (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  disabled={estaBloqueada}
                  value={margen}
                  onChange={(e) => setMargen(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 rounded-xl p-3 text-right font-mono font-bold text-base text-blue-900 focus:ring-2 focus:ring-blue-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 block">Precio Final al Cliente:</span>
              <span className="text-3xl font-mono font-extrabold text-emerald-600">
                ${precioFinalCalculado.toLocaleString('es-CL')} CLP
              </span>
            </div>

            {!estaBloqueada && (
              <button
                onClick={manejarEnviarCotizacion}
                disabled={enviando}
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition flex justify-center items-center gap-2"
              >
                <CheckCircle2 size={18} />
                <span>{enviando ? 'Enviando...' : 'Aprobar y Enviar Cotización'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}