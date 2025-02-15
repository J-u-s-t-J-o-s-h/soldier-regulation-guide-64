
import { Home, Book, Bookmark, Search, Settings, Menu, MessageSquare, LogOut } from "lucide-react";
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
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
    title: "Chats",
    icon: MessageSquare,
    url: "/chats",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

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

                {/* Sign Out Button */}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleSignOut}
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium truncate">
                      Sign Out
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
