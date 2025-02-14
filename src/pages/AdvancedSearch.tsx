
import { Search, Filter } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SearchBar } from "@/components/SearchBar";

const AdvancedSearch = () => {
  const filters = [
    { name: "Category", options: ["Personnel", "Operations", "Supply", "Medical", "Intelligence", "Financial"] },
    { name: "Date Range", options: ["Last 30 days", "Last 6 months", "Last year", "All time"] },
    { name: "Document Type", options: ["Regulations", "Policies", "Manuals", "Forms"] },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-6 w-6 text-military-gold" />
                <h1 className="text-3xl font-bold text-military-gold">
                  Advanced Search
                </h1>
              </div>
              <p className="text-military-muted">
                Refine your search with advanced filters and options.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <SearchBar />
              
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filters.map((filter) => (
                  <div
                    key={filter.name}
                    className="p-4 rounded-lg border border-military-accent/20 bg-white/5 backdrop-blur-sm"
                  >
                    <h3 className="text-sm font-semibold text-military-gold mb-3 flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {filter.name}
                    </h3>
                    <div className="space-y-2">
                      {filter.options.map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 text-military-text/80 hover:text-military-gold transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-military-accent/20 text-military-gold focus:ring-military-gold/50"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdvancedSearch;
