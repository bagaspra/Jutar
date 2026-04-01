import { SidebarServerWrapper } from "@/components/layout/sidebar-server-wrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white text-on-surface flex min-h-screen print:block">
      <SidebarServerWrapper />
      
      <main className="flex-1 min-h-screen flex flex-col overflow-y-auto no-scrollbar px-6 pt-6 bg-surface/30">
        {children}
      </main>
    </div>
  );
}
