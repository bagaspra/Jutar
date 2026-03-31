import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActiveOrderRowProps {
  itemName: string;
  price: string;
  pax: number;
  waitTime: string;
  status: "Plating" | "Preparing" | "Served";
  orderType: "dine_in" | "take_away";
  isPrimary?: boolean;
}

export function ActiveOrderRow({
  itemName,
  price,
  pax,
  waitTime,
  status,
  orderType,
  isPrimary = false,
}: ActiveOrderRowProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-outline/50 editorial-shadow flex items-center gap-6 transition-transform hover:scale-[1.01]">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center border transition-colors",
        isPrimary 
          ? "bg-primary/10 border-primary/20" 
          : "bg-surface-variant/30 border-outline/20"
      )}>
        <span className={cn(
          "material-symbols-outlined",
          isPrimary ? "text-primary material-symbols-fill" : "text-on-surface-variant/40"
        )}>
          {orderType === "dine_in" ? "restaurant" : "shopping_bag"}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black uppercase tracking-tight italic">{itemName}</h4>
            <span className={cn(
              "text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider",
              orderType === "dine_in" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
            )}>
              {orderType === "dine_in" ? "Dine In" : "Take Away"}
            </span>
          </div>
          <span className="text-sm font-black text-primary tabular-nums">{price}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs">group</span> {pax} pax
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs">schedule</span> {waitTime} wait
          </span>
        </div>
      </div>
      <div className="shrink-0">
        <Badge variant={status.toLowerCase() as any}>{status}</Badge>
      </div>
    </div>
  );
}
