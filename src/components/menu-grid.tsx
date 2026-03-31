"use client";

import { useState } from "react";
import { MenuItem, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";

interface MenuGridProps {
  items: MenuItem[];
  categories: Category[];
}

export function MenuGrid({ items, categories }: MenuGridProps) {
  // Default to the first category if it exists, otherwise empty
  const [activeTab, setActiveTab] = useState<string>(categories[0]?.slug || "");
  const { addItem } = useCartStore();

  const filteredItems = items.filter((item) => item.category === activeTab);

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth p-1">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant="ghost"
            onClick={() => setActiveTab(cat.slug)}
            className={cn(
              "h-12 rounded-xl px-6 font-bold transition-all whitespace-nowrap",
              activeTab === cat.slug
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            )}
          >
            <span className="mr-2 text-xl">{cat.emoji}</span>
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <ScrollArea className="flex-1 pr-4">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 mt-20">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-lg font-bold">No items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="group relative flex flex-col bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-black/5 active:scale-95 text-left"
              >
                <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition-transform duration-500 bg-linear-to-br from-muted to-muted/30">
                  {item.emoji}
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1 truncate pr-4">
                  {item.name}
                </h3>
                <p className="text-primary font-black text-base mt-auto">
                  ${item.price.toFixed(2)}
                </p>
                <div className="absolute top-3 right-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="size-6 bg-primary text-white rounded-lg flex items-center justify-center">
                    +
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
