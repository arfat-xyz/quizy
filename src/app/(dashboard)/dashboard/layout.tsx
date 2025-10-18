import { AppSidebar } from "@/components/app-sidebar";
import GlobalBreadcrumb from "@/components/shared/GlobalBreadcrumb";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";
import { ReactNode } from "react";
export const metadata = metaDataGeneratorForNormalPage(
  "Dashboard layout - Arfat",
  "Your Productivity Dashboard on Arfat.",
);
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <GlobalBreadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Dashboard", href: "/dashboard" },
              ]}
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
