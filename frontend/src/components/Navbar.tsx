import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  ShoppingBag,
  Sliders,
  Wrench,
  MessageSquare,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ClientSupportModal } from './ClientSupportModal';

export const Navbar: React.FC = () => {
  const { totalItems } = useCart();
  const {
    currentCliente,
    isLoggedIn,
    isAdmin,
    logout,
    setIsLoginModalOpen,
    setIsProfileModalOpen,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportInitialTab, setSupportInitialTab] = useState<'solicitudes' | 'mensajes'>('solicitudes');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  // Close user dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [userDropdownOpen]);

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    if (location.pathname === '/admin') {
      navigate('/');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0B0F1A]/95 backdrop-blur-md border-b border-noctis-surface/40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo / Imagotipo Oficial */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/imagotipo-noctis.png"
            alt="Noctis Gaming"
            className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Navigation links - Desktop */}
        <nav className="hidden md:flex items-center gap-8 font-poppins text-sm font-medium">
          <Link
            to="/"
            className={`transition-colors duration-200 hover:text-noctis-cyan ${
              isActive('/') ? 'text-noctis-cyan font-semibold border-b-2 border-noctis-cyan pb-1' : 'text-noctis-text/90'
            }`}
          >
            Inicio
          </Link>
          <Link
            to="/catalogo"
            className={`transition-colors duration-200 hover:text-noctis-cyan ${
              isActive('/catalogo') ? 'text-noctis-cyan font-semibold border-b-2 border-noctis-cyan pb-1' : 'text-noctis-text/90'
            }`}
          >
            Catálogo
          </Link>
          <Link
            to="/clientes"
            className={`transition-colors duration-200 hover:text-noctis-cyan ${
              isActive('/clientes') ? 'text-noctis-cyan font-semibold border-b-2 border-noctis-cyan pb-1' : 'text-noctis-text/90'
            }`}
          >
            Comunidad
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 transition-colors duration-200 hover:text-noctis-purpleLight ${
                isActive('/admin') ? 'text-noctis-purpleLight font-semibold border-b-2 border-noctis-purple pb-1' : 'text-noctis-text/70'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-noctis-purpleLight" />
              <span>Administración</span>
            </Link>
          )}
        </nav>

        {/* Right action controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* User Profile / Login dropdown */}
          <div className="relative" ref={userMenuRef}>
            {isLoggedIn && currentCliente ? (
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-noctis-card border border-noctis-surface hover:border-noctis-cyan/60 text-xs text-noctis-text transition-all focus:outline-none focus:ring-2 focus:ring-noctis-cyan/30"
                aria-expanded={userDropdownOpen}
                aria-label="Menú de usuario"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-noctis-purple to-noctis-cyan flex items-center justify-center text-white">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-semibold text-white leading-tight max-w-[120px] truncate">
                    {currentCliente.nombre.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-noctis-muted leading-tight">
                    {isAdmin ? 'Administrador' : 'Cliente'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-noctis-muted transition-transform duration-200" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-noctis-card border border-noctis-surface hover:border-noctis-cyan/60 hover:text-noctis-cyan text-xs font-medium text-noctis-text transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-noctis-cyan" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#111827] border border-noctis-surface/90 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 font-sans"
                onClick={(e) => e.stopPropagation()}
              >
                {isLoggedIn && currentCliente ? (
                  <>
                    {/* User header */}
                    <div className="px-3 py-2.5 rounded-xl bg-noctis-card/80 border border-noctis-surface/60 mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                          {currentCliente.nombre}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isAdmin
                              ? 'bg-noctis-purple/30 text-noctis-purpleLight border border-noctis-purple/40'
                              : 'bg-noctis-cyan/20 text-noctis-cyan border border-noctis-cyan/30'
                          }`}
                        >
                          {isAdmin ? 'Administrador' : 'Cliente'}
                        </span>
                      </div>
                      <p className="text-[11px] text-noctis-muted truncate">{currentCliente.email}</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-noctis-text hover:bg-noctis-surface/50 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4 text-noctis-cyan" />
                        <span>Mi Perfil y Contraseña</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setSupportInitialTab('solicitudes');
                          setSupportModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-noctis-text hover:bg-noctis-surface/50 hover:text-white transition-colors"
                      >
                        <Wrench className="w-4 h-4 text-noctis-cyan" />
                        <span>Mis Solicitudes Técnicas</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setSupportInitialTab('mensajes');
                          setSupportModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-noctis-text hover:bg-noctis-surface/50 hover:text-white transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-noctis-cyan" />
                        <span>Mis Mensajes & Soporte</span>
                      </button>

                      <Link
                        to="/carrito"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-noctis-text hover:bg-noctis-surface/50 hover:text-white transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-noctis-cyan" />
                        <span>Mis Compras / Carrito</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-noctis-purpleLight hover:bg-noctis-purple/20 transition-colors font-medium"
                        >
                          <Sliders className="w-4 h-4 text-noctis-purpleLight" />
                          <span>Panel Administrativo</span>
                        </Link>
                      )}

                      <div className="my-1 border-t border-noctis-surface/60"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 p-1">
                    <p className="text-xs text-noctis-muted text-center mb-2">
                      Inicia sesión para realizar pedidos y gestionar tu cuenta
                    </p>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-noctis-purple to-noctis-purpleLight text-xs font-semibold text-white shadow-glow-purple"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Iniciar Sesión</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-noctis-card border border-noctis-surface text-xs font-medium text-noctis-text hover:text-white hover:border-noctis-cyan/60"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-noctis-cyan" />
                      <span>Registrarse</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Carrito de compras */}
          <Link
            to="/carrito"
            className="relative p-2.5 rounded-xl bg-noctis-card border border-noctis-surface hover:border-noctis-cyan/60 hover:shadow-glow-cyan transition-all text-noctis-text"
            title="Ver carrito de compras"
          >
            <ShoppingCart className="w-5 h-5 text-noctis-cyan" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-noctis-purple text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-noctis-bg animate-pulse">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Botón hamburguesa móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-noctis-text hover:bg-noctis-surface/50 border border-noctis-surface"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-noctis-bg/95 backdrop-blur-md border-b border-noctis-surface px-4 py-4 space-y-3 font-poppins text-sm">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-noctis-text hover:bg-noctis-surface/40"
          >
            Inicio
          </Link>
          <Link
            to="/catalogo"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-noctis-text hover:bg-noctis-surface/40"
          >
            Catálogo de Productos
          </Link>
          <Link
            to="/clientes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-noctis-text hover:bg-noctis-surface/40"
          >
            Comunidad y Clientes
          </Link>
          <Link
            to="/carrito"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-noctis-cyan hover:bg-noctis-surface/40 font-semibold"
          >
            Carrito ({totalItems} productos)
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-noctis-purpleLight hover:bg-noctis-surface/40 font-semibold"
            >
              Panel Administrativo
            </Link>
          )}

          {!isLoggedIn && (
            <div className="pt-2 border-t border-noctis-surface">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-noctis-purple text-white text-xs font-semibold text-center"
              >
                Iniciar Sesión / Registro
              </button>
            </div>
          )}
        </div>
      )}
      </header>

      {/* Modal de Soporte y Mensajería para Clientes */}
      {currentCliente && (
        <ClientSupportModal
          isOpen={supportModalOpen}
          onClose={() => setSupportModalOpen(false)}
          clienteId={currentCliente.id}
          initialTab={supportInitialTab}
        />
      )}
    </>
  );
};
