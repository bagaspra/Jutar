"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { ZReportPrint } from "../pos/z-report-print";

interface ShiftHistoryTableProps {
  history: any[];
}

export function ShiftHistoryTable({ history }: ShiftHistoryTableProps) {
  const [printData, setPrintData] = useState<any>(null);

  const handlePrint = (shift: any) => {
    setPrintData({
      closedAt: shift.closed_at,
      startingCash: Number(shift.starting_cash),
      expectedCash: Number(shift.expected_cash),
      actualCash: Number(shift.actual_cash),
      totalDigital: Number(shift.total_digital),
      difference: Number(shift.difference)
    });

    // Short delay to ensure React renders the print component before window.print()
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-3xl border border-outline/20 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-surface-variant/5">
            <tr className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 border-b border-outline/5">
              <th className="px-8 py-5">Ditutup Pada</th>
              <th className="px-8 py-5">Kasir</th>
              <th className="px-8 py-5">Modal Awal</th>
              <th className="px-8 py-5">Ekspektasi Kas</th>
              <th className="px-8 py-5">Kas Aktual</th>
              <th className="px-8 py-5">Selisih</th>
              <th className="px-8 py-5">Digital</th>
              <th className="px-8 py-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5">
            {history.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-8 py-20 text-center opacity-30 font-black uppercase tracking-widest text-[10px]">
                  Belum ada riwayat shift ditemukan
                </td>
              </tr>
            ) : (
              history.map((shift: any) => (
                <tr key={shift.id} className="group hover:bg-primary/5 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black italic">{new Date(shift.closed_at).toLocaleDateString('id-ID')}</p>
                    <p className="text-[9px] font-bold opacity-40 uppercase">{new Date(shift.closed_at).toLocaleTimeString('id-ID')}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded">
                      {shift.profiles?.name || "Tidak Diketahui"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold tabular-nums">Rp {Number(shift.starting_cash).toLocaleString()}</td>
                  <td className="px-8 py-6 text-xs font-bold tabular-nums">Rp {Number(shift.expected_cash).toLocaleString()}</td>
                  <td className="px-8 py-6 text-xs font-black tabular-nums italic">Rp {Number(shift.actual_cash).toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded",
                      Number(shift.difference) < 0 ? "bg-red-50 text-red-600" : Number(shift.difference) > 0 ? "bg-green-50 text-green-600" : "bg-surface-variant/50 opacity-40"
                    )}>
                      Rp {Number(shift.difference).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold tabular-nums opacity-60">Rp {Number(shift.total_digital).toLocaleString()}</td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handlePrint(shift)}
                      className="p-3 bg-on-surface text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-on-surface/20"
                      title="Cetak Ulang Z-Report"
                    >
                      <Printer className="size-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 
          Hidden Print Container:
          We use 'invisible absolute' instead of 'hidden' to keep the element 
          mounted in the DOM so the print renderer can find it.
      */}
      {printData && (
        <div className="invisible pointer-events-none absolute left-0 top-0 opacity-0 print:visible print:opacity-100 print:static">
           <ZReportPrint data={printData} />
        </div>
      )}
    </div>
  );
}
