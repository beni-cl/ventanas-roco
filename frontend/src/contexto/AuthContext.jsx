// src/contexto/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const token = sessionStorage.getItem('token');
    const nombre = sessionStorage.getItem('nombre');
    const rol = sessionStorage.getItem('rol');
    return token ? { token, nombre, rol } : null;
  });

  const iniciarSesion = ({ token, nombre, rol }) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('nombre', nombre);
    sessionStorage.setItem('rol', rol);
    setUsuario({ token, nombre, rol });
  };

  const cerrarSesion = () => {
    sessionStorage.clear();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);