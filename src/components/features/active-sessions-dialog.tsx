"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, TableProperties, ChevronRight } from "lucide-react";
import { getActiveSessions, getSessionBill } from "@/actions/kitchen-actions";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Session {
  id: string;
  table_number: string;
  customer_name: string;
  created_at: string;
}

interface ActiveSessionsDialogProps {
  sessionId?: string | null;
  onSessionLoaded?: (sessionId: string) => void;
}

export function ActiveSessionsDialog({ onSessionLoaded }: ActiveSessionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { setCartItems, setOrderType, setTableNumber, setActiveOrderId } = useCartStore();

  const fetchSessions = async () => {
    setLoading(true);
    const result = await getActiveSessions();
    if (result.success) setSessions(result.sessions as Session[]);
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchSessions();
  }, [open]);

  const handleLoad = async (session: Session) => {
    setLoadingId(session.id);
    const result = await getSessionBill(session.id);

    if (!result.success || result.cartItems.length === 0) {
      toast.error("Tidak ada pesanan aktif untuk meja ini");
      setLoadingId(null);
      return;
    }

    setCartItems(result.cartItems);
    setOrderType("dine_in");
    setTableNumber(session.table_number);
    setActiveOrderId(null); // kiosk orders don't have a single 'open' orderId

    onSessionLoaded?.(session.id);
    setLoadingId(null);
    setOpen(false);
    toast.success(`Tagihan Meja ${session.table_number} — ${session.customer_name} dimuat`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-outline/20 text-[9px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-variant/20 transition-all"
            title="Lihat pesanan aktif dari meja"
          >
            <Users className="size-3.5" />
            Meja Aktif
            {sessions.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center text-white bg-primary">
                {sessions.length}
              </span>
            )}
          </button>
        }
      />
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <TableProperties className="size-4 text-primary" />
            Pesanan Aktif (Meja)
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center py-8 opacity-40">
            <Users className="size-10 mb-2" />
            <p className="text-xs font-black uppercase tracking-widest">Tidak ada meja aktif</p>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleLoad(s)}
                disabled={loadingId === s.id}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-outline/10 hover:bg-primary/5 hover:border-primary/20 transition-all text-left"
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Meja {s.table_number}
                  </p>
                  <p className="text-xs font-bold text-on-surface">{s.customer_name}</p>
                  <p className="text-[9px] text-on-surface-variant/40 mt-0.5">
                    {new Date(s.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {loadingId === s.id ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <ChevronRight className="size-4 text-on-surface-variant/30" />
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
