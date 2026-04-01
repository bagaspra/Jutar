import { PageWrapper } from "@/components/layout/page-wrapper";
import { TopBar } from "@/components/layout/top-bar";
import { StatCard } from "@/components/ui/stat-card";
import { LowStockAlert } from "@/components/ui/low-stock-alert";
import { ActiveOrderRow } from "@/components/features/active-order-row";
import { createClient } from "@/utils/supabase/server";
import { formatCurrency, cn } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Fetch Today's Sales Metrics
  const { data: todayOrders, error: ordersError } = await supabase
    .from("orders")
    .select("total_amount, status")
    .eq("status", "paid")
    .gte("created_at", today.toISOString());

  const totalRevenue = todayOrders?.reduce((acc: number, order: any) => acc + Number(order.total_amount), 0) || 0;
  const totalCount = todayOrders?.length || 0;

  // 2. Fetch Yesterday's Sales for Trend Calculation
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const { data: yesterdayOrders } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("status", "paid")
    .gte("created_at", yesterday.toISOString())
    .lt("created_at", today.toISOString());

  const yesterdayRevenue = yesterdayOrders?.reduce((acc: number, order: any) => acc + Number(order.total_amount), 0) || 0;
  const revenueTrend = yesterdayRevenue > 0 
    ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
    : 100;

  // 3. Fetch Low Stock Alerts
  const { data: lowStockItems, error: stockError } = await supabase
    .from("raw_materials")
    .select("*")
    .lt("current_stock", "low_stock_threshold");

  // 4. Fetch Live Active Orders (Today's Paid Orders)
  const { data: activeOrders, error: activeError } = await supabase
    .from("orders")
    .select("*, order_items(id, products(name))")
    .eq("status", "paid")
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false })
    .limit(5);

  // 5. Fetch Top Sold Products Today
  const { data: topSellingProducts } = await supabase
    .from("order_items")
    .select("product_id, products(name, image_url)")
    .gte("created_at", today.toISOString());

  const productCounts: Record<string, { name: string; image: string; count: number }> = {};
  topSellingProducts?.forEach((item: any) => {
    if (!productCounts[item.product_id]) {
      productCounts[item.product_id] = { 
        name: item.products.name, 
        image: item.products.image_url, 
        count: 0 
      };
    }
    productCounts[item.product_id].count++;
  });

  const sortedTopProducts = Object.values(productCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <PageWrapper>
      <TopBar />
      
      <div className="space-y-10 pb-10">
        {/* Metric Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Today's Revenue"
            value={formatCurrency(totalRevenue)}
            subValue={`vs yesterday ${formatCurrency(yesterdayRevenue)}`}
            icon="payments"
            trend={{ 
              value: `${revenueTrend > 0 ? "+" : ""}${revenueTrend.toFixed(1)}%`, 
              isUp: revenueTrend >= 0 
            }}
            variant="red"
            showLeftBorder={true}
          />
          <StatCard
            label="Total Orders"
            value={totalCount.toString()}
            subValue="Completed transactions"
            icon="receipt_long"
            trend={{ value: "+8%", isUp: true }} // Dummy trend for now
            variant="orange"
          />
          <StatCard
            label="Low Stock Alert"
            value={(lowStockItems?.length || 0).toString()}
            subValue="Items below threshold"
            icon="warning"
            trend={{ value: "0", isUp: true }}
            variant="blue"
          />
        </div>

        {/* Main Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Live Paid Orders (8/12) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-end justify-between px-2">
              <div>
                <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Live Paid Orders</h3>
                <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Real-time completed floor transactions</p>
              </div>
              <button className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center hover:underline group">
                Full Records
                <span className="material-symbols-outlined text-xs ml-1 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {activeOrders && activeOrders.length > 0 ? (
                activeOrders.map((order: any) => {
                  const firstItemName = order.order_items?.[0]?.products?.name || "Order Item";
                  const waitTime = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000);
                  
                  return (
                    <ActiveOrderRow
                      key={order.id}
                      itemName={firstItemName + (order.order_items.length > 1 ? ` (+${order.order_items.length - 1})` : "")}
                      price={formatCurrency(order.total_amount)}
                      pax={2} // Dummy pax for now
                      waitTime={`${waitTime}m`}
                      status="Served" // Paid orders are considered served/completed
                      orderType={order.order_type}
                      isPrimary={waitTime < 5}
                    />
                  );
                })
              ) : (
                <div className="h-64 border-2 border-dashed border-outline rounded-3xl flex flex-col items-center justify-center grayscale opacity-20">
                  <span className="material-symbols-outlined text-4xl mb-2">history</span>
                  <p className="text-xs font-black uppercase tracking-widest">No transactions recorded today</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts (4/12) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="px-2">
              <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Inventory Alerts</h3>
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Critical items requiring immediate restock</p>
            </div>
            
            <div className="bg-white rounded-card shadow-xl border border-outline/10 overflow-hidden divide-y divide-outline/5">
              {lowStockItems && lowStockItems.length > 0 ? (
                lowStockItems.map((item: any) => {
                  const percentage = Math.min(100, Math.floor((Number(item.current_stock) / (Number(item.low_stock_threshold) * 2)) * 100));
                  return (
                    <LowStockAlert
                      key={item.id}
                      image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c" // Dummy image
                      name={item.name}
                      category={item.unit}
                      level={Number(item.current_stock) <= Number(item.low_stock_threshold) * 0.2 ? "CRITICAL" : "LOW"}
                      amountLeft={`${item.current_stock} ${item.unit}`}
                      minAmount={`${item.low_stock_threshold} ${item.unit}`}
                      percentage={percentage}
                    />
                  );
                })
              ) : (
                <div className="h-48 flex flex-col items-center justify-center grayscale opacity-10 py-10 scale-90">
                  <span className="material-symbols-outlined text-5xl mb-4">inventory_2</span>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest">Stock Levels Optimal</p>
                  </div>
                </div>
              )}
              
              <div className="p-6 bg-surface/30">
                <button className="w-full bg-white border border-outline/30 rounded-xl py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all active:scale-[0.98]">
                  Inventory Management
                </button>
              </div>
            </div>

            {/* Daily Highlights Section */}
            <div className="px-2 pt-4">
              <h3 className="text-xl font-extrabold uppercase tracking-tight italic">Daily Highlights</h3>
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Top performing products today</p>
            </div>

            <div className="bg-white p-6 rounded-card shadow-xl border border-outline/10 space-y-5">
               {sortedTopProducts.length > 0 ? (
                 sortedTopProducts.map((p, i) => (
                   <div key={p.name} className="flex items-center gap-4">
                     <img src={p.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                     <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-tight italic truncate">{p.name}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant/60">{p.count} units sold</p>
                     </div>
                     <div className={cn(
                       "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black italic",
                       i === 0 ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface-variant text-on-surface-variant"
                     )}>
                       #{i + 1}
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="py-6 text-center opacity-20">
                   <p className="text-[10px] font-black uppercase tracking-widest">Awaiting sales data</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Reports FAB */}
      <button className="fixed bottom-10 right-10 bg-primary hover:bg-primary/90 text-white px-8 py-5 rounded-3xl shadow-2xl shadow-primary/30 flex items-center gap-3 transition-all active:scale-[0.95] z-50 group">
        <span className="material-symbols-outlined text-xl material-symbols-fill group-hover:rotate-12 transition-transform">summarize</span>
        <span className="font-black text-xs uppercase tracking-[0.2em]">Live Reports</span>
      </button>
    </PageWrapper>
  );
}
