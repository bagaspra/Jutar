"use client";

import { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface PrintableInvoiceProps {
  receiptNumber: string;
  date: string;
  orderType: "dine_in" | "take_away";
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  isTemporary?: boolean;
  tableNumber?: string | null;
}

/**
 * Optimized for 80mm Thermal POS Printers
 * Strictly Black & White, Monospace, and Indonesian Localization
 */
export function ThermalReceipt({
  receiptNumber,
  date,
  orderType,
  items,
  subtotal,
  tax,
  total,
  isTemporary = false,
  tableNumber,
}: PrintableInvoiceProps) {
  const queueNumber = receiptNumber.split('-').pop();

  return (
    <div 
      id="printable-invoice" 
      className="w-[80mm] p-6 bg-white text-black font-mono text-[11px] leading-[1.2] relative overflow-hidden print:p-0"
    >
      {/* Header Toko */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight mb-0.5">JUTAR POS</h1>
        <p className="text-[9px] uppercase tracking-widest font-bold">Terminal Utama • Jakarta</p>
        <p className="text-[8px] opacity-80">Jl. Teknologi No. 42, Jakarta</p>
        
        {isTemporary && (
          <div className="mt-3 border-2 border-black py-1 bg-white">
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">TAGIHAN SEMENTARA</p>
            <p className="text-[8px] font-bold uppercase mt-0.5 italic">Bukan Bukti Pembayaran Sah</p>
          </div>
        )}

        {/* Nomor Antrean */}
        <div className="my-5 border-y-2 border-dashed border-black py-4">
          <p className="text-[9px] font-black mb-1 opacity-60">NOMOR ANTREAN</p>
          <p className="text-4xl font-black tracking-tighter">{queueNumber}</p>
          <p className="text-[8px] mt-1 font-bold tracking-widest">{receiptNumber}</p>
        </div>

        {/* Nomor Meja - Only for Dine-In */}
        {orderType === "dine_in" && tableNumber && (
          <div className="my-4 border-2 border-black py-3 bg-black text-white">
            <p className="text-[8px] font-black mb-1 uppercase tracking-widest opacity-80">Meja</p>
            <p className="text-3xl font-black tracking-tighter">{tableNumber}</p>
          </div>
        )}
      </div>

      {/* Info Transaksi */}
      <div className="mb-4 space-y-0.5 text-[9px] font-bold uppercase">
        <div className="flex justify-between">
          <span>Tanggal:</span>
          <span>{date}</span>
        </div>
        <div className="flex justify-between">
          <span>Layanan:</span>
          <span>{orderType === "dine_in" ? "MAKAN DI TEMPAT" : "BAWA PULANG"}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir:</span>
          <span>Admin</span>
        </div>
      </div>

      <div className="border-b-2 border-dashed border-black mb-3"></div>
      <div className="text-center font-black uppercase text-[9px] mb-3 tracking-[0.2em]">Rincian Pesanan</div>

      {/* Daftar Item */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.id} className="space-y-0.5">
            <div className="flex justify-between items-start gap-2">
              <span className="font-black uppercase flex-1 leading-tight">{item.name}</span>
              <span className="font-black tabular-nums shrink-0">{formatCurrency(item.price * item.quantity)}</span>
            </div>
            <div className="text-[9px] font-bold opacity-70">
              {item.quantity} x {formatCurrency(item.price)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-b-2 border-black mb-4"></div>

      {/* Ringkasan Biaya */}
      <div className="space-y-1.5 mb-8 uppercase font-black">
        <div className="flex justify-between text-[9px]">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[9px]">
          <span>Pajak {orderType === "dine_in" ? "10%" : "0%"}</span>
          <span className="tabular-nums">{formatCurrency(tax)}</span>
        </div>
        
        <div className="border-t border-dashed border-black mt-3 pt-3 flex justify-between items-end">
          <span className="text-xs uppercase">{isTemporary ? "ESTIMASI TOTAL" : "TOTAL BAYAR"}</span>
          <span className="text-xl tabular-nums tracking-tighter leading-none">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center pt-6 border-t-2 border-dashed border-black">
         <p className="text-[10px] font-black italic mb-2 uppercase tracking-wider">
           {isTemporary ? "Silakan Bayar Di Kasir" : "Terima Kasih Atas Kunjungan Anda!"}
         </p>
         <p className="text-[8px] font-bold opacity-60 uppercase tracking-[0.15em] leading-relaxed">
           Layanan POS Modern & Efisien <br/> By Jutar POS
         </p>
         
         {!isTemporary && (
           <div className="mt-6 flex flex-col items-center gap-1">
             <div className="w-16 h-16 border-2 border-black flex items-center justify-center p-1">
                <span className="text-[7px] font-black uppercase text-center leading-none">QR<br/>Review</span>
             </div>
             <p className="text-[7px] font-black uppercase opacity-40">Scan untuk ulasan</p>
           </div>
         )}
      </div>
      
      {/* Paper Cut Spacing */}
      <div className="h-10"></div>
    </div>
  );
}
