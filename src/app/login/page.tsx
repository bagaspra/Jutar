"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/actions/auth-actions";

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
      
      // Force refreshing the router to pick up the server-side cookies
      router.refresh();
      
      // Use the role-aware path returned from the server
      router.push(result.redirectPath!);
    }
  };

  return (
    <main className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8 gap-4">
          <div className="size-16 bg-primary rounded-3xl flex items-center justify-center text-4xl shadow-2xl shadow-primary/20 rotate-3">
             🔒
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter uppercase font-heading">JuRasa Backoffice</h1>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 italic">Akses Terbatas</p>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden ring-1 ring-black/5">
          <CardHeader className="bg-muted/10 pb-4">
            <CardTitle className="text-2xl font-black font-heading">Otentikasi Admin</CardTitle>
            <CardDescription className="font-medium">Silakan masuk untuk mengelola inventaris dan menu.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="nama@contoh.com" 
                    className="h-12 pl-12 rounded-2xl bg-muted/50 border-none font-bold placeholder:font-medium placeholder:text-muted-foreground/40 focus-visible:ring-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Kata Sandi</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 pl-12 rounded-2xl bg-muted/50 border-none font-bold placeholder:font-medium placeholder:text-muted-foreground/40 focus-visible:ring-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-xl shadow-xl shadow-primary/20 transition-all active:scale-95 duration-300 font-heading"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Masuk Sekarang"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-[11px] text-muted-foreground mt-8 font-medium uppercase tracking-[0.1em]">
          JuRasa POS © 2026 • Dirancang untuk Efisiensi
        </p>
      </div>
    </main>
  );
}
