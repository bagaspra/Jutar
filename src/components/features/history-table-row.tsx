import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HistoryTableRowProps {
  id: string;
  date: string;
  time: string;
  itemsCount: number;
  total: string;
  status: "Completed" | "Refunded";
  orderType: "dine_in" | "take_away";
}

export function HistoryTableRow({
  id,
  date,
  time,
  itemsCount,
  total,
  status,
  orderType,
}: HistoryTableRowProps) {
  return (
    <tr className="group hover:bg-surface-container-low transition-colors">
      <td className="px-8 py-6">
        <span className="text-sm font-black font-headline text-on-surface uppercase tracking-tight italic">{id}</span>
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col">
          <span className="text-sm font-black text-on-surface uppercase tracking-widest">{date}</span>
          <span className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-[0.2em]">{time}</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <span className={cn(
             "material-symbols-outlined text-sm px-2 py-2 rounded-xl",
             orderType === "dine_in" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
          )}>
            {orderType === "dine_in" ? "restaurant" : "shopping_bag"}
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">
              {orderType === "dine_in" ? "Makan di Tempat" : "Bawa Pulang"}
            </span>
            <span className="text-[8px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
              {itemsCount} Menu
            </span>
          </div>
        </div>
      </td>
      <td className="px-8 py-6 text-right font-headline font-black text-lg text-primary tabular-nums tracking-tighter italic">
        {total}
      </td>
      <td className="px-8 py-6">
        <Badge variant={status === "Completed" ? "green" : "orange"} className="flex gap-2 items-center w-fit px-4 py-1.5 rounded-full shadow-sm">
          <span className={`w-1.5 h-1.5 rounded-full ${status === "Completed" ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"}`}></span>
          {status === "Completed" ? "Selesai" : "Dibatalkan"}
        </Badge>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center justify-center gap-3">
          <button className="w-9 h-9 rounded-xl bg-surface border border-outline/20 text-neutral-400 hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center active:scale-[0.9]">
            <span className="material-symbols-outlined text-sm">description</span>
          </button>
          <button className="w-9 h-9 rounded-xl bg-surface border border-outline/20 text-neutral-400 hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center active:scale-[0.9]">
            <span className="material-symbols-outlined text-sm">print</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
