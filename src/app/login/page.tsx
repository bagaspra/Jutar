"use client";

import { useState } from "react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      toast.error("Authentication Failed", {
        description: result.error,
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md rounded-[2.5rem] border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-4 pt-12 pb-8 text-center bg-primary/5">
          <div className="mx-auto size-16 bg-primary rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-primary/20">
            🔐
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter">JuRasa Backoffice</CardTitle>
            <CardDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
              Secured Administrator Access
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-10 px-10">
          <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground pl-1">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@jurasa.pos"
                required
                className="h-14 rounded-2xl border-none bg-muted/50 focus-visible:ring-primary font-bold px-6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground pl-1">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-14 rounded-2xl border-none bg-muted/50 focus-visible:ring-primary font-bold px-6"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="pb-12 pt-4 px-10">
          <Button
            type="submit"
            form="login-form"
            disabled={loading}
            className="w-full h-16 rounded-[1.5rem] text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
            {loading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <>
                Continue to Admin
                <KeyRound className="size-5 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
