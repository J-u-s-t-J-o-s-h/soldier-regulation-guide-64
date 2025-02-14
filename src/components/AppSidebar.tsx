
import { Home, Book, Bookmark, Search, Settings, Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Home",
    icon: Home,
    url: "/home",
  },
  {
    title: "Regulations",
    icon: Book,
    url: "#regulations",
  },
  {
    title: "Bookmarks",
    icon: Bookmark,
    url: "#bookmarks",
  },
  {
    title: "Advanced Search",
    icon: Search,
    url: "#search",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

export function AppSidebar() {
  return (
    <>
      <SidebarTrigger className="fixed top-4 left-4 z-50">
        <Menu className="h-6 w-6 text-military-gold hover:text-military-gold/80 transition-colors" />
      </SidebarTrigger>
      <Sidebar className="border-r border-military-accent/20">
        <SidebarContent>
          <SidebarGroup>
            <div className="px-3 py-4">
              <h2 className="mb-4 text-sm uppercase tracking-wider text-military-gold/70">
                AR Guide
              </h2>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="w-full px-3 py-2 hover:bg-military-accent/10 transition-colors rounded-md group"
                    >
                      <a
                        href={item.url}
                        className="flex items-center gap-3 text-military-text/80 hover:text-military-gold"
                      >
                        <item.icon className="h-4 w-4 group-hover:text-military-gold transition-colors" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
