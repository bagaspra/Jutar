"use client";

import { useEffect, useState, useTransition } from "react";
import { getPaymentMethods, createPaymentMethod, deletePaymentMethod, togglePaymentMethodStatus } from "@/actions/payment-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Trash2, CreditCard, Banknote, SwitchCamera } from "lucide-react";

export function PaymentMethodManager() {
  const [methods, setMethods] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<'cash' | 'digital'>("cash");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const fetchMethods = async () => {
    setIsLoading(true);
    const data = await getPaymentMethods();
    setMethods(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleAdd = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createPaymentMethod(name, type);
      if (result.success) {
        toast.success("Payment method added");
        setName("");
        fetchMethods();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await togglePaymentMethodStatus(id, currentStatus);
      if (result.success) {
        fetchMethods();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure? This will fail if orders already use this method.")) return;
    startTransition(async () => {
      const result = await deletePaymentMethod(id);
      if (result.success) {
        toast.success("Method deleted");
        fetchMethods();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Add Form (4/12) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="px-2">
           <h3 className="text-xl font-extrabold uppercase tracking-tight italic">New Payment Gateway</h3>
           <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Enable diverse transaction channels</p>
        </div>
        
        <div className="bg-white p-8 rounded-card shadow-xl border border-outline/10 space-y-8">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Gateway Name</label>
              <input 
                 type="text" 
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 placeholder="e.g., QRIS, Debit Card"
                 className="w-full bg-surface-variant/10 border border-outline/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/20 transition-all outline-none"
              />
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Accounting Type</label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-surface-variant/10 rounded-2xl border border-outline/5">
                 <button 
                    onClick={() => setType("cash")}
                    className={cn(
                       "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                       type === "cash" ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-on-surface-variant/40 hover:text-on-surface hover:bg-white/50"
                    )}
                 >
                    <Banknote className="size-4" />
                    Cash
                 </button>
                 <button 
                    onClick={() => setType("digital")}
                    className={cn(
                       "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                       type === "digital" ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-on-surface-variant/40 hover:text-on-surface hover:bg-white/50"
                    )}
                 >
                    <CreditCard className="size-4" />
                    Digital
                 </button>
              </div>
           </div>
           
           <button 
              onClick={handleAdd}
              disabled={isPending || !name.trim()}
              className={cn(
                 "w-full bg-primary text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all",
                 (isPending || !name.trim()) && "opacity-50 grayscale"
              )}
           >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Deploy Gateway
           </button>
        </div>
      </div>

      {/* List (8/12) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="px-2">
           <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Active Gateways</h3>
           <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Transactional infrastructure currently in POS</p>
        </div>

        <div className="bg-white rounded-card shadow-xl border border-outline/10 overflow-hidden divide-y divide-outline/5">
           {isLoading ? (
             <div className="p-20 flex justify-center opacity-20"><Loader2 className="size-8 animate-spin" /></div>
           ) : methods.length === 0 ? (
             <div className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">No payment methods configured</div>
           ) : (
             methods.map((method) => (
               <div key={method.id} className="flex items-center justify-between p-6 hover:bg-surface-variant/10 transition-colors group">
                  <div className="flex items-center gap-6">
                     <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                        method.type === 'cash' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600",
                        !method.is_active && "grayscale opacity-50"
                     )}>
                        {method.type === 'cash' ? <Banknote className="size-6" /> : <CreditCard className="size-6" />}
                     </div>
                     <div>
                        <p className={cn(
                           "text-sm font-black uppercase tracking-tight italic",
                           !method.is_active && "line-through text-on-surface-variant/40"
                        )}>{method.name}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">{method.type} revenue tracking</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={() => handleToggle(method.id, method.is_active)}
                       className={cn(
                         "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                         method.is_active ? "bg-emerald-100 text-emerald-700" : "bg-surface-variant/20 text-on-surface-variant"
                       )}
                     >
                       <SwitchCamera className="size-3" />
                       {method.is_active ? "Active" : "Disabled"}
                     </button>
                     <button 
                       onClick={() => handleDelete(method.id)}
                       className="p-2 text-on-surface-variant/20 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg opacity-0 group-hover:opacity-100"
                     >
                       <Trash2 className="size-4" />
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
