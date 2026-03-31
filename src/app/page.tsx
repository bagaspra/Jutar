import { createClient } from "@/utils/supabase/server";
import { MenuGrid } from "@/components/menu-grid";
import { CartPanel } from "@/components/cart-panel";
import { MenuItem, Category } from "@/types";
import { getCategories } from "@/actions/category-actions";

export default async function CashierPage() {
  const supabase = await createClient();

  const [productsResponse, categories] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(name, slug, emoji)")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    getCategories()
  ]);

  const { data: products, error } = productsResponse;

  if (error) {
    console.error("Fetch Products Error:", error);
  }

  // Map database format to MenuItem type
  const menuItems: MenuItem[] = (products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    category: p.categories?.slug || "uncategorized",
    emoji: p.emoji || "🍔",
  }));

  return (
    <main className="min-h-screen bg-background flex flex-col h-screen overflow-hidden">
      {/* Header Bar */}
      <header className="h-20 bg-white/50 backdrop-blur-md border-b flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-primary/20">
            🍔
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-foreground tracking-tight leading-none pt-1">JuRasa</h1>
            <span className="text-[10px] uppercase tracking-widest font-black text-primary/60">Modern POS Terminal</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-bold text-muted-foreground leading-none">Terminal #01</p>
            <p className="text-[10px] text-primary/60 font-black uppercase tracking-tighter">Fast Food Edition</p>
          </div>
          <div className="size-10 rounded-full bg-muted flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </div>
        </div>
      </header>

      {/* Grid Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 h-full overflow-hidden">
        {/* Left Column: Menu */}
        <section className="flex-1 h-full min-h-0 bg-white/30 rounded-[2.5rem] border p-6 shadow-xl backdrop-blur-sm">
          <MenuGrid items={menuItems} categories={categories as Category[]} />
        </section>

        {/* Right Column: Cart */}
        <aside className="w-full md:w-[400px] lg:w-[450px] shrink-0 h-full">
          <CartPanel />
        </aside>
      </div>
    </main>
  );
}
