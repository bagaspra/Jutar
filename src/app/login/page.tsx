"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Loader2, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/actions/auth-actions";

const BRAND_RED = "#C8102E";
const CREAM_BG = "#F5F0EB";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn(email, password);
    if (!result.success) {
      toast.error("Masuk Gagal", { description: result.error });
      setLoading(false);
    } else {
      toast.success("Masuk Berhasil", { description: "Sedang menyambungkan ke dashboard..." });
      router.refresh();
      router.push(result.redirectPath!);
    }
  };

  return (
    <main
      className="w-full min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: CREAM_BG }}
    >
      <div className="w-full max-w-sm animate-in fade-in zoom-in duration-500 flex flex-col items-center">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-3">
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M28 20 L28 44 Q28 54 18 54 Q10 54 8 48" stroke={BRAND_RED} strokeWidth="6" strokeLinecap="round" fill="none"/>
              <path d="M18 20 L36 20" stroke={BRAND_RED} strokeWidth="6" strokeLinecap="round"/>
              <path d="M36 20 Q44 20 44 13 Q44 6 36 6 Q30 6 28 12" stroke={BRAND_RED} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
              <circle cx="28" cy="12" r="2.5" fill={BRAND_RED}/>
            </svg>
          </div>
          <h1 className="text-xl font-black tracking-[0.12em] uppercase" style={{ color: BRAND_RED }}>
            JURASA BACKOFFICE
          </h1>
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase mt-0.5" style={{ color: "#999" }}>
            AKSES TERBATAS
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-3xl p-8" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
          <div className="mb-6">
            <h2 className="text-xl font-black text-gray-900 mb-1">Otentikasi Admin</h2>
            <p className="text-sm text-gray-400 font-medium leading-snug">
              Silakan masuk untuk mengelola inventaris<br />dan menu.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
                <Input
                  type="email"
                  placeholder="nama@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-10 rounded-xl border border-gray-100 bg-gray-50 text-sm font-medium placeholder:text-gray-300 focus-visible:border-red-300 focus-visible:ring-red-100"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pl-10 rounded-xl border border-gray-100 bg-gray-50 text-sm font-medium placeholder:text-gray-300 focus-visible:border-red-300 focus-visible:ring-red-100"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl font-black text-white text-base tracking-wide transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center py-3.5 mt-2"
              style={{ backgroundColor: BRAND_RED, boxShadow: "0 6px 24px rgba(200,16,46,0.30)" }}
            >
              {loading ? <Loader2 className="animate-spin size-5" /> : "Masuk Sekarang"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] mt-8 font-bold uppercase tracking-[0.15em]" style={{ color: "#BBB" }}>
          JURASA POS © 2026 • DIRANCANG UNTUK EFISIENSI
        </p>
      </div>
    </main>
  );
}
