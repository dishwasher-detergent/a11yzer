import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden h-dvh">
        <header className="py-2 px-4 border-b w-full flex flex-row items-center gap-2 md:hidden">
          <SidebarTrigger />
          <p className="font-bold">A11yzer</p>
        </header>
        <div className="max-w-5xl mx-auto w-full h-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
