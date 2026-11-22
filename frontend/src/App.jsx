import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexto/AuthContext';
import { Navbar } from './componentes/Navbar';
import { RutaProtegida } from './componentes/RutaProtegida';
import { Configurador } from './vistas/cliente/Configurador';
import { MisCotizaciones } from './vistas/cliente/MisCotizaciones';
import { PresupuestoImprimible } from './vistas/cliente/PresupuestoImprimible';
import { DashboardFabricante } from './vistas/fabricante/DashboardFabricante';
import { CosteoDetalle } from './vistas/fabricante/CosteoDetalle';
import { Inventario } from './vistas/fabricante/Inventario';

// Vistas públicas
import { Home } from './vistas/publicas/Home';
import { Catalogo } from './vistas/publicas/Catalogo';
import { Login } from './vistas/publicas/Login';

// Placeholders temporales para los bloques 2 y 3
const Placeholder = ({ titulo }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-600 font-semibold">
    Vista en construcción: {titulo}
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
          <Navbar />

          <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/login" element={<Login />} />

              {/* Rutas Protegidas: Cliente */}
              <Route
              path="/configurador"
              element={
                <RutaProtegida rolPermitido="Cliente">
                  <Configurador />
                </RutaProtegida>
              }
              />
              <Route
              path="/mis-cotizaciones"
              element={
                <RutaProtegida rolPermitido="Cliente">
                  <MisCotizaciones />
                </RutaProtegida>
              }
              />
              <Route
              path="/presupuesto/:id"
              element={
                  <RutaProtegida rolPermitido="Cliente">
                    <PresupuestoImprimible />
                  </RutaProtegida>
              }
              />

              {/* Rutas Protegidas: Fabricante */}
              <Route
              path="/fabricante/dashboard"
              element={
                  <RutaProtegida rolPermitido="Fabricante">
                    <DashboardFabricante />
                  </RutaProtegida>
              }
              />
              <Route
              path="/fabricante/costeo/:id"
              element={
                  <RutaProtegida rolPermitido="Fabricante">
                    <CosteoDetalle />
                  </RutaProtegida>
              }
              />
              <Route
              path="/fabricante/inventario"
              element={
                  <RutaProtegida rolPermitido="Fabricante">
                    <Inventario />
                  </RutaProtegida>
              }
              />

              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </main>

          <footer className="bg-slate-900 text-slate-400 text-xs py-6 text-center border-t border-slate-800 print:hidden">
            <p>© 2026 ROCO Ventanas. Todos los derechos reservados.</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}