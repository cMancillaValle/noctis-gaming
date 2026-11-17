import React from 'react';
import { ShoppingCart, Check, Gamepad2, Tv, Sparkles, Layers } from 'lucide-react';
import { Producto } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  producto: Producto;
  stock?: number;
  onOpenDetails?: (producto: Producto) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ producto, stock, onOpenDetails }) => {
  const { addToCart, cart } = useCart();

  const cartItem = cart.find((i) => i.producto.id === producto.id);
  const inCart = !!cartItem;
  const isAvailable = stock === undefined ? true : stock > 0;

  // Format COP Currency
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Visual Category Icon fallback
  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'consolas':
        return <Tv className="w-12 h-12 text-noctis-cyan/40" />;
      case 'controles':
        return <Gamepad2 className="w-12 h-12 text-noctis-purpleLight/40" />;
      case 'videojuegos':
        return <Sparkles className="w-12 h-12 text-emerald-400/40" />;
      default:
        return <Layers className="w-12 h-12 text-noctis-muted/40" />;
    }
  };

  return (
    <div className="group relative rounded-2xl bg-noctis-card border border-noctis-surface/60 hover:border-noctis-cyan/60 hover:shadow-glow-cyan/50 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <span className="px-2.5 py-1 rounded-md bg-noctis-surfaceDark/80 backdrop-blur-md text-[11px] font-semibold tracking-wide text-noctis-cyan border border-noctis-surface/50 uppercase">
          {producto.categoria}
        </span>
        {stock !== undefined && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
              isAvailable
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-950/70 text-rose-300 border-rose-500/30'
            }`}
          >
            {isAvailable ? `${stock} disp.` : 'Agotado'}
          </span>
        )}
      </div>

      {/* Image container / Visual placeholder */}
      <div
        onClick={() => onOpenDetails && onOpenDetails(producto)}
        className="relative w-full h-48 sm:h-52 bg-gradient-to-b from-noctis-surfaceDark/40 to-noctis-card flex items-center justify-center p-6 cursor-pointer overflow-hidden"
      >
        <div className="transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
          {producto.imagenUrl && producto.imagenUrl.startsWith('http') ? (
            <img
              src={producto.imagenUrl}
              alt={producto.nombre}
              className="max-h-36 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
              onError={(e) => {
                // fallback to category icon
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-noctis-surfaceDark/50 border border-noctis-surface/30">
              {getCategoryIcon(producto.categoria)}
              <span className="text-[10px] text-noctis-muted mt-2 font-mono uppercase tracking-widest">
                Noctis Pro Hardware
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onOpenDetails && onOpenDetails(producto)}
            className="font-poppins font-semibold text-white text-base group-hover:text-noctis-cyan transition-colors line-clamp-2 cursor-pointer mb-2"
          >
            {producto.nombre}
          </h3>
          <p className="text-xs text-noctis-muted line-clamp-2 leading-relaxed mb-4">
            {producto.descripcion}
          </p>
        </div>

        <div>
          {/* Price */}
          <div className="mb-4">
            <span className="text-[10px] uppercase tracking-wider text-noctis-muted block">Precio oficial COP</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-poppins font-bold text-xl sm:text-2xl text-white">
                {formatCOP(producto.precio)}
              </span>
              <span className="text-xs font-semibold text-noctis-cyan">COP</span>
            </div>
          </div>

          {/* Add to cart button */}
          <button
            onClick={() => addToCart(producto, 1)}
            disabled={!isAvailable}
            className={`w-full py-2.5 px-4 rounded-xl font-poppins text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
              !isAvailable
                ? 'bg-noctis-surface text-noctis-muted cursor-not-allowed opacity-60'
                : inCart
                ? 'bg-noctis-purple text-white hover:bg-noctis-purpleDark shadow-glow-purple/40'
                : 'bg-gradient-to-r from-noctis-purple to-noctis-purpleDark hover:from-noctis-purpleLight hover:to-noctis-purple text-white hover:shadow-glow-purple/60'
            }`}
          >
            {inCart ? (
              <>
                <Check className="w-4 h-4 text-noctis-cyan" />
                <span>En carrito ({cartItem?.cantidad})</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{isAvailable ? 'Agregar al Carrito' : 'Agotado'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
