import { Settings, LayoutDashboard, Printer, ClipboardList, KanbanSquare, FileText, QrCode, Users, FolderTree } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import ThemeToggle from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";

type AppSidebarProps = {
  userRole: "ADMIN" | "OPERATOR" | "VIEWER";
};

export function AppSidebar({ userRole }: AppSidebarProps) {
  const [location, setLocation] = useLocation();

  const mainItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Printers", url: "/printers", icon: Printer },
    { title: "Tasks", url: "/tasks", icon: ClipboardList },
    { title: "Task Board", url: "/board", icon: KanbanSquare },
    { title: "Work Logs", url: "/logs", icon: FileText },
    { title: "QR Scanner", url: "/scan", icon: QrCode },
  ];

  const settingsItems = [
    { title: "Categories", url: "/settings/categories", icon: FolderTree, roles: ["ADMIN", "OPERATOR"] },
    { title: "User Groups", url: "/settings/groups", icon: Users, roles: ["ADMIN"] },
    { title: "Settings", url: "/settings", icon: Settings, roles: ["ADMIN"] },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Settings className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">3D Printer Care</h2>
            <Badge variant="outline" className="text-xs mt-1">
              {userRole}
            </Badge>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <a href={item.url} onClick={(e) => { e.preventDefault(); setLocation(item.url); }}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {settingsItems.some(item => item.roles.includes(userRole)) && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems
                  .filter(item => item.roles.includes(userRole))
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                        data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <a href={item.url} onClick={(e) => { e.preventDefault(); setLocation(item.url); }}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
