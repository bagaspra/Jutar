import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  name: string;
  description: string;
  price: string;
  image: string;
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
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white rounded-card overflow-hidden transition-all hover:scale-[1.02] cursor-pointer group active:scale-95",
        className
      )}
    >
      <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-card">
        <img 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          src={image} 
        />
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
