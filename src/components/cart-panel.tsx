"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, CreditCard, Plus, Minus, Loader2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Receipt } from "@/components/receipt";
import { CartItem } from "@/types";

export function CartPanel() {
  const { cartItems, updateQuantity, clearCart, getCartTotal } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cartItems, total: getCartTotal() }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Pesanan Berhasil!", {
            description: `Pesanan #${result.receiptNumber} telah dibayar.`,
          });
          
          setLastOrder({
            receiptNumber: result.receiptNumber,
            queueNumber: result.queueNumber,
            items: [...cartItems],
            total: getCartTotal(),
            date: new Date().toISOString(),
          });
          
          setShowReceipt(true);
          clearCart();
        } else {
          toast.error("Gagal Checkout", { description: result.error });
        }
      } catch (error) {
        toast.error("Kesalahan Sistem", { description: "Gagal memproses pesanan." });
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-black/5">
      {/* Header */}
      <div className="p-8 bg-primary/5 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="size-6 text-primary" />
          <h2 className="text-2xl font-black tracking-tighter font-heading">Pesanan</h2>
        </div>
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black tabular-nums">
          {cartItems.length} Item
        </span>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 p-6">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4 mt-20">
            <ShoppingCart className="size-16" />
            <p className="font-bold text-lg">Keranjang Kosong</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item: CartItem) => (
              <div key={item.id} className="flex items-center gap-4 group animate-in slide-in-from-right duration-300">
                <div className="size-16 bg-muted rounded-2xl flex items-center justify-center text-2xl shrink-0 font-black text-muted-foreground/50">
                  {item.name.substring(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-foreground truncate pr-2">{item.name}</h4>
                  <p className="text-sm font-black text-primary/60">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center bg-muted/50 rounded-xl p-1 shrink-0">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="size-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-muted-foreground"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-8 text-center font-black tabular-nums text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="size-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-primary"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer / Summary */}
      <div className="p-8 bg-muted/30 border-t space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-muted-foreground font-medium">
            <span className="text-sm">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(getCartTotal())}</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground font-medium">
            <span className="text-sm">Pajak (0%)</span>
            <span className="tabular-nums">Rp 0</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-muted">
            <span className="text-lg font-black tracking-tight uppercase font-heading">Total</span>
            <span className="text-3xl font-black text-primary tracking-tighter tabular-nums">
              {formatCurrency(getCartTotal())}
            </span>
          </div>
        </div>

        <Button 
          className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl shadow-xl shadow-primary/20 transition-all active:scale-95 gap-3 font-heading"
          disabled={cartItems.length === 0 || isPending}
          onClick={handleCheckout}
        >
          {isPending ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <>
              <CreditCard className="size-6" />
              Bayar Sekarang
            </>
          )}
        </Button>
      </div>

      {/* Printer Modal (Hidden or Auto-trigger) */}
      {showReceipt && lastOrder && (
        <div className="hidden">
           <Receipt 
            order={lastOrder} 
            onClose={() => setShowReceipt(false)} 
            autoPrint={true}
          />
        </div>
      )}
    </div>
  );
}
