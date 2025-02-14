
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
import { Link } from "react-router-dom";

const navigationItems = [
  {
    title: "Home",
    icon: Home,
    url: "/home",
  },
  {
    title: "Regulations",
    icon: Book,
    url: "/regulations",
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
      <SidebarTrigger className="fixed top-4 left-4 md:left-6 z-50 p-3 rounded-xl bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/15 active:scale-95 transition-all duration-200 border border-white/10">
        <Menu className="h-5 w-5 text-white/90 hover:text-white transition-colors" />
      </SidebarTrigger>
      <Sidebar className="border-r border-military-accent/20">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <Link key={item.title} to={item.url}>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
