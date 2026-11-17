import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Tv,
  Sparkles,
  Layers,
  Wrench,
  ShieldCheck,
  Truck,
  Headphones,
  ArrowRight,
  Cpu,
  Flame,
  CheckCircle2,
  Laptop,
  Check,
  ChevronRight,
  Send,
  RotateCcw,
  MessageSquare,
  AlertCircle,
  Loader2,
  LogIn,
} from 'lucide-react';
import { Producto, SolicitudTecnica } from '../types';
import { productosApi, inventarioApi, solicitudesApi } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { CustomSelect, SelectOption } from '../components/CustomSelect';
import { FormField, CustomInput, CustomTextarea } from '../components/form';
import { useAuth } from '../context/AuthContext';
import { ChatModal } from '../components/ChatModal';

export const HomePage: React.FC = () => {
  const { currentCliente, isLoggedIn, setIsLoginModalOpen } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([]);
  const [stocks, setStocks] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  // Technical Service Multi-step Assistant State
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('mantenimiento-preventivo');
  const [selectedDeviceType, setSelectedDeviceType] = useState('consola');
  const [brandModel, setBrandModel] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCity, setContactCity] = useState('bogota');
  const [serviceSubmitted, setServiceSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [solicitudCreada, setSolicitudCreada] = useState<SolicitudTecnica | null>(null);
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [errorSolicitud, setErrorSolicitud] = useState<string | null>(null);
  const [chatAbierto, setChatAbierto] = useState(false);

  useEffect(() => {
    if (currentCliente) {
      if (!contactName) setContactName(currentCliente.nombre);
      if (!contactPhone) setContactPhone(currentCliente.telefono);
    }
  }, [currentCliente]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productos, inventario] = await Promise.all([
          productosApi.listar(),
          inventarioApi.listar().catch(() => []),
        ]);

        const stockMap: Record<number, number> = {};
        inventario.forEach((item) => {
          stockMap[item.productoId] = item.cantidadDisponible;
        });
        setStocks(stockMap);
        setFeaturedProducts(productos.slice(0, 6));
      } catch (err) {
        console.error('Error al cargar datos en inicio:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const categories = [
    { name: 'Consolas', icon: Tv, desc: 'PS5, Xbox Series X, Switch OLED', color: 'from-blue-600/20 to-noctis-cyan/20' },
    { name: 'Controles', icon: Gamepad2, desc: 'DualSense Edge, Elite Series 2', color: 'from-purple-600/20 to-noctis-purple/20' },
    { name: 'Videojuegos', icon: Sparkles, desc: 'Títulos AAA y lanzamientos 2026', color: 'from-emerald-600/20 to-cyan-500/20' },
    { name: 'Periféricos', icon: Cpu, desc: 'Switches ópticos, sensores 32K DPI', color: 'from-pink-600/20 to-purple-600/20' },
    { name: 'Accesorios', icon: Layers, desc: 'Stands RGB, hubs de alta velocidad', color: 'from-indigo-600/20 to-blue-500/20' },
  ];

  const serviceOptions: SelectOption[] = [
    { value: 'diagnostico-general', label: 'Diagnóstico General de Falla', description: 'Revisión técnica exhaustiva y presupuesto' },
    { value: 'mantenimiento-preventivo', label: 'Mantenimiento Preventivo Integral', description: 'Limpieza profunda, lubricación y optimización' },
    { value: 'limpieza-termica', label: 'Limpieza Térmica & Pasta Térmica', description: 'Cambio de metal líquido y pastas de alto rendimiento' },
    { value: 'reparacion-especializada', label: 'Reparación Especializada de Hardware', description: 'Cambio de componentes, puertos HDMI y módulos' },
    { value: 'actualizacion-repotenciacion', label: 'Actualización y Repotenciación', description: 'Ampliación de almacenamiento SSD y optimización' },
  ];

  const deviceTypes = [
    { id: 'consola', label: 'Consola de Videojuegos', desc: 'PlayStation 5, Xbox Series X/S, Nintendo Switch', icon: Tv },
    { id: 'control', label: 'Control / Mando Gamer', desc: 'DualSense, Xbox Wireless, mandos competitivos', icon: Gamepad2 },
    { id: 'pc', label: 'PC / Portátil Gamer', desc: 'Torres ensambladas, tarjetas gráficas, laptops', icon: Laptop },
    { id: 'periferico', label: 'Periférico o Accesorio', desc: 'Audífonos, teclados mecánicos, timones y pedales', icon: Headphones },
  ];

  const cityOptions: SelectOption[] = [
    { value: 'bogota', label: 'Bogotá D.C. (Sede Principal)' },
    { value: 'medellin', label: 'Medellín y Valle de Aburrá' },
    { value: 'cali', label: 'Cali y Valle del Cauca' },
    { value: 'barranquilla', label: 'Barranquilla y Costa Caribe' },
    { value: 'bucaramanga', label: 'Bucaramanga y Santanderes' },
    { value: 'otra', label: 'Otra Ciudad (Envío Nacional Asegurado)' },
  ];

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSolicitud(null);

    if (!isLoggedIn || !currentCliente) {
      setErrorSolicitud('Debes iniciar sesión con tu cuenta de cliente para radicar una solicitud técnica oficial.');
      setIsLoginModalOpen(true);
      return;
    }

    try {
      setEnviandoSolicitud(true);
      const nuevaSolicitud = await solicitudesApi.crear({
        clienteId: currentCliente.id,
        clienteNombre: currentCliente.nombre,
        clienteTelefono: currentCliente.telefono,
        clienteEmail: currentCliente.email,
        servicioTipo: selectedService,
        dispositivoTipo: selectedDeviceType,
        marcaModelo: brandModel.trim(),
        sintomas: issueDescription.trim(),
        ciudad: contactCity,
        nombreContacto: contactName.trim(),
        telefonoContacto: contactPhone.trim(),
      });

      setTicketNumber(nuevaSolicitud.numeroSolicitud || nuevaSolicitud.numeroTicket || 'ST-2026-REG');
      setSolicitudCreada(nuevaSolicitud);
      setServiceSubmitted(true);
    } catch (err: any) {
      console.error('Error al registrar solicitud técnica:', err);
      setErrorSolicitud(err?.response?.data?.mensaje || err?.message || 'Error al radicar la solicitud técnica.');
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  const handleResetService = () => {
    setStep(1);
    setSelectedService('mantenimiento-preventivo');
    setSelectedDeviceType('consola');
    setBrandModel('');
    setIssueDescription('');
    setContactName(currentCliente?.nombre || '');
    setContactPhone(currentCliente?.telefono || '');
    setContactCity('bogota');
    setServiceSubmitted(false);
    setTicketNumber('');
    setSolicitudCreada(null);
    setErrorSolicitud(null);
  };

  return (
    <div className="space-y-24 pb-20 overflow-hidden font-sans">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-noctis-purple/25 via-noctis-cyan/20 to-transparent blur-[120px] -z-10 rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-noctis-card border border-noctis-surface/60 text-xs text-noctis-cyan font-medium shadow-inner">
              <Sparkles className="w-4 h-4 text-noctis-cyan animate-pulse" />
              <span>Tienda Gamer de Alto Rendimiento • Colombia</span>
            </div>

            <h1 className="font-poppins font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15]">
              EQUIPA TU NIVEL <br />
              <span className="bg-gradient-to-r from-noctis-cyan via-noctis-purpleLight to-noctis-purple bg-clip-text text-transparent">
                LEGENDARIO
              </span>
            </h1>

            <p className="text-base sm:text-lg text-noctis-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Consolas de última generación, controles competitivos y periféricos para streamers y profesionales del gaming. Respaldado por tecnología de alta velocidad, máxima confiabilidad y garantía real.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                to="/catalogo"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-poppins font-semibold text-sm bg-gradient-to-r from-noctis-purple to-noctis-purpleDark hover:from-noctis-purpleLight hover:to-noctis-purple text-white shadow-glow-purple flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#servicio-tecnico"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-poppins font-semibold text-sm bg-noctis-card border border-noctis-surface hover:border-noctis-cyan text-white hover:text-noctis-cyan transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4 text-noctis-cyan" />
                <span>Asistente de Servicio Técnico</span>
              </a>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-noctis-surface/40 text-left font-sans">
              <div>
                <span className="font-poppins font-bold text-white text-lg sm:text-xl">100%</span>
                <p className="text-xs text-noctis-muted">Original con Garantía</p>
              </div>
              <div>
                <span className="font-poppins font-bold text-noctis-cyan text-lg sm:text-xl">Nacional</span>
                <p className="text-xs text-noctis-muted">Envíos a toda Colombia</p>
              </div>
              <div>
                <span className="font-poppins font-bold text-noctis-purpleLight text-lg sm:text-xl">24/7</span>
                <p className="text-xs text-noctis-muted">Soporte Técnico Pro</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-b from-noctis-card to-[#0e1626] border border-noctis-surface/60 p-8 flex flex-col justify-between shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-noctis-cyan/15 rounded-full blur-3xl group-hover:bg-noctis-cyan/25 transition-all" />
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-noctis-purple/30 border border-noctis-purple/40 text-xs font-semibold text-white">
                  DESTACADO PRO
                </span>
                <Flame className="w-5 h-5 text-noctis-cyan animate-bounce" />
              </div>

              <div className="my-auto text-center space-y-3 font-sans">
                <Gamepad2 className="w-24 h-24 text-noctis-cyan mx-auto drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]" />
                <h3 className="font-poppins font-bold text-2xl text-white">DualSense Edge PS5</h3>
                <p className="text-xs text-noctis-muted">Palancas intercambiables y perfiles pro</p>
                <div className="pt-2">
                  <span className="font-sans font-bold text-2xl text-noctis-cyan">$ 1.149.900</span>
                  <span className="text-xs text-white/60 ml-1">COP</span>
                </div>
              </div>

              <Link
                to="/catalogo?categoria=Controles"
                className="w-full py-2.5 rounded-xl bg-noctis-surfaceDark hover:bg-noctis-purple text-xs font-poppins font-medium text-white transition-colors text-center"
              >
                Ver Controles Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-noctis-cyan block mb-1">
              Explora por departamento
            </span>
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-white">
              CATEGORÍAS GAMER
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="text-xs font-medium text-noctis-cyan hover:underline mt-2 sm:mt-0 flex items-center gap-1"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/catalogo?categoria=${encodeURIComponent(cat.name)}`}
                className="group p-5 rounded-2xl bg-noctis-card border border-noctis-surface/60 hover:border-noctis-cyan/60 hover:shadow-glow-cyan/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-base text-white group-hover:text-noctis-cyan transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-noctis-muted mt-1 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-noctis-purpleLight block mb-1">
              Selección de alto impacto
            </span>
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-white">
              PRODUCTOS DESTACADOS
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-noctis-cyan hover:underline"
          >
            <span>Explorar Todos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-noctis-card border border-noctis-surface/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} producto={p} stock={stocks[p.id]} />
            ))}
          </div>
        )}
      </section>

      {/* ASISTENTE GUIADO DE SERVICIO TÉCNICO EN 3 PASOS */}
      <section id="servicio-tecnico" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="rounded-3xl bg-gradient-to-br from-noctis-card via-[#11192b] to-noctis-bg border border-noctis-surface/80 p-6 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-noctis-purple/15 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="max-w-3xl mb-8">
            <span className="px-3 py-1 rounded-full bg-noctis-purple/30 border border-noctis-purple/40 text-xs font-semibold text-noctis-cyan uppercase tracking-wider">
              Taller Técnico Oficial Noctis
            </span>
            <h2 className="font-poppins font-extrabold text-2xl sm:text-4xl text-white mt-3">
              ASISTENTE GUIADO DE SERVICIO TÉCNICO
            </h2>
            <p className="text-xs sm:text-sm text-noctis-muted mt-2 leading-relaxed font-sans">
              Configura tu solicitud técnica en 3 sencillos pasos. Diagnóstico sin costo y repuestos originales con garantía certificada de 6 meses.
            </p>
          </div>

          {/* Step Progress Bar */}
          {!serviceSubmitted && (
            <div className="mb-10 max-w-2xl">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
                {[
                  { num: 1, title: 'Servicio' },
                  { num: 2, title: 'Dispositivo' },
                  { num: 3, title: 'Detalles & Contacto' },
                ].map((s) => (
                  <div
                    key={s.num}
                    className={`flex items-center gap-2.5 p-2 sm:p-3 rounded-xl border transition-all ${
                      step === s.num
                        ? 'bg-noctis-purple/20 border-noctis-cyan text-white shadow-glow-cyan'
                        : step > s.num
                        ? 'bg-noctis-surface/40 border-noctis-purple/40 text-noctis-cyan'
                        : 'bg-noctis-card/50 border-noctis-surface/40 text-noctis-muted opacity-60'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        step > s.num
                          ? 'bg-noctis-cyan text-noctis-bg'
                          : step === s.num
                          ? 'bg-noctis-purple text-white ring-2 ring-noctis-cyan/40'
                          : 'bg-noctis-surface text-noctis-muted'
                      }`}
                    >
                      {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                    </div>
                    <span className="text-xs font-medium font-poppins truncate">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Contents */}
          {serviceSubmitted ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-noctis-card/90 border border-noctis-cyan/40 text-center max-w-xl mx-auto space-y-5 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-noctis-cyan/20 border border-noctis-cyan/40 text-noctis-cyan mx-auto flex items-center justify-center shadow-glow-cyan">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-poppins font-bold text-2xl text-white">¡Solicitud Radicada en el Sistema!</h3>
              <p className="text-xs sm:text-sm text-noctis-muted leading-relaxed font-inter">
                Tu solicitud técnica ha sido registrada oficialmente en la base de datos de soporte. Nuestro equipo de ingenieros la revisará y podrás hacerle seguimiento continuo.
              </p>
              <div className="p-4 rounded-xl bg-noctis-bg border border-noctis-surface/60 inline-block font-inter w-full max-w-md">
                <p className="text-[11px] text-noctis-muted uppercase tracking-wider">Número Oficial de Radicado</p>
                <p className="text-2xl font-bold text-noctis-cyan tracking-wider font-poppins mt-0.5">{ticketNumber}</p>
                <p className="text-[11px] text-noctis-text/80 mt-1">Contacto: {contactName} ({contactPhone})</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {solicitudCreada && (
                  <button
                    type="button"
                    onClick={() => setChatAbierto(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-noctis-purple to-noctis-purpleDark hover:from-noctis-purpleLight transition-all flex items-center justify-center gap-2 shadow-glow-purple"
                  >
                    <MessageSquare className="w-4 h-4 text-noctis-cyan" />
                    <span>Abrir Chat con Soporte</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetService}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-noctis-surface hover:bg-noctis-surface/80 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Crear otra solicitud</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl bg-noctis-card/60 p-6 sm:p-8 rounded-2xl border border-noctis-surface/60">
              {/* PASO 1 */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold font-poppins text-white flex items-center gap-2">
                      <span className="text-noctis-cyan">Paso 1:</span> Selecciona el tipo de servicio técnico
                    </h3>
                    <p className="text-xs text-noctis-muted mt-1 font-inter">
                      Elige el procedimiento que mejor describa la necesidad de tu equipo gamer.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-noctis-text mb-2 font-inter">
                      Servicio Solicitado
                    </label>
                    <CustomSelect
                      options={serviceOptions}
                      value={selectedService}
                      onChange={setSelectedService}
                      placeholder="Selecciona el servicio técnico..."
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-noctis-bg/60 border border-noctis-surface/40 text-xs text-noctis-muted space-y-1 font-inter">
                    <p className="font-semibold text-noctis-cyan flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Garantía Oficial Noctis
                    </p>
                    <p>
                      Todo mantenimiento incluye diagnóstico de temperaturas inicial y final, informe fotográfico y 6 meses de respaldo.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-poppins font-semibold text-xs text-white bg-gradient-to-r from-noctis-purple to-noctis-purpleLight hover:opacity-90 shadow-glow-purple transition-all"
                    >
                      <span>Siguiente: Dispositivo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2 */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold font-poppins text-white flex items-center gap-2">
                      <span className="text-noctis-cyan">Paso 2:</span> Selecciona el tipo de dispositivo
                    </h3>
                    <p className="text-xs text-noctis-muted mt-1 font-inter">
                      Indica la plataforma o periférico sobre el cual realizaremos la intervención técnica.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {deviceTypes.map((dev) => {
                      const Icon = dev.icon;
                      const isSelected = selectedDeviceType === dev.id;
                      return (
                        <div
                          key={dev.id}
                          onClick={() => setSelectedDeviceType(dev.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-noctis-purple/20 border-noctis-cyan shadow-glow-cyan text-white'
                              : 'bg-noctis-bg/70 border-noctis-surface/60 text-noctis-muted hover:border-noctis-surface/90 hover:text-noctis-text'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2.5 rounded-lg ${
                                isSelected ? 'bg-noctis-cyan/20 text-noctis-cyan' : 'bg-noctis-surface/50 text-noctis-muted'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white font-poppins">{dev.label}</p>
                              <p className="text-[11px] text-noctis-muted mt-0.5 leading-snug">{dev.desc}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-noctis-text hover:bg-noctis-surface/40 transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-poppins font-semibold text-xs text-white bg-gradient-to-r from-noctis-purple to-noctis-purpleLight hover:opacity-90 shadow-glow-purple transition-all"
                    >
                      <span>Siguiente: Datos & Envío</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3 */}
              {step === 3 && (
                <form onSubmit={handleServiceSubmit} className="space-y-4 animate-in fade-in duration-200 font-inter">
                  <div>
                    <h3 className="text-lg font-bold font-poppins text-white flex items-center gap-2">
                      <span className="text-noctis-cyan">Paso 3:</span> Especificación técnica y contacto
                    </h3>
                    <p className="text-xs text-noctis-muted mt-1">
                      Completa los detalles de tu equipo y los datos donde te notificaremos el avance.
                    </p>
                  </div>

                  {!isLoggedIn && (
                    <div className="p-3.5 rounded-xl bg-noctis-bg border border-noctis-purple/50 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <AlertCircle className="w-4 h-4 text-noctis-cyan shrink-0" />
                        <span>Se requiere una cuenta de usuario para radicar y hacer seguimiento a tu solicitud.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsLoginModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-noctis-purple hover:bg-noctis-purpleLight text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Iniciar Sesión
                      </button>
                    </div>
                  )}

                  {errorSolicitud && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorSolicitud}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Marca y Modelo Exacto" required>
                      <CustomInput
                        type="text"
                        required
                        value={brandModel}
                        onChange={(e) => setBrandModel(e.target.value)}
                        placeholder="Ej: PlayStation 5 Slim o ROG Ally"
                      />
                    </FormField>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5 font-inter">
                        Ciudad de Atención <span className="text-[#22D3EE]">*</span>
                      </label>
                      <CustomSelect
                        options={cityOptions}
                        value={contactCity}
                        onChange={setContactCity}
                        placeholder="Selecciona tu ciudad..."
                      />
                    </div>
                  </div>

                  <FormField label="Descripción del Síntoma o Falla" required>
                    <CustomTextarea
                      required
                      rows={3}
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Describe la falla observada (sobrecalentamiento, apagado repentino, drift en joysticks, etc.)..."
                    />
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <FormField label="Tu Nombre Completo" required>
                      <CustomInput
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ej: Camilo Torres"
                      />
                    </FormField>

                    <FormField label="Número de Teléfono / WhatsApp" required>
                      <CustomInput
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="3101234567"
                      />
                    </FormField>
                  </div>

                  <div className="flex justify-between items-center pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-noctis-text hover:bg-noctis-surface/40 transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={enviandoSolicitud}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-poppins font-semibold text-xs text-white bg-gradient-to-r from-noctis-purple to-noctis-purpleLight hover:opacity-90 shadow-glow-purple transition-all disabled:opacity-50"
                    >
                      {enviandoSolicitud ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Radicando solicitud...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Confirmar y Enviar Solicitud</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN BENEFICIOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-noctis-cyan block mb-1">
            ¿Por qué comprar en Noctis?
          </span>
          <h2 className="font-poppins font-bold text-3xl text-white">
            EXPERIENCIA DE COMPRA DE ÉLITE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-noctis-card border border-noctis-surface/50 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-noctis-purple to-noctis-cyan mx-auto flex items-center justify-center text-white shadow-glow-cyan/50">
              <Truck className="w-7 h-7" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-white">Logística Rápida y Segura</h3>
            <p className="text-xs text-noctis-muted leading-relaxed font-sans">
              Envíos nacionales asegurados con tracking en tiempo real a las principales ciudades de Colombia: Bogotá, Medellín, Cali, Barranquilla y más.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-noctis-card border border-noctis-surface/50 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-noctis-cyan to-blue-600 mx-auto flex items-center justify-center text-white shadow-glow-cyan/50">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-white">Facturación Oficial Inmediata</h3>
            <p className="text-xs text-noctis-muted leading-relaxed font-sans">
              Cada venta genera de forma automatizada su factura digital certificada con IVA discriminado y entrega inmediata a tu correo electrónico.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-noctis-card border border-noctis-surface/50 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-noctis-purple mx-auto flex items-center justify-center text-white shadow-glow-purple/50">
              <Headphones className="w-7 h-7" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-white">Asesoría de Gamers a Gamers</h3>
            <p className="text-xs text-noctis-muted leading-relaxed font-sans">
              Nuestro equipo te ayuda a seleccionar el hardware ideal según tus juegos favoritos, resolución deseada y presupuesto disponible.
            </p>
          </div>
        </div>
      </section>

      {/* Modal de chat contextual para la solicitud técnica recién creada */}
      {solicitudCreada && (
        <ChatModal
          isOpen={chatAbierto}
          onClose={() => setChatAbierto(false)}
          tipoOrigen="SOLICITUD_TECNICA"
          entidadId={solicitudCreada.id}
          isAdmin={false}
        />
      )}
    </div>
  );
};
