import { AppSidebar } from "../AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "../ThemeProvider";

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <ThemeProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar userRole="ADMIN" />
          <div className="flex-1 p-8">
            <h1 className="text-2xl font-bold">Main Content Area</h1>
            <p className="text-muted-foreground mt-2">The sidebar navigation is shown on the left.</p>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
