"use client";

import { useState, useTransition } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { saveEquityTransaction, deleteEquityTransaction } from "@/actions/equity-actions";
import { toast } from "sonner";
import { 
  Plus, 
  Minus, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Scale 
} from "lucide-react";

interface EquityDashboardProps {
  data: {
    beginningEquity: number;
    netProfit: number;
    newInvestments: number;
    ownerWithdrawals: number;
    endingEquity: number;
    ledger: any[];
  };
  month: number;
  year: number;
}

export function EquityDashboard({ data, month, year }: EquityDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [type, setType] = useState<"INVESTMENT" | "WITHDRAWAL">("INVESTMENT");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error("Jumlah harus valid");

    startTransition(async () => {
      const res = await saveEquityTransaction({
        transaction_date: new Date(year, month - 1, 1).toISOString().split('T')[0],
        type,
        amount: Number(amount),
        description
      });

      if (res.success) {
        toast.success("Transaksi ekuitas berhasil dicatat");
        setAmount("");
        setDescription("");
        setShowForm(false);
      } else {
        toast.error(res.error || "Gagal mencatat transaksi");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    
    startTransition(async () => {
      const res = await deleteEquityTransaction(id);
      if (res.success) toast.success("Transaksi dihapus");
      else toast.error("Gagal menghapus");
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Mathematical Flow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Reconciliation Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-outline/20 p-8 editorial-shadow relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
              <Scale className="size-48" />
           </div>
           
           <div className="mb-10">
              <h3 className="text-xl font-extrabold font-headline italic uppercase">Rekonsiliasi Modal</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-1">Alur perubahan ekuitas periode berjalan</p>
           </div>

           <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center group">
                 <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 group-hover:text-primary transition-colors">Modal Awal (1/{month}/{year})</span>
                 <span className="font-black italic text-lg">{formatCurrency(data.beginningEquity)}</span>
              </div>

              <div className="flex justify-between items-center group">
                 <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">(+)</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 group-hover:text-primary transition-colors">Laba Bersih Periode Ini</span>
                 </div>
                 <span className="font-black italic text-lg text-emerald-600">{formatCurrency(data.netProfit)}</span>
              </div>

              <div className="flex justify-between items-center group">
                 <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">(+)</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 group-hover:text-primary transition-colors">Tambahan Modal Disetor</span>
                 </div>
                 <span className="font-black italic text-lg text-blue-600">{formatCurrency(data.newInvestments)}</span>
              </div>

              <div className="flex justify-between items-center group">
                 <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">(-)</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 group-hover:text-primary transition-colors">Penarikan Pemilik (Prive)</span>
                 </div>
                 <span className="font-black italic text-lg text-rose-600">({formatCurrency(data.ownerWithdrawals)})</span>
              </div>

              <div className="pt-8 border-t-2 border-dashed border-outline/20">
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Saldo Akhir</p>
                       <h4 className="text-xs font-black uppercase tracking-widest mt-1 opacity-40">Modal Akhir ({new Date(year, month, 0).toLocaleDateString('id-ID')})</h4>
                    </div>
                    <span className="text-4xl font-black italic tracking-tighter text-primary">
                       {formatCurrency(data.endingEquity)}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Summary StatCards */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <StatCard 
              label="Kesehatan Ekuitas"
              value={data.endingEquity > 0 ? "SURPLUS" : "DEFISIT"}
              subValue="Status modal bersih saat ini"
              icon="account_balance"
              variant={data.endingEquity > 0 ? "emerald" : "red"}
              className="flex-1"
           />
           <div className="bg-primary p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Scale className="size-40" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Peringatan Likuiditas</h4>
              <p className="text-lg font-black italic leading-tight">
                 {data.endingEquity < data.netProfit 
                   ? "Perhatian: Prive atau pengeluaran modal melebihi laba bersih bulan ini." 
                   : "Struktur modal saat ini dalam kondisi stabil untuk ekspansi."}
              </p>
           </div>
        </div>
      </div>

      {/* Action & Ledger Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Record Transaction Form */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-3xl border border-outline/20 p-8 editorial-shadow">
              <h4 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Plus className="size-3 text-primary" /> 
                 Catat Mutasi Modal
              </h4>
              
              <form onSubmit={handleSave} className="space-y-4">
                 <div className="flex gap-2 p-1 bg-surface-variant/20 rounded-xl border border-outline/10">
                    <button 
                      type="button"
                      onClick={() => setType("INVESTMENT")}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        type === "INVESTMENT" ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-on-surface-variant/40"
                      )}
                    >Tambah Modal</button>
                    <button 
                      type="button"
                      onClick={() => setType("WITHDRAWAL")}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        type === "WITHDRAWAL" ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-on-surface-variant/40"
                      )}
                    >Prive (Ambil)</button>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 ml-2">Jumlah (Rp)</label>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Contoh: 5000000"
                      className="w-full h-12 bg-surface-variant/30 border-2 border-outline/10 rounded-xl px-4 font-black italic focus:border-primary outline-none transition-all placeholder:text-neutral-300"
                    />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 ml-2">Deskripsi</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Misal: Investasi awal dari pemilik"
                      className="w-full h-24 bg-surface-variant/30 border-2 border-outline/10 rounded-xl p-4 font-bold text-xs focus:border-primary outline-none transition-all placeholder:text-neutral-300"
                    />
                 </div>

                 <button 
                   disabled={isPending}
                   className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : "Simpan Transaksi"}
                 </button>
              </form>
           </div>
        </div>

        {/* Ledger Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-outline/20 overflow-hidden editorial-shadow flex flex-col">
           <div className="px-8 py-6 border-b border-outline/5 bg-surface-variant/5">
              <h3 className="text-xl font-extrabold font-headline italic uppercase">Buku Besar Modal</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-1">Audit mutasi ekuitas secara kronologis</p>
           </div>
           <div className="flex-1 overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                 <thead className="bg-surface-variant/5 border-b border-outline/5">
                    <tr className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50">
                       <th className="px-8 py-5">Tanggal</th>
                       <th className="px-8 py-5">Deskripsi</th>
                       <th className="px-8 py-5 text-right">Mutasi Dana</th>
                       <th className="px-8 py-5 text-right w-10">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-outline/5">
                    {data.ledger.length === 0 ? (
                       <tr>
                          <td colSpan={4} className="px-8 py-20 text-center opacity-30 font-black uppercase tracking-widest text-[10px]">Belum ada mutasi modal untuk periode ini</td>
                       </tr>
                    ) : (
                       data.ledger.map((tx: any) => (
                          <tr key={tx.id} className="group hover:bg-neutral-50 transition-colors">
                             <td className="px-8 py-6">
                                <span className="text-xs font-black italic">{new Date(tx.transaction_date).toLocaleDateString('id-ID')}</span>
                             </td>
                             <td className="px-8 py-6">
                                <p className="text-xs font-black italic uppercase tracking-tight text-on-surface group-hover:text-primary transition-colors">{tx.description || "-"}</p>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">{tx.type}</span>
                             </td>
                             <td className={cn(
                                "px-8 py-6 text-right font-black italic text-sm tabular-nums",
                                tx.type === "INVESTMENT" ? "text-emerald-600" : "text-rose-600"
                             )}>
                                <div className="flex items-center justify-end gap-2 text-xs">
                                   {tx.type === "INVESTMENT" ? <ArrowUpCircle className="size-3" /> : <ArrowDownCircle className="size-3" />}
                                   {tx.type === "INVESTMENT" ? "+" : "-"} {formatCurrency(Number(tx.amount))}
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <button 
                                  onClick={() => handleDelete(tx.id)}
                                  className="p-2 text-on-surface-variant/20 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                   <Trash2 className="size-3.5" />
                                </button>
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
