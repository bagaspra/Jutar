"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { getInventoryStatus, adjustInventory } from "@/actions/inventory-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  ChevronRight,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  ShieldCheck
} from "lucide-react";

interface InventoryAdjusterProps {
  readOnly?: boolean;
}

export function InventoryAdjuster({ readOnly = false }: InventoryAdjusterProps) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [logType, setLogType] = useState<"restock" | "waste">("restock");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const data = await getInventoryStatus();
    setMaterials(data);
    if (data.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(data[0].id);
    }
    setIsLoading(false);
  }, [selectedMaterialId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = () => {
    if (!selectedMaterialId || !quantity) return;
    startTransition(async () => {
      const result = await adjustInventory(
        selectedMaterialId,
        logType,
        parseFloat(quantity),
        notes
      );
      if (result.success) {
        toast.success(`Inventory updated: ${result.materialName}`);
        setQuantity("");
        setNotes("");
        fetchData();
      } else {
        toast.error(result.error);
      }
    });
  };

  const getStatusBadge = (current: number, threshold: number) => {
    if (current <= threshold) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100 text-[8px] font-black uppercase tracking-widest animate-pulse">
          <TrendingDown className="size-2.5" />
          Critical
        </span>
      );
    }
    if (current <= threshold * 2) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-black uppercase tracking-widest">
          <AlertCircle className="size-2.5" />
          Low Stock
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase tracking-widest">
        <ShieldCheck className="size-2.5" />
        Safe
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[600px]">
      {/* 1. Adjustment Form (4/12) */}
      {!readOnly && (
        <div className="lg:col-span-4 space-y-6">
           <div className="px-2">
              <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Manual Calibration</h3>
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Record restocking movements or waste</p>
           </div>
           {/* ...rest of the form content is wrapped by the !readOnly condition... */}


        <div className="bg-white p-8 rounded-card shadow-xl border border-outline/10 space-y-8">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Movement Type</label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-surface-variant/10 rounded-2xl border border-outline/5">
                 <button 
                    onClick={() => setLogType("restock")}
                    className={cn(
                       "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                       logType === "restock" ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-on-surface-variant/40 hover:bg-white/50"
                    )}
                 >
                    <ArrowUpRight className="size-4" />
                    Restock
                 </button>
                 <button 
                    onClick={() => setLogType("waste")}
                    className={cn(
                       "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                       logType === "waste" ? "bg-white text-destructive shadow-xl ring-1 ring-black/5" : "text-on-surface-variant/40 hover:bg-white/50"
                    )}
                 >
                    <ArrowDownRight className="size-4" />
                    Waste
                 </button>
              </div>
           </div>

           <div className="space-y-4 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Select Material</label>
              <select 
                 value={selectedMaterialId}
                 onChange={(e) => setSelectedMaterialId(e.target.value)}
                 className="w-full bg-surface-variant/5 border border-outline/5 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none"
              >
                 {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Quantity Change</label>
              <div className="relative">
                 <input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-surface-variant/5 border border-outline/5 rounded-xl px-4 py-3 text-sm font-black outline-none tabular-nums"
                 />
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-on-surface-variant/40">
                    {materials.find(m => m.id === selectedMaterialId)?.unit}
                 </span>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Notes</label>
              <textarea 
                 value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 placeholder="Batch ID or reason for waste..."
                 className="w-full bg-surface-variant/5 border border-outline/5 rounded-xl px-4 py-3 text-xs font-bold outline-none min-h-[80px] resize-none"
              />
           </div>

           <button 
             onClick={handleSubmit}
             disabled={isPending || !selectedMaterialId || !quantity}
             className={cn(
                "w-full bg-primary text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all",
                (isPending || !selectedMaterialId || !quantity) && "opacity-50 grayscale"
             )}
           >
             {isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
             Sync Stocks
           </button>
        </div>
      </div>
      )}

      {/* 2. Inventory Dashboard (8/12) */}
      <div className={cn("space-y-6", readOnly ? "lg:col-span-12" : "lg:col-span-8")}>
        <div className="px-2 flex items-center justify-between">
           <div>
              <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Inventory Dashboard</h3>
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Live stock health and movement status</p>
           </div>
           <button 
             onClick={fetchData} 
             className="p-2 hover:bg-surface-variant/20 rounded-lg transition-colors"
           >
             <RefreshCw className={cn("size-4 text-on-surface-variant", isLoading && "animate-spin")} />
           </button>
        </div>

        <div className="bg-white rounded-card shadow-xl border border-outline/10 overflow-hidden divide-y divide-outline/5">
           {isLoading && !materials.length ? (
             <div className="p-20 flex justify-center opacity-20"><Loader2 className="size-8 animate-spin" /></div>
           ) : materials.length === 0 ? (
             <div className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">No inventory data available</div>
           ) : (
             <table className="w-full text-left">
                <thead className="bg-surface-variant/5">
                   <tr className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 border-b border-outline/5">
                      <th className="px-6 py-4">Ingredient</th>
                      <th className="px-6 py-4">Live Balance</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Last Movement</th>
                      <th className="px-6 py-4 text-right pr-10">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-outline/5">
                   {materials.map((m) => (
                     <tr key={m.id} className="group hover:bg-surface-variant/10 transition-all">
                        <td className="px-6 py-5">
                           <span className="text-xs font-black uppercase tracking-tight italic">{m.name}</span>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col">
                              <span className="text-sm font-black tabular-nums">{m.current_stock}</span>
                              <span className="text-[8px] font-bold text-on-surface-variant/60 uppercase tracking-widest">{m.unit}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           {getStatusBadge(Number(m.current_stock), Number(m.low_stock_threshold))}
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2 text-[9px] font-bold text-on-surface-variant/40 uppercase">
                              <History className="size-3" />
                              {m.latest_movement ? new Date(m.latest_movement).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : 'No Logs'}
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right pr-6">
                           {!readOnly && (
                             <button 
                               onClick={() => setSelectedMaterialId(m.id)}
                               className={cn(
                                 "flex items-center gap-1.5 ml-auto px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                 selectedMaterialId === m.id 
                                   ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                   : "bg-surface-variant/20 text-on-surface-variant hover:bg-surface-variant/40"
                               )}
                             >
                               Adjust
                               <ChevronRight className="size-3" />
                             </button>
                           )}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           )}
        </div>

        {/* Dashboard Legend */}
        <div className="grid grid-cols-3 gap-6 p-6 bg-surface-variant/5 rounded-3xl border border-outline/5">
           <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest">Safe</p>
                 <p className="text-[8px] font-bold text-on-surface-variant/60 truncate">Stock &gt; 2x Threshold</p>
              </div>
           </div>
           <div className="flex items-center gap-3 border-x border-outline/10 px-6">
              <div className="size-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest">Low</p>
                 <p className="text-[8px] font-bold text-on-surface-variant/60 truncate">Stock nearing threshold</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse" />
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest">Critical</p>
                 <p className="text-[8px] font-bold text-on-surface-variant/60 truncate">Stock below safe line</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
