"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createSession, verifySession } from "@/actions/session-actions";

const SESSION_KEY = "jutar_session_token";

type ViewState = "loading" | "welcome" | "menu";

interface Props {
  tableNumber: string;
}

export function SessionGate({ tableNumber }: Props) {
  const [view, setView] = useState<ViewState>("loading");
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem(SESSION_KEY);

      if (!token) {
        setView("welcome");
        return;
      }

      const result = await verifySession(token);

      if (result.success && result.status === "active") {
        setSessionName(result.session?.customer_name ?? null);
        setView("menu");
      } else {
        // Expired, paid, cancelled, or not found — start fresh
        localStorage.removeItem(SESSION_KEY);
        setView("welcome");
      }
    };

    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = customerName.trim();
    if (!name) return;

    setSubmitting(true);
    setError(null);

    const result = await createSession(tableNumber, name);

    if (result.success && result.sessionId) {
      localStorage.setItem(SESSION_KEY, result.sessionId);
      setSessionName(name);
      setView("menu");
    } else {
      setError("Gagal memulai sesi. Silakan coba lagi.");
    }

    setSubmitting(false);
  };

  if (view === "loading") {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F0EB" }}>
        <Loader2 className="size-8 animate-spin" style={{ color: "#C8102E" }} />
      </div>
    );
  }

  if (view === "welcome") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="w-full max-w-sm animate-in fade-in zoom-in duration-500 flex flex-col items-center">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-3">
              <svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M28 20 L28 44 Q28 54 18 54 Q10 54 8 48" stroke="#C8102E" strokeWidth="6" strokeLinecap="round" fill="none"/>
                <path d="M18 20 L36 20" stroke="#C8102E" strokeWidth="6" strokeLinecap="round"/>
                <path d="M36 20 Q44 20 44 13 Q44 6 36 6 Q30 6 28 12" stroke="#C8102E" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
                <circle cx="28" cy="12" r="2.5" fill="#C8102E"/>
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-[0.12em] uppercase" style={{ color: "#C8102E" }}>
              JURASA
            </h1>
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase mt-0.5" style={{ color: "#999" }}>
              MEJA {tableNumber}
            </p>
          </div>

          {/* Card */}
          <div className="w-full bg-white rounded-3xl p-8" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
            <div className="mb-6">
              <h2 className="text-xl font-black text-gray-900 mb-1">Selamat Datang!</h2>
              <p className="text-sm text-gray-400 font-medium leading-snug">
                Silakan masukkan nama Anda untuk mulai memesan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Nama Anda
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  autoFocus
                  className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 text-sm font-medium placeholder:text-gray-300 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !customerName.trim()}
                className="w-full rounded-2xl font-black text-white text-base tracking-wide transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center py-3.5"
                style={{ backgroundColor: "#C8102E", boxShadow: "0 6px 24px rgba(200,16,46,0.30)" }}
              >
                {submitting ? <Loader2 className="animate-spin size-5" /> : "Mulai Memesan"}
              </button>
            </form>
          </div>

          <p className="text-center text-[10px] mt-8 font-bold uppercase tracking-[0.15em]" style={{ color: "#BBB" }}>
            JURASA POS © 2026 • DIRANCANG UNTUK EFISIENSI
          </p>
        </div>
      </div>
    );
  }

  // view === "menu"
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: "#F5F0EB" }}>
      <div className="w-full max-w-sm flex flex-col items-center text-center animate-in fade-in duration-500">
        <div className="mb-4">
          <svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28 20 L28 44 Q28 54 18 54 Q10 54 8 48" stroke="#C8102E" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M18 20 L36 20" stroke="#C8102E" strokeWidth="6" strokeLinecap="round"/>
            <path d="M36 20 Q44 20 44 13 Q44 6 36 6 Q30 6 28 12" stroke="#C8102E" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
            <circle cx="28" cy="12" r="2.5" fill="#C8102E"/>
          </svg>
        </div>
        <h1 className="text-xl font-black uppercase tracking-widest mb-1" style={{ color: "#C8102E" }}>JURASA</h1>
        <p className="text-[10px] font-bold tracking-widest uppercase mb-8" style={{ color: "#999" }}>MEJA {tableNumber}</p>

        <div className="w-full bg-white rounded-3xl p-8" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#C8102E" }}>
            Halo, {sessionName}!
          </p>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Katalog Menu</h2>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl py-12 px-4 flex flex-col items-center gap-3">
            <span className="text-4xl">🍽️</span>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Coming Soon</p>
            <p className="text-xs text-gray-300 font-medium">Menu katalog akan tersedia di update berikutnya.</p>
          </div>
        </div>

        <p className="text-center text-[10px] mt-8 font-bold uppercase tracking-[0.15em]" style={{ color: "#BBB" }}>
          JURASA POS © 2026 • DIRANCANG UNTUK EFISIENSI
        </p>
      </div>
    </div>
  );
}
