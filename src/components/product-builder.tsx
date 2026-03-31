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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, Utensils, Beaker } from "lucide-react";
import { createProductWithRecipe } from "@/actions/menu-actions";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  emoji: string;
}

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
}

interface ProductBuilderProps {
  categories: Category[];
  materials: RawMaterial[];
}

interface RecipeItem {
  raw_material_id: string;
  quantity_required: number;
}

export function ProductBuilder({ categories, materials }: ProductBuilderProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);

  const addRecipeItem = () => {
    setRecipeItems([...recipeItems, { raw_material_id: "", quantity_required: 1 }]);
  };

  const removeRecipeItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const updateRecipeItem = (index: number, field: keyof RecipeItem, value: any) => {
    const updated = [...recipeItems];
    updated[index] = { ...updated[index], [field]: value };
    setRecipeItems(updated);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const productData = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      category_id: formData.get("category_id") as string,
      emoji: formData.get("emoji") as string,
    };

    if (!productData.name || !productData.category_id || !productData.emoji) {
      toast.error("Please fill in all required product fields.");
      return;
    }

    // Validate recipe items
    const validRecipeItems = recipeItems.filter(item => item.raw_material_id !== "");

    startTransition(async () => {
      const result = await createProductWithRecipe(productData, validRecipeItems);
      if (result.success) {
        toast.success("Product Created Successfully!");
        setIsOpen(false);
        setRecipeItems([]);
      } else {
        toast.error("Error", { description: result.error });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button className="rounded-xl h-12 font-black gap-2 shadow-xl shadow-primary/20 scale-105 active:scale-95 transition-all">
            <Utensils className="size-5" />
            Add New Product
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          <div className="p-8 bg-primary/5 border-b border-primary/10">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-3xl font-black tracking-tighter">Product Builder</DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                Craft a new menu item with optional inventory tracking.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Core Details */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Name</Label>
                <Input name="name" placeholder="e.g. Double Cheeseburger" required className="rounded-2xl h-12 bg-muted/50 border-none font-bold" />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price ($)</Label>
                <Input name="price" type="number" step="0.01" placeholder="9.99" required className="rounded-2xl h-12 bg-muted/50 border-none font-bold" />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                <Select name="category_id" required>
                  <SelectTrigger className="rounded-2xl h-12 bg-muted/50 border-none font-bold">
                    <SelectValue placeholder="Select Tab..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-[1.5rem] border-none shadow-2xl">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="font-bold py-3">
                        {c.emoji} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Icon / Emoji</Label>
                <Input name="emoji" placeholder="🍔" maxLength={2} required className="rounded-2xl h-12 bg-muted/50 border-none font-bold text-center text-xl" />
              </div>
            </div>

            {/* Recipe Builder */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-muted pb-4">
                <div className="flex items-center gap-3">
                  <Beaker className="size-5 text-primary" />
                  <h3 className="font-black text-lg tracking-tight">Inventory Recipe</h3>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addRecipeItem}
                  className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold"
                >
                  <Plus className="size-4 mr-1" /> Add Ingredient
                </Button>
              </div>

              {recipeItems.length === 0 ? (
                <div className="py-8 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
                  <p className="text-sm font-bold text-muted-foreground">Standalone Product</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-1">No ingredients mapped</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recipeItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 animate-in slide-in-from-top duration-300">
                      <div className="flex-1">
                        <Select 
                          value={item.raw_material_id} 
                          onValueChange={(val) => updateRecipeItem(index, "raw_material_id", val)}
                        >
                          <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-none font-medium">
                            <SelectValue placeholder="Ingredient..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-xl">
                            {materials.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.name} ({m.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Input 
                          type="number" 
                          step="0.01" 
                          value={item.quantity_required}
                          onChange={(e) => updateRecipeItem(index, "quantity_required", Number(e.target.value))}
                          className="rounded-xl h-12 bg-muted/50 border-none font-bold tabular-nums"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeRecipeItem(index)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-8 bg-muted/30">
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isPending} 
                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                {isPending ? <Loader2 className="animate-spin size-6" /> : "Finalize & Add Product"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
