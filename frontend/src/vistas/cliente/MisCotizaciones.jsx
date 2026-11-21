import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, AlertCircle } from 'lucide-react';
import { api } from '../../servicios/api';
import { EtiquetaEstado } from '../../componentes/EtiquetaEstado';
import { ESTADOS_COTIZACION } from '../../config/constantes';

export function MisCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMisCotizaciones()
      .then((datos) => {
        // Regla de seguridad: verificar que el backend no exponga costos ni márgenes al Cliente
        const exponeCostos = datos.some((c) => c.costos || c.margen !== undefined);
        if (exponeCostos) {
          console.warn('ALERTA DE SEGURIDAD: La API devolvió costos o márgenes en una vista de Cliente.');
        }
        setCotizaciones(datos);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <div className="text-center py-12 text-slate-500">Cargando tus cotizaciones...</div>;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estado de Mis Solicitudes</h1>
          <p className="text-slate-500 text-sm">Seguimiento en tiempo real de tus presupuestos enviados al taller.</p>
        </div>
        <Link
          to="/configurador"
          className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
        >
          <Plus size={16} /> Nueva Cotización
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {cotizaciones.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-sm">
          Aún no tienes solicitudes registradas. ¡Crea tu primera cotización en el configurador!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-bold tracking-wider">
                <th className="pb-3">N° Orden</th>
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Configuración</th>
                <th className="pb-3">Dimensiones</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3 text-right">Precio Final</th>
                <th className="pb-3 text-right">Documento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cotizaciones.map((cot) => {
                const estaRespondida = cot.estado === ESTADOS_COTIZACION.RESPONDIDA;

                return (
                  <tr key={cot.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 font-mono font-bold text-blue-900">{cot.numeroOrden}</td>
                    <td className="py-4 text-slate-500 text-xs">{cot.fecha}</td>
                    <td className="py-4 font-medium text-slate-700">
                      {cot.serie} / {cot.vidrio}
                      <span className="block text-xs text-slate-400">
                        Color: {cot.color} · Cant: {cot.cantidad}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-500">
                      {cot.ancho} x {cot.alto} mm
                    </td>
                    <td className="py-4">
                      <EtiquetaEstado estado={cot.estado} />
                    </td>
                    <td className="py-4 text-right font-mono">
                      {estaRespondida && cot.precioFinal ? (
                        <span className="font-bold text-slate-900 text-base">
                          ${Number(cot.precioFinal).toLocaleString('es-CL')} CLP
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Por calcular en taller...</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {estaRespondida ? (
                        <Link
                          to={`/presupuesto/${cot.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition"
                        >
                          <FileText size={14} /> Presupuesto
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}