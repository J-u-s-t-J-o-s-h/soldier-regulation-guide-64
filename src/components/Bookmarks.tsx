
import { Bookmark } from "lucide-react";

export const Bookmarks = () => {
  const bookmarks = [
    {
      title: "AR 670-1",
      description: "Wear and Appearance of Army Uniforms and Insignia",
    },
    {
      title: "AR 350-1",
      description: "Army Training and Leader Development",
    },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-up delay-200">
      <h2 className="text-military-gold text-sm font-medium mb-3 flex items-center gap-2">
        <Bookmark size={16} />
        Bookmarked Regulations
      </h2>
      <div className="space-y-2">
        {bookmarks.map((bookmark, index) => (
          <button
            key={index}
            className="w-full military-glass p-4 rounded-lg text-left hover:bg-military-accent/10 transition-colors"
          >
            <h3 className="font-medium mb-1">{bookmark.title}</h3>
            <p className="text-military-muted text-sm">{bookmark.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
