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
}

export function PrintableInvoice({
  receiptNumber,
  date,
  orderType,
  items,
  subtotal,
  tax,
  total,
}: PrintableInvoiceProps) {
  return (
    <div id="printable-invoice" className="w-[300px] p-8 bg-white text-black font-mono text-[12px] leading-relaxed">
      {/* Receipt Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-1 font-headline">JuRasa Gastronomy</h1>
        <p className="text-[10px] uppercase tracking-widest opacity-60">Terminal ST-001 • Jakarta</p>
        <div className="my-6 border-y-2 border-dashed border-black py-6">
          <p className="text-[10px] font-black mb-1 opacity-40">ORDER QUEUE</p>
          <p className="text-5xl font-black tracking-tighter">{receiptNumber.split('-').pop()}</p>
          <p className="text-[9px] opacity-30 mt-2 font-body font-bold">{receiptNumber}</p>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex justify-between items-center mb-6 uppercase text-[10px] font-black tracking-widest">
        <span>{date}</span>
        <span className="px-3 py-1 bg-black text-white text-[9px] rounded-md">
          {orderType === "dine_in" ? "DINE IN" : "TAKE AWAY"}
        </span>
      </div>

      <div className="border-b border-dashed border-black/30 mb-6 font-black uppercase text-[10px] pb-1 tracking-[0.2em]">Items Summary</div>

      {/* Items List */}
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="font-black uppercase leading-tight mb-1">{item.name}</p>
              <p className="text-[10px] font-bold opacity-40">
                {item.quantity} x {formatCurrency(item.price)}
              </p>
            </div>
            <span className="font-black tabular-nums">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-b-2 border-black mb-6"></div>

      {/* Totals Section */}
      <div className="space-y-2 mb-10 uppercase font-black">
        <div className="flex justify-between items-center text-[10px]">
          <span className="opacity-40">Subtotal</span>
          <span className="tabular-nums">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="opacity-40">Tax {orderType === "dine_in" ? "(10%)" : "(0%)"}</span>
          <span className="tabular-nums">{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between items-center pt-4 mt-6 border-t border-dashed border-black/20 text-lg tracking-tighter">
          <span>Total Payment</span>
          <span className="tabular-nums">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center pt-8 border-t border-dashed border-black/30">
         <p className="text-[11px] font-black italic mb-2 uppercase tracking-widest">Thank You for Dining!</p>
         <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em]">Service with Gastronomy Passion</p>
         <div className="mt-8 flex justify-center grayscale opacity-100 scale-100">
            <div className="w-20 h-20 border-4 border-black flex items-center justify-center p-2">
               <div className="w-full h-full bg-black"></div>
            </div>
         </div>
      </div>
    </div>
  );
}
