"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

export function ReportPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentMonth = Number(searchParams.get("month")) || new Date().getMonth() + 1;
  const currentYear = Number(searchParams.get("year")) || new Date().getFullYear();

  const handleUpdate = (type: "month" | "year", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 bg-surface-variant/20 p-1.5 rounded-2xl border border-outline/10">
      <div className="flex items-center gap-2 px-3 opacity-40">
        <Calendar className="size-4" />
      </div>
      
      <Select 
        value={String(currentMonth)} 
        onValueChange={(val) => handleUpdate("month", val)}
      >
        <SelectTrigger className="w-[140px] h-10 border-none bg-transparent font-black uppercase text-[10px] tracking-widest focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-outline/10">
          {MONTHS.map((m, i) => (
            <SelectItem key={i} value={String(i + 1)} className="text-[10px] font-black uppercase tracking-widest py-3 hover:bg-primary/5">
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-[1px] h-4 bg-outline/20 mx-1" />

      <Select 
        value={String(currentYear)} 
        onValueChange={(val) => handleUpdate("year", val)}
      >
        <SelectTrigger className="w-[100px] h-10 border-none bg-transparent font-black uppercase text-[10px] tracking-widest focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-outline/10">
          {YEARS.map(y => (
            <SelectItem key={y} value={String(y)} className="text-[10px] font-black uppercase tracking-widest py-3 hover:bg-primary/5">
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
