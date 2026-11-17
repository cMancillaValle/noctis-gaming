import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck, AlertCircle, ShoppingBag, Loader2, LogIn, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ventasApi } from '../services/api';
import { FormField, CustomInput } from '../components/form';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, impuestos, total } = useCart();
  const { currentCliente, isLoggedIn, setIsLoginModalOpen } = useAuth();
  const navigate = useNavigate();

  const [direccion, setDireccion] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentCliente?.direccion) {
      setDireccion(currentCliente.direccion);
    }
  }, [currentCliente]);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !currentCliente) {
      setIsLoginModalOpen(true);
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('El carrito está vacío.');
      return;
    }

    if (!direccion.trim()) {
      setErrorMessage('Por favor ingresa la dirección de entrega para el envío.');
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const itemsPayload = cart.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
      }));

      const ventaResponse = await ventasApi.crearVenta({
        clienteId: currentCliente.id,
        direccionEntrega: direccion.trim(),
        items: itemsPayload,
      });

      clearCart();
      navigate(`/confirmacion/${ventaResponse.id}`);
    } catch (err: any) {
      console.error('Error al procesar compra:', err);
      setErrorMessage(err.message || 'Ocurrió un error al procesar la compra. Verifica existencias.');
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 font-sans">
        <div className="w-20 h-20 rounded-3xl bg-noctis-card border border-noctis-surface flex items-center justify-center mx-auto text-noctis-cyan shadow-glow-cyan/30">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-poppins font-bold text-3xl text-white">Tu carrito está vacío</h1>
        <p className="text-sm text-noctis-muted max-w-md mx-auto leading-relaxed">
          Aún no has agregado periféricos, consolas o títulos gamer a tu orden. Explora nuestro catálogo y equipa tu setup.
        </p>
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-poppins font-semibold text-xs bg-gradient-to-r from-noctis-purple to-noctis-purpleDark text-white shadow-glow-purple hover:from-noctis-purpleLight transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      <div>
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-xs font-semibold text-noctis-cyan hover:underline mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continuar comprando</span>
        </Link>
        <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-white">
          CARRITO DE COMPRAS
        </h1>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Notificación de compra:</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Tabla de items */}
        <div className="lg:col-span-8 rounded-2xl bg-noctis-card border border-noctis-surface/60 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-noctis-surface/60 flex items-center justify-between">
            <h2 className="font-poppins font-bold text-base text-white">
              Productos en tu orden ({cart.length})
            </h2>
            <button
              onClick={clearCart}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
            >
              Vaciar carrito
            </button>
          </div>

          <div className="divide-y divide-noctis-surface/40">
            {cart.map((item) => (
              <div key={item.producto.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 rounded-xl bg-noctis-surfaceDark/60 border border-noctis-surface/40 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-noctis-cyan font-bold uppercase">Noctis</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-noctis-muted uppercase tracking-wider block">
                      {item.producto.categoria}
                    </span>
                    <h3 className="font-poppins font-semibold text-white text-sm">
                      {item.producto.nombre}
                    </h3>
                    <span className="text-xs text-noctis-cyan font-bold block sm:hidden mt-1 font-sans">
                      {formatCOP(item.producto.precio)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-noctis-surface/30">
                  {/* Modificador de cantidades */}
                  <div className="flex items-center gap-2 bg-noctis-surfaceDark rounded-xl border border-noctis-surface/60 px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                      className="p-1 rounded-lg text-noctis-muted hover:text-white hover:bg-noctis-surface/50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-sans font-bold text-xs text-white">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                      className="p-1 rounded-lg text-noctis-muted hover:text-white hover:bg-noctis-surface/50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal del item */}
                  <div className="text-right min-w-[120px]">
                    <span className="font-sans font-bold text-sm text-white block">
                      {formatCOP(item.producto.precio * item.cantidad)}
                    </span>
                    <span className="text-[10px] text-noctis-muted font-sans">
                      {formatCOP(item.producto.precio)} c/u
                    </span>
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={() => removeFromCart(item.producto.id)}
                    className="p-2 rounded-lg text-noctis-muted hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de orden y Checkout */}
        <div className="lg:col-span-4 rounded-2xl bg-noctis-card border border-noctis-surface/60 p-6 space-y-6 shadow-xl">
          <h2 className="font-poppins font-bold text-base text-white border-b border-noctis-surface/60 pb-4">
            Resumen de Compra
          </h2>

          {/* Información de Usuario / Checkout */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-noctis-cyan uppercase tracking-wider block">
              Comprador
            </span>
            {isLoggedIn && currentCliente ? (
              <div className="p-3.5 rounded-xl bg-noctis-bg/70 border border-noctis-surface/60">
                <p className="text-xs font-semibold text-white">{currentCliente.nombre}</p>
                <p className="text-[11px] text-noctis-muted truncate">{currentCliente.email}</p>
                <p className="text-[11px] text-noctis-muted mt-1">{currentCliente.telefono}</p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-noctis-bg/70 border border-noctis-purple/40 text-center space-y-2">
                <p className="text-xs text-noctis-text">Inicia sesión para vincular la orden a tu cuenta oficial.</p>
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-noctis-purple text-white text-xs font-semibold hover:bg-noctis-purpleLight transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión / Registrarse</span>
                </button>
              </div>
            )}
          </div>

          {/* Dirección de entrega */}
          <div className="pt-2">
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
          </div>

          {/* Desglose financiero */}
          <div className="space-y-3 pt-3 border-t border-noctis-surface/40 text-xs">
            <div className="flex justify-between text-noctis-muted">
              <span>Subtotal base</span>
              <span className="font-sans font-medium text-white">{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between text-noctis-muted">
              <span>IVA (19% discriminado)</span>
              <span className="font-sans font-medium text-white">{formatCOP(impuestos)}</span>
            </div>
            <div className="flex justify-between text-noctis-muted">
              <span>Costo de Envío Nacional</span>
              <span className="text-emerald-400 font-semibold font-sans">GRATIS</span>
            </div>
            <div className="pt-3 border-t border-noctis-surface/60 flex justify-between items-baseline">
              <span className="font-poppins font-bold text-sm text-white">Total a Pagar</span>
              <div className="text-right">
                <span className="font-sans font-extrabold text-2xl text-noctis-cyan block">
                  {formatCOP(total)}
                </span>
                <span className="text-[10px] text-noctis-muted font-sans">Pesos Colombianos (COP)</span>
              </div>
            </div>
          </div>

          {/* Botón de confirmación de compra */}
          <button
            onClick={handleCheckout}
            disabled={processing}
            className="w-full py-4 rounded-xl font-poppins font-semibold text-xs bg-gradient-to-r from-noctis-purple to-noctis-purpleDark hover:from-noctis-purpleLight hover:to-noctis-purple text-white shadow-glow-purple flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando compra segura...</span>
              </>
            ) : !isLoggedIn ? (
              <>
                <LogIn className="w-4 h-4 text-noctis-cyan" />
                <span>Iniciar Sesión para Comprar</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-noctis-cyan" />
                <span>Confirmar y Finalizar Compra</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-noctis-muted leading-relaxed font-sans">
            🔒 Transacción protegida con cifrado de extremo a extremo y garantía oficial Noctis.
          </p>
        </div>
      </div>
    </div>
  );
};
