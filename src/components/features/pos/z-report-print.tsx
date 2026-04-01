"use client";

import { cn, formatCurrency } from "@/lib/utils";

interface ZReportPrintProps {
  data: {
    closedAt: string | Date;
    startingCash: number;
    expectedCash: number;
    actualCash: number;
    totalDigital: number;
    difference: number;
  };
}

/**
 * Reusable Z-Report Thermal Template
 * Optimized for 80mm B&W Thermal Printing
 */
export function ZReportPrint({ data }: ZReportPrintProps) {
  const totalGross = (data.expectedCash - data.startingCash) + data.totalDigital;
  
  return (
    <div className="p-8 space-y-6 bg-white print:block font-mono text-black" id="z-report">
      {/* Header */}
      <div className="border-b-2 border-dashed border-black pb-4 text-center space-y-1">
        <h1 className="text-xl font-bold uppercase italic">Jutar POS</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest">LAPORAN REKONSILIASI Z-REPORT</p>
        <p className="text-[8px] font-bold uppercase">
          {new Date(data.closedAt).toLocaleString('id-ID')}
        </p>
      </div>

      {/* Metrics Ledger */}
      <div className="space-y-3 pt-4">
        {[
          { label: "Total Pendapatan Kotor", value: totalGross, bold: true },
          { label: "Modal Awal (Kas)", value: data.startingCash },
          { label: "Penjualan Digital", value: data.totalDigital },
          { label: "Ekspektasi Kas Laci", value: data.expectedCash },
          { label: "Kas Terhitung Fisik", value: data.actualCash },
          { label: "Selisih (Over/Short)", value: data.difference, color: data.difference !== 0 ? "underline" : "" }
        ].map((row, i) => (
          <div key={i} className={cn(
            "flex justify-between items-end", 
            row.bold && "border-b border-black pb-2 mb-2"
          )}>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", row.bold && "opacity-100")}>
              {row.label}
            </span>
            <span className={cn("text-xs font-bold tabular-nums", row.color)}>
              {row.bold ? "Rp " : ""}{Math.abs(row.value).toLocaleString('id-ID')}
              {row.value < 0 ? " (-)" : ""}
            </span>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="pt-6 border-t border-dashed border-black text-center">
        <p className="text-[8px] font-bold italic">
          *** LAPORAN SALINAN / REPRINT ***
        </p>
        <p className="text-[8px] italic opacity-60 mt-2">
          Lampirkan struk ini pada bundel uang kas harian Anda sebagai bukti audit fiskal.
        </p>
      </div>
    </div>
  );
}
