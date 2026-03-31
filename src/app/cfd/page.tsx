"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { CartItem } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";

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
          <h1 className="text-4xl font-black text-foreground tracking-tighter font-heading">Pesanan Anda</h1>
        </div>

        <ScrollArea className="flex-1 pr-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center mt-20 space-y-6 animate-in fade-in zoom-in duration-1000">
              <div className="size-48 bg-primary/5 rounded-[3rem] flex items-center justify-center text-9xl shadow-inner font-black text-primary/40 italic">JU</div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-foreground tracking-tighter font-heading">Selamat Datang!</h2>
                <p className="text-xl text-muted-foreground font-medium uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                  Rasakan Sajian Cepat Saji Terbaik.<br/>Silakan Pesan di Kasir.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-6 animate-in slide-in-from-right duration-300">
                  <div className="size-20 bg-muted rounded-3xl flex items-center justify-center text-2xl font-black text-muted-foreground/30 shrink-0">
                    {item.name.substring(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-2xl text-foreground truncate pr-4">{item.name}</h4>
                    <p className="text-lg text-muted-foreground font-medium">Jumlah: {item.quantity}</p>
                  </div>
                  <p className="text-2xl font-black text-primary tabular-nums">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="mt-10 pt-10 border-t-4 border-dashed border-muted">
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold text-muted-foreground uppercase tracking-widest">Total Bayar</span>
            <span className="text-5xl font-black text-primary tabular-nums tracking-tighter">
              {formatCurrency(total)}
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
            <div className="size-48 bg-white rounded-full flex items-center justify-center text-8xl shadow-2xl mx-auto animate-bounce duration-1000 border-8 border-primary/20">🍔</div>
            <h2 className="text-7xl font-black text-foreground mt-8 leading-[0.9] tracking-tight font-heading">
              PROMO BARU:<br/>
              <span className="text-primary uppercase">PAKET HEMAT!</span>
            </h2>
            <p className="text-2xl text-muted-foreground mt-8 font-bold uppercase tracking-[0.2em]">
              Hanya tersedia minggu ini
            </p>
            <div className="mt-12 bg-white px-10 py-5 rounded-full shadow-xl border-4 border-primary inline-block rotate-[-2deg] group-hover:rotate-0 transition-transform">
              <span className="text-4xl font-black text-primary italic font-heading">Diskon 20% untuk semua Menu!</span>
            </div>
          </div>
        </div>

        {/* Brand Watermark */}
        <div className="absolute bottom-10 right-10 opacity-30 flex items-center gap-3 grayscale">
          <span className="font-black text-xl tracking-tighter uppercase">JuRasa POS System</span>
        </div>
      </section>
    </main>
  );
}
