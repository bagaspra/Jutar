"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/admin", exact: true },
  { icon: "store", label: "Cashier", href: "/", exact: true },
  { icon: "history", label: "History", href: "/admin/history" },
  { icon: "bar_chart", label: "Reports", href: "/admin/report" },
  { icon: "tv", label: "CFD", href: "/cfd" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-[calc(100vh-2rem)] w-28 bg-primary rounded-sidebar m-4 flex flex-col items-center py-8 gap-8 text-white shrink-0 shadow-2xl shadow-primary/20 print:hidden">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
        <span className="material-symbols-outlined text-primary text-3xl material-symbols-fill">
          restaurant
        </span>
      </div>

      <nav className="flex flex-col gap-8 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
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
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/admin/settings"
        className={cn(
          "flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-110 mt-auto",
          pathname === "/admin/settings" ? "opacity-100" : "opacity-40"
        )}
      >
        <div className={cn(
          "p-2 rounded-xl transition-all",
          pathname === "/admin/settings" && "bg-white/10"
        )}>
          <span 
            className={cn(
              "material-symbols-outlined text-2xl",
              pathname === "/admin/settings" && "material-symbols-fill"
            )}
          >
            settings
          </span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">Settings</span>
      </Link>
    </aside>
  );
}
