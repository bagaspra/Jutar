import { cn } from "@/lib/utils";

interface TopBarProps {
  className?: string;
}

export function TopBar({ className }: TopBarProps) {
  return (
    <header className={cn("flex justify-between items-center mb-2 sticky top-0 z-10 py-2", className)}>
      <div className="relative flex-1 group">
        <input
          className="w-full pl-6 pr-12 py-3.5 bg-surface-variant/40 border-none rounded-full text-sm placeholder-on-surface-variant/60 focus:ring-1 focus:ring-primary/20 transition-all group-hover:bg-surface-variant/60"
          placeholder="Search orders, tables, or stock..."
          type="text"
        />
        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-xl group-hover:text-primary transition-colors">
          search
        </span>
      </div>
    </header>
  );
}
