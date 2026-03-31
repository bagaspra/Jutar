import { Sidebar } from "./sidebar";

interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="bg-white text-on-surface flex min-h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-h-screen flex flex-col overflow-y-auto no-scrollbar px-6 pt-6 bg-surface/30 print:hidden">
        {children}
      </main>
    </div>
  );
}
