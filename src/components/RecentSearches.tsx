
import { Clock } from "lucide-react";

export const RecentSearches = () => {
  const recentSearches = [
    "AR 670-1 Wear and Appearance",
    "Physical Fitness Requirements",
    "Leave Policy Updates",
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-up delay-100">
      <h2 className="text-military-gold text-sm font-medium mb-3 flex items-center gap-2">
        <Clock size={16} />
        Recent Searches
      </h2>
      <div className="space-y-2">
        {recentSearches.map((search, index) => (
          <button
            key={index}
            className="w-full military-glass p-3 rounded-lg text-left hover:bg-military-accent/10 transition-colors"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
};
