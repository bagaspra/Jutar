"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Pencil, Trash2, FolderEdit } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/category-actions";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;

    if (!name) {
      toast.error("Harap isi nama kategori.");
      return;
    }

    startTransition(async () => {
      const result = editingCategory
        ? await updateCategory(editingCategory.id, name)
        : await createCategory(name);

      if (result.success) {
        toast.success(editingCategory ? "Kategori Diperbarui" : "Kategori Dibuat");
        setIsOpen(false);
        setEditingCategory(null);
      } else {
        toast.error("Kesalahan", { description: result.error });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success("Kategori Dihapus");
      } else {
        toast.error("Kesalahan", { description: result.error });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2 font-heading">
          <FolderEdit className="size-5 text-primary" />
          Kategori Menu
        </h2>
        
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setEditingCategory(null);
        }}>
          <DialogTrigger
            render={
              <Button className="rounded-xl h-10 font-bold gap-2">
                <Plus className="size-4" />
                Tambah Kategori
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tighter font-heading">
                  {editingCategory ? "Ubah Kategori" : "Kategori Baru"}
                </DialogTitle>
                <DialogDescription className="font-medium text-muted-foreground">
                  Berikan nama untuk kategori menu baru Anda.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-8">
                <div className="grid gap-2">
                  <label htmlFor="name" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                    Nama Kategori
                  </label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCategory?.name}
                    placeholder="Contoh: Burger, Minuman"
                    className="rounded-xl h-12 bg-muted/50 border-none font-bold"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-lg shadow-primary/20 transition-all">
                  {isPending ? <Loader2 className="animate-spin" /> : editingCategory ? "Simpan Perubahan" : "Buat Kategori"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden ring-1 ring-black/5">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-none">
              <TableHead className="font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground pl-8">Nama Kategori</TableHead>
              <TableHead className="text-right pr-8 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} className="hover:bg-muted/10 transition-all h-16 border-muted/20">
                <TableCell className="font-black text-foreground pl-8">{category.name}</TableCell>
                <TableCell className="text-right pr-8 space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setEditingCategory(category);
                      setIsOpen(true);
                    }}
                    className="size-10 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    disabled={isPending}
                    onClick={() => handleDelete(category.id)}
                    className="size-10 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
