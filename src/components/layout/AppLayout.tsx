import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className={cn("relative flex flex-col min-h-screen bg-background", className)}>
        <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur px-4 lg:hidden">
          <SidebarTrigger />
          <div className="flex-1 text-sm font-bold tracking-tight">BarMaster.PH</div>
        </div>
        <main className="flex-1">
          {container ? (
            <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12", contentClassName)}>
              {children}
            </div>
          ) : (
            <div className={cn("py-8 md:py-10", contentClassName)}>
              {children}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}