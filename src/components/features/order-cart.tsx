"use client";

import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/utils";
import { processCheckout } from "@/actions/order-actions";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PrintableInvoice } from "./printable-invoice";
import { CartItem } from "@/types";

interface OrderItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}

function OrderItem({ name, price, quantity, image, onRemove, onUpdateQty }: OrderItemProps) {
  return (
    <div className="space-y-2 animate-in slide-in-from-right duration-500">
      <div className="flex gap-4">
        <img alt={name} className="w-20 h-16 rounded-xl object-cover shadow-sm" src={image} />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-xs font-black text-on-surface leading-tight uppercase tracking-tighter">
              {name}
            </h4>
            <button 
              onClick={onRemove}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-3 bg-surface-variant/50 px-2 py-1 rounded-lg border border-outline/20">
              <button 
                onClick={() => onUpdateQty(quantity - 1)}
                className="w-5 h-5 flex items-center justify-center text-xs font-black hover:text-primary transition-colors"
              >
                -
              </button>
              <span className="text-[10px] font-black w-4 text-center tabular-nums">{quantity}</span>
              <button 
                onClick={() => onUpdateQty(quantity + 1)}
                className="w-5 h-5 flex items-center justify-center text-xs font-black hover:text-primary transition-colors"
              >
                +
              </button>
            </div>
            <span className="text-xs font-black text-primary tabular-nums">{formatCurrency(price * quantity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderCart() {
  const { cartItems, orderType, setOrderType, removeItem, updateQuantity, clearCart, getCartTotal } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState<{
    receiptNumber: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    orderType: "dine_in" | "take_away";
    date: string;
  } | null>(null);
  
  const total = getCartTotal();
  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);
  const tax = orderType === "dine_in" ? subtotal * 0.1 : 0;

  // Auto-trigger print when lastOrder is populated
  useEffect(() => {
    if (lastOrder) {
      const timer = setTimeout(() => {
        window.print();
        // Reset last order after print dialog closes to prevent re-prints
        setLastOrder(null);
      }, 500); // Small delay to ensure the DOM is ready for print
      return () => clearTimeout(timer);
    }
  }, [lastOrder]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsProcessing(true);
    try {
      const currentItems = [...cartItems];
      const result = await processCheckout(cartItems, "Cash", total, orderType);
      
      if (result.success) {
        toast.success("Order processed successfully!");
        
        // Save current cart data for the printing component
        setLastOrder({
          receiptNumber: result.order.receipt_number,
          items: currentItems,
          subtotal,
          tax,
          total,
          orderType,
          date: new Date().toLocaleString(),
        });

        clearCart();
      } else {
        toast.error(result.error || "Failed to process order");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <aside className="w-[420px] bg-white border-l border-outline flex flex-col h-screen shrink-0 sticky top-0 editorial-shadow print:hidden">
        <div className="p-6 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold uppercase tracking-tighter">Current Order</h2>
            <div className="bg-primary text-white px-5 py-2 rounded-full text-[10px] font-black shadow-lg shadow-primary/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-xs material-symbols-fill">shopping_basket</span>
              POS TERMINAL
            </div>
          </div>

          {/* Order Type Toggle */}
          <div className="mb-8 grid grid-cols-2 gap-3 p-1.5 bg-surface-variant/20 rounded-2xl border border-outline/10">
            <button 
              onClick={() => setOrderType("dine_in")}
              className={cn(
                 "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 orderType === "dine_in" ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-on-surface-variant/60 hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-sm">restaurant</span>
              Dine In
            </button>
            <button 
              onClick={() => setOrderType("take_away")}
              className={cn(
                 "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 orderType === "take_away" ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-on-surface-variant/60 hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-sm">shopping_bag</span>
              Take Away
            </button>
          </div>

          {/* Detailed Order List */}
          <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pr-1 pt-2 pb-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <OrderItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  quantity={item.quantity}
                  image={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                  onRemove={() => removeItem(item.id)}
                  onUpdateQty={(qty) => updateQuantity(item.id, qty)}
                />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale py-10 scale-90">
                 <span className="material-symbols-outlined text-6xl mb-4">shopping_cart</span>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center max-w-[150px] leading-relaxed">
                    Terminal is active. <br/>Awaiting first entry.
                 </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Section */}
        <div className="p-6 bg-white border-t border-outline/50 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
          <div className="space-y-2 mb-6">
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">
               <span>Subtotal</span>
               <span>{formatCurrency(subtotal)}</span>
             </div>
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">
               <span>Tax {orderType === "dine_in" ? "(10%)" : "(0%)"}</span>
               <span>{formatCurrency(tax)}</span>
             </div>
             <div className="flex justify-between items-center pt-4 mt-2 border-t border-outline/10">
               <span className="text-xs font-black uppercase tracking-widest text-on-surface">Total Payment</span>
               <span className="text-2xl font-black text-primary tabular-nums tracking-tighter">
                  {formatCurrency(total)}
               </span>
             </div>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={isProcessing || cartItems.length === 0}
            className={cn(
              "w-full bg-primary text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-primary/25 font-headline uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3",
              (isProcessing || cartItems.length === 0) && "opacity-50 grayscale cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                Proceed Order
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Hidden component for printing */}
      {lastOrder && (
        <PrintableInvoice 
          receiptNumber={lastOrder.receiptNumber}
          date={lastOrder.date}
          items={lastOrder.items}
          subtotal={lastOrder.subtotal}
          tax={lastOrder.tax}
          total={lastOrder.total}
          orderType={lastOrder.orderType}
        />
      )}
    </>
  );
}
