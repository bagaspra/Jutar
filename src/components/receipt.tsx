"use client";

import { MenuItem } from "@/types";

interface ReceiptProps {
  order: {
    receipt_number: string;
    total_amount: number;
    created_at: string;
  };
  items: (MenuItem & { quantity: number })[];
}

export function Receipt({ order, items }: ReceiptProps) {
  const queueNumber = order.receipt_number.slice(-4);
  const date = new Date(order.created_at).toLocaleString();

  return (
    <div id="thermal-receipt" className="hidden print:block w-[80mm] p-4 bg-white text-black font-mono text-[12px] leading-tight mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold uppercase tracking-widest">JuRasa Express</h1>
        <p>123 Fast Food Lane, City</p>
        <p>Tel: (555) 0123-4567</p>
      </div>

      <div className="border-t border-b border-black border-dashed py-2 mb-4 text-center">
        <p className="text-[10px] uppercase font-bold">Queue Number</p>
        <p className="text-4xl font-black">{queueNumber}</p>
      </div>

      {/* Order Info */}
      <div className="mb-4 space-y-1">
        <div className="flex justify-between">
          <span>Receipt:</span>
          <span className="font-bold">{order.receipt_number}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{date}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="border-t border-black border-dashed pt-2 mb-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black border-dotted">
              <th className="font-bold py-1">Item</th>
              <th className="font-bold py-1 text-center">Qty</th>
              <th className="font-bold py-1 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-1 pr-2">{item.name}</td>
                <td className="py-1 text-center">{item.quantity}</td>
                <td className="py-1 text-right">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t border-black border-dashed pt-2 space-y-1">
        <div className="flex justify-between font-bold text-lg">
          <span>TOTAL PAiD:</span>
          <span>${order.total_amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Payment Method:</span>
          <span className="uppercase">Cash</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center space-y-1 opacity-80 text-[10px]">
        <p className="font-bold">THANK YOU FOR YOUR ORDER!</p>
        <p>Please wait for your number to be called.</p>
        <p>Download our app for 10% off next visit.</p>
      </div>

      {/* Print-specific CSS to force 80mm width and hide everything else */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
          }
          #thermal-receipt, #thermal-receipt * {
            visibility: visible;
          }
          #thermal-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            padding: 10mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
