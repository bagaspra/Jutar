import { PageWrapper } from "@/components/layout/page-wrapper";
import { TopBar } from "@/components/layout/top-bar";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";

export default async function ReportPage() {
  return (
    <PageWrapper>
      <TopBar />
      
      <div className="space-y-10 pb-20 px-4">
        {/* Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black text-on-surface tracking-tight font-headline">Intelligence Reports</h2>
            <p className="text-neutral-500 mt-2 font-body">Deep dive into sales performance and inventory efficiency.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white border border-outline/30 px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-variant transition-colors shadow-sm font-headline uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">download</span>
              Export PDF
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Gross Sales"
            value="Rp 824.500.000"
            subValue="this month"
            icon="payments"
            trend={{ value: "+18%", isUp: true }}
          />
          <StatCard
            label="Net Profit"
            value="Rp 142.200.000"
            subValue="estimated"
            icon="monitoring"
            trend={{ value: "+5.2%", isUp: true }}
            variant="blue"
          />
          <StatCard
            label="Refund Rate"
            value="0.8%"
            subValue="12 orders"
            icon="undo"
            trend={{ value: "-2%", isUp: true }}
            variant="orange"
          />
          <StatCard
            label="Customer Return"
            value="64%"
            subValue="recurring guests"
            icon="group"
            trend={{ value: "+12%", isUp: true }}
            variant="red"
          />
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sales Chart Placeholder */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-outline/20 p-8 editorial-shadow">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-xl font-extrabold font-headline">Sales Velocity</h3>
                <p className="text-xs text-on-surface-variant mt-1">Transaction frequency over the last 14 days</p>
              </div>
              <div className="flex bg-surface-variant/50 p-1 rounded-lg">
                <span className="px-3 py-1 bg-white rounded-md text-[10px] font-bold shadow-sm cursor-pointer">Daily</span>
                <span className="px-3 py-1 text-[10px] font-bold text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors">Weekly</span>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-4 px-2">
              {[40, 70, 45, 90, 65, 80, 55, 95, 75, 60, 85, 50, 70, 92].map((height, i) => (
                <div key={i} className="flex-1 group relative">
                  <div 
                    className="w-full bg-primary/10 rounded-t-lg group-hover:bg-primary transition-all duration-500 cursor-pointer relative"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold tracking-widest uppercase">
                      Rp {(height * 10000).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-[8px] font-bold text-on-surface-variant mt-3 text-center uppercase tracking-tighter opacity-40">
                    Day {i+1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-outline/20 p-8 editorial-shadow flex flex-col">
            <h3 className="text-xl font-extrabold font-headline mb-8">Top Moving Items</h3>
            <div className="space-y-6 flex-1">
              {[
                { name: "Sashimi Salmon Platter", count: 842, growth: "+22%", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCf9AnQDqNQAaOllTeQjSSj3yZKwudc0-30JrJfcPHgXKKhcT6MKDEb-bkX27c20fEydqBfpHQZkL9AeAzMjW48yOOig5xT0s5Nw7r3teJfPNghbIYsi3tWQXtQWGON8Ls3nBPVp6QhDSKdZD2dvXm9D2f0ddbJpF0pD0ZFx5ShZhgu47DOMAdeWHfFyzFpdzFCbyZr6uC2v77IXwWrJQm9gWjDv9QULjhAOjkTIjJsqcv_N0Q-pF9SEg1CTF9Sido6BPWH5SqkY9M" },
                { name: "Aged Wagyu Steak", count: 531, growth: "+14%", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuArzoMq52VWSi6k8jG97SqPFkfXNxsyl1NruGE_Rfyy2E0-E1PIP3f7C3byrTx6RDd9wRB37ZnDZ9M1zldaXWfbzGIZcqI2Okh7af2OZ7fKeua_kF8G0ZP-Km0Mvpk85pMrgPJ3z-9CC_hxRfWzx7tpjycK2vHgRJJeOGG7n35HAuqGM47SBn1SAOqqz6hI92zhQ3ySMVcPxDmY9gTpUtOBvFOmXg4QDw-NoumiTAgvbHBo60bba1oEMChMMXjG_qbxKzziI27i1j4" },
                { name: "Hokkaido Milk Tea", count: 420, growth: "-2%", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCl2oCAryzCf5qXMO3NL_YC13cAfSOiKl_96qTYpoj0G2uJdJVOXmiqN188mQB53EXnWRTCSV8JbhB3BNl9VrH_qYznRha6S6LY4thSXH7mBz_7HXX0qNuCqxrAs2rtAaiYOISDD-XRYep9SlYwCbVYOejGNr4CXX3MGEoiFh0tYYbzKsLX4sPHShLXeraWfpo1TIgNN0CqjNvzTOx5d0o2rXOWZ9e4eJUPgC6sD8w9aYUfxZm6sjCrppxclF3tW4ZP8CVvkxZIuTI" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-outline/10">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-extrabold truncate">{item.name}</h4>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{item.count} sold</p>
                  </div>
                  <Badge variant={item.growth.startsWith('+') ? "green" : "orange"} className="shrink-0">{item.growth}</Badge>
                </div>
              ))}
            </div>
            <button className="mt-10 w-full border border-outline/30 rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-surface-variant transition-colors text-on-surface-variant">
              Full Inventory Analysis
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
