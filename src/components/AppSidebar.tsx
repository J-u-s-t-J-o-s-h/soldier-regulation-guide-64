
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
    url: "/bookmarks",
  },
  {
    title: "Advanced Search",
    icon: Search,
    url: "/advanced-search",
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
      <Sidebar className="border-r border-military-accent/20">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <Link 
                    key={item.title} 
                    to={item.url}
                    className="w-full"
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton className="w-full justify-start gap-3">
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {item.title}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger className="p-3 rounded-xl bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/15 active:scale-95 transition-all duration-200 border border-white/10">
        <Menu className="h-5 w-5 text-white/90 hover:text-white transition-colors" />
      </SidebarTrigger>
    </>
  );
}
