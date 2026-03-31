"use client";

import { useState } from "react";
import { MenuItem } from "@/types";
import { MENU_CATEGORIES, MenuCategory } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MenuGridProps {
  items: MenuItem[];
}

export function MenuGrid({ items }: MenuGridProps) {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>("burgers");
  const addItem = useCartStore((state) => state.addItem);

  const filteredItems = items.filter((item) => item.category === activeCategory);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Category Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl overflow-x-auto no-scrollbar">
        {MENU_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg transition-all whitespace-nowrap font-medium text-sm",
              activeCategory === cat.value
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "hover:bg-background/50 text-muted-foreground"
            )}
          >
            <span className="text-xl">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8 overflow-y-auto pr-2">
        {filteredItems.map((item) => (
          <Card 
            key={item.id} 
            className="group hover:shadow-xl transition-all duration-300 border-none bg-white/80 backdrop-blur-sm ring-1 ring-black/5 flex flex-col justify-between"
          >
            <CardContent className="pt-6 flex flex-col items-center gap-3">
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                {item.emoji}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-foreground text-sm line-clamp-1">{item.name}</h3>
                <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-none">
                  ${item.price.toFixed(2)}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="pb-4">
              <Button 
                onClick={() => addItem(item)}
                className="w-full rounded-lg h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
