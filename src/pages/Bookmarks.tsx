
import { Bookmark } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SearchBar } from "@/components/SearchBar";

const Bookmarks = () => {
  const bookmarks = [
    {
      id: "1",
      title: "AR 670-1",
      description: "Wear and Appearance of Army Uniforms and Insignia",
      dateAdded: "2024-02-15",
      category: "Personnel",
    },
    {
      id: "2",
      title: "AR 350-1",
      description: "Army Training and Leader Development",
      dateAdded: "2024-02-14",
      category: "Training",
    },
    {
      id: "3",
      title: "AR 600-20",
      description: "Army Command Policy",
      dateAdded: "2024-02-13",
      category: "Leadership",
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Bookmark className="h-6 w-6 text-military-gold" />
                <h1 className="text-3xl font-bold text-military-gold">
                  My Bookmarks
                </h1>
              </div>
              <p className="text-military-muted">
                Quick access to your saved Army regulations and documents.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <SearchBar />
              
              <div className="mt-8 space-y-4">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="p-4 rounded-lg border border-military-accent/20 hover:border-military-gold/50 transition-colors bg-white/5 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-military-gold">
                          {bookmark.title}
                        </h3>
                        <p className="text-sm text-military-muted mt-1">
                          {bookmark.description}
                        </p>
                      </div>
                      <span className="text-xs text-military-muted">
                        Added {bookmark.dateAdded}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-military-accent/20 text-military-gold">
                        {bookmark.category}
                      </span>
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

export default Bookmarks;
