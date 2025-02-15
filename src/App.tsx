
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Regulations from "./pages/Regulations";
import Bookmarks from "./pages/Bookmarks";
import AdvancedSearch from "./pages/AdvancedSearch";
import Chats from "./pages/Chats";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SubscriptionProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route 
                path="/auth" 
                element={session ? <Navigate to="/home" replace /> : <Auth />} 
              />
              <Route 
                path="/home" 
                element={session ? <Index /> : <Navigate to="/auth" replace />} 
              />
              <Route 
                path="/settings" 
                element={session ? <Settings /> : <Navigate to="/auth" replace />} 
              />
              <Route 
                path="/regulations" 
                element={session ? <Regulations /> : <Navigate to="/auth" replace />} 
              />
              <Route 
                path="/bookmarks" 
                element={session ? <Bookmarks /> : <Navigate to="/auth" replace />} 
              />
              <Route 
                path="/advanced-search" 
                element={session ? <AdvancedSearch /> : <Navigate to="/auth" replace />} 
              />
              <Route 
                path="/chats" 
                element={session ? <Chats /> : <Navigate to="/auth" replace />} 
              />
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SubscriptionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
