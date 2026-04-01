import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue: string;
  icon: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  variant?: "red" | "orange" | "blue" | "emerald";
  showLeftBorder?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  icon,
  trend,
  variant = "red",
  showLeftBorder = false,
  className,
}: StatCardProps) {
  const iconBgColors = {
    red: "bg-red-50 text-error",
    orange: "bg-orange-50 text-orange-500",
    blue: "bg-blue-50 text-blue-500",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  const iconTextColors: Record<string, string> = {
    red: "text-primary",
    orange: "text-orange-500",
    blue: "text-blue-500",
    emerald: "text-emerald-600",
  };

  return (
    <div className={cn(
      "bg-white p-6 rounded-card editorial-shadow border border-outline/50 relative overflow-hidden group",
      className
    )}>
      {showLeftBorder && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          variant === "red" ? "bg-red-50" : variant === "orange" ? "bg-orange-50" : variant === "emerald" ? "bg-emerald-50" : "bg-blue-50",
          iconTextColors[variant]
        )}>
          <span className="material-symbols-outlined material-symbols-fill">{icon}</span>
        </div>
        {trend && (
          <span className={cn(
            "flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full",
            trend.isUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
          )}>
            <span className="material-symbols-outlined text-sm mr-0.5">
              {trend.isUp ? "trending_up" : "trending_down"}
            </span>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider">{label}</p>
      <h2 className="text-2xl font-extrabold mt-1">{value}</h2>
      <p className="text-[10px] text-on-surface-variant mt-2 font-medium">{subValue}</p>
    </div>
  );
}
