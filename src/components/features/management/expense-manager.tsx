"use client";

import { useEffect, useState, useTransition } from "react";
import { getExpenses, createExpense, deleteExpense, ExpenseCategory } from "@/actions/expense-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Trash2, ReceiptText, Banknote, Calendar } from "lucide-react";

const CATEGORIES: ExpenseCategory[] = ['Salary', 'Utilities', 'Maintenance', 'Marketing', 'Rent', 'Other'];
const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  'Salary': 'Gaji',
  'Utilities': 'Utilitas',
  'Maintenance': 'Pemeliharaan',
  'Marketing': 'Pemasaran',
  'Rent': 'Sewa',
  'Other': 'Lainnya'
};

export function ExpenseManager() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Other');
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = async () => {
    setIsLoading(true);
    const data = await getExpenses();
    setExpenses(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreate = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    startTransition(async () => {
      const result = await createExpense(date, category, parseFloat(amount), description);
      if (result.success) {
        toast.success(`Pengeluaran dicatat dalam kategori ${CATEGORY_LABELS[category]}`);
        setAmount("");
        setDescription("");
        fetchExpenses();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus catatan pengeluaran ini?")) return;
    startTransition(async () => {
      const result = await deleteExpense(id);
      if (result.success) {
        toast.success("Pengeluaran berhasil dihapus");
        fetchExpenses();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Expense Form (4/12) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="px-2">
           <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Catat Pengeluaran</h3>
           <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Catat pengeluaran operasional untuk pelaporan</p>
        </div>
        
        <div className="bg-white p-8 rounded-card shadow-xl border border-outline/10 space-y-6">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Tanggal Pengeluaran</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-primary opacity-40" />
                <input 
                   type="date" 
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                   className="w-full bg-surface-variant/10 border border-outline/5 rounded-xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Kategori</label>
              <select 
                 value={category}
                 onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                 className="w-full bg-surface-variant/10 border border-outline/5 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none transition-all"
              >
                 {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Jumlah (Nominal)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-primary opacity-40">Rp</span>
                <input 
                   type="number"
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                   placeholder="0.00"
                   className="w-full bg-primary/5 border-2 border-primary/10 rounded-xl pl-10 pr-4 py-3 text-sm font-black text-primary outline-none focus:border-primary transition-all shadow-inner"
                />
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Deskripsi / Catatan</label>
              <textarea 
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 placeholder="Untuk apa pengeluaran ini?"
                 rows={3}
                 className="w-full bg-surface-variant/10 border border-outline/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-1 focus:ring-primary/20 transition-all resize-none"
              />
           </div>
           
           <button 
              onClick={handleCreate}
              disabled={isPending || !amount}
              className={cn(
                 "w-full bg-primary text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all",
                 (isPending || !amount) && "opacity-50 grayscale"
              )}
           >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Simpan Pengeluaran
           </button>
        </div>
      </div>

      {/* Ledger View (8/12) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="px-2 flex justify-between items-end">
           <div>
              <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Buku Kas Operasional</h3>
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Riwayat kronologis pengeluaran operasional bisnis</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Total Pengeluaran Halaman Ini</p>
              <p className="text-xl font-black text-primary italic">Rp {expenses.reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()}</p>
           </div>
        </div>

        <div className="bg-white rounded-card shadow-xl border border-outline/10 overflow-hidden divide-y divide-outline/5">
           {isLoading ? (
             <div className="p-20 flex justify-center opacity-20"><Loader2 className="size-8 animate-spin" /></div>
           ) : expenses.length === 0 ? (
             <div className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Belum ada pengeluaran yang dicatat</div>
           ) : (
             <table className="w-full text-left">
                <thead className="bg-surface-variant/5">
                   <tr className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 border-b border-outline/5">
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Deskripsi</th>
                      <th className="px-6 py-4">Jumlah</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-outline/5">
                   {expenses.map((e) => (
                     <tr key={e.id} className="group hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                           <span className="text-[10px] font-black tabular-nums opacity-60 uppercase">{new Date(e.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </td>
                        <td className="px-6 py-5">
                           <span className="text-[10px] bg-primary/10 px-2 py-1 rounded text-primary font-black uppercase tracking-widest border border-primary/20">
                              {CATEGORY_LABELS[e.category as ExpenseCategory] || e.category}
                           </span>
                        </td>
                        <td className="px-6 py-5">
                            <span className="text-xs font-bold text-on-surface-variant line-clamp-1">{e.description || "-"}</span>
                        </td>
                        <td className="px-6 py-5">
                           <span className="text-sm font-black tabular-nums text-primary italic">Rp {Number(e.amount).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <button 
                             onClick={() => handleDelete(e.id)}
                             className="p-2 text-on-surface-variant/20 hover:text-red-500 transition-all rounded-lg"
                           >
                              <Trash2 className="size-4" />
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           )}
        </div>
      </div>
    </div>
  );
}
