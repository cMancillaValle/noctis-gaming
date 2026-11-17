import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Sparkles, Loader2, LogIn, Shield, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FormField, CustomInput } from '../components/form';

export const CustomersPage: React.FC = () => {
  const { currentCliente, isLoggedIn, register, setIsLoginModalOpen, setIsProfileModalOpen } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!password || password.length < 6) {
      setErrorMessage('La contraseña es obligatoria y debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      await register({
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        password: password.trim(),
      });

      setSuccessMessage('¡Cuenta creada y sesión iniciada con éxito en Noctis Gaming!');
      setNombre('');
      setEmail('');
      setTelefono('');
      setDireccion('');
      setPassword('');
    } catch (err: any) {
      console.error('Error al registrar cliente:', err);
      setErrorMessage(err.message || 'Error al procesar el registro de usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-inter">
      <div>
        <span className="text-xs font-semibold text-noctis-cyan uppercase tracking-widest block mb-1">
          Comunidad Oficial Gamer
        </span>
        <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-white">
          CUENTAS & COMUNIDAD
        </h1>
        <p className="text-sm text-noctis-muted mt-1 font-inter">
          Gestiona tu cuenta oficial en Noctis Gaming para recibir beneficios exclusivos, seguimiento de órdenes y facturación digital inmediata.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulario de Registro */}
        <div className="lg:col-span-7 rounded-3xl bg-noctis-card border border-noctis-surface/70 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-noctis-surface/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-noctis-purple to-noctis-cyan flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-lg text-white">Crear Cuenta de Usuario</h2>
              <p className="text-xs text-noctis-muted">Crea una cuenta para compras, facturación y soporte</p>
            </div>
          </div>

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-3 text-emerald-200 text-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 flex items-center gap-3 text-rose-200 text-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre Completo" required>
              <CustomInput
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Daniel Morales"
                required
                leftIcon={<User />}
              />
            </FormField>

            <FormField label="Correo Electrónico" required>
              <CustomInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej: gamer@noctisgaming.co"
                required
                leftIcon={<Mail />}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Teléfono" required>
                <CustomInput
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 3101234567"
                  required
                  leftIcon={<Phone />}
                />
              </FormField>

              <FormField label="Contraseña (Mínimo 6)" required>
                <CustomInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña segura"
                  required
                  minLength={6}
                />
              </FormField>
            </div>

            <FormField label="Dirección de Entrega" required>
              <CustomInput
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej: Cra 15 # 85-30, Bogotá D.C."
                required
                leftIcon={<MapPin />}
              />
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-poppins font-semibold text-xs bg-gradient-to-r from-noctis-purple to-noctis-purpleDark hover:from-noctis-purpleLight text-white shadow-glow-purple flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando cuenta segura...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-noctis-cyan" />
                  <span>Crear Cuenta en Noctis</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Panel lateral: Perfil Activo o Acceso */}
        <div className="lg:col-span-5 space-y-6">
          {isLoggedIn && currentCliente ? (
            <div className="rounded-3xl bg-noctis-card border border-noctis-surface/70 p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-noctis-surface/60">
                <div>
                  <h2 className="font-poppins font-bold text-lg text-white">Sesión Activa</h2>
                  <p className="text-xs text-noctis-muted">Tu perfil en Noctis Gaming</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    currentCliente.rol === 'ADMIN'
                      ? 'bg-noctis-purple/30 text-noctis-purpleLight border border-noctis-purple/40'
                      : 'bg-noctis-cyan/20 text-noctis-cyan border border-noctis-cyan/30'
                  }`}
                >
                  {currentCliente.rol || 'CLIENTE'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-noctis-bg/70 border border-noctis-surface/60 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <User className="w-4 h-4 text-noctis-cyan" />
                    <span>{currentCliente.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2 text-noctis-muted text-xs">
                    <Mail className="w-4 h-4 text-noctis-muted" />
                    <span>{currentCliente.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-noctis-muted text-xs">
                    <Phone className="w-4 h-4 text-noctis-muted" />
                    <span>{currentCliente.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2 text-noctis-muted text-xs">
                    <MapPin className="w-4 h-4 text-noctis-muted" />
                    <span>{currentCliente.direccion}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-noctis-surface hover:bg-noctis-surface/80 text-white text-xs font-semibold transition-colors"
                >
                  <Edit className="w-4 h-4 text-noctis-cyan" />
                  <span>Editar Mis Datos Personales</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-noctis-card border border-noctis-surface/70 p-6 sm:p-8 shadow-xl space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-noctis-purple/20 border border-noctis-purple/30 text-noctis-cyan mx-auto flex items-center justify-center shadow-glow-purple">
                <LogIn className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-xl text-white">¿Ya eres parte de Noctis?</h3>
                <p className="text-xs text-noctis-muted mt-2 leading-relaxed">
                  Inicia sesión de forma manual con tu correo y contraseña para ver tus pedidos y agilizar tus compras.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full h-11 px-4 rounded-xl font-poppins font-semibold text-xs text-white bg-gradient-to-r from-noctis-purple to-noctis-purpleLight hover:opacity-90 shadow-glow-purple transition-all flex items-center justify-center"
              >
                Iniciar Sesión
              </button>
            </div>
          )}

          {/* Beneficios */}
          <div className="rounded-3xl bg-noctis-card/50 border border-noctis-surface/50 p-6 space-y-3">
            <h4 className="font-poppins font-bold text-xs uppercase tracking-wider text-noctis-cyan flex items-center gap-2">
              <Shield className="w-4 h-4" /> Ventajas de tu cuenta
            </h4>
            <ul className="text-xs text-noctis-muted space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-noctis-cyan shrink-0 mt-0.5" />
                <span>Facturas automáticas asociadas a tu identificación fiscal.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-noctis-cyan shrink-0 mt-0.5" />
                <span>Garantía de 6 meses directa en hardware y periféricos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-noctis-cyan shrink-0 mt-0.5" />
                <span>Atención preferencial en el laboratorio técnico.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
