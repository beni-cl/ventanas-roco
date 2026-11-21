import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../../servicios/api';
import { useAuth } from '../../contexto/AuthContext';

export function PresupuestoImprimible() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [cotizacion, setCotizacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCotizacionDetalle(id)
      .then((data) => {
        if (!data) throw new Error('No se encontró el presupuesto solicitado.');
        setCotizacion(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return <div className="text-center py-12 text-slate-500">Generando vista de presupuesto...</div>;
  }

  if (error || !cotizacion) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
        <AlertCircle size={18} />
        <span>{error || 'Presupuesto no disponible.'}</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Barra de acciones (se oculta al imprimir gracias a no-print) */}
      <div className="no-print flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <Link
          to="/mis-cotizaciones"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Volver a Mis Cotizaciones
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow flex items-center gap-2 transition"
        >
          <Printer size={16} /> Imprimir / Guardar PDF
        </button>
      </div>

      {/* Hoja de Presupuesto Formal */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
        {/* Encabezado Documento */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">ROCO Ventanas</h1>
            <p className="text-xs text-slate-500 mt-1">Fabricación a Medida en Aluminio y PVC</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Presupuesto Formal</span>
            <span className="text-lg font-mono font-bold text-blue-900">{cotizacion.numeroOrden}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Fecha: {cotizacion.fecha}</span>
          </div>
        </div>

        {/* Datos del Cliente */}
        <div className="grid grid-cols-2 gap-4 py-6 border-b border-slate-200 text-sm">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block">Cliente</span>
            <span className="font-semibold text-slate-900">{usuario?.nombre}</span>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-bold text-slate-400 block">Estado</span>
            <span className="font-semibold text-emerald-700">{cotizacion.estado}</span>
          </div>
        </div>

        {/* Detalle Técnico Comercial */}
        <div className="py-6">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-xs uppercase text-slate-500">
                <th className="py-2">Descripción del Producto</th>
                <th className="py-2">Dimensiones</th>
                <th className="py-2 text-center">Cant.</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-4">
                  <p className="font-bold text-slate-900">{cotizacion.serie}</p>
                  <p className="text-xs text-slate-600 mt-0.5">Cristal: {cotizacion.vidrio}</p>
                  <p className="text-xs text-slate-600">Acabado / Color: {cotizacion.color}</p>
                </td>
                <td className="py-4 font-mono text-slate-700">
                  {cotizacion.ancho} x {cotizacion.alto} mm
                </td>
                <td className="py-4 text-center font-mono">{cotizacion.cantidad}</td>
                <td className="py-4 text-right font-mono font-bold text-slate-900">
                  {cotizacion.precioFinal
                    ? `$${Number(cotizacion.precioFinal).toLocaleString('es-CL')} CLP`
                    : 'Pendiente'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Final */}
        <div className="pt-6 border-t-2 border-slate-900 flex justify-end">
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between items-center text-base font-extrabold text-slate-900">
              <span>TOTAL PRESUPUESTO:</span>
              <span className="font-mono text-xl text-blue-900">
                {cotizacion.precioFinal
                  ? `$${Number(cotizacion.precioFinal).toLocaleString('es-CL')} CLP`
                  : 'Por definir'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 text-right">
              Valores expresados en Pesos Chilenos (CLP).
            </p>
          </div>
        </div>

        {/* Pie legal */}
        <div className="mt-12 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          Documento generado por el sistema de cotizaciones ROCO Ventanas. Validez de la oferta: 15 días corridos.
        </div>
      </div>
    </div>
  );
}