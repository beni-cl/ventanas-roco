import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import { api } from '../../servicios/api';
import { useAuth } from '../../contexto/AuthContext';

export function Login() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');
    setCargando(true);

    try {
      if (esRegistro) {
        // POST /api/auth/registro
        await api.registro({ nombre, email, password, telefono, direccion });
        setMensajeExito('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
        setEsRegistro(false);
        setPassword('');
      } else {
        // POST /api/auth/login
        const respuesta = await api.login(email, password);
        iniciarSesion(respuesta);
        setPassword(''); // Limpiar de memoria inmediatamente

        // Redirección según rol
        if (respuesta.rol === 'Fabricante') {
          navigate('/fabricante/dashboard');
        } else {
          navigate('/configurador');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {esRegistro ? 'Crear Cuenta de Cliente' : 'Bienvenido a ROCO Ventanas'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {esRegistro
            ? 'Regístrate para cotizar tus ventanas a medida'
            : 'Ingresa tus credenciales para continuar'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mensajeExito && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          {mensajeExito}
        </div>
      )}

      <form onSubmit={manejarSubmit} className="space-y-4">
        {esRegistro && (
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nombre Completo *</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-900 outline-none"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Correo Electrónico *</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.cl"
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Contraseña *</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-900 outline-none"
            />
          </div>
        </div>

        {esRegistro && (
          <>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Teléfono (Opcional)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+56 9 1234 5678"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Dirección (Opcional)</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle, Número, Comuna"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-900 outline-none"
                />
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md transition mt-2"
        >
          {cargando ? 'Procesando...' : esRegistro ? 'Registrarme' : 'Ingresar'}
        </button>
      </form>

      {/* Pista rápida para pruebas con mocks */}
      {!esRegistro && (
        <p className="text-[11px] text-slate-400 text-center mt-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
          Modo prueba: usa cualquier correo para entrar como <strong>Cliente</strong>, o incluye <code>gerardo</code> en el correo para entrar como <strong>Fabricante</strong>.
        </p>
      )}

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={() => {
            setEsRegistro(!esRegistro);
            setError('');
            setMensajeExito('');
          }}
          className="text-sm text-blue-900 hover:underline font-semibold"
        >
          {esRegistro ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿Eres cliente nuevo? Regístrate aquí'}
        </button>
      </div>
    </div>
  );
}