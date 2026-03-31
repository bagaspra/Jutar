"use client";

import { create } from "zustand";
import { MenuItem, CartItem } from "@/types";
import { supabase } from "@/lib/supabase/client";

interface CartState {
  cartItems: CartItem[];
  orderType: "dine_in" | "take_away";
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  setOrderType: (type: "dine_in" | "take_away") => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

// Helper to broadcast cart to CFD
const broadcastCart = (cartItems: CartItem[], orderType: "dine_in" | "take_away") => {
  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = orderType === "dine_in" ? subtotal * 0.1 : 0;
  const total = subtotal + tax;

  const channel = supabase.channel("pos-sync");
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.send({
        type: "broadcast",
        event: "cart-update",
        payload: { 
          cartItems, 
          orderType,
          subtotal,
          tax,
          total
        },
      });
    }
  });
};

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  orderType: "dine_in",

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
    broadcastCart(newItems, state.orderType);
    return { cartItems: newItems };
  }),

  removeItem: (id) => set((state) => {
    const newItems = state.cartItems.filter((i) => i.id !== id);
    broadcastCart(newItems, state.orderType);
    return { cartItems: newItems };
  }),

  updateQuantity: (id, qty) => set((state) => {
    const newItems = state.cartItems.map((i) =>
      i.id === id ? { ...i, quantity: Math.max(0, qty) } : i
    ).filter(i => i.quantity > 0);
    broadcastCart(newItems, state.orderType);
    return { cartItems: newItems };
  }),

  setOrderType: (type) => set((state) => {
    broadcastCart(state.cartItems, type);
    return { orderType: type };
  }),

  clearCart: () => {
    broadcastCart([], "dine_in");
    set({ cartItems: [], orderType: "dine_in" });
  },

  getCartTotal: () => {
    const { cartItems, orderType } = get();
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = orderType === "dine_in" ? subtotal * 0.1 : 0;
    return subtotal + tax;
  },
}));
