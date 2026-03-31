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
  emoji: string;
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
    const emoji = formData.get("emoji") as string;

    if (!name || !emoji) {
      toast.error("Please fill in both name and emoji.");
      return;
    }

    startTransition(async () => {
      const result = editingCategory
        ? await updateCategory(editingCategory.id, name, emoji)
        : await createCategory(name, emoji);

      if (result.success) {
        toast.success(editingCategory ? "Category Updated" : "Category Created");
        setIsOpen(false);
        setEditingCategory(null);
      } else {
        toast.error("Error", { description: result.error });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success("Category Deleted");
      } else {
        toast.error("Error", { description: result.error });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
          <FolderEdit className="size-5 text-primary" />
          Menu Categories
        </h2>
        
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setEditingCategory(null);
        }}>
          <DialogTrigger
            render={
              <Button className="rounded-xl h-10 font-bold gap-2">
                <Plus className="size-4" />
                Add Category
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tighter">
                  {editingCategory ? "Edit Category" : "New Category"}
                </DialogTitle>
                <DialogDescription className="font-medium text-muted-foreground">
                  Give your menu category a name and a fresh emoji.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-8">
                <div className="grid gap-2">
                  <label htmlFor="name" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                    Category Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCategory?.name}
                    placeholder="e.g. Burgers, Drinks"
                    className="rounded-xl h-12 bg-muted/50 border-none font-bold"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="emoji" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                    Category Emoji
                  </label>
                  <Input
                    id="emoji"
                    name="emoji"
                    defaultValue={editingCategory?.emoji}
                    placeholder="e.g. 🍔, 🥤"
                    maxLength={2}
                    className="rounded-xl h-12 bg-muted/50 border-none font-bold"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-lg shadow-primary/20 transition-all">
                  {isPending ? <Loader2 className="animate-spin" /> : editingCategory ? "Save Changes" : "Create Category"}
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
              <TableHead className="w-16 text-center pl-8">Icon</TableHead>
              <TableHead className="font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Category Name</TableHead>
              <TableHead className="text-right pr-8 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} className="hover:bg-muted/10 transition-all h-16 border-muted/20">
                <TableCell className="text-center text-3xl pl-8">{category.emoji}</TableCell>
                <TableCell className="font-black text-foreground">{category.name}</TableCell>
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
