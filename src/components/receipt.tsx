"use client";

import { useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

interface ReceiptProps {
  order: {
    receiptNumber: string;
    queueNumber: string | number;
    items: any[];
    total: number;
    date: string;
  };
  onClose: () => void;
  autoPrint?: boolean;
}

export function Receipt({ order, onClose, autoPrint = true }: ReceiptProps) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
        onClose();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, onClose]);

  return (
    <div className="receipt-container bg-white p-4 max-w-[80mm] mx-auto text-black font-mono text-sm leading-tight">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold uppercase tracking-tighter">JuRasa Express</h1>
        <p className="text-[10px]">Jl. Makanan Cepat No. 123</p>
        <p className="text-[10px]">Telp: 021-1234567</p>
      </div>

      <div className="border-t border-dashed my-2" />

      {/* Queue Number - CRITICAL FOR PRODUCTION */}
      <div className="text-center my-4 py-2 border-2 border-black rounded-lg">
        <p className="text-[10px] font-bold uppercase">Nomor Antrean</p>
        <h2 className="text-5xl font-black">{order.queueNumber}</h2>
      </div>

      <div className="border-t border-dashed my-2" />

      {/* Meta Info */}
      <div className="flex justify-between text-[10px] mb-4">
        <span>No: {order.receiptNumber}</span>
        <span>{new Date(order.date).toLocaleString('id-ID')}</span>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-4">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between">
            <div className="flex-1 pr-2">
              <p className="font-bold">{item.name}</p>
              <p className="text-[10px]">{item.quantity} x {formatCurrency(item.price)}</p>
            </div>
            <span className="tabular-nums font-bold self-end text-sm">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed my-2" />

      {/* Totals */}
      <div className="space-y-1">
        <div className="flex justify-between font-bold text-base pt-2">
          <span>TOTAL</span>
          <span className="tabular-nums">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="border-t border-dashed my-4" />

      {/* Footer */}
      <div className="text-center space-y-1">
        <p className="text-[10px] font-bold italic">Terima Kasih Atas Kunjungan Anda!</p>
        <p className="text-[10px]">Nikmati Hidangan Anda</p>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-container, .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 0;
            margin: 0;
            box-shadow: none;
            border: none;
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
