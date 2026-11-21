import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Eye, AlertCircle, Filter } from 'lucide-react';
import { api } from '../../servicios/api';
import { EtiquetaEstado } from '../../componentes/EtiquetaEstado';
import { ESTADOS_COTIZACION } from '../../config/constantes';

export function DashboardFabricante() {
  const [todasLasSolicitudes, setTodasLasSolicitudes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSolicitudesFabricante()
      .then((datos) => setTodasLasSolicitudes(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  // Contadores por estado
  const conteo = {
    Pendiente: todasLasSolicitudes.filter((s) => s.estado === ESTADOS_COTIZACION.PENDIENTE).length,
    'En Revisión': todasLasSolicitudes.filter((s) => s.estado === ESTADOS_COTIZACION.EN_REVISION).length,
    Respondida: todasLasSolicitudes.filter((s) => s.estado === ESTADOS_COTIZACION.RESPONDIDA).length,
  };

  const solicitudesFiltradas =
    filtroEstado === 'Todas'
      ? todasLasSolicitudes
      : todasLasSolicitudes.filter((s) => s.estado === filtroEstado);

  if (cargando) {
    return <div className="text-center py-12 text-slate-500">Cargando bandeja del taller...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado y Tarjetas Resumen */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bandeja de Cotizaciones Entrantes</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Selecciona una orden para revisar el despiece técnico y calcular el margen.
            </p>
          </div>
          <Link
            to="/fabricante/inventario"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
          >
            Gestionar Precios de Materiales
          </Link>
        </div>

        {/* Resumen numérico por estado */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-amber-50 border border-amber-200 p-3 sm:p-4 rounded-xl">
            <span className="text-xs font-bold uppercase text-amber-800 block">Pendientes</span>
            <span className="text-2xl font-mono font-extrabold text-amber-900">{conteo.Pendiente}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-xl">
            <span className="text-xs font-bold uppercase text-blue-800 block">En Revisión</span>
            <span className="text-2xl font-mono font-extrabold text-blue-900">{conteo['En Revisión']}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-3 sm:p-4 rounded-xl">
            <span className="text-xs font-bold uppercase text-emerald-800 block">Respondidas</span>
            <span className="text-2xl font-mono font-extrabold text-emerald-900">{conteo.Respondida}</span>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Filter size={14} /> Filtrar:
          </span>
          {['Todas', 'Pendiente', 'En Revisión', 'Respondida'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                filtroEstado === estado
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {estado} {estado !== 'Todas' && `(${conteo[estado] ?? 0})`}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Listado Responsivo (Tabla en desktop, adaptable en móvil) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {solicitudesFiltradas.length === 0 ? (
          <p className="text-center py-8 text-slate-500 text-sm">
            No hay solicitudes en estado "{filtroEstado}".
          </p>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase font-bold border-b border-slate-200">
                <th className="pb-3">N° Solicitud</th>
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Configuración</th>
                <th className="pb-3">Dimensiones</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {solicitudesFiltradas.map((sol) => {
                const esRespondida = sol.estado === ESTADOS_COTIZACION.RESPONDIDA;

                return (
                  <tr key={sol.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 font-mono font-bold text-blue-900">{sol.numeroOrden}</td>
                    <td className="py-4 text-xs text-slate-500">{sol.fecha}</td>
                    <td className="py-4 text-slate-700 font-medium">
                      {sol.serie} / {sol.vidrio}
                      <span className="block text-xs text-slate-400">
                        {sol.color} · Cant: {sol.cantidad}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-600">
                      {sol.ancho} x {sol.alto} mm
                    </td>
                    <td className="py-4">
                      <EtiquetaEstado estado={sol.estado} />
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        to={`/fabricante/costeo/${sol.id}`}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition ${
                          esRespondida
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-blue-900 hover:bg-blue-800 text-white shadow-sm'
                        }`}
                      >
                        {esRespondida ? (
                          <>
                            <Eye size={14} /> Ver Detalle
                          </>
                        ) : (
                          <>
                            <Calculator size={14} /> Costear
                          </>
                        )}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}