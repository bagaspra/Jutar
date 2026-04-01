"use client";

import { formatCurrency, cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Landmark, Package, TrendingUp, Minus, Building2 } from "lucide-react";

interface BalanceSheetDashboardProps {
  data: {
    kasBank: number;
    persediaan: number;
    inventoryBreakdown: { name: string; stock: number; unitCost: number; value: number }[];
    totalAset: number;
    endingEquity: number;
    utangUsaha: number;
    totalKewajibanDanModal: number;
    isBalanced: boolean;
    hasIntegrityWarning: boolean;
  };
  month: number;
  year: number;
}

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function LedgerRow({
  label,
  value,
  sublabel,
  indent = false,
  bold = false,
  border = false,
  valueColor,
}: {
  label: string;
  value: number;
  sublabel?: string;
  indent?: boolean;
  bold?: boolean;
  border?: boolean;
  valueColor?: string;
}) {
  return (
    <div className={cn(
      "flex justify-between items-start py-3 gap-4",
      border && "border-t border-dashed border-outline/20 mt-1",
    )}>
      <div className={cn("flex flex-col", indent && "pl-4 border-l-2 border-outline/10")}>
        <span className={cn(
          "text-[10px] uppercase tracking-widest font-black",
          bold ? "text-on-surface" : "text-on-surface-variant/60"
        )}>
          {label}
        </span>
        {sublabel && (
          <span className="text-[8px] uppercase tracking-wider font-bold text-on-surface-variant/30 mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
      <span className={cn(
        "text-sm font-black italic tabular-nums shrink-0",
        bold ? "text-on-surface" : "text-on-surface-variant/70",
        valueColor
      )}>
        {formatCurrency(Math.abs(value))}
        {value < 0 && <span className="text-[9px] text-rose-500 ml-1">(–)</span>}
      </span>
    </div>
  );
}

function TotalRow({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className={cn(
      "flex justify-between items-center py-4 px-6 rounded-2xl mt-4",
      color || "bg-on-surface text-white"
    )}>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      <span className="text-base font-black italic tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}

export function BalanceSheetDashboard({ data, month, year }: BalanceSheetDashboardProps) {
  const {
    kasBank, persediaan, inventoryBreakdown, totalAset,
    endingEquity, utangUsaha, totalKewajibanDanModal,
    isBalanced, hasIntegrityWarning,
  } = data;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">
            Posisi per Akhir {monthNames[month - 1]} {year}
          </p>
          <h3 className="text-2xl font-black italic uppercase mt-1">Laporan Neraca</h3>
        </div>

        {/* Balance Indicator */}
        {hasIntegrityWarning ? (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 px-5 py-3 rounded-2xl shadow-sm">
            <AlertTriangle className="size-4 shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Peringatan Integritas</p>
              <p className="text-[8px] font-bold opacity-70 mt-0.5">Ekuitas melebihi total aset</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-2xl shadow-sm">
            <CheckCircle2 className="size-4 shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Neraca Seimbang</p>
              <p className="text-[8px] font-bold opacity-70 mt-0.5">Aset = Kewajiban + Modal</p>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Balance Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ─── LEFT: ASET ─── */}
        <div className="bg-white rounded-3xl border border-outline/20 overflow-hidden shadow-xl">
          <div className="bg-on-surface px-8 py-6 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <Building2 className="size-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black italic uppercase text-white">Aset</h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Sumber Daya yang Dimiliki</p>
            </div>
          </div>

          <div className="px-8 py-6 space-y-1">
            {/* Aset Lancar */}
            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30 mb-4">
              Aset Lancar
            </p>

            <LedgerRow
              label="Kas & Bank"
              sublabel="Kas tunai kumulatif hingga akhir bulan ini"
              value={kasBank}
              indent
              valueColor={kasBank < 0 ? "text-rose-600" : undefined}
            />

            <LedgerRow
              label="Persediaan Bahan Baku"
              sublabel="Nilai stok saat ini × biaya satuan"
              value={persediaan}
              indent
            />

            {/* Inventory Breakdown (collapsed sub-rows) */}
            {inventoryBreakdown.length > 0 && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-outline/5 pl-4 pb-2">
                {inventoryBreakdown.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-[8px] uppercase tracking-widest font-bold text-on-surface-variant/30 truncate max-w-[55%]">
                      {item.name}
                    </span>
                    <span className="text-[9px] font-black tabular-nums text-on-surface-variant/40">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <TotalRow label="Total Aset" value={totalAset} />
          </div>
        </div>

        {/* ─── RIGHT: KEWAJIBAN & MODAL ─── */}
        <div className="bg-white rounded-3xl border border-outline/20 overflow-hidden shadow-xl">
          <div className="bg-primary px-8 py-6 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <Landmark className="size-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black italic uppercase text-white">Kewajiban & Modal</h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Sumber Pendanaan Aset</p>
            </div>
          </div>

          <div className="px-8 py-6 space-y-1">
            {/* Kewajiban */}
            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30 mb-4">
              Kewajiban
            </p>

            <LedgerRow
              label="Utang Usaha"
              sublabel="Kewajiban residual (Total Aset − Modal)"
              value={utangUsaha}
              indent
              valueColor={utangUsaha < 0 ? "text-amber-600" : undefined}
            />

            <div className="border-t border-dashed border-outline/20 mt-3 pt-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30 mb-4">
                Ekuitas Pemilik
              </p>
              <LedgerRow
                label="Modal Akhir (Ekuitas)"
                sublabel="Dari laporan perubahan modal bulan ini"
                value={endingEquity}
                indent
                valueColor={endingEquity >= 0 ? "text-emerald-600" : "text-rose-600"}
              />
            </div>

            <TotalRow
              label="Total Kewajiban & Modal"
              value={totalKewajibanDanModal}
              color="bg-primary text-white"
            />
          </div>
        </div>
      </div>

      {/* Equation Proof Strip */}
      <div className={cn(
        "rounded-2xl border px-8 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center",
        hasIntegrityWarning
          ? "bg-amber-50 border-amber-200"
          : "bg-surface-variant/5 border-outline/10"
      )}>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Total Aset</span>
          <span className="text-xl font-black italic">{formatCurrency(totalAset)}</span>
        </div>
        <span className="text-2xl font-black text-on-surface-variant/20">=</span>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Kewajiban</span>
          <span className={cn("text-xl font-black italic", utangUsaha < 0 ? "text-amber-600" : "")}>
            {formatCurrency(utangUsaha < 0 ? 0 : utangUsaha)}
          </span>
        </div>
        <span className="text-2xl font-black text-on-surface-variant/20">+</span>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Modal</span>
          <span className="text-xl font-black italic text-emerald-600">{formatCurrency(endingEquity)}</span>
        </div>
      </div>

      {/* Footnote for derived liabilities */}
      <p className="text-center text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/30 pb-4">
        * Utang Usaha dihitung secara residual (Aset − Modal). Untuk akurasi penuh, catat kewajiban di modul Akuntansi.
      </p>
    </div>
  );
}
