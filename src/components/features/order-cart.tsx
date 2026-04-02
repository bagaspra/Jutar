"use client";

import { useCartStore } from "@/store/useCartStore";
import { formatCurrency, cn } from "@/lib/utils";
import { processCheckout, saveOpenOrder } from "@/actions/order-actions";
import { closeSession } from "@/actions/kitchen-actions";
import { useState, useMemo, useEffect, useTransition } from "react";
import { getPaymentMethods } from "@/actions/payment-actions";
import { toast } from "sonner";
import { ThermalReceipt } from "./thermal-receipt";
import { CartItem } from "@/types";
import { SavedOrdersDialog } from "./saved-orders-dialog";
import { TableNumberDialog } from "./table-number-dialog";
import { ActiveSessionsDialog } from "./active-sessions-dialog";
import { 
  Pause, 
  Printer, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  WalletCards
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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
  const {
    cartItems,
    orderType,
    activeOrderId,
    tableNumber,
    setOrderType,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotal,
    setActiveOrderId,
    setTableNumber,
    fetchOpenOrdersCount,
    selectedPaymentMethodId,
    setSelectedPaymentMethodId
  } = useCartStore();

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchMethods = async () => {
      const data = await getPaymentMethods();
      setPaymentMethods(data?.filter(m => m.is_active) || []);
    };
    fetchMethods();
  }, []);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [showTableNumberDialog, setShowTableNumberDialog] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [lastOrder, setLastOrder] = useState<{
    receiptNumber: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    orderType: "dine_in" | "take_away";
    date: string;
    isTemporary?: boolean;
    tableNumber?: string | null;
  } | null>(null);
  
  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);
  const tax = orderType === "dine_in" ? subtotal * 0.1 : 0;
  const total = subtotal + tax;

  // Auto-trigger print when lastOrder is populated
  useEffect(() => {
    if (lastOrder) {
      const timer = setTimeout(() => {
        window.print();
        setLastOrder(null);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [lastOrder]);

  const handleHoldOrder = async (tableNum?: string | null) => {
    if (cartItems.length === 0) return;
    setIsHolding(true);
    try {
      const result = await saveOpenOrder(cartItems, total, orderType, activeOrderId, selectedPaymentMethodId, tableNum || null);
      if (result.success && result.receiptNumber) {
        setTableNumber(tableNum || null);
        toast.success(`Order ${result.receiptNumber.split('-').pop()} Held Successfully`);
        clearCart();
        setSelectedPaymentMethodId(null);
        fetchOpenOrdersCount(); // Refresh badge
      } else {
        toast.error(result.error || "Failed to hold order");
      }
    } catch (err) {
      toast.error("Internal transaction error");
    } finally {
      setIsHolding(false);
    }
  };

  const selectedMethod = useMemo(() => 
    paymentMethods.find(m => m.id === selectedPaymentMethodId),
    [paymentMethods, selectedPaymentMethodId]
  );

  const handlePrintTemporary = async () => {
    if (cartItems.length === 0) return;
    setIsHolding(true);
    try {
      const result = await saveOpenOrder(cartItems, total, orderType, activeOrderId, selectedPaymentMethodId, tableNumber);
      if (result.success && result.receiptNumber) {
        setLastOrder({
          receiptNumber: result.receiptNumber,
          items: [...cartItems],
          subtotal,
          tax,
          total,
          orderType,
          date: new Date().toLocaleString(),
          isTemporary: true,
          tableNumber
        });
        setActiveOrderId(result.orderId ?? null);
        toast.info("Temporary Bill Generated");
      }
    } finally {
      setIsHolding(false);
    }
  };

  const handlePayAndClose = async () => {
    if (cartItems.length === 0) return;
    if (!selectedPaymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);
    try {
      const currentItems = [...cartItems];
      const result = await processCheckout(cartItems, "ID", total, orderType, activeOrderId, selectedPaymentMethodId, tableNumber);

      if (result.success) {
        toast.success("Transaction Finalized!");
        setLastOrder({
          receiptNumber: result.order.receipt_number,
          items: currentItems,
          subtotal,
          tax,
          total,
          orderType,
          date: new Date().toLocaleString(),
          isTemporary: false,
          tableNumber
        });
        // Close kiosk dining session if one was loaded
        if (activeSessionId) {
          await closeSession(activeSessionId);
          setActiveSessionId(null);
        }
        clearCart();
        setSelectedPaymentMethodId(null);
        fetchOpenOrdersCount(); // Refresh badge
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <aside className="w-[420px] bg-white border-l border-outline flex flex-col h-screen shrink-0 sticky top-0 editorial-shadow print:hidden">
        <div className="p-5 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
               <h2 className="text-xl font-extrabold uppercase tracking-tighter italic font-headline">Order</h2>
               {activeOrderId && (
                 <div className="flex items-center gap-2">
                   <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse shadow-sm">
                     <Pause className="size-2.5 fill-primary" />
                     Sedang Ditunda
                   </span>
                   {tableNumber && (
                     <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
                       Meja {tableNumber}
                     </span>
                   )}
                 </div>
               )}
            </div>
             <div className="flex items-center gap-2">
               <ActiveSessionsDialog onSessionLoaded={(id) => setActiveSessionId(id)} />
               <SavedOrdersDialog />
               <div className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95">
                 <span className="material-symbols-outlined text-xs material-symbols-fill">shopping_basket</span>
                 KASIR
               </div>
             </div>
          </div>

           {/* Order Type Toggle (Compacted) */}
           <div className="mb-5 grid grid-cols-2 gap-2 p-1 bg-surface-variant/20 rounded-2xl border border-outline/10">
             <button 
               onClick={() => setOrderType("dine_in")}
               className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  orderType === "dine_in" ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-on-surface-variant/60 hover:text-on-surface"
               )}
             >
              <span className="material-symbols-outlined text-sm">restaurant</span>
              Makan di Tempat
            </button>
             <button 
               onClick={() => setOrderType("take_away")}
               className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  orderType === "take_away" ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-on-surface-variant/60 hover:text-on-surface"
               )}
             >
              <span className="material-symbols-outlined text-sm">shopping_bag</span>
              Bawa Pulang
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
                    Kasir aktif. <br/>Menunggu pesanan.
                 </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Section (Compacted) */}
        <div className="p-4 bg-surface-variant/5 border-t border-outline/50 shadow-[0_-20px_60px_rgba(0,0,0,0.03)] backdrop-blur-sm">
          <div className="space-y-1 mb-4 px-2">
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">
               <span>Subtotal</span>
               <span className="tabular-nums">{formatCurrency(subtotal)}</span>
             </div>
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">
               <span>Pajak {orderType === "dine_in" ? "(10%)" : "(0%)"}</span>
               <span className="tabular-nums">{formatCurrency(tax)}</span>
             </div>
             <div className="flex justify-between items-center pt-3 mt-2 border-t border-outline/10 group">
               <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">Total Pembayaran</span>
                  <AlertCircle className="size-3 text-on-surface-variant/20 stroke-[3]" />
               </div>
               <span className="text-2xl font-black text-primary tabular-nums tracking-tighter scale-105 origin-right leading-none">
                  {formatCurrency(total)}
               </span>
             </div>
          </div>

          {/* Payment Method Selector (Fixed Naming & Transparency) */}
          <div className="mb-4 px-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 mb-2 block">Metode Pembayaran</label>
            <Select 
              value={selectedPaymentMethodId || ""} 
              onValueChange={(val) => setSelectedPaymentMethodId(val)}
            >
              <SelectTrigger className="w-full h-12 rounded-xl bg-white border-2 border-outline/10 px-5 font-black text-[10px] uppercase tracking-widest shadow-sm focus:ring-primary/20">
                <div className="flex items-center gap-2">
                  {selectedMethod ? (
                    <>
                      <span className="material-symbols-outlined text-base opacity-60">
                        {selectedMethod.type === 'cash' ? 'payments' : 'credit_card'}
                      </span>
                      {selectedMethod.name}
                    </>
                  ) : (
                    <span className="opacity-40 tracking-[0.1em]">Pilih Metode...</span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-outline/10 shadow-2xl bg-white z-[100]">
                {paymentMethods.map((method) => (
                  <SelectItem 
                    key={method.id} 
                    value={method.id}
                    className="py-3 px-5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg opacity-60">
                        {method.type === 'cash' ? 'payments' : 'credit_card'}
                      </span>
                      <span className="font-black uppercase tracking-[0.1em] text-[10px]">{method.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
             <button
               onClick={() => {
                 if (orderType === "dine_in") {
                   setShowTableNumberDialog(true);
                 } else {
                   handleHoldOrder();
                 }
               }}
               disabled={cartItems.length === 0 || isHolding}
               className="col-span-2 bg-white border-2 border-outline/20 text-on-surface-variant font-black py-4 rounded-2xl transition-all active:scale-[0.9] hover:bg-surface-variant/20 hover:border-on-surface-variant/10 text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
               title="Simpan pesanan untuk nanti"
             >
               {isHolding ? <Loader2 className="size-3.5 animate-spin" /> : <Pause className="size-3.5 fill-current" />}
               Tunda
             </button>
             
             <button 
               onClick={handlePrintTemporary}
               disabled={cartItems.length === 0 || isHolding}
               className="col-span-1 bg-white border-2 border-outline/20 text-on-surface-variant font-black py-3 rounded-2xl transition-all active:scale-[0.9] hover:bg-surface-variant/20 hover:border-on-surface-variant/10 flex items-center justify-center"
               title="Print temporary bill"
             >
               <Printer className="size-4" />
             </button>

             <button 
               onClick={handlePayAndClose}
               disabled={isProcessing || cartItems.length === 0 || !selectedPaymentMethodId}
               className={cn(
                 "col-span-2 bg-primary text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-primary/20 text-[9px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 overflow-hidden relative group",
                 (isProcessing || cartItems.length === 0 || !selectedPaymentMethodId) && "opacity-50 grayscale cursor-not-allowed"
               )}
             >
               <div className="absolute inset-y-0 left-0 w-1 bg-white/20 group-hover:w-full transition-all duration-500 opacity-0 group-hover:opacity-100" />
               {isProcessing ? (
                 <Loader2 className="size-3.5 animate-spin" />
               ) : (
                 <>
                   <span className="relative z-10">Bayar & Selesai</span>
                   <CheckCircle2 className="size-3.5 relative z-10" />
                 </>
               )}
             </button>
          </div>
          
          {activeOrderId && (
            <div className="mt-4 flex items-center justify-center gap-1 text-[8px] font-black text-primary uppercase tracking-[0.2em] opacity-60">
              <span className="w-1 h-1 bg-primary rounded-full animate-ping" />
              Editing Active Bill
            </div>
          )}
        </div>
      </aside>

      {/* Table Number Dialog */}
      <TableNumberDialog
        open={showTableNumberDialog}
        onOpenChange={setShowTableNumberDialog}
        orderType={orderType}
        onConfirm={(tableNum) => {
          setShowTableNumberDialog(false);
          handleHoldOrder(tableNum);
        }}
      />

      {/* Hidden component for printing */}
      {lastOrder && (
        <ThermalReceipt
          receiptNumber={lastOrder.receiptNumber}
          date={lastOrder.date}
          items={lastOrder.items}
          subtotal={lastOrder.subtotal}
          tax={lastOrder.tax}
          total={lastOrder.total}
          orderType={lastOrder.orderType}
          isTemporary={lastOrder.isTemporary}
          tableNumber={lastOrder.tableNumber}
        />
      )}
    </>
  );
}
