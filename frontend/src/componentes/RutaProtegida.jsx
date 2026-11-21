// src/componentes/RutaProtegida.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContext';

export function RutaProtegida({ children, rolPermitido }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rolPermitido && usuario.rol !== rolPermitido) {
    // Si un Cliente intenta entrar a /fabricante/dashboard, lo redirige a su inicio
    return <Navigate to="/home" replace />;
  }

  return children;
}