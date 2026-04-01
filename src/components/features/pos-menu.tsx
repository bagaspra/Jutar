"use client";

import { useState, useMemo } from "react";
import { CategoryTab } from "@/components/features/category-tab";
import { MenuItemCard } from "@/components/features/menu-item-card";
import { MenuItem, Category } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/utils";

interface POSMenuProps {
  products: MenuItem[];
  categories: Category[];
}

export function POSMenu({ products, categories }: POSMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const addItem = useCartStore((state) => state.addItem);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);



  return (
    <>
      {/* Categories Section */}
      <section className="mb-4">
        <h2 className="text-sm font-black mb-2 uppercase tracking-widest opacity-60">Daftar Kategori</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          <CategoryTab 
            label="Semua Menu" 
            isActive={activeCategory === "all"} 
            onClick={() => setActiveCategory("all")}
          />
          {categories.map((cat) => (
            <CategoryTab 
              key={cat.id}
              label={cat.name} 
              isActive={activeCategory === cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
            />
          ))}
        </div>
      </section>

      {/* Menu Grid */}
      <section className="flex-1 overflow-y-auto no-scrollbar pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold uppercase tracking-tighter">
            {activeCategory === "all" ? "Paling Laris" : categories.find(c => c.slug === activeCategory)?.name}
          </h2>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{filteredProducts.length} Menu Ditemukan</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <MenuItemCard
              key={product.id}
              name={product.name}
              description={product.description || ""}
              price={formatCurrency(product.price)}
              image={product.image_url}
              onClick={() => addItem(product)}
            />
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-outline rounded-card opacity-30">
              <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
              <p className="text-xs font-bold uppercase tracking-widest">Tidak ada menu di kategori ini</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
