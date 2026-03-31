"use client";

import { useState, useRef } from "react";
import { useCartStore } from "@/store/useCartStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Trash2, ShoppingCart, Loader2, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { processCheckout } from "@/actions/order-actions";
import { toast } from "sonner";
import { Receipt } from "@/components/receipt";

export function CartPanel() {
  const { cartItems, updateQuantity, removeItem, clearCart, getCartTotal } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [printedItems, setPrintedItems] = useState<any[]>([]);
  const total = getCartTotal();

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setIsProcessing(true);
    
    // Clone items for the receipt before clearing cart
    const itemsForReceipt = [...cartItems];
    const result = await processCheckout(cartItems, "cash", total);
    
    if (result.success) {
      setLastOrder(result.order);
      setPrintedItems(itemsForReceipt);
      
      toast.success("Order Placed Successfully!", {
        description: `Receipt: ${result.order.receipt_number}`,
      });
      
      clearCart();

      // Trigger Print after a small delay to allow DOM to render the receipt
      setTimeout(() => {
        window.print();
      }, 500);

    } else {
      toast.error("Checkout Failed", {
        description: result.error,
      });
    }
    setIsProcessing(false);
  };

  return (
    <>
      {/* Printable Receipt (Hidden on Screen) */}
      {lastOrder && <Receipt order={lastOrder} items={printedItems} />}

      {/* Main UI (Hidden on Print) */}
      <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-3xl shadow-xl overflow-hidden ring-1 ring-black/5 ring-inset print:hidden">
        {/* Header */}
        <div className="p-6 pb-2 flex items-center justify-between shadow-sm">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2 tracking-tight">
            <ShoppingCart className="size-6 text-primary" />
            My Order
          </h2>
          {cartItems.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearCart}
              disabled={isProcessing}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              Clear All
            </Button>
          )}
        </div>

        <Separator className="mx-6 opacity-30 mt-4" />

        {/* Cart Items List */}
        <ScrollArea className="flex-1 px-6 mt-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
              <div className="text-6xl mb-4 grayscale">🍔</div>
              <p className="text-sm font-bold">Your cart is empty.</p>
              <p className="text-xs">Add products from the menu left.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 group animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="size-14 bg-muted rounded-2xl flex items-center justify-center text-3xl shrink-0">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate">{item.name}</h4>
                    <p className="text-xs text-primary font-bold">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center bg-muted/50 rounded-lg p-1">
                    <button 
                      disabled={isProcessing}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="size-8 rounded-md flex items-center justify-center hover:bg-background transition-colors text-muted-foreground disabled:opacity-50"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                    <button 
                      disabled={isProcessing}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="size-8 rounded-md flex items-center justify-center hover:bg-background transition-colors text-muted-foreground disabled:opacity-50"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                  <button 
                    disabled={isProcessing}
                    onClick={() => removeItem(item.id)}
                    className="size-8 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-8 bg-muted/30 pt-6">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-foreground pt-1 pb-4">
              <span>Total Payable</span>
              <span className="text-xl text-primary">${total.toFixed(2)}</span>
            </div>
            <Button 
              disabled={cartItems.length === 0 || isProcessing}
              onClick={handleCheckout}
              className={cn(
                "w-full h-16 rounded-2xl text-lg font-black transition-all shadow-xl active:scale-95 group",
                cartItems.length > 0
                  ? "bg-primary text-primary-foreground shadow-primary/30 hover:bg-primary/90"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isProcessing ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <>
                  Confirm Payment
                  <ShoppingCart className="size-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            
            {lastOrder && !isProcessing && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.print()}
                className="mt-2 text-muted-foreground hover:text-primary gap-2"
              >
                <Printer className="size-4" />
                Reprint Last Receipt
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
