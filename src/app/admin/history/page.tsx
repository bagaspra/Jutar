import { createClient } from "@/utils/supabase/server";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { TopBar } from "@/components/layout/top-bar";
import { HistoryTableRow } from "@/components/features/history-table-row";
import { formatCurrency } from "@/lib/utils";

export default async function OrderHistoryPage() {
  const supabase = await createClient();

  // 1. Fetch Real Transaction History
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, order_items(count)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Fetch History Error:", error);
  }

  // Calculate Metrics for Summary Widgets
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data: todayStats } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("status", "paid")
    .gte("created_at", today.toISOString());

  const dailyRevenue = todayStats?.reduce((acc: number, o: any) => acc + Number(o.total_amount), 0) || 0;
  const totalOrdersToday = todayStats?.length || 0;

  return (
    <PageWrapper>
      <TopBar />
      
      {/* Page Header & Filters */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <h2 className="text-4xl font-black text-on-surface tracking-tight font-headline uppercase italic">Riwayat Pesanan</h2>
          <p className="text-neutral-500 mt-2 font-body font-medium">Tinjau dan kelola semua transaksi masa lalu dan catatan terminal.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-variant/50 p-2 rounded-full border border-outline/10 overflow-x-auto no-scrollbar max-w-full">
          <button className="px-6 py-2 rounded-full bg-primary text-white font-headline text-xs font-black shadow-lg shadow-primary/20 animate-in fade-in duration-300 whitespace-nowrap">
            Hari Ini
          </button>
          <button className="px-6 py-2 rounded-full text-on-surface-variant hover:text-primary font-headline text-xs font-black transition-colors whitespace-nowrap">
            Kemarin
          </button>
          <button className="px-6 py-2 rounded-full text-on-surface-variant hover:text-primary font-headline text-xs font-black transition-colors whitespace-nowrap">
            7 Hari Terakhir
          </button>
          <button className="px-6 py-2 rounded-full text-on-surface-variant hover:text-primary font-headline text-xs font-black transition-colors flex items-center gap-2 whitespace-nowrap">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            Pilih Tanggal
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-outline/10 mx-4 editorial-shadow mb-10">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse text-left min-w-[1000px]">
            <thead>
              <tr className="bg-surface-variant/30 border-b border-outline/10">
                <th className="px-10 py-6 text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] font-label">ID Transaksi</th>
                <th className="px-10 py-6 text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] font-label">Tanggal & Waktu</th>
                <th className="px-10 py-6 text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] font-label">Tipe Pesanan / Qty</th>
                <th className="px-10 py-6 text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] font-label text-right">Total Pembayaran</th>
                <th className="px-10 py-6 text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] font-label">Status</th>
                <th className="px-10 py-6 text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] font-label text-center">Layanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <HistoryTableRow
                    key={order.id}
                    id={order.receipt_number}
                    date={new Date(order.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                    time={new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    itemsCount={Number(order.order_items[0]?.count) || 0}
                    total={formatCurrency(order.total_amount)}
                    status={order.status === "paid" ? "Completed" : "Refunded"}
                    orderType={order.order_type}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="h-64 flex flex-col items-center justify-center grayscale opacity-10">
                    <span className="material-symbols-outlined text-6xl mb-4">database_off</span>
                    <p className="text-xs font-black uppercase tracking-widest text-center">Nol Transaksi Tercatat</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="px-10 py-8 bg-surface-variant/20 flex items-center justify-between border-t border-outline/10">
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none">Terminal v1.2.0 • Data Sinkron Aktif</p>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-on-surface-variant hover:text-primary transition-colors border border-outline/30 cursor-not-allowed opacity-50">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-headline text-xs font-black shadow-lg shadow-primary/20">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-on-surface-variant font-headline text-xs font-black border border-outline/30 hover:bg-surface-variant transition-colors opacity-30">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-on-surface-variant font-headline text-xs font-black border border-outline/30 hover:bg-surface-variant transition-colors opacity-30">3</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-on-surface-variant hover:text-primary transition-colors border border-outline/30 cursor-not-allowed opacity-50">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 px-4 pb-24">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-outline/10 flex flex-col justify-between editorial-shadow min-h-[220px]">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] block mb-3 font-label opacity-60">Penjualan Kotor Hari Ini</span>
            <h3 className="text-4xl font-black font-headline text-on-surface tabular-nums tracking-tighter">{formatCurrency(dailyRevenue)}</h3>
          </div>
          <div className="flex items-center gap-2 mt-auto">
            <span className="text-emerald-500 text-xs font-black flex items-center bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100/50">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              LATEST LIVE
            </span>
            <span className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest pl-2">Syncing Terminal</span>
          </div>
        </div>
        
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-outline/10 flex flex-col justify-between editorial-shadow min-h-[220px]">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] block mb-3 font-label opacity-60">Tiket Selesai</span>
            <h3 className="text-4xl font-black font-headline text-on-surface tabular-nums tracking-tighter">{totalOrdersToday} <span className="text-sm font-bold opacity-30">PESANAN</span></h3>
          </div>
          <div className="flex items-center gap-2 mt-auto">
            <span className="text-primary text-xs font-black flex items-center bg-red-50 px-3 py-1 rounded-lg border border-red-100/50 uppercase">
              Paid Terminal
            </span>
            <span className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest pl-2">Session 004</span>
          </div>
        </div>
        
        <div className="bg-primary p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-between text-white relative overflow-hidden group shadow-primary/20 min-h-[220px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-3xl group-hover:scale-150 transition-all duration-700"></div>
          <div>
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] block mb-3 font-label">Network Status</span>
            <h3 className="text-3xl font-black font-headline italic tracking-tight flex items-center gap-3">
               ENCRYPTED
               <span className="material-symbols-outlined text-white animate-pulse">lock</span>
            </h3>
          </div>
          <div className="mt-auto flex justify-between items-end">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                  <p className="text-[10px] font-black uppercase tracking-widest">Sinkronisasi Database Utama</p>
               </div>
               <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">Lat: 12ms • Sec: SSL 256bit</p>
            </div>
            <span className="material-symbols-outlined text-white/30 text-5xl">cloud_sync</span>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
