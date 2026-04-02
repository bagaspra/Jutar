"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ChefHat, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getKitchenOrders, markOrderReady } from "@/actions/kitchen-actions";
import { formatCurrency } from "@/lib/utils";

const BRAND_RED = "#C8102E";
const DARK_BG = "#111111";
const CARD_BG = "#1C1C1C";
const BORDER = "#2A2A2A";

interface OrderItem {
  quantity: number;
  price_at_time: number;
  products: { name: string } | null;
}

interface KitchenOrder {
  id: string;
  receipt_number: string;
  table_number: string | null;
  created_at: string;
  order_items: OrderItem[];
  dining_sessions: { customer_name: string } | null;
}

function ElapsedTimer({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(createdAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isUrgent = elapsed > 600; // 10 min

  return (
    <span
      className="text-[11px] font-black tabular-nums"
      style={{ color: isUrgent ? "#EF4444" : "#9CA3AF" }}
    >
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}

export function KitchenDisplay() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const playBeep = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new AudioContext();
      }
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const fetchOrders = async () => {
    const result = await getKitchenOrders();
    if (result.success) setOrders(result.orders as unknown as KitchenOrder[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: "status=eq.pending_kitchen" },
        () => {
          playBeep();
          fetchOrders();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMarkReady = async (orderId: string) => {
    setMarking(orderId);
    const result = await markOrderReady(orderId);
    if (result.success) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
    setMarking(null);
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: DARK_BG, color: "white" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ backgroundColor: DARK_BG, borderColor: BORDER }}
      >
        <div className="flex items-center gap-3">
          <ChefHat className="size-6" style={{ color: BRAND_RED }} />
          <h1 className="text-lg font-black uppercase tracking-widest">Layar Dapur</h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: "#22C55E" }}
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Live
          </span>
          <span
            className="ml-3 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ backgroundColor: BRAND_RED }}
          >
            {orders.length} Antrian
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="size-8 animate-spin" style={{ color: BRAND_RED }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 opacity-30">
          <ChefHat className="size-16 mb-4" />
          <p className="text-sm font-black uppercase tracking-widest">Dapur Bersih</p>
          <p className="text-xs text-gray-500 mt-1">Tidak ada pesanan masuk</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl flex flex-col overflow-hidden border"
              style={{ backgroundColor: CARD_BG, borderColor: BORDER }}
            >
              {/* Ticket Header */}
              <div
                className="px-4 py-3 flex items-center justify-between border-b"
                style={{ backgroundColor: "#222", borderColor: BORDER }}
              >
                <div>
                  <p
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: BRAND_RED }}
                  >
                    {order.table_number ? `Meja ${order.table_number}` : "Take Away"}
                  </p>
                  <p className="text-xs font-bold text-gray-300">
                    {(order.dining_sessions as any)?.customer_name ?? "—"}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                    #{order.receipt_number.split("-").pop()}
                  </p>
                  <div className="flex items-center gap-1">
                    <Clock className="size-3 text-gray-500" />
                    <ElapsedTimer createdAt={order.created_at} />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="flex-1 px-4 py-3 space-y-2">
                {(order.order_items as OrderItem[]).map((oi, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <span className="text-sm font-black text-white leading-tight">
                      <span
                        className="inline-block w-6 text-center mr-1 font-black text-base"
                        style={{ color: BRAND_RED }}
                      >
                        {oi.quantity}×
                      </span>
                      {oi.products?.name ?? "Item"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => handleMarkReady(order.id)}
                  disabled={marking === order.id}
                  className="w-full py-3 rounded-xl font-black text-white text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{ backgroundColor: "#16A34A" }}
                >
                  {marking === order.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Selesai Dimasak
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
