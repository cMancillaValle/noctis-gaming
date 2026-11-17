import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Lock, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FormField, CustomInput } from './form';
import BaseModal from './BaseModal';

export const ProfileModal: React.FC = () => {
  const { currentCliente, isProfileModalOpen, setIsProfileModalOpen, updateProfile } = useAuth();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNuevo, setPasswordNuevo] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentCliente) {
      setNombre(currentCliente.nombre || '');
      setTelefono(currentCliente.telefono || '');
      setDireccion(currentCliente.direccion || '');
      setChangePassword(false);
      setPasswordActual('');
      setPasswordNuevo('');
      setError(null);
      setSuccess(null);
    }
  }, [currentCliente, isProfileModalOpen]);

  if (!isProfileModalOpen || !currentCliente) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const payload: any = {
        nombre,
        telefono,
        direccion,
      };

      if (changePassword) {
        if (!passwordActual) {
          throw new Error('Debes ingresar tu contraseña actual para establecer una nueva');
        }
        if (!passwordNuevo || passwordNuevo.length < 6) {
          throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
        }
        payload.passwordActual = passwordActual;
        payload.passwordNuevo = passwordNuevo;
      }

      await updateProfile(payload);
      setSuccess('Perfil actualizado exitosamente');
      setPasswordActual('');
      setPasswordNuevo('');
      setChangePassword(false);
      setTimeout(() => {
        setIsProfileModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
      maxWidth="max-w-md"
      maxHeight="max-h-[calc(100dvh-2rem)] sm:max-h-[min(92dvh,680px)]"
      zIndexClass="z-50"
      ariaLabel="Mi Perfil"
    >
      <div className="relative p-6 sm:p-8 overflow-y-auto">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-noctis-purple to-transparent"></div>

        {/* Close button */}
        <button
          onClick={() => setIsProfileModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-noctis-muted hover:text-white hover:bg-noctis-surface/50 transition-colors"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex p-3 rounded-xl bg-noctis-purple/20 text-noctis-cyan mb-2 border border-noctis-purple/30">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-poppins text-white">Mi Perfil</h2>
          <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-noctis-surface/80 text-noctis-cyan border border-noctis-cyan/30">
            <Shield className="w-3 h-3" />
            <span>Rol: {currentCliente.rol || 'CLIENTE'}</span>
          </div>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-xs text-green-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <FormField label="Correo Electrónico (No modificable)">
            <CustomInput
              type="email"
              disabled
              readOnly
              value={currentCliente.email}
              className="opacity-70 cursor-not-allowed"
            />
          </FormField>

          <FormField label="Nombre Completo" required>
            <CustomInput
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              icon={<User className="w-4 h-4" />}
            />
          </FormField>

          <FormField label="Teléfono de Contacto" required>
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
              placeholder="Cra 15 # 85-30, Bogotá"
              icon={<MapPin className="w-4 h-4" />}
            />
          </FormField>

          {/* Change password section */}
          <div className="pt-2 border-t border-noctis-surface/50">
            <button
              type="button"
              onClick={() => setChangePassword(!changePassword)}
              className="text-xs text-noctis-cyan hover:underline flex items-center gap-1.5 font-medium"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{changePassword ? 'Cancelar cambio de contraseña' : '¿Deseas cambiar tu contraseña?'}</span>
            </button>

            {changePassword && (
              <div className="mt-3 space-y-3 p-3.5 rounded-xl bg-noctis-bg/60 border border-noctis-surface/60">
                <FormField label="Contraseña Actual" required>
                  <CustomInput
                    type="password"
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    placeholder="Tu contraseña actual"
                    icon={<Lock className="w-4 h-4" />}
                  />
                </FormField>
                <FormField label="Nueva Contraseña" required helperText="Mínimo 6 caracteres">
                  <CustomInput
                    type="password"
                    value={passwordNuevo}
                    onChange={(e) => setPasswordNuevo(e.target.value)}
                    placeholder="Nueva contraseña segura"
                    icon={<Lock className="w-4 h-4" />}
                  />
                </FormField>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 h-11 px-4 rounded-xl font-poppins font-semibold text-xs text-white bg-gradient-to-r from-noctis-purple to-noctis-purpleLight hover:opacity-90 active:scale-95 transition-all shadow-glow-purple disabled:opacity-50"
          >
            {isLoading ? 'Guardando cambios...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </BaseModal>
  );
};
