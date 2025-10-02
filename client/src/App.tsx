import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import Dashboard from "@/pages/Dashboard";
import Printers from "@/pages/Printers";
import TaskBoard from "@/pages/TaskBoard";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function Router() {
  const { data: user, isLoading, refetch } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => refetch()} />;
  }

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar userRole={user.role as "ADMIN" | "OPERATOR" | "VIEWER"} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/printers" component={Printers} />
                <Route path="/board" component={TaskBoard} />
                <Route path="/tasks">
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold">Tasks</h1>
                    <p className="text-muted-foreground">Task management coming soon...</p>
                  </div>
                </Route>
                <Route path="/logs">
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold">Work Logs</h1>
                    <p className="text-muted-foreground">Work logs coming soon...</p>
                  </div>
                </Route>
                <Route path="/scan">
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold">QR Scanner</h1>
                    <p className="text-muted-foreground">QR scanner coming soon...</p>
                  </div>
                </Route>
                <Route path="/settings/categories">
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold">Task Categories</h1>
                    <p className="text-muted-foreground">Categories management coming soon...</p>
                  </div>
                </Route>
                <Route path="/settings/groups">
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold">User Groups</h1>
                    <p className="text-muted-foreground">User groups management coming soon...</p>
                  </div>
                </Route>
                <Route path="/settings">
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Settings coming soon...</p>
                  </div>
                </Route>
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Router />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
