import { Settings, LayoutDashboard, Printer, ClipboardList, KanbanSquare, FileText, QrCode, Users, FolderTree, ChevronDown } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import ThemeToggle from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type AppSidebarProps = {
  userRole: "ADMIN" | "OPERATOR" | "VIEWER";
};

export function AppSidebar({ userRole }: AppSidebarProps) {
  const [location, setLocation] = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const mainItems = [
    { title: "Панель управління", url: "/", icon: LayoutDashboard },
    { title: "Принтери", url: "/printers", icon: Printer },
    { title: "Завдання", url: "/tasks", icon: ClipboardList },
    { title: "Дошка завдань", url: "/board", icon: KanbanSquare },
    { title: "Журнал робіт", url: "/logs", icon: FileText },
    { title: "QR сканер", url: "/scan", icon: QrCode },
  ];

  const settingsSubItems = [
    { title: "Категорії", url: "/settings/categories", icon: FolderTree, roles: ["ADMIN", "OPERATOR"] },
    { title: "Користувачі", url: "/settings/users", icon: Users, roles: ["ADMIN"] },
    { title: "Групи", url: "/settings/groups", icon: Users, roles: ["ADMIN"] },
  ];

  const hasSettingsAccess = settingsSubItems.some(item => item.roles.includes(userRole)) || userRole === "ADMIN";

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Settings className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">Догляд за 3D принтерами</h2>
            <Badge variant="outline" className="text-xs mt-1">
              {userRole}
            </Badge>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Головне меню</SidebarGroupLabel>
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

        {hasSettingsAccess && (
          <SidebarGroup>
            <SidebarGroupLabel>Керування</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.startsWith('/settings')}
                  >
                    <button 
                      onClick={() => setSettingsOpen(!settingsOpen)}
                      data-testid="nav-налаштування"
                      className="w-full"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Налаштування</span>
                      <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </SidebarMenuButton>
                  {settingsOpen && (
                    <SidebarMenuSub>
                      {settingsSubItems
                        .filter(item => item.roles.includes(userRole))
                        .map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={location === item.url}
                              data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <a href={item.url} onClick={(e) => { e.preventDefault(); setLocation(item.url); }}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      {userRole === "ADMIN" && (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location === '/settings'}
                            data-testid="nav-загальні-налаштування"
                          >
                            <a href="/settings" onClick={(e) => { e.preventDefault(); setLocation('/settings'); }}>
                              <Settings className="h-4 w-4" />
                              <span>Загальні</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Тема</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
