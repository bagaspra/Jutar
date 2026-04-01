"use client";

interface PageWrapperProps {
  children: React.ReactNode;
}

/**
 * Since the persistent Sidebar and Main Layout are now handled 
 * at the /admin/layout level, this component is now a pure
 * presentational wrapper for the interior page content.
 */
export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
      {children}
    </div>
  );
}
