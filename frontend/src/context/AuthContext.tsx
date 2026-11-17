import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cliente, ClienteUpdateInput } from '../types';
import { clientesApi, getToken, setToken } from '../services/api';

interface AuthContextType {
  currentCliente: Cliente | null;
  token: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (datos: { nombre: string; email: string; telefono: string; direccion: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (datos: ClienteUpdateInput) => Promise<void>;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(() => {
    try {
      const stored = localStorage.getItem('noctis_active_client');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Validate session on mount if token exists
  useEffect(() => {
    const verificarSesion = async () => {
      const activeToken = getToken();
      if (!activeToken) {
        // Visitante por defecto
        setCurrentCliente(null);
        setIsLoading(false);
        return;
      }

      try {
        const clienteActualizado = await clientesApi.me();
        setCurrentCliente(clienteActualizado);
        localStorage.setItem('noctis_active_client', JSON.stringify(clienteActualizado));
      } catch (err) {
        console.warn('Sesión no válida o expirada:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verificarSesion();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await clientesApi.login({ email, password });
    setToken(response.token);
    setTokenState(response.token);
    setCurrentCliente(response.cliente);
    localStorage.setItem('noctis_active_client', JSON.stringify(response.cliente));
  };

  const register = async (datos: { nombre: string; email: string; telefono: string; direccion: string; password: string }) => {
    // Registrar en backend
    await clientesApi.registrar(datos);
    // Iniciar sesión automáticamente tras el registro
    await login(datos.email, datos.password);
  };

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setCurrentCliente(null);
    localStorage.removeItem('noctis_active_client');
    localStorage.removeItem('noctis_admin_key');
  }, []);

  const updateProfile = async (datos: ClienteUpdateInput) => {
    if (!currentCliente) throw new Error('No hay cliente con sesión activa');
    const actualizado = await clientesApi.actualizarPerfil(currentCliente.id, datos);
    setCurrentCliente(actualizado);
    localStorage.setItem('noctis_active_client', JSON.stringify(actualizado));
  };

  const isLoggedIn = Boolean(currentCliente && token);
  const isAdmin = Boolean(currentCliente?.rol === 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        currentCliente,
        token,
        isLoggedIn,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
