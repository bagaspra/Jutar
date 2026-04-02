"use client";

import { useEffect, useState, useTransition } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getOpenOrders } from "@/actions/order-actions";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency, cn } from "@/lib/utils";
import { Loader2, History, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function SavedOrdersDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [orders, setOrders] = useState<any[]>([]);
  const {
    setCartItems,
    setActiveOrderId,
    setOrderType,
    setTableNumber,
    cartItems,
    openOrdersCount,
    fetchOpenOrdersCount,
    setOpenOrdersCount
  } = useCartStore();

  const fetchOrders = () => {
    startTransition(async () => {
      const result = await getOpenOrders();
      if (result.success) {
        const orderList = result.orders || [];
        setOrders(orderList);
        setOpenOrdersCount(orderList.length);
      } else {
        toast.error("Gagal mengambil daftar pesanan ditunda");
      }
    });
  };

  useEffect(() => {
    fetchOpenOrdersCount();
  }, []);

  useEffect(() => {
    if (open) {
      fetchOrders();
    }
  }, [open]);

  const handleRecall = (order: any) => {
    if (cartItems.length > 0) {
      const confirm = window.confirm("Keranjang saat ini akan dihapus. Lanjutkan?");
      if (!confirm) return;
    }

    // Map order_items to CartItem type
    const items = order.order_items.map((oi: any) => ({
      id: oi.products.id,
      name: oi.products.name,
      price: oi.products.price,
      quantity: oi.quantity,
      image_url: oi.products.image_url,
    }));

    setCartItems(items);
    setActiveOrderId(order.id);
    setOrderType(order.order_type);
    setTableNumber(order.table_number || null);
    setOpen(false);
    toast.success(`Mengambil kembali Pesanan #${order.receipt_number.split('-').pop()}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
            title="Saran Pesanan Ditunda"
          >
            <History className="size-5" />
            {openOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm ring-2 ring-white">
                {openOrdersCount}
              </span>
            )}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] gap-0 rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-primary/5 border-b border-primary/10">
          <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center gap-3 font-headline uppercase">
            <RotateCcw className="size-6 text-primary" />
            Pesanan Tunda
          </DialogTitle>
          <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant/40 mt-1">Pilih pesanan yang ditunda untuk dilanjutkan</p>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-y-auto no-scrollbar p-6 space-y-4">
          {isPending ? (
            <div className="h-40 flex items-center justify-center text-primary/40">
              <Loader2 className="size-8 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-on-surface-variant/20">
              <History className="size-12 mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center">Tidak ada pesanan yang ditunda</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="group flex items-center justify-between p-4 bg-white border border-outline/20 hover:bg-surface-variant/10 rounded-2xl transition-all cursor-pointer shadow-md hover:shadow-lg"
                onClick={() => handleRecall(order)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {order.table_number ? (
                      <span className="text-[10px] font-black text-white px-3 py-1 bg-primary rounded-md">
                        Meja {order.table_number}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-md">
                        #{order.receipt_number.split('-').pop()}
                      </span>
                    )}
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest bg-white/50 px-2 py-0.5 rounded-md border border-outline/5 transition-all">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-on-surface truncate pr-4">
                    {order.order_items.length} Menu • {order.order_type === 'dine_in' ? 'Makan di Tempat' : 'Bawa Pulang'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-primary tabular-nums group-hover:scale-110 transition-transform">
                    {formatCurrency(order.total_amount)}
                  </p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-1">Siap Diambil Kembali</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-surface-variant/10">
           <Button variant="ghost" onClick={() => setOpen(false)} className="w-full text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
              Tutup Panel
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
