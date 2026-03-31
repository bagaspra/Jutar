import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: 
    | "critical" 
    | "low" 
    | "orange" 
    | "blue" 
    | "green" 
    | "plating" 
    | "preparing" 
    | "served"
    | "outline"
    | "secondary";
  className?: string;
}

export function Badge({ children, variant = "low", className }: BadgeProps) {
  const variants = {
    critical: "bg-red-600 text-white",
    low: "bg-orange-500 text-white",
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    plating: "bg-orange-100 text-orange-600",
    preparing: "bg-blue-100 text-blue-600",
    served: "bg-green-100 text-green-600",
    outline: "border border-outline bg-transparent text-on-surface-variant",
    secondary: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter inline-flex items-center justify-center",
        variant !== "critical" && variant !== "low" && variant !== "outline" && variant !== "secondary"
          ? "px-3 py-1 rounded-full text-[9px] tracking-widest" 
          : "",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
