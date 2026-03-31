"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { CartItem } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function CustomerFacingDisplay() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const channel = supabase.channel("pos-sync");

    channel
      .on("broadcast", { event: "cart-update" }, (payload) => {
        setCartItems(payload.payload.cartItems || []);
        setTotal(payload.payload.total || 0);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="h-screen w-full flex bg-background overflow-hidden p-8 gap-8">
      {/* Left Column: Live Order Summary (40%) */}
      <section className="w-[40%] flex flex-col bg-white rounded-[3rem] shadow-2xl p-10 ring-1 ring-black/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="size-14 bg-primary rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-primary/20">
            🛒
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">Current Order</h1>
        </div>

        <ScrollArea className="flex-1 pr-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center mt-20 space-y-6 animate-in fade-in zoom-in duration-1000">
              <div className="size-48 bg-primary/5 rounded-[3rem] flex items-center justify-center text-9xl shadow-inner rotate-3">🍔</div>
              <div className="space-y-4">
                <p className="text-4xl font-black text-foreground tracking-tighter">Welcome to JuRasa!</p>
                <p className="text-xl text-muted-foreground font-medium uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                  Experience fast food at its finest.<br/>Please start your order at the counter.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-6 animate-in slide-in-from-right duration-300">
                  <div className="size-20 bg-muted rounded-3xl flex items-center justify-center text-4xl shrink-0">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-2xl text-foreground truncate">{item.name}</h4>
                    <p className="text-lg text-muted-foreground font-medium">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-2xl font-black text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="mt-10 pt-10 border-t-4 border-dashed border-muted">
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold text-muted-foreground uppercase tracking-widest">Total to Pay</span>
            <span className="text-6xl font-black text-primary tabular-nums tracking-tighter">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* Right Column: Promo Banner (60%) */}
      <section className="flex-1 flex flex-col relative group">
        <div className="absolute inset-0 bg-primary/5 rounded-[4rem] border-8 border-white shadow-inner flex flex-col items-center justify-center text-center p-20 overflow-hidden">
          {/* Animated background blobs */}
          <div className="absolute -top-20 -right-20 size-[400px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 size-[300px] bg-destructive/5 rounded-full blur-3xl animate-pulse delay-700" />
          
          <div className="relative z-10">
            <div className="text-[12rem] animate-bounce duration-1000">🍟</div>
            <h2 className="text-7xl font-black text-foreground mt-8 leading-[0.9] tracking-tight">
              NEW PROMO:<br/>
              <span className="text-primary">COMBO MEAL!</span>
            </h2>
            <p className="text-2xl text-muted-foreground mt-8 font-bold uppercase tracking-[0.2em]">
              Only available this week
            </p>
            <div className="mt-12 bg-white px-10 py-5 rounded-full shadow-xl border-4 border-primary inline-block rotate-[-2deg] group-hover:rotate-0 transition-transform">
              <span className="text-4xl font-black text-primary italic">Save 20% on all Combos!</span>
            </div>
          </div>
        </div>

        {/* Brand Watermark */}
        <div className="absolute bottom-10 right-10 opacity-30 flex items-center gap-3 grayscale">
          <div className="size-8 bg-foreground rounded-lg flex items-center justify-center text-lg">🍔</div>
          <span className="font-black text-xl tracking-tighter uppercase">JuRasa Terminal</span>
        </div>
      </section>
    </main>
  );
}
