// src/vistas/publicas/Catalogo.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Box, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../../servicios/api';

export function Catalogo() {
  const [series, setSeries] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarCatalogo() {
      try {
        const [datosSeries, datosMateriales] = await Promise.all([
          api.getSeries(),
          api.getMateriales(),
        ]);
        setSeries(datosSeries);
        setMateriales(datosMateriales);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    cargarCatalogo();
  }, []);

  if (cargando) {
    return <div className="text-center py-12 text-slate-500">Cargando catálogo de productos...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de Perfilería y Materiales</h1>
          <p className="text-slate-500 text-sm mt-1">
            Explora nuestras líneas de fabricación en Aluminio y PVC antes de configurar tu medida.
          </p>
        </div>
        <Link
          to="/configurador"
          className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold px-5 py-3 rounded-xl shadow transition flex items-center gap-2 shrink-0"
        >
          <span>Cotizar Ventana</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Sección Series */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Layers size={20} className="text-blue-900" />
          Líneas y Series Disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {series.map((serie) => (
            <div key={serie.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                  {serie.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-3">{serie.nombre}</h3>
                <p className="text-slate-500 text-sm mt-2">{serie.descripcion}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link to="/configurador" className="text-sm font-semibold text-blue-900 hover:underline flex items-center gap-1">
                  Configurar con esta serie <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección Materiales y Cristales (Sin precios) */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Box size={20} className="text-blue-900" />
          Componentes e Insumos Disponibles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiales.map((mat) => (
            <div key={mat.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="font-medium text-slate-800 text-sm">{mat.nombre}</span>
              <span className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Por {mat.unidad}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}