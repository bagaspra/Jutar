"use client";

import { useEffect, useState } from "react";
import { Loader2, ShoppingCart, ChefHat, ClipboardList, Plus, Minus, Trash2 } from "lucide-react";
import { getPublicMenu, submitKioskOrder, getSessionOrders } from "@/actions/kiosk-actions";
import { useKioskCartStore } from "@/store/useKioskCartStore";
import { formatCurrency } from "@/lib/utils";

const BRAND_RED = "#C8102E";
const CREAM_BG = "#F5F0EB";

interface Props {
  tableNumber: string;
  sessionId: string;
  customerName: string;
}

type Tab = "menu" | "orders";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  emoji?: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending_kitchen: { label: "Sedang Diproses", bg: "#FFF3CD", color: "#856404" },
    paid:            { label: "Selesai",         bg: "#D1FAE5", color: "#065F46" },
    open:            { label: "Ditunda",          bg: "#E0E7FF", color: "#3730A3" },
  };
  const s = map[status] ?? { label: status, bg: "#F3F4F6", color: "#374151" };
  return (
    <span
      className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export function MenuCatalog({ tableNumber, sessionId, customerName }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("menu");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [menuLoading, setMenuLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { items, addItem, updateQuantity, clearCart, getTotal, getSubtotal, getTotalItems } =
    useKioskCartStore();

  // Load menu on mount
  useEffect(() => {
    getPublicMenu().then((result) => {
      if (result.success) {
        setCategories(result.categories as Category[]);
        setProducts(result.products as Product[]);
      }
      setMenuLoading(false);
    });
  }, []);

  // Load orders when switching to orders tab
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const result = await getSessionOrders(sessionId);
    if (result.success) setOrders(result.orders);
    setOrdersLoading(false);
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);

    const result = await submitKioskOrder(sessionId, tableNumber, items);
    if (result.success) {
      clearCart();
      setActiveTab("orders");
      fetchOrders();
    } else {
      setSubmitError(result.error ?? "Gagal mengirim pesanan. Coba lagi.");
    }
    setSubmitting(false);
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const total = getTotal();

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ backgroundColor: CREAM_BG }}>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: BRAND_RED }}>
              MEJA {tableNumber}
            </p>
            <p className="text-xs font-bold text-gray-500">Halo, {customerName}!</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab: Menu */}
            <button
              onClick={() => setActiveTab("menu")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
              style={
                activeTab === "menu"
                  ? { backgroundColor: BRAND_RED, color: "white" }
                  : { backgroundColor: "#F3F4F6", color: "#6B7280" }
              }
            >
              <ChefHat className="size-3" />
              Menu
            </button>
            {/* Tab: Pesanan */}
            <button
              onClick={() => setActiveTab("orders")}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
              style={
                activeTab === "orders"
                  ? { backgroundColor: BRAND_RED, color: "white" }
                  : { backgroundColor: "#F3F4F6", color: "#6B7280" }
              }
            >
              <ClipboardList className="size-3" />
              Pesanan Saya
              {orders.length > 0 && activeTab !== "orders" && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center text-white" style={{ backgroundColor: BRAND_RED }}>
                  {orders.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB: MENU ── */}
      {activeTab === "menu" && (
        <div className="flex-1 flex flex-col pb-32">
          {menuLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin" style={{ color: BRAND_RED }} />
            </div>
          ) : (
            <>
              {/* Category filter */}
              <div className="overflow-x-auto no-scrollbar px-4 py-3 flex gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="shrink-0 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide transition-all"
                  style={
                    selectedCategory === "all"
                      ? { backgroundColor: BRAND_RED, color: "white" }
                      : { backgroundColor: "white", color: "#6B7280", border: "1px solid #E5E7EB" }
                  }
                >
                  Semua
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className="shrink-0 flex items-center gap-1 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide transition-all"
                    style={
                      selectedCategory === cat.slug
                        ? { backgroundColor: BRAND_RED, color: "white" }
                        : { backgroundColor: "white", color: "#6B7280", border: "1px solid #E5E7EB" }
                    }
                  >
                    {cat.emoji && <span>{cat.emoji}</span>}
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Product grid */}
              {filteredProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40">
                  <ChefHat className="size-12 mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest">Menu tidak tersedia</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                  {filteredProducts.map((product) => {
                    const cartItem = items.find((i) => i.id === product.id);
                    const qty = cartItem?.quantity ?? 0;
                    return (
                      <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col">
                        {/* Product image */}
                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-3 flex flex-col gap-2 flex-1">
                          <div>
                            <p className="text-xs font-black text-gray-900 leading-tight">{product.name}</p>
                            <p className="text-sm font-black mt-0.5" style={{ color: BRAND_RED }}>
                              {formatCurrency(product.price)}
                            </p>
                          </div>

                          {/* Qty controls */}
                          {qty === 0 ? (
                            <button
                              onClick={() => addItem(product)}
                              className="w-full py-1.5 rounded-xl text-white text-[11px] font-black uppercase tracking-wide flex items-center justify-center gap-1 transition-all active:scale-95"
                              style={{ backgroundColor: BRAND_RED }}
                            >
                              <Plus className="size-3" />
                              Tambah
                            </button>
                          ) : (
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-2 py-1">
                              <button
                                onClick={() => updateQuantity(product.id, qty - 1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                style={{ backgroundColor: BRAND_RED, color: "white" }}
                              >
                                {qty === 1 ? <Trash2 className="size-3" /> : <Minus className="size-3" />}
                              </button>
                              <span className="text-sm font-black text-gray-900 tabular-nums">{qty}</span>
                              <button
                                onClick={() => addItem(product)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                style={{ backgroundColor: BRAND_RED, color: "white" }}
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB: PESANAN SAYA ── */}
      {activeTab === "orders" && (
        <div className="flex-1 flex flex-col p-4 gap-4">
          {ordersLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin" style={{ color: BRAND_RED }} />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40">
              <ClipboardList className="size-12 mb-3" />
              <p className="text-xs font-black uppercase tracking-widest">Belum ada pesanan</p>
              <p className="text-[10px] text-gray-400 mt-1">Pesan sesuatu dari tab Menu</p>
            </div>
          ) : (
            orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {new Date(order.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-xs font-black text-gray-600">#{order.receipt_number.split("-").pop()}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="space-y-1.5 mb-3">
                  {order.order_items?.map((oi: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-700">
                        {oi.quantity}× {oi.products?.name ?? "Item"}
                      </span>
                      <span className="font-bold text-gray-900 tabular-nums">
                        {formatCurrency(oi.price_at_time * oi.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total</span>
                  <span className="text-sm font-black" style={{ color: BRAND_RED }}>
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── STICKY CART BOTTOM BAR (Menu tab only) ── */}
      {activeTab === "menu" && totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4" style={{ backgroundColor: CREAM_BG }}>
          <div className="max-w-lg mx-auto">
            {submitError && (
              <p className="text-xs text-red-500 font-medium text-center mb-2">{submitError}</p>
            )}
            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="w-full rounded-2xl font-black text-white flex items-center justify-between px-5 py-4 transition-all active:scale-[0.98] disabled:opacity-70"
              style={{ backgroundColor: BRAND_RED, boxShadow: "0 8px 24px rgba(200,16,46,0.35)" }}
            >
              <div className="flex items-center gap-2">
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShoppingCart className="size-4" />
                )}
                <span className="text-[11px] uppercase tracking-widest">
                  {submitting ? "Mengirim..." : `${totalItems} Item`}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-70">Total</p>
                <p className="text-base font-black tabular-nums leading-none">{formatCurrency(total)}</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
