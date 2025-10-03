import { Settings, LayoutDashboard, Printer, ClipboardList, KanbanSquare, FileText, QrCode, Users, FolderTree, ChevronDown, Mail, MessageSquare } from "lucide-react";
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
import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type AppSidebarProps = {
  userRole: "ADMIN" | "OPERATOR" | "VIEWER";
};

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const mainItems = [
    { title: t('nav.dashboard'), url: "/", icon: LayoutDashboard },
    { title: t('nav.printers'), url: "/printers", icon: Printer },
    { title: t('nav.tasks'), url: "/tasks", icon: ClipboardList },
    { title: t('nav.taskBoard'), url: "/board", icon: KanbanSquare },
    { title: t('nav.workLogs'), url: "/logs", icon: FileText },
    { title: t('nav.qrScanner'), url: "/scan", icon: QrCode },
  ];

  const settingsSubItems = [
    { title: t('nav.categories'), url: "/settings/categories", icon: FolderTree, roles: ["ADMIN", "OPERATOR"] },
    { title: t('nav.users'), url: "/settings/users", icon: Users, roles: ["ADMIN"] },
    { title: t('nav.groups'), url: "/settings/groups", icon: Users, roles: ["ADMIN"] },
    { title: t('nav.smtp'), url: "/settings/smtp", icon: Mail, roles: ["ADMIN"] },
    { title: t('nav.telegram'), url: "/settings/telegram", icon: MessageSquare, roles: ["ADMIN"] },
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
            <h2 className="font-semibold truncate">{t('nav.appTitle')}</h2>
            <Badge variant="outline" className="text-xs mt-1">
              {userRole}
            </Badge>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.mainMenu')}</SidebarGroupLabel>
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
            <SidebarGroupLabel>{t('nav.management')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.startsWith('/settings')}
                  >
                    <button 
                      onClick={() => setSettingsOpen(!settingsOpen)}
                      data-testid="nav-settings"
                      className="w-full"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{t('nav.settings')}</span>
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
                            data-testid="nav-general-settings"
                          >
                            <a href="/settings" onClick={(e) => { e.preventDefault(); setLocation('/settings'); }}>
                              <Settings className="h-4 w-4" />
                              <span>{t('nav.general')}</span>
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
          <span className="text-sm text-muted-foreground">{t('nav.theme')}</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
