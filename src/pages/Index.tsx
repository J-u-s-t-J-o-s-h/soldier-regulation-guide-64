
import { SearchBar } from "@/components/SearchBar";
import { RecentSearches } from "@/components/RecentSearches";
import { Bookmarks } from "@/components/Bookmarks";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="w-full max-w-2xl mb-8 animate-fade-up">
        <h1 className="text-3xl font-bold mb-2 text-military-gold">
          Army Regulations Guide
        </h1>
        <p className="text-military-muted">
          Search through Army regulations or ask questions to get instant answers
          with citations.
        </p>
      </div>
      
      <div className="w-full space-y-6">
        <SearchBar />
        <RecentSearches />
        <Bookmarks />
      </div>
    </div>
  );
};

export default Index;
