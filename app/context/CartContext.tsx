// app/context/CartContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Buku {
  id: number;
  kodeBuku: string;
  judul: string;
  penulis: string;
  kategori: string | null;
  deskripsi: string | null;
  stok: number;
  lokasiRak: string | null;
  imageUrl: string | null;
}

interface CartContextType {
  cart: Buku[];
  addToCart: (buku: Buku) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalItems: number;
  isInCart: (id: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Buku[]>([]);

  // Load cart dari localStorage saat pertama kali
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Gagal load cart:", e);
      }
    }
  }, []);

  // Simpan ke localStorage setiap kali cart berubah
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (buku: Buku) => {
    setCart((prev) => {
      // Cek apakah buku sudah ada di keranjang
      if (prev.some((item) => item.id === buku.id)) {
        return prev; // Sudah ada, tidak tambah lagi
      }
      return [...prev, buku];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.length;

  const isInCart = (id: number) => {
    return cart.some((item) => item.id === id);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
