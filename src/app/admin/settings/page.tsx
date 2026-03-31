import { PageWrapper } from "@/components/layout/page-wrapper";
import { TopBar } from "@/components/layout/top-bar";

export default async function SettingsPage() {
  return (
    <PageWrapper>
      <TopBar />
      
      <div className="space-y-10 pb-20 px-4">
        {/* Page Header */}
        <div>
          <h2 className="text-4xl font-black text-on-surface tracking-tight font-headline">System Configuration</h2>
          <p className="text-neutral-500 mt-2 font-body">Manage terminal preferences, tax rates, and peripheral settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Settings Navigation */}
          <aside className="lg:col-span-3 space-y-2">
            {[
              { label: "General", icon: "settings", active: true },
              { label: "Tax & Pricing", icon: "payments", active: false },
              { label: "Receipt Printer", icon: "print", active: false },
              { label: "Terminal Display", icon: "monitor", active: false },
              { label: "Staff Access", icon: "group", active: false },
              { label: "Cloud Sync", icon: "cloud_sync", active: false }
            ].map((tab) => (
              <button
                key={tab.label}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  tab.active 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-white text-on-surface-variant hover:bg-surface-variant/50 border border-outline/10 text-neutral-500"
                }`}
              >
                <span className={`material-symbols-outlined text-lg ${tab.active ? 'material-symbols-fill' : ''}`}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </aside>

          {/* Settings Form Canvas */}
          <div className="lg:col-span-9 bg-white rounded-3xl border border-outline/20 p-10 editorial-shadow">
            <div className="max-w-2xl space-y-10">
              {/* Branch Information Section */}
              <section className="space-y-6">
                <h3 className="text-xl font-extrabold font-headline pb-4 border-b border-outline/10">Branch Identity</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Store Name</label>
                    <input 
                      type="text" 
                      defaultValue="Editorial Gastronomy - HQ" 
                      className="w-full bg-surface-variant/30 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-1 focus:ring-primary/20" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Store Location ID</label>
                    <input 
                      type="text" 
                      defaultValue="LOC-JKT-001" 
                      className="w-full bg-surface-variant/30 border-none rounded-xl py-3 px-4 text-sm font-medium opacity-50" 
                      readOnly 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Legal Address</label>
                  <textarea 
                    rows={3} 
                    className="w-full bg-surface-variant/30 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-1 focus:ring-primary/20" 
                    defaultValue="Jl. Gastronomi Premium No. 88, Kebayoran Baru, Jakarta Selatan, 12160"
                  />
                </div>
              </section>

              {/* Preferences Section */}
              <section className="space-y-6">
                <h3 className="text-xl font-extrabold font-headline pb-4 border-b border-outline/10">Terminal Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-variant/20 rounded-2xl border border-outline/10 group hover:border-primary/20 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold">Automatic Receipt Printing</h4>
                      <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Print receipt immediately after successful transaction.</p>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-surface-variant/20 rounded-2xl border border-outline/10 group hover:border-primary/20 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold">Dual-Display Mirroring</h4>
                      <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Sync customer facing display in real-time.</p>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-outline/10 group hover:border-primary/20 transition-colors opacity-60">
                    <div>
                      <h4 className="text-sm font-bold">Dark Mode UI (Beta)</h4>
                      <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Use high-contrast dark theme for night service.</p>
                    </div>
                    <div className="w-12 h-6 bg-neutral-200 rounded-full relative p-1 cursor-not-allowed">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="pt-10 flex gap-4">
                <button className="flex-1 bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 font-headline uppercase tracking-widest text-sm hover:bg-primary/90 transition-all active:scale-[0.98]">
                  Save Changes
                </button>
                <button className="px-8 border border-outline/30 rounded-2xl font-bold text-sm text-neutral-400 hover:bg-surface-variant transition-colors">
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
