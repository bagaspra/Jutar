import { PageWrapper } from "@/components/layout/page-wrapper";
import { TopBar } from "@/components/layout/top-bar";
import { StatCard } from "@/components/ui/stat-card";
import { generateIncomeStatement, generateCashFlowReport } from "@/actions/report-actions";
import { generateEquityStatement } from "@/actions/equity-actions";
import { generateBalanceSheet } from "@/actions/balance-sheet-actions";
import { getShiftHistory } from "@/actions/shift-actions";
import { ReportPicker } from "@/components/features/reports/report-picker";
import { EquityDashboard } from "@/components/features/reports/equity-dashboard";
import { BalanceSheetDashboard } from "@/components/features/reports/balance-sheet-dashboard";
import { ShiftHistoryTable } from "@/components/features/reports/shift-history-table";
import { getUserRole } from "@/utils/rbac-server";
import { redirect } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle, Wallet, History, BarChart3, ReceiptText, Info, Scale, BookOpen } from "lucide-react";

interface ReportPageProps {
  searchParams: Promise<{ month?: string; year?: string; tab?: string }>;
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  // 1. Security Check
  const role = await getUserRole();
  if (role !== "super_admin") {
    redirect("/");
  }

  // 2. Parse Date Filters & Tabs
  const { month, year, tab } = await searchParams;
  const activeTab = tab || "pnl";
  const targetMonth = Number(month) || new Date().getMonth() + 1;
  const targetYear = Number(year) || new Date().getFullYear();

  // 3. Fetch Data based on active tab
  const pnlResult = activeTab === "pnl" ? await generateIncomeStatement(targetMonth, targetYear) : null;
  const cashFlowResult = activeTab === "cashflow" ? await generateCashFlowReport(targetMonth, targetYear) : null;
  const equityResult = activeTab === "equity" ? await generateEquityStatement(targetMonth, targetYear) : null;
  const balanceSheetResult = activeTab === "neraca" ? await generateBalanceSheet(targetMonth, targetYear) : null;
  const shiftHistory = activeTab === "shifts" ? await getShiftHistory() : [];

  const pnlData = pnlResult?.success ? pnlResult.data : null;
  const cashFlowData = cashFlowResult?.success ? cashFlowResult.data : null;
  const equityData = equityResult?.success ? equityResult.data : null;
  const balanceSheetData = balanceSheetResult?.success ? balanceSheetResult.data : null;

  // 4. Verification & Helpers
  const isPnlError = activeTab === "pnl" && !pnlData;
  const isCashFlowError = activeTab === "cashflow" && !cashFlowData;
  const isEquityError = activeTab === "equity" && !equityData;
  const isNeracaError = activeTab === "neraca" && !balanceSheetData;

  if (isPnlError || isCashFlowError || isEquityError || isNeracaError) {
    return (
      <PageWrapper>
        <TopBar />
        <div className="p-20 text-center opacity-40 font-black uppercase tracking-widest flex flex-col items-center gap-4">
          <BarChart3 className="size-10 mb-2" />
          Gagal memuat data intelejen finansial.
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TopBar />
      
      <div className="space-y-10 pb-20 px-4">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-black text-on-surface tracking-tight font-headline italic uppercase">Laporan Intelejen</h2>
              <p className="text-neutral-500 mt-2 font-body font-bold uppercase text-[10px] tracking-widest opacity-60">
                Analisis Fiskal Lanjutan & Log Audit
              </p>
            </div>
            
            {/* Shadcn-Style Tabs Navigation */}
            <div className="flex gap-2 p-1.5 bg-surface-variant/20 rounded-2xl border border-outline/10 w-fit backdrop-blur-md">
              <a 
                href="?tab=pnl"
                className={cn(
                  "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "pnl" ? "bg-white text-primary shadow-xl ring-1 ring-outline/5" : "text-on-surface-variant/40 hover:text-on-surface"
                )}
              >
                <BarChart3 className="size-3" />
                Laba Rugi
              </a>
              <a 
                href="?tab=cashflow"
                className={cn(
                  "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "cashflow" ? "bg-white text-primary shadow-xl ring-1 ring-outline/5" : "text-on-surface-variant/40 hover:text-on-surface"
                )}
              >
                <Wallet className="size-3" />
                Arus Kas
              </a>
              <a 
                href="?tab=equity"
                className={cn(
                  "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "equity" ? "bg-white text-primary shadow-xl ring-1 ring-outline/5" : "text-on-surface-variant/40 hover:text-on-surface"
                )}
              >
                <Scale className="size-3" />
                Perubahan Modal
              </a>
              <a
                href="?tab=neraca"
                className={cn(
                  "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "neraca" ? "bg-white text-primary shadow-xl ring-1 ring-outline/5" : "text-on-surface-variant/40 hover:text-on-surface"
                )}
              >
                <BookOpen className="size-3" />
                Neraca
              </a>
              <a
                href="?tab=shifts"
                className={cn(
                  "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "shifts" ? "bg-white text-primary shadow-xl ring-1 ring-outline/5" : "text-on-surface-variant/40 hover:text-on-surface"
                )}
              >
                <History className="size-3" />
                Riwayat Shift
              </a>
            </div>
          </div>
          {(activeTab === "pnl" || activeTab === "cashflow" || activeTab === "equity" || activeTab === "neraca") && <ReportPicker />}
        </div>

        {/* ----------------- TAB: LABA RUGI (PNL) ----------------- */}
        {activeTab === "pnl" && pnlData && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label="Total Pendapatan"
                value={formatCurrency(pnlData.metrics.revenue)}
                subValue="Pendapatan kotor dari pesanan lunas"
                icon="payments"
              />
              <StatCard
                label="Estimasi HPP"
                value={formatCurrency(pnlData.metrics.cogs)}
                subValue="Biaya bahan baku yang digunakan"
                icon="inventory_2"
                variant="orange"
              />
              <StatCard
                label="Beban Operasional"
                value={formatCurrency(pnlData.metrics.expenses)}
                subValue="Gaji, Utilitas, Pemeliharaan, dll."
                icon="account_balance_wallet"
                variant="red"
              />
              <StatCard
                label="Laba Bersih"
                value={formatCurrency(pnlData.metrics.netProfit)}
                subValue="Hasil akhir periode ini"
                icon="monitoring"
                variant={pnlData.metrics.netProfit >= 0 ? "blue" : "red"}
                className={cn(pnlData.metrics.netProfit < 0 && "ring-4 ring-red-500/20 animate-pulse")}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white rounded-3xl border border-outline/20 p-8 editorial-shadow">
                <div className="mb-10">
                  <h3 className="text-xl font-extrabold font-headline italic uppercase">Distribusi Pengeluaran</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-1">Biaya operasional berdasarkan kategori</p>
                </div>
                <div className="space-y-8">
                  {Object.entries(pnlData.expenseBreakdown).length === 0 ? (
                    <div className="h-48 flex items-center justify-center opacity-20 font-black uppercase text-[10px] tracking-widest border-2 border-dashed border-outline/20 rounded-2xl">
                      Tidak ada data pengeluaran
                    </div>
                  ) : (
                    Object.entries(pnlData.expenseBreakdown).map(([cat, amount]) => {
                      const percentage = (Number(amount) / pnlData.metrics.expenses) * 100;
                      return (
                        <div key={cat} className="space-y-3 group">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">{cat}</span>
                            <span className="text-xs font-black italic">{formatCurrency(Number(amount))}</span>
                          </div>
                          <div className="h-3 w-full bg-surface-variant/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 bg-white rounded-3xl border border-outline/20 p-8 editorial-shadow flex flex-col">
                <h3 className="text-xl font-extrabold font-headline italic uppercase mb-2">Kecepatan Penjualan</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-8">Volume penjualan & dampak</p>
                <div className="space-y-6 flex-1">
                  {pnlData.topMoving.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center opacity-20 font-black uppercase text-[10px] tracking-widest">
                      Belum ada penjualan
                    </div>
                  ) : (
                    pnlData.topMoving.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                          <span className="text-[10px] font-black italic text-primary">#{i+1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black uppercase truncate italic group-hover:text-primary transition-colors">{item.name}</h4>
                          <p className="text-[9px] text-on-surface-variant/60 font-black uppercase tracking-widest">{item.count} terjual</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/20">Est. HPP</p>
                           <p className="text-[10px] font-black italic">{formatCurrency(item.cogs)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: ARUS KAS (CASH FLOW) ----------------- */}
        {activeTab === "cashflow" && cashFlowData && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Cash Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label="Total Kas Masuk"
                value={formatCurrency(cashFlowData.metrics.cashInflow)}
                subValue="Khusus pembayaran TUNAI"
                icon="account_balance"
                variant="emerald"
              />
              <StatCard
                label="Total Kas Keluar"
                value={formatCurrency(cashFlowData.metrics.cashOutflow)}
                subValue="Beban operasional terbayar"
                icon="outbox"
                variant="red"
              />
              <StatCard
                label="Arus Kas Bersih"
                value={formatCurrency(cashFlowData.metrics.netCashFlow)}
                subValue="Likuiditas tersedia bulan ini"
                icon="account_balance_wallet"
                variant={cashFlowData.metrics.netCashFlow >= 0 ? "blue" : "red"}
                className={cn(cashFlowData.metrics.netCashFlow < 0 && "ring-4 ring-rose-500/20")}
              />
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl border border-primary/20 p-8 shadow-sm flex flex-col justify-center gap-3 relative overflow-hidden group">
                 <div className="absolute -right-10 -top-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <BarChart3 className="size-40" />
                 </div>
                 <div className="flex items-center gap-2 group/info cursor-help">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Estimasi Digital Info</span>
                    <Info className="size-3 text-primary/40 group-hover/info:text-primary transition-colors" />
                 </div>
                 <h4 className="text-2xl font-black italic font-headline uppercase leading-none">
                    {formatCurrency(cashFlowData.metrics.digitalSettlement)}
                 </h4>
                 <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest leading-relaxed">
                    Total QRIS & Bank Transfer (Sudah Lunas)
                 </p>
              </div>
            </div>

            {/* Chronological Ledger */}
            <div className="bg-white rounded-card shadow-2xl border border-outline/10 overflow-hidden backdrop-blur-sm">
               <div className="px-8 py-6 border-b border-outline/5 bg-surface-variant/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold font-headline italic uppercase">Buku Besar Kas Mutasi</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-1">Audit aliran dana tunai secara kronologis</p>
                  </div>
                  <div className="bg-white/50 px-4 py-2 rounded-xl border border-outline/10 text-[9px] font-black uppercase flex items-center gap-2">
                     <ReceiptText className="size-3 opacity-40" />
                     {cashFlowData.ledger.length} Transaksi Terdeteksi
                  </div>
               </div>
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                     <thead className="bg-surface-variant/5 border-b border-outline/5">
                        <tr className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50">
                           <th className="px-8 py-5">Waktu & Tanggal</th>
                           <th className="px-8 py-5">Deskripsi Transaksi</th>
                           <th className="px-8 py-5">Kategori</th>
                           <th className="px-8 py-5 text-right">Mutasi Dana</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-outline/5">
                        {cashFlowData.ledger.length === 0 ? (
                           <tr>
                              <td colSpan={4} className="px-8 py-20 text-center opacity-30 font-black uppercase tracking-widest text-[10px]">Belum ada mutasi kas untuk periode ini</td>
                           </tr>
                        ) : (
                           cashFlowData.ledger.map((entry: any) => (
                              <tr key={entry.id} className="group hover:bg-neutral-50 transition-colors">
                                 <td className="px-8 py-6">
                                    <p className="text-xs font-black italic">{new Date(entry.date).toLocaleDateString('id-ID')}</p>
                                    <p className="text-[9px] font-bold opacity-40 uppercase">{new Date(entry.date).toLocaleTimeString('id-ID')}</p>
                                 </td>
                                 <td className="px-8 py-6">
                                    <span className="text-xs font-black italic uppercase tracking-tight text-on-surface group-hover:text-primary transition-colors">
                                       {entry.label}
                                    </span>
                                 </td>
                                 <td className="px-8 py-6">
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-surface-variant/10 px-2 py-1 rounded-md opacity-60">
                                       {entry.category}
                                    </span>
                                 </td>
                                 <td className={cn(
                                    "px-8 py-6 text-right font-black italic text-sm tabular-nums",
                                    entry.type === 'inflow' ? "text-emerald-600" : "text-rose-600"
                                 )}>
                                    <div className="flex items-center justify-end gap-2">
                                       {entry.type === 'inflow' ? <ArrowUpCircle className="size-3" /> : <ArrowDownCircle className="size-3" />}
                                       {entry.type === 'inflow' ? "+" : "-"} {formatCurrency(Number(entry.amount))}
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}
         {/* ----------------- TAB: PERUBAHAN MODAL (EQUITY) ----------------- */}
        {activeTab === "equity" && equityData && (
          <EquityDashboard 
            data={equityData}
            month={targetMonth}
            year={targetYear}
          />
        )}
        {/* ----------------- TAB: NERACA (BALANCE SHEET) ----------------- */}
        {activeTab === "neraca" && balanceSheetData && (
          <BalanceSheetDashboard
            data={balanceSheetData}
            month={targetMonth}
            year={targetYear}
          />
        )}
        {/* ----------------- TAB: RIWAYAT SHIFT ----------------- */}
        {activeTab === "shifts" && (
           <ShiftHistoryTable history={shiftHistory} />
        )}
      </div>
    </PageWrapper>
  );
}
