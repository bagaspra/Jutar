import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Banknote, AlertTriangle, History } from "lucide-react";
import { InventoryActionsPortal } from "@/components/inventory-dialogs";
import { getRawMaterials } from "@/actions/inventory-actions";
import { MenuManagementTable } from "@/components/menu-table";
import { CategoryManager } from "@/components/category-manager";
import { getCategories } from "@/actions/category-actions";
import { ProductBuilder } from "@/components/product-builder";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const supabase = await createClient();

  // 1. Fetch Today's Sales
  const { data: todayOrders, error: ordersError } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("status", "paid")
    .gte("created_at", today.toISOString());

  const totalRevenue = todayOrders?.reduce((acc: number, order: any) => acc + Number(order.total_amount), 0) || 0;
  const totalCount = todayOrders?.length || 0;

  // 2. Fetch Low Stock Alerts
  const { data: lowStockItems, error: stockError } = await supabase
    .from("raw_materials")
    .select("*")
    .lte("current_stock", "low_stock_threshold");

  // 3. Fetch Recent Inventory Logs
  const { data: recentLogs, error: logsError } = await supabase
    .from("inventory_logs")
    .select(`
      id,
      log_type,
      quantity_change,
      notes,
      created_at,
      raw_materials (name, unit)
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  // 4. Fetch All Products for Menu Management (Joined with Categories)
  const { data: allProducts, error: productsError } = await supabase
    .from("products")
    .select(`
      *,
      categories (name)
    `)
    .order("name", { ascending: true });

  const rawMaterialsForSelection = await getRawMaterials();
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-background p-8 pb-32 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-3 font-heading">
            <span className="p-3 bg-primary rounded-2xl text-primary-foreground shadow-2xl shadow-primary/20 scale-105">
              📊
            </span>
            JuRasa Backoffice
          </h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase tracking-[0.2em] text-[10px] pl-1">
            Terminal Administrasi Sistem
          </p>
        </div>
        
        {/* Actions (Restock/Waste/Add Product) */}
        <div className="flex items-center gap-3">
          <ProductBuilder categories={categories} materials={rawMaterialsForSelection} />
          <InventoryActionsPortal materials={rawMaterialsForSelection} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Stat Cards - Top Row */}
        <Card className="shadow-2xl shadow-primary/5 border-none bg-primary/5 rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-primary">Pendapatan Hari Ini</CardTitle>
            <Banknote className="size-5 text-primary opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tabular-nums tracking-tighter">{formatCurrency(totalRevenue)}</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest pl-1">Penjualan Kasir</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xl shadow-foreground/5 border-none rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground">Pesanan Hari Ini</CardTitle>
            <ShoppingCart className="size-5 text-muted-foreground opacity-30" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tabular-nums tracking-tighter">{totalCount}</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest pl-1">Transaksi</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xl shadow-amber-500/5 border-none rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-amber-600">Peringatan Stok</CardTitle>
            <AlertTriangle className="size-5 text-amber-600 opacity-50 shadow-sm" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tabular-nums text-amber-600 tracking-tighter">{lowStockItems?.length || 0}</div>
            <p className="text-[10px] text-amber-600/60 mt-2 font-black uppercase tracking-widest pl-1">Butuh Peninjauan</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xl shadow-blue-500/5 border-none rounded-[2rem] bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-blue-600">Status Terminal</CardTitle>
            <div className="size-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-blue-600 tracking-tighter italic">AKTIF</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest pl-1">Sinkronisasi Online</p>
          </CardContent>
        </Card>

        {/* Dashboard Main Grid Blocks */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-none overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-amber-500/10 border-b border-amber-500/5 flex flex-row items-center justify-between h-20 px-8">
              <CardTitle className="text-xl font-black flex items-center gap-3 font-heading">
                <AlertTriangle className="size-6 text-amber-600" />
                Stok Sangat Rendah
              </CardTitle>
              <Badge className="bg-amber-500/20 text-amber-900 border-none uppercase tracking-[0.15em] text-[9px] font-black px-3 py-1">Tindakan Diperlukan</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="h-14">
                    <TableHead className="font-black pl-8 uppercase text-[10px] tracking-widest">Bahan Baku</TableHead>
                    <TableHead className="font-black text-center uppercase text-[10px] tracking-widest">Status</TableHead>
                    <TableHead className="font-black text-right pr-8 uppercase text-[10px] tracking-widest">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems && lowStockItems.length > 0 ? (
                    lowStockItems.map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-amber-50/40 transition-colors h-16 border-muted/20">
                        <TableCell className="font-black pl-8 text-sm">{item.name}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-destructive/10 text-destructive border-none font-black uppercase text-[9px] px-2">HABIS SEGERA</Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8 font-black tabular-nums text-sm">
                          {item.current_stock} <span className="text-[10px] text-muted-foreground/60 font-medium uppercase ml-1">{item.unit}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-48 text-center p-8">
                        <div className="flex flex-col items-center justify-center space-y-3 opacity-20 grayscale">
                          <span className="text-6xl">✨</span>
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Level Inventaris Optimal</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-none overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-muted/40 border-b flex flex-row items-center justify-between h-20 px-8">
              <CardTitle className="text-xl font-black flex items-center gap-3 opacity-70 italic font-heading">
                <History className="size-6 text-muted-foreground" />
                Log Inventaris
              </CardTitle>
              <Badge className="bg-background/80 text-muted-foreground border border-muted-foreground/10 uppercase tracking-[0.2em] text-[9px] font-bold px-3 py-1">Aliran Terbaru</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="h-14">
                    <TableHead className="font-black pl-8 uppercase text-[10px] tracking-widest">Kejadian</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Item</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Delta</TableHead>
                    <TableHead className="font-black text-right pr-8 uppercase text-[10px] tracking-widest">Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs && recentLogs.length > 0 ? (
                    recentLogs.map((log: any) => (
                      <TableRow key={log.id} className="text-[13px] group hover:bg-muted/10 transition-colors h-14 border-muted/10">
                        <TableCell className="pl-8">
                          <Badge 
                            variant="secondary" 
                            className={log.log_type === 'restock' 
                              ? "bg-green-500/10 text-green-700 border-none font-black uppercase text-[9px]" 
                              : "bg-amber-500/10 text-amber-700 border-none font-black uppercase text-[9px]"
                            }
                          >
                            {log.log_type === 'restock' ? "STOK ULANG" : "SISA/BUANG"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-black text-foreground/80">{log.raw_materials.name}</TableCell>
                        <TableCell className={`font-black tabular-nums ${log.quantity_change > 0 ? "text-green-600" : "text-destructive"}`}>
                          {log.quantity_change > 0 ? "+" : ""}{log.quantity_change}
                        </TableCell>
                        <TableCell className="text-right pr-8 text-muted-foreground font-black text-[11px] tabular-nums">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center p-8">
                        <div className="flex flex-col items-center justify-center space-y-3 opacity-20 grayscale">
                          <span className="text-6xl">📝</span>
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Menunggu kejadian inventaris pertama</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Category Management Section */}
        <div className="col-span-full pt-6">
          <CategoryManager categories={categories} />
        </div>

        {/* Menu Management Section */}
        <div className="col-span-full pt-6">
          <MenuManagementTable products={allProducts || []} />
        </div>
      </div>
    </div>
  );
}
