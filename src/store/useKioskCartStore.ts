"use client";

import { create } from "zustand";
import { MenuItem, CartItem } from "@/types";

interface KioskCartState {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number; // subtotal + 10% tax (kiosk is always dine_in)
  getTotalItems: () => number;
}

export const useKioskCartStore = create<KioskCartState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  updateQuantity: (id, qty) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, qty) } : i))
        .filter((i) => i.quantity > 0),
    })),

  clearCart: () => set({ items: [] }),

  getSubtotal: () =>
    get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),

  getTotal: () => {
    const subtotal = get().getSubtotal();
    return subtotal + subtotal * 0.1;
  },

  getTotalItems: () =>
    get().items.reduce((acc, i) => acc + i.quantity, 0),
}));
