import { cn } from "@/lib/utils";

interface TopBarProps {
  className?: string;
}

export function TopBar({ className }: TopBarProps) {
  return (
    <header className={cn("flex justify-between items-center mb-2 sticky top-0 z-10 py-2", className)}>
      <div className="relative w-full max-w-md">
        <input
          className="w-full pl-6 pr-12 py-3.5 bg-surface-variant/50 border-none rounded-full text-sm placeholder-on-surface-variant focus:ring-1 focus:ring-primary/20"
          placeholder="Search orders, tables, or stock..."
          type="text"
        />
        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
          search
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <span className="material-symbols-outlined text-xl">wifi</span>
        </div>
        <div className="flex items-center gap-3 bg-white border border-outline rounded-full pl-2 pr-4 py-1.5 cursor-pointer shadow-sm">
          <img
            alt="User"
            className="w-8 h-8 rounded-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCi3JW01tOT4WwKJoy-Aql2GUTWvPA_7RFe2Z31AuUk3Qhd7Q8ROBwW8eebihhCJDokaSRjZo5GLbuAY6aaaaAM9i6aonPlcf1x78mWw4tU4A7SlmDEabZhkgwG0WI_m35VC_muxLD7pOCbHY-5XajUdhRwstvqXeFkg-b7isCwYsaA2WaUlqaJYpRa5aVeKEvS3E6fTNYaavmVpX8FbZfXBWMsxuSEij74P_r8-j8JpMJaFDOIMovUgRl4g3g9v9WdEuTMhiPZcDM"
          />
          <div className="leading-none">
            <p className="text-xs font-bold">Admin User</p>
            <p className="text-[10px] text-on-surface-variant">Station Chief</p>
          </div>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </div>
      </div>
    </header>
  );
}
