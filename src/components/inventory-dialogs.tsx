"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, MinusCircle, Loader2 } from "lucide-react";
import { adjustInventory } from "@/actions/inventory-actions";
import { toast } from "sonner";

interface InventoryActionsPortalProps {
  materials: { id: string; name: string; unit: string }[];
}

export function InventoryActionsPortal({ materials }: InventoryActionsPortalProps) {
  const [isPending, startTransition] = useTransition();
  const [openType, setOpenType] = useState<"restock" | "waste" | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!openType) return;

    const formData = new FormData(event.currentTarget);
    const materialId = formData.get("materialId") as string;
    const quantity = Number(formData.get("quantity"));
    const notes = formData.get("notes") as string;

    if (!materialId || !quantity) {
      toast.error("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      const result = await adjustInventory(materialId, openType, quantity, notes);
      if (result.success) {
        toast.success(`Success!`, {
          description: `Updated stock for ${result.materialName}`,
        });
        setOpenType(null);
      } else {
        toast.error("Operation failed", {
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Restock Dialog */}
      <Dialog open={openType === "restock"} onOpenChange={(open) => !open && setOpenType(null)}>
        <DialogTrigger
          render={
            <Button onClick={() => setOpenType("restock")} className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 font-bold gap-2 rounded-xl h-12 px-6">
              <PlusCircle className="size-4" />
              Receive Restock
            </Button>
          }
        />
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tighter">Inventory Restock</DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                Add purchased supplies back into current stock levels.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-8">
              <div className="grid gap-2">
                <Label htmlFor="materialId" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Select Raw Material</Label>
                <Select name="materialId" required>
                  <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-none font-bold">
                    <SelectValue placeholder="Choose material..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    {materials.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="font-medium py-3 cursor-pointer">
                        {m.name} ({m.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Quantity Received</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 50"
                  className="rounded-xl h-12 bg-muted/50 border-none font-bold placeholder:font-medium placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Notes / Supplier</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Supplier name or batch ID"
                  className="rounded-xl h-12 bg-muted/50 border-none font-bold placeholder:font-medium placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending} className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 font-black text-lg shadow-lg shadow-green-600/20 active:scale-95 transition-all">
                {isPending ? <Loader2 className="animate-spin" /> : "Confirm Restock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Waste Dialog */}
      <Dialog open={openType === "waste"} onOpenChange={(open) => !open && setOpenType(null)}>
        <DialogTrigger
          render={
            <Button variant="outline" onClick={() => setOpenType("waste")} className="border-amber-500/30 text-amber-600 hover:bg-amber-50 shadow-sm font-bold gap-2 rounded-xl h-12 px-6">
              <MinusCircle className="size-4" />
              Log Waste
            </Button>
          }
        />
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tighter text-amber-600">Inventory Waste</DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                Subtract damaged or expired stock from current levels.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-8">
              <div className="grid gap-2">
                <Label htmlFor="materialId" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Select Raw Material</Label>
                <Select name="materialId" required>
                  <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-none font-bold">
                    <SelectValue placeholder="Choose material..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    {materials.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="font-medium py-3 cursor-pointer">
                        {m.name} ({m.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Quantity Wasted</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 2.5"
                  className="rounded-xl h-12 bg-muted/50 border-none font-bold placeholder:font-medium placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Reason for Waste</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Expired, damaged, etc."
                  className="rounded-xl h-12 bg-muted/50 border-none font-bold placeholder:font-medium placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending} className="w-full h-14 rounded-2xl bg-amber-600 hover:bg-amber-700 font-black text-lg shadow-lg shadow-amber-600/20 active:scale-95 transition-all">
                {isPending ? <Loader2 className="animate-spin" /> : "Log Waste Deduction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
