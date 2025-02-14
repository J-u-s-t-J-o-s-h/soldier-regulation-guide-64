
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Regulations from "./pages/Regulations";
import Bookmarks from "./pages/Bookmarks";
import AdvancedSearch from "./pages/AdvancedSearch";
import Chats from "./pages/Chats";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Index />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/regulations" element={<Regulations />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/advanced-search" element={<AdvancedSearch />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
