// src/vistas/publicas/Home.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Ruler, Sparkles } from 'lucide-react';

export function Home() {
  return (
    <div className="space-y-8">
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg">
        <div className="max-w-2xl space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider bg-blue-900/80 text-blue-200 px-3 py-1 rounded-full border border-blue-700">
            Fabricación a Medida
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ventanas de Aluminio y PVC diseñadas para tu proyecto
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Configura las dimensiones exactas, selecciona el tipo de cristal termopanel y recibe una cotización formal directamente desde nuestro taller.
          </p>
          <div className="pt-4 flex flex-wrap gap-3">
            <Link
              to="/configurador"
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-3.5 rounded-xl border border-blue-700 transition flex items-center gap-2"
            >
              <span>Diseñar mi Ventana</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/catalogo"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3.5 rounded-xl border border-slate-700 transition"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <Ruler className="text-blue-900" size={24} />
          <h3 className="font-bold text-slate-900">Medidas Exactas</h3>
          <p className="text-sm text-slate-500">Configuración milimétrica adaptada a los requerimientos de tu obra.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <Sparkles className="text-blue-900" size={24} />
          <h3 className="font-bold text-slate-900">Aislación Térmica y Acústica</h3>
          <p className="text-sm text-slate-500">Opciones en PVC ThermoLine y cristales Doble Vidriado Hermético (DVH).</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <ShieldCheck className="text-blue-900" size={24} />
          <h3 className="font-bold text-slate-900">Seguimiento en Línea</h3>
          <p className="text-sm text-slate-500">Revisa el estado de tus solicitudes y descarga tu presupuesto listo para imprimir.</p>
        </div>
      </div>
    </div>
  );
}