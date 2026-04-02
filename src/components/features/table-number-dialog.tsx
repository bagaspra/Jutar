"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TableNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderType: "dine_in" | "take_away";
  onConfirm: (tableNumber: string) => void;
}

export function TableNumberDialog({
  open,
  onOpenChange,
  orderType,
  onConfirm,
}: TableNumberDialogProps) {
  const [tableNumber, setTableNumber] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset and focus when dialog opens
  useEffect(() => {
    if (open) {
      setTableNumber("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Only show dialog for dine_in orders
  if (orderType !== "dine_in") {
    return null;
  }

  const handleConfirm = () => {
    const trimmed = tableNumber.trim();
    if (!trimmed) {
      toast.error("Masukkan nomor meja");
      return;
    }
    onConfirm(trimmed);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-outline/10 bg-surface-variant/5">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase tracking-widest">
            Nomor Meja
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Input
            ref={inputRef}
            type="number"
            placeholder="Contoh: 4 atau 12"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-center text-xl font-bold"
            min="1"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-bold uppercase"
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-primary font-bold uppercase text-primary-foreground"
          >
            Tunda Pesanan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
