"use client";

import { create } from "zustand";
import { MenuItem, CartItem } from "@/types";
import { supabase } from "@/lib/supabase/client";

interface CartState {
  cartItems: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

// Helper to broadcast cart to CFD
const broadcastCart = (cartItems: CartItem[]) => {
  const channel = supabase.channel("pos-sync");
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.send({
        type: "broadcast",
        event: "cart-update",
        payload: { cartItems, total: cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0) },
      });
    }
  });
};

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],

  addItem: (item) => set((state) => {
    const existing = state.cartItems.find((i) => i.id === item.id);
    let newItems;
    if (existing) {
      newItems = state.cartItems.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newItems = [...state.cartItems, { ...item, quantity: 1 }];
    }
    broadcastCart(newItems);
    return { cartItems: newItems };
  }),

  removeItem: (id) => set((state) => {
    const newItems = state.cartItems.filter((i) => i.id !== id);
    broadcastCart(newItems);
    return { cartItems: newItems };
  }),

  updateQuantity: (id, qty) => set((state) => {
    const newItems = state.cartItems.map((i) =>
      i.id === id ? { ...i, quantity: Math.max(0, qty) } : i
    ).filter(i => i.quantity > 0);
    broadcastCart(newItems);
    return { cartItems: newItems };
  }),

  clearCart: () => {
    broadcastCart([]);
    set({ cartItems: [] });
  },

  getCartTotal: () => {
    const { cartItems } = get();
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  },
}));
