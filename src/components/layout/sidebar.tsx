"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/auth-actions";
import { useState } from "react";
import { ShiftCloseModal } from "@/components/features/pos/shift-close-modal";

const NAV_ITEMS = [
  { icon: "store", label: "Kasir", href: "/", roles: ["super_admin", "cashier"] },
  { icon: "dashboard", label: "Dasbor", href: "/admin", roles: ["super_admin"], exact: true },
  { icon: "history", label: "Riwayat", href: "/admin/history", roles: ["super_admin", "cashier"] },
  { icon: "inventory_2", label: "Kelola", href: "/admin/management", roles: ["super_admin", "cashier", "inventory_admin"] },
  { icon: "bar_chart", label: "Laporan", href: "/admin/report", roles: ["super_admin"] },
  { icon: "manage_accounts", label: "Akun", href: "/admin/accounts", roles: ["super_admin"] },
  { icon: "tv", label: "CFD", href: "/cfd", roles: ["super_admin", "cashier"] },
];

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside className="h-[calc(100vh-2rem)] w-28 bg-primary rounded-sidebar m-4 flex flex-col items-center py-8 gap-8 text-white shrink-0 shadow-2xl shadow-primary/20 print:hidden overflow-y-auto no-scrollbar">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg shrink-0">
        <span className="material-symbols-outlined text-primary text-3xl material-symbols-fill">
          restaurant
        </span>
      </div>

      <nav className="flex flex-col gap-8 flex-1">
        {visibleItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-110",
                isActive ? "opacity-100 translate-x-1" : "opacity-40"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                isActive && "bg-white/10"
              )}>
                <span 
                  className={cn(
                    "material-symbols-outlined text-2xl",
                    isActive && "material-symbols-fill"
                  )}
                >
                  {item.icon}
                </span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-center">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions Section */}
      <div className="mt-auto flex flex-col gap-6 w-full items-center pb-2 shrink-0">
        {/* Settings — super_admin only */}
        {role === "super_admin" && (
          <Link
            href="/admin/settings"
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-110",
              pathname === "/admin/settings" ? "opacity-100" : "opacity-40"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl transition-all",
              pathname === "/admin/settings" && "bg-white/10"
            )}>
              <span className={cn(
                "material-symbols-outlined text-2xl",
                pathname === "/admin/settings" && "material-symbols-fill"
              )}>
                settings
              </span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-center">Pengaturan</span>
          </Link>
        )}

        {/* Logout Button */}
        <button
          onClick={() => signOut()}
          className="flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-110 opacity-40 hover:opacity-100 group"
        >
          <div className="p-2 rounded-xl group-hover:bg-red-500/20 transition-all">
            <span className="material-symbols-outlined text-2xl group-hover:text-red-400 font-black">
              logout
            </span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-center group-hover:text-red-400">Keluar</span>
        </button>

        {/* Close Shift (Reconciliation) */}
        {(role === "super_admin" || role === "cashier") && (
          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-110 opacity-40 hover:opacity-100 group mt-4 border-t border-white/10 pt-6 w-full"
          >
            <div className="p-2 rounded-xl group-hover:bg-primary-foreground/20 transition-all">
              <span className="material-symbols-outlined text-2xl group-hover:text-white font-black">
                lock_clock
              </span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-center group-hover:text-white leading-tight">Tutup<br/>Kasir</span>
          </button>
        )}

        <ShiftCloseModal 
          isOpen={isShiftModalOpen} 
          onClose={() => setIsShiftModalOpen(false)} 
        />
      </div>
    </aside>

  );
}
