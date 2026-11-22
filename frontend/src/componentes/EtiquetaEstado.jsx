import { Clock, CheckCircle2, Search } from 'lucide-react';
import { ESTADOS_COTIZACION } from '../config/constantes';

export function EtiquetaEstado({ estado }) {
  if (estado === ESTADOS_COTIZACION.RESPONDIDA) {
    return (
      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1.5">
        <CheckCircle2 size={14} />
        {estado}
      </span>
    );
  }

  if (estado === ESTADOS_COTIZACION.EN_REVISION) {
    return (
      <span className="bg-blue-100 text-blue-800 border border-blue-200 text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1.5">
        <Search size={14} />
        {estado}
      </span>
    );
  }

  // Por defecto: Pendiente (Amarillo según guía de estilos)
  return (
    <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1.5">
      <Clock size={14} />
      {estado || ESTADOS_COTIZACION.PENDIENTE}
    </span>
  );
}