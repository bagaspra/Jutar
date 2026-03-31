import { cn } from "@/lib/utils";

interface CategoryTabProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function CategoryTab({
  label,
  isActive = false,
  onClick,
}: CategoryTabProps) {
  if (isActive) {
    return (
      <button
        onClick={onClick}
        className="flex items-center justify-center px-8 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 shrink-0 transition-transform active:scale-95"
      >
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center px-8 py-3 bg-white border border-outline rounded-xl shrink-0 hover:border-primary/30 transition-all active:scale-95 group"
    >
      <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest group-hover:text-primary transition-colors">
        {label}
      </span>
    </button>
  );
}
