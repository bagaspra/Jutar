import { Badge } from "./badge";

interface LowStockAlertProps {
  name: string;
  category: string;
  level: "CRITICAL" | "LOW";
  amountLeft: string;
  minAmount: string;
  percentage: number;
  image: string;
}

export function LowStockAlert({
  name,
  category,
  level,
  amountLeft,
  minAmount,
  percentage,
  image,
}: LowStockAlertProps) {
  return (
    <div className="p-5 flex items-center gap-4 border-b border-outline/30">
      <img alt={name} className="w-14 h-14 rounded-xl object-cover shrink-0" src={image} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <div className="truncate">
            <h5 className="text-sm font-extrabold truncate">{name}</h5>
            <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">{category}</p>
          </div>
          <Badge variant={level === "CRITICAL" ? "critical" : "low"}>{level}</Badge>
        </div>
        <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
          <div 
            className={`h-full ${level === "CRITICAL" ? "bg-red-600" : "bg-orange-500"}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1.5">
          <span className={`text-[10px] font-extrabold ${level === "CRITICAL" ? "text-red-600" : "text-orange-600"}`}>
            {amountLeft} left
          </span>
          <span className="text-[10px] text-on-surface-variant font-medium">Min: {minAmount}</span>
        </div>
      </div>
    </div>
  );
}
