
import { SearchBar } from "@/components/SearchBar";
import { RecentSearches } from "@/components/RecentSearches";
import { Bookmarks } from "@/components/Bookmarks";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-military-gold">
                Army Regulations Guide
              </h1>
              <p className="text-military-muted">
                Search through Army regulations or ask questions to get instant answers
                with citations.
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-12">
              <div className="space-y-6">
                <SearchBar />
                <RecentSearches />
                <Bookmarks />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
