import { useEffect, useState } from 'react';
import { Save, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { api } from '../../servicios/api';

export function Inventario() {
  const [materiales, setMateriales] = useState([]);
  const [preciosEditados, setPreciosEditados] = useState({});
  const [guardandoId, setGuardandoId] = useState(null);
  const [mensajeOk, setMensajeOk] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.getInventario()
      .then((datos) => {
        setMateriales(datos);
        const mapaInicial = {};
        datos.forEach((m) => {
          mapaInicial[m.id] = m.precio;
        });
        setPreciosEditados(mapaInicial);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const manejarGuardarPrecio = async (id) => {
    const nuevoPrecio = Number(preciosEditados[id]);
    if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
      setError('Ingresa un precio válido mayor o igual a 0.');
      return;
    }

    setGuardandoId(id);
    setError('');
    setMensajeOk('');

    try {
      await api.actualizarPrecioMaterial(id, nuevoPrecio);
      setMateriales((prev) =>
        prev.map((m) => (m.id === id ? { ...m, precio: nuevoPrecio } : m))
      );
      setMensajeOk('Precio actualizado correctamente en el inventario.');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoId(null);
    }
  };

  if (cargando) {
    return <div className="text-center py-12 text-slate-500">Cargando inventario de materiales...</div>;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Package size={24} className="text-blue-900" />
          Inventario y Precios Base
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Actualiza los costos unitarios de perfiles, cristales y herrajes para los próximos cálculos del taller.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {mensajeOk && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{mensajeOk}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-bold">
              <th className="pb-3">Material / Insumo</th>
              <th className="pb-3">Unidad</th>
              <th className="pb-3">Precio Unitario (CLP)</th>
              <th className="pb-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materiales.map((mat) => {
              const cambioPendiente = Number(preciosEditados[mat.id]) !== mat.precio;

              return (
                <tr key={mat.id} className="hover:bg-slate-50 transition">
                  <td className="py-4 font-semibold text-slate-800">{mat.nombre}</td>
                  <td className="py-4 font-mono text-xs text-slate-500 uppercase">{mat.unidad}</td>
                  <td className="py-4">
                    <div className="relative max-w-[160px]">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        value={preciosEditados[mat.id] ?? ''}
                        onChange={(e) =>
                          setPreciosEditados((prev) => ({ ...prev, [mat.id]: e.target.value }))
                        }
                        className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none"
                      />
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => manejarGuardarPrecio(mat.id)}
                      disabled={!cambioPendiente || guardandoId === mat.id}
                      className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
                    >
                      <Save size={14} />
                      <span>{guardandoId === mat.id ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}