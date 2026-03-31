import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { OrderCart } from "@/components/features/order-cart";
import { POSMenu } from "@/components/features/pos-menu";
import { getCategories } from "@/actions/category-actions";
import { MenuItem } from "@/types";

export default async function CashierPage() {
  const supabase = await createClient();

  // 1. Fetch Real Products and Categories
  const [productsResponse, categories] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    getCategories()
  ]);

  const { data: products, error } = productsResponse;

  if (error) {
    console.error("Fetch Products Error:", error);
  }

  // 2. Map raw database products to MenuItem type
  const menuItems: MenuItem[] = (products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    category: p.categories?.slug || "uncategorized",
    image_url: p.image_url,
    description: p.description,
  }));

  return (
    <div className="bg-white text-on-surface flex h-screen overflow-hidden font-body">
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden px-6 pt-6 bg-surface/30">
        <TopBar />

        {/* Dynamic Menu & Categories Wrapper (Client Component) */}
        <POSMenu 
          products={menuItems} 
          categories={categories as any[]} 
        />
      </main>

      {/* Right Sidebar (Current Order) */}
      <OrderCart />
    </div>
  );
}
