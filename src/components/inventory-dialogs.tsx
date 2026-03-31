"use client";

import { useTransition } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, PackagePlus, Recycle } from "lucide-react";
import { adjustInventory } from "@/actions/inventory-actions";
import { toast } from "sonner";

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
}

interface InventoryActionsPortalProps {
  materials: RawMaterial[];
}

export function InventoryActionsPortal({ materials }: InventoryActionsPortalProps) {
  return (
    <div className="flex items-center gap-3">
      <InventoryDialog title="Stok Ulang" type="restock" materials={materials} />
      <InventoryDialog title="Sisa/Buang" type="waste" materials={materials} />
    </div>
  );
}

function InventoryDialog({ 
  title, 
  type, 
  materials 
}: { 
  title: string; 
  type: "restock" | "waste"; 
  materials: RawMaterial[] 
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const materialId = formData.get("materialId") as string;
    const quantity = Number(formData.get("quantity"));
    const notes = formData.get("notes") as string;

    if (!materialId || isNaN(quantity) || quantity <= 0) {
      toast.error("Input Tidak Valid", { description: "Harap pilih bahan dan masukkan jumlah yang benar." });
      return;
    }

    startTransition(async () => {
      const result = await adjustInventory(materialId, type, quantity, notes);
      if (result.success) {
        toast.success(`${title} Berhasil`, {
          description: `${result.materialName} telah diperbarui.`
        });
        // We'd ideally close the dialog here, but shadcn Dialog with uncontrolled form 
        // needs a controlled 'open' state to close programmatically. 
        // For now, assume the user closes it or we add state.
      } else {
        toast.error("Gagal Memperbarui", { description: result.error });
      }
    });
  };

  const Icon = type === "restock" ? PackagePlus : Recycle;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant={type === "restock" ? "default" : "outline"} className="rounded-xl h-12 font-black gap-2 shadow-lg transition-all active:scale-95 font-heading">
            <Icon className="size-5" />
            {title}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter font-heading">{title} Inventaris</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              {type === "restock" 
                ? "Tambahkan pasokan baru ke gudang Anda." 
                : "Catat bahan yang rusak atau terbuang."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-8">
            <div className="grid gap-2">
              <Label htmlFor="materialId" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Pilih Bahan Baku</Label>
              <Select name="materialId" required>
                <SelectTrigger className="rounded-2xl h-12 bg-muted/50 border-none font-bold">
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="font-medium">
                      {m.name} ({m.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Jumlah ({type === 'restock' ? '+' : '-'})</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="rounded-xl h-12 bg-muted/50 border-none font-bold"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Catatan Tambahan (Opsional)</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Contoh: Kiriman Supplier, Expired..."
                className="rounded-xl h-12 bg-muted/50 border-none font-bold placeholder:font-medium"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-lg shadow-primary/20 transition-all font-heading">
              {isPending ? <Loader2 className="animate-spin" /> : `Konfirmasi ${title}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
