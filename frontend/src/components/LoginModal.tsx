import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FormField, CustomInput } from './form';
import BaseModal from './BaseModal';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        if (!password || password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        await register({ nombre, email, telefono, direccion, password });
      } else {
        await login(email, password);
      }
      setIsLoginModalOpen(false);
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isLoginModalOpen}
      onClose={() => setIsLoginModalOpen(false)}
      maxWidth="max-w-md"
      maxHeight="max-h-[calc(100dvh-2rem)] sm:max-h-[min(92dvh,680px)]"
      zIndexClass="z-50"
      ariaLabel={isRegistering ? 'Crear Cuenta en Noctis' : 'Iniciar Sesión'}
    >
      <div className="relative p-6 sm:p-8 overflow-y-auto">
        {/* Glow decorative accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-noctis-cyan to-transparent"></div>

        {/* Close button */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-noctis-muted hover:text-white hover:bg-noctis-surface/50 transition-colors"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex p-3 rounded-xl bg-noctis-purple/20 text-noctis-cyan mb-3 border border-noctis-purple/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-poppins text-white">
            {isRegistering ? 'Crear Cuenta en Noctis' : 'Iniciar Sesión'}
          </h2>
          <p className="text-xs text-noctis-muted mt-1">
            {isRegistering
              ? 'Regístrate para realizar compras y gestionar tus pedidos'
              : 'Accede a tu cuenta para gestionar pedidos y perfil'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegistering && (
            <FormField label="Nombre Completo" required>
              <CustomInput
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: David Martínez"
                icon={<User className="w-4 h-4" />}
              />
            </FormField>
          )}

          <FormField label="Correo Electrónico" required>
            <CustomInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              icon={<Mail className="w-4 h-4" />}
            />
          </FormField>

          <FormField
            label="Contraseña"
            required
            helperText={isRegistering ? 'Mínimo 6 caracteres' : undefined}
          >
            <CustomInput
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegistering ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
              icon={<Lock className="w-4 h-4" />}
            />
          </FormField>

          {isRegistering && (
            <>
              <FormField label="Teléfono" required>
                <CustomInput
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="3001234567"
                  icon={<Phone className="w-4 h-4" />}
                />
              </FormField>

              <FormField label="Dirección de Entrega" required>
                <CustomInput
                  type="text"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle 100 #15-20, Bogotá"
                  icon={<MapPin className="w-4 h-4" />}
                />
              </FormField>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 h-11 px-4 rounded-xl font-poppins font-semibold text-xs text-white bg-gradient-to-r from-noctis-purple to-noctis-purpleLight hover:opacity-90 active:scale-95 transition-all shadow-glow-purple disabled:opacity-50"
          >
            {isLoading
              ? 'Procesando...'
              : isRegistering
              ? 'Registrarme e Iniciar Sesión'
              : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="text-xs text-noctis-cyan hover:underline"
          >
            {isRegistering
              ? '¿Ya tienes una cuenta? Inicia sesión aquí'
              : '¿No tienes cuenta aún? Regístrate aquí'}
          </button>
        </div>

        {/* Atajo de desarrollo local (exclusivo para entorno de desarrollo local) */}
        {!isRegistering && import.meta.env.DEV && (
          <div className="mt-5 p-3 rounded-xl bg-noctis-bg/80 border border-noctis-surface/60">
            <p className="text-[11px] font-semibold text-noctis-text/80 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3 text-noctis-cyan" /> Entorno de desarrollo local:
            </p>
            <div className="text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setEmail('smora@noctisgaming.co');
                  setPassword('');
                }}
                className="w-full p-2 rounded-lg bg-noctis-surface/40 hover:bg-noctis-surface/80 text-left border border-noctis-surface/50 text-noctis-text transition-colors truncate"
              >
                <div className="font-semibold text-noctis-cyan">Cargar correo de cliente de prueba</div>
                <div className="text-noctis-muted text-[10px] truncate">smora@noctisgaming.co</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
};
