"use client";

import { useEffect, useState, useTransition } from "react";
import { getPendingShiftSummary, submitShiftCloseout } from "@/actions/shift-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, Calculator, Receipt, CircleDollarSign, CheckCircle, Printer } from "lucide-react";
import { ZReportPrint } from "./z-report-print";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface ShiftCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShiftCloseModal({ isOpen, onClose }: ShiftCloseModalProps) {
  const [summary, setSummary] = useState<any>(null);
  const [startingCash, setStartingCash] = useState("");
  const [actualCash, setActualCash] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchSummary = async () => {
    setIsLoading(true);
    const result = await getPendingShiftSummary();
    if (result.success) setSummary(result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
      setIsSuccess(false);
      setActualCash("");
      setNotes("");
    }
  }, [isOpen]);

  const expectedCash = (summary?.totalCashSales || 0) + (parseFloat(startingCash) || 0);
  const difference = (parseFloat(actualCash) || 0) - expectedCash;

  const handleCloseout = () => {
    if (!actualCash) {
       toast.error("Mohon masukkan jumlah kas fisik");
       return;
    }

    startTransition(async () => {
      const result = await submitShiftCloseout(
        parseFloat(startingCash),
        expectedCash,
        parseFloat(actualCash),
        summary?.totalDigitalSales || 0,
        notes
      );

      if (result.success) {
        setIsSuccess(true);
        toast.success("Shift berhasil ditutup dan direkonsiliasi");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isSuccess && summary) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px] border-none shadow-2xl overflow-hidden p-0">
           <div className="bg-primary p-8 text-center text-white space-y-4">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                 <CheckCircle className="size-10" />
              </div>
              <h2 className="text-2xl font-black italic uppercase italic">Kasir Ditutup</h2>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Sesi Shift Berakhir</p>
           </div>
           
            <ZReportPrint 
               data={{
                  closedAt: new Date(),
                  startingCash: parseFloat(startingCash) || 0,
                  expectedCash: expectedCash,
                  actualCash: parseFloat(actualCash) || 0,
                  totalDigital: summary.totalDigitalSales || 0,
                  difference: difference
               }}
            />

           <div className="p-8 bg-surface-variant/10 flex gap-3 print:hidden">
              <button 
                onClick={handlePrint}
                className="flex-1 bg-on-surface text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                 <Printer className="size-4" />
                 Cetak Z-Report
              </button>
              <button 
                onClick={onClose}
                className="flex-1 bg-primary text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                 Selesai
              </button>
           </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-on-surface text-white space-y-1">
          <DialogTitle className="text-2xl font-black italic uppercase flex items-center gap-3">
             <Calculator className="size-6 text-primary" />
             Selesai Shift
          </DialogTitle>
          <DialogDescription className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            Rekonsiliasi logika kas laci fisik
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-8 bg-white">
           {isLoading ? (
             <div className="p-10 flex justify-center opacity-10"><Loader2 className="size-10 animate-spin" /></div>
           ) : (
             <>
               {/* Quick Summary Grid */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                     <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-1">Total Pesanan</p>
                     <p className="text-xl font-black italic">{summary?.totalOrders || 0}</p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                     <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-1">Penjualan Digital</p>
                     <p className="text-xl font-black italic">Rp {summary?.totalDigitalSales.toLocaleString() || 0}</p>
                  </div>
               </div>

               {/* Inputs */}
               <div className="space-y-6">
                 <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Modal Awal (Kas Awal)</label>
                   <div className="relative">
                      <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant/20" />
                      <input 
                         type="number"
                         value={startingCash}
                         onChange={(e) => setStartingCash(e.target.value)}
                         onFocus={(e) => e.target.select()}
                         className="w-full bg-surface-variant/10 border border-outline/5 rounded-xl pl-12 pr-4 py-3 text-sm font-black outline-none focus:ring-1 focus:ring-on-surface/10 transition-all shadow-inner"
                         placeholder="0.00"
                      />
                   </div>
                 </div>

                 <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Kas Aktual dalam Laci</label>
                      <span className="text-[10px] font-black text-primary uppercase italic">Ekspektasi: Rp {expectedCash.toLocaleString()}</span>
                   </div>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-primary opacity-40">Rp</span>
                      <input 
                         type="number"
                         value={actualCash}
                         onChange={(e) => setActualCash(e.target.value)}
                         onFocus={(e) => e.target.select()}
                         className="w-full bg-primary/5 border-2 border-primary/10 rounded-xl pl-10 pr-4 py-4 text-lg font-black text-primary outline-none focus:border-primary transition-all shadow-inner"
                         placeholder="0.00"
                         autoFocus
                      />
                   </div>
                   {actualCash && difference !== 0 && (
                      <div className={cn(
                        "p-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-center border-t-2 border-b-2",
                        difference < 0 ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"
                      )}>
                         Selisih: Rp {difference.toLocaleString()}
                      </div>
                   )}
                 </div>

                 <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Penjelasan / Catatan</label>
                   <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={difference !== 0 ? "Kenapa ada selisih?" : "Catatan opsional..."}
                      className="w-full bg-surface-variant/10 border border-outline/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-1 focus:ring-on-surface/10 transition-all resize-none"
                      rows={2}
                   />
                 </div>
               </div>
             </>
           )}
        </div>

        <DialogFooter className="p-8 pt-0 bg-white">
           <button 
              onClick={handleCloseout}
              disabled={isPending || !actualCash}
              className={cn(
                 "w-full bg-primary text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 active:scale-[0.98] transition-all",
                 (isPending || !actualCash) && "opacity-50 grayscale"
              )}
           >
              {isPending ? <Loader2 className="size-5 animate-spin" /> : <Receipt className="size-5" />}
              Rekonsiliasi & Tutup Kasir
           </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
