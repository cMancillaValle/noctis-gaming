import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Producto } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (producto: Producto, cantidad?: number) => void;
  updateQuantity: (productoId: number, cantidad: number) => void;
  removeFromCart: (productoId: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  impuestos: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('noctis_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('noctis_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const addToCart = (producto: Producto, cantidad = 1) => {
    setCart((prev) => {
      const index = prev.findIndex((item) => item.producto.id === producto.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = {
          ...next[index],
          cantidad: next[index].cantidad + cantidad,
        };
        return next;
      }
      return [...prev, { producto, cantidad }];
    });
  };

  const updateQuantity = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productoId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.producto.id === productoId ? { ...item, cantidad } : item
      )
    );
  };

  const removeFromCart = (productoId: number) => {
    setCart((prev) => prev.filter((item) => item.producto.id !== productoId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const total = cart.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  // Base gravable IVA 19%
  const subtotal = Math.round((total / 1.19) * 100) / 100;
  const impuestos = Math.round((total - subtotal) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        impuestos,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
};
