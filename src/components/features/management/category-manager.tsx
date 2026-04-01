"use client";

import { useEffect, useState, useTransition } from "react";
import { getCategories, createCategory, deleteCategory } from "@/actions/category-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    setIsLoading(true);
    const data = await getCategories();
    setCategories(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createCategory(name);
      if (result.success) {
        toast.success("Category created");
        setName("");
        fetchCategories();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure? Products in this category might prevent deletion.")) return;
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success("Category removed");
        fetchCategories();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Add Form (4/12) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="px-2">
           <h3 className="text-xl font-extrabold uppercase tracking-tight italic">New Category</h3>
           <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Classification for menu organization</p>
        </div>
        
        <div className="bg-white p-8 rounded-card shadow-xl border border-outline/10 space-y-6">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Name</label>
              <input 
                 type="text" 
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 placeholder="e.g., Beverages"
                 className="w-full bg-surface-variant/20 border border-outline/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/20 transition-all outline-none"
              />
           </div>
           
           <button 
              onClick={handleAdd}
              disabled={isPending || !name.trim()}
              className={cn(
                 "w-full bg-primary text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all",
                 (isPending || !name.trim()) && "opacity-50 grayscale"
              )}
           >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Create Category
           </button>
        </div>
      </div>

      {/* List (8/12) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="px-2">
           <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Catalog Structure</h3>
           <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Existing categories in database</p>
        </div>

        <div className="bg-white rounded-card shadow-xl border border-outline/10 overflow-hidden divide-y divide-outline/5">
           {isLoading ? (
             <div className="p-20 flex justify-center opacity-20"><Loader2 className="size-8 animate-spin" /></div>
           ) : categories.length === 0 ? (
             <div className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">No categories found</div>
           ) : (
             categories.map((cat) => (
               <div key={cat.id} className="flex items-center justify-between p-6 hover:bg-surface-variant/10 transition-colors group">
                  <div className="flex items-center gap-4">
                     <div className="w-2 h-2 rounded-full bg-primary shadow-sm" />
                     <div>
                        <p className="text-sm font-black uppercase tracking-tight italic">{cat.name}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">/{cat.slug}</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-on-surface-variant/20 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
