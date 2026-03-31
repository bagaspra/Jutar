"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function CustomerFacingDisplay() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [orderType, setOrderType] = useState<"dine_in" | "take_away">("dine_in");

  useEffect(() => {
    const channel = supabase.channel("pos-sync");

    channel
      .on("broadcast", { event: "cart-update" }, (payload) => {
        const data = payload.payload;
        setCartItems(data.cartItems || []);
        setTotal(data.total || 0);
        setSubtotal(data.subtotal || 0);
        setTax(data.tax || 0);
        setOrderType(data.orderType || "dine_in");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-surface text-on-surface h-screen overflow-hidden flex flex-col font-body">
      {/* Top Navigation */}
      <header className="bg-white border-b border-outline flex justify-between items-center w-full px-12 py-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl material-symbols-fill">
              restaurant
            </span>
          </div>
          <div className="text-2xl font-extrabold tracking-tighter text-on-surface font-headline uppercase italic">
            JuRasa POS
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-green-50 text-green-700 px-6 py-2 rounded-full text-xs font-black flex items-center gap-2 border border-green-100 italic tracking-widest">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LIVE SYNC
          </div>
          <div className="bg-primary/5 text-primary px-6 py-2 rounded-full text-xs font-black flex items-center gap-2 border border-primary/10 uppercase tracking-[0.2em]">
            <span className="material-symbols-outlined text-sm">
               {orderType === "dine_in" ? "restaurant" : "shopping_bag"}
            </span>
            {orderType === "dine_in" ? "Dine In" : "Take Away"}
          </div>
        </div>
      </header>

      {/* Main Content: Centered Layout */}
      <main className="flex-1 flex justify-center items-center p-8 bg-surface overflow-hidden">
        <div className="w-full max-w-5xl h-full flex gap-8">
          {/* Left: Order Summary */}
          <section className="flex-1 bg-white rounded-card shadow-sm border border-outline flex flex-col overflow-hidden editorial-shadow">
            <div className="p-10 border-b border-outline flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black tracking-tight font-headline text-on-surface uppercase italic">Your Order</h2>
                <p className="text-on-surface-variant font-bold text-xs mt-2 uppercase tracking-widest leading-loose opacity-60">
                  Mirroring Cashier Terminal
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">Terminal Status</p>
                <p className="text-sm font-black text-on-surface">ONLINE • ST-001</p>
              </div>
            </div>

            {/* Scrollable Order Items */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-10 py-10 space-y-10">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-8 animate-in slide-in-from-bottom duration-500">
                    <div className="relative w-28 h-24 rounded-2xl overflow-hidden bg-surface-variant shrink-0 border border-outline/20">
                      <img 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                      />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-headline font-black text-xl text-on-surface leading-tight uppercase tracking-tighter">
                            {item.name}
                          </h3>
                          <div className="mt-3">
                            <p className="text-sm text-on-surface-variant flex items-center gap-2">
                              <span className="font-black text-primary px-2 py-0.5 bg-primary/5 rounded-md">{item.quantity}x</span> 
                              Serving per Order
                            </p>
                          </div>
                        </div>
                        <span className="font-headline font-black text-2xl text-primary whitespace-nowrap tabular-nums tracking-tighter">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-1000 opacity-20 grayscale">
                  <div className="size-48 bg-primary/5 rounded-[3rem] flex items-center justify-center text-9xl font-black text-primary/40 italic">JU</div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black text-on-surface tracking-tighter font-headline italic">WELCOME TO JURASA</h2>
                    <p className="text-xl text-on-surface-variant font-bold uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                      Experience Fast-Food Gastronomy at its finest.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Branding Message */}
            <div className="px-10 py-8 bg-surface-variant/30 text-center border-t border-outline">
              <p className="text-on-surface-variant font-black text-sm uppercase tracking-widest leading-loose italic">
                Thank you for choosing JuRasa Gastronomy Experience
              </p>
            </div>
          </section>

          {/* Right: Payment Breakdown */}
          <section className="w-[380px] flex flex-col gap-6">
            <div className="bg-white rounded-card shadow-sm border border-outline p-10 flex flex-col h-full editorial-shadow">
              <h3 className="text-xl font-black mb-10 font-headline uppercase tracking-tight italic border-b border-outline pb-6">Payment Summary</h3>
              <div className="space-y-5 flex-1">
                <div className="flex justify-between text-base font-black text-on-surface-variant/70 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-on-surface tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-on-surface-variant/70 uppercase tracking-widest">
                   <span>Tax {orderType === "dine_in" ? "(10%)" : "(0%)"}</span>
                  <span className="text-on-surface tabular-nums">{formatCurrency(tax)}</span>
                </div>
                
                <div className="pt-10 mt-10 border-t border-outline/50">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant/50 mb-3">
                    Total Amount Due
                  </p>
                  <h1 className="text-6xl font-black font-headline tracking-tighter text-primary tabular-nums animate-pulse">
                    {formatCurrency(total)}
                  </h1>
                </div>
              </div>
              <div className="mt-auto space-y-8">
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary text-3xl material-symbols-fill">
                    contactless
                  </span>
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-2 italic">
                       Terminal Ready
                    </p>
                    <p className="text-xs font-black text-on-surface uppercase tracking-tighter">Please Pay At Cashier</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-outline flex justify-between items-center px-12 py-6 w-full z-50">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/50">
          © 2026 JURASA GASTRONOMY SYSTEM • PREMIUM POS EXPERIENCE
        </div>
        <div className="flex gap-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/30">
            Terms of Service
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/30">
            Privacy Policy
          </span>
        </div>
      </footer>
    </div>
  );
}
