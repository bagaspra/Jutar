"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { TopBar } from "@/components/layout/top-bar";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { 
  CategoryManager 
} from "@/components/features/management/category-manager";
import { 
  ProductBuilder 
} from "@/components/features/management/product-builder";
import { 
  InventoryAdjuster 
} from "@/components/features/management/inventory-adjuster";
import { 
  PaymentMethodManager 
} from "@/components/features/management/payment-method-manager";
import { 
  MaterialManager 
} from "@/components/features/management/material-manager";
import { 
  ExpenseManager 
} from "@/components/features/management/expense-manager";

const ALL_TABS = [
  { id: "categories", label: "Kategori", icon: "category", roles: ["super_admin"] },
  { id: "products", label: "Daftar Menu", icon: "restaurant_menu", roles: ["super_admin"] },
  { id: "materials", label: "Bahan Baku", icon: "database", roles: ["super_admin", "inventory_admin"] },
  { id: "inventory", label: "Stok & Inventaris", icon: "inventory", roles: ["super_admin", "inventory_admin", "cashier"] },
  { id: "expenses", label: "Pengeluaran", icon: "receipt_long", roles: ["super_admin"] },
  { id: "payments", label: "Pembayaran", icon: "payments", roles: ["super_admin"] },
];

export default function ManagementPage() {
  const [activeTab, setActiveTab] = useState("");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        const userRole = profile?.role || "cashier";
        setRole(userRole);
        
        // Auto-select first allowed tab
        const allowed = ALL_TABS.filter(t => t.roles.includes(userRole));
        if (allowed.length > 0) setActiveTab(allowed[0].id);
      }
    }
    fetchRole();
  }, []);

  const visibleTabs = ALL_TABS.filter(tab => !role || tab.roles.includes(role));

  return (
    <PageWrapper>
      <TopBar />
      
      <div className="space-y-10 pb-20">
        {/* Page Header */}
        <div className="px-2">
          <h2 className="text-4xl font-extrabold tracking-tighter italic uppercase font-headline">Kelola Sistem</h2>
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-60">
            {role === 'cashier' ? 'Ringkasan Stok - Hanya Baca' : 'Kontrol Administratif & Sinkronisasi Database'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-surface-variant/20 rounded-2xl border border-outline/10 w-fit">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id 
                  ? "bg-white text-primary shadow-xl shadow-black/5 ring-1 ring-black/5" 
                  : "text-on-surface-variant/40 hover:text-on-surface hover:bg-white/50"
              )}
            >
              <span className={cn(
                "material-symbols-outlined text-lg",
                activeTab === tab.id && "material-symbols-fill"
              )}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === "categories" && <CategoryManager />}
          {activeTab === "products" && <ProductBuilder />}
          {activeTab === "materials" && <MaterialManager />}
          {activeTab === "inventory" && <InventoryAdjuster readOnly={role === "cashier"} />}
          {activeTab === "expenses" && <ExpenseManager />}
          {activeTab === "payments" && <PaymentMethodManager />}
        </div>
      </div>
    </PageWrapper>
  );
}
