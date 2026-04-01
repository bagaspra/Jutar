import { cn } from "@/lib/utils";
import { UtensilsCrossed } from "lucide-react";
import { useState } from "react";

interface MenuItemCardProps {
  name: string;
  description: string;
  price: string;
  image?: string | null;
  onClick?: () => void;
  className?: string;
}

export function MenuItemCard({
  name,
  description,
  price,
  image,
  onClick,
  className,
}: MenuItemCardProps) {
  const [imageError, setImageError] = useState(false);
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white rounded-card overflow-hidden transition-all hover:scale-[1.02] cursor-pointer group active:scale-95",
        className
      )}
    >
      <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-card bg-surface-variant/5 border border-outline/5 flex items-center justify-center">
        {image && !imageError ? (
          <img 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            src={image} 
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
            <UtensilsCrossed className="size-10" />
            <span className="text-[8px] font-black uppercase tracking-widest">JuRasa Pos</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
      </div>
      <div className="space-y-1.5 px-1">
        <h3 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-[10px] text-on-surface-variant line-clamp-2 leading-relaxed">{description}</p>
        <p className="text-primary font-bold text-base mt-2">{price}</p>
      </div>
    </div>
  );
}
