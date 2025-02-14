
import { Search } from "lucide-react";
import { useState } from "react";

export const SearchBar = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full max-w-2xl animate-fade-up">
      <div className="relative military-glass rounded-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-military-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Army regulations or ask a question..."
          className="w-full bg-transparent py-4 pl-12 pr-4 text-military-text placeholder:text-military-muted focus:outline-none focus:ring-2 focus:ring-military-accent/50 rounded-lg"
        />
      </div>
    </div>
  );
};
