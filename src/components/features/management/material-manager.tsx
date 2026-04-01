"use client";

import { useEffect, useState, useTransition } from "react";
import { getRawMaterials, createRawMaterial, deleteRawMaterial } from "@/actions/inventory-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Trash2, Database } from "lucide-react";

const UNITS = ["gram", "kg", "liter", "ml", "buah", "botol", "kaleng"];

export function MaterialManager() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("gram");
  const [minStock, setMinStock] = useState("0");
  const [unitCost, setUnitCost] = useState("0");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const fetchMaterials = async () => {
    setIsLoading(true);
    const data = await getRawMaterials();
    setMaterials(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createRawMaterial(name, unit, parseFloat(minStock), parseFloat(unitCost));
      if (result.success) {
        toast.success(`${name} telah terdaftar dalam sistem`);
        setName("");
        setMinStock("0");
        setUnitCost("0");
        fetchMaterials();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin? Penghapusan akan gagal jika bahan ini masih digunakan dalam resep produk manapun.")) return;
    startTransition(async () => {
      const result = await deleteRawMaterial(id);
      if (result.success) {
        toast.success("Catatan bahan berhasil dihapus");
        fetchMaterials();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Master Form (4/12) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="px-2">
           <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Definisi Bahan Baku</h3>
           <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Tetapkan standar bahan baru</p>
        </div>
        
        <div className="bg-white p-8 rounded-card shadow-xl border border-outline/10 space-y-8">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Nama Bahan Baku</label>
              <input 
                 type="text" 
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 placeholder="e.g., Wagyu Beef"
                 className="w-full bg-surface-variant/10 border border-outline/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/20 transition-all outline-none font-bold uppercase tracking-tight"
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Satuan</label>
                 <select 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-surface-variant/10 border border-outline/5 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none transition-all"
                 >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                 </select>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Batas Stok Minimum</label>
                 <input 
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full bg-surface-variant/10 border border-outline/5 rounded-xl px-4 py-3 text-sm font-black outline-none transition-all"
                 />
              </div>
           </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Harga Satuan (Harga Beli)</label>
              <input 
                 type="number"
                 value={unitCost}
                 onChange={(e) => setUnitCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-primary/5 border-2 border-primary/10 rounded-xl px-4 py-3 text-sm font-black text-primary outline-none focus:border-primary transition-all"
               />
               <p className="text-[10px] text-on-surface-variant/40 font-bold italic">Biaya standar per satuan untuk Laporan Laba Rugi</p>
            </div>
           
           <button 
              onClick={handleCreate}
              disabled={isPending || !name.trim()}
              className={cn(
                 "w-full bg-primary text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all",
                 (isPending || !name.trim()) && "opacity-50 grayscale"
              )}
            >
               {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
               Daftarkan Bahan Baku
            </button>
        </div>
      </div>

      {/* Database View (8/12) - PURE CATALOG */}
       <div className="lg:col-span-8 space-y-6">
        <div className="px-2">
           <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Katalog Bahan Baku</h3>
           <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Registri global untuk standar bahan baku</p>
        </div>

        <div className="bg-white rounded-card shadow-xl border border-outline/10 overflow-hidden divide-y divide-outline/5">
            {isLoading ? (
              <div className="p-20 flex justify-center opacity-20"><Loader2 className="size-8 animate-spin" /></div>
            ) : materials.length === 0 ? (
              <div className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Tidak ada bahan ditemukan</div>
            ) : (
             <table className="w-full text-left">
                 <thead className="bg-surface-variant/5">
                    <tr className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 border-b border-outline/5">
                       <th className="px-6 py-4">Nama Bahan</th>
                       <th className="px-6 py-4">Satuan Ukur</th>
                       <th className="px-6 py-4">Harga Satuan</th>
                       <th className="px-6 py-4">Batas Peringatan</th>
                       <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                 </thead>
                <tbody className="divide-y divide-outline/5">
                   {materials.map((m) => (
                     <tr key={m.id} className="group hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3">
                              <Database className="size-4 text-primary opacity-30 group-hover:opacity-100 transition-opacity" />
                              <span className="text-xs font-black uppercase tracking-tight italic">{m.name}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className="text-[10px] bg-surface-variant/50 px-2 py-1 rounded text-on-surface-variant font-black uppercase tracking-widest border border-outline/10">
                              {m.unit}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-black tabular-nums text-primary/80">Rp {Number(m.unit_cost || 0).toLocaleString()}</td>
                        <td className="px-6 py-5 text-sm font-black tabular-nums text-on-surface-variant/60">{m.low_stock_threshold}</td>
                        <td className="px-6 py-5 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                onClick={() => handleDelete(m.id)}
                                className="p-2 text-on-surface-variant/20 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                              >
                                 <Trash2 className="size-4" />
                              </button>
                           </div>
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
