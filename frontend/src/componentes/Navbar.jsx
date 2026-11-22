import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Wrench, User } from "lucide-react";
import { useAuth } from "../contexto/AuthContext";

export function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const manejarLogout = () => {
    cerrarSesion();
    setMenuAbierto(false);
    navigate("/login");
  };

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo y Nombre Oficial según guía de estilos */}
        <Link
          to="/home"
          className="flex items-center space-x-2.5"
          onClick={() => setMenuAbierto(false)}
        >
          <div className="bg-blue-900 p-1.5 rounded-lg border border-blue-700">
            <span className="font-black text-blue-300 tracking-tighter text-lg">
              RV
            </span>
          </div>
          <span className="font-bold text-xl tracking-wide">
            ROCO <span className="text-blue-400 font-normal">Ventanas</span>
          </span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/home" className="hover:text-blue-400 transition">
            Inicio
          </Link>
          <Link to="/catalogo" className="hover:text-blue-400 transition">
            Catálogo
          </Link>

          {usuario?.rol === "Cliente" && (
            <>
              <Link
                to="/configurador"
                className="hover:text-blue-400 transition"
              >
                Configurador
              </Link>
              <Link
                to="/mis-cotizaciones"
                className="hover:text-blue-400 transition"
              >
                Mis Cotizaciones
              </Link>
            </>
          )}

          {usuario?.rol === "Fabricante" && (
            <>
              <Link
                to="/fabricante/dashboard"
                className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5"
              >
                <Wrench size={15} /> Solicitudes
              </Link>
              <Link
                to="/fabricante/inventario"
                className="hover:text-blue-400 transition"
              >
                Inventario
              </Link>
            </>
          )}

          {!usuario ? (
            <Link
              to="/login"
              className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition border border-blue-700"
            >
              Iniciar Sesión
            </Link>
          ) : (
            <div className="flex items-center space-x-4 pl-4 border-l border-slate-700">
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <User size={14} className="text-blue-400" />
                {usuario.nombre}{" "}
                <span className="text-slate-500">({usuario.rol})</span>
              </span>
              <button
                onClick={manejarLogout}
                className="text-slate-400 hover:text-red-400 transition flex items-center gap-1 text-xs"
                title="Cerrar sesión"
              >
                <LogOut size={16} /> Salir
              </button>
            </div>
          )}
        </nav>

        {/* Botón Menú Móvil (para teléfono en el taller) */}
        <button
          className="md:hidden text-slate-300 hover:text-white p-1"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
        >
          {menuAbierto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú Desplegable Móvil */}
      {menuAbierto && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 px-4 py-4 space-y-3 text-sm">
          <Link
            to="/home"
            onClick={() => setMenuAbierto(false)}
            className="block py-1.5 hover:text-blue-400"
          >
            Inicio
          </Link>
          <Link
            to="/catalogo"
            onClick={() => setMenuAbierto(false)}
            className="block py-1.5 hover:text-blue-400"
          >
            Catálogo
          </Link>

          {usuario?.rol === "Cliente" && (
            <>
              <Link
                to="/configurador"
                onClick={() => setMenuAbierto(false)}
                className="block py-1.5 hover:text-blue-400"
              >
                Configurador
              </Link>
              <Link
                to="/mis-cotizaciones"
                onClick={() => setMenuAbierto(false)}
                className="block py-1.5 hover:text-blue-400"
              >
                Mis Cotizaciones
              </Link>
            </>
          )}

          {usuario?.rol === "Fabricante" && (
            <>
              <Link
                to="/fabricante/dashboard"
                onClick={() => setMenuAbierto(false)}
                className="block py-1.5 text-emerald-400 font-semibold"
              >
                Panel Solicitudes
              </Link>
              <Link
                to="/fabricante/inventario"
                onClick={() => setMenuAbierto(false)}
                className="block py-1.5 hover:text-blue-400"
              >
                Inventario de Materiales
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-slate-700">
            {!usuario ? (
              <Link
                to="/login"
                onClick={() => setMenuAbierto(false)}
                className="block w-full text-center bg-blue-900 hover:bg-blue-800 text-white py-2.5 rounded-lg font-semibold"
              >
                Iniciar Sesión / Registrarse
              </Link>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">
                  {usuario.nombre} ({usuario.rol})
                </span>
                <button
                  onClick={manejarLogout}
                  className="text-red-400 text-xs font-semibold flex items-center gap-1"
                >
                  <LogOut size={14} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
