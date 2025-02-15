
import { Bookmark, Lock } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const Bookmarks = () => {
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  
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

  if (!subscription.isPremium) {
    return (
      <div className="w-full max-w-2xl animate-fade-up delay-200">
        <h2 className="text-military-gold text-sm font-medium mb-3 flex items-center gap-2">
          <Lock size={16} />
          Premium Feature
        </h2>
        <div className="military-glass p-6 rounded-lg text-center">
          <p className="text-military-muted mb-4">
            Bookmarking is available for premium subscribers only.
          </p>
          <Button
            variant="outline"
            className="border-military-gold text-military-gold hover:bg-military-gold/10"
            onClick={() => navigate("/settings#upgrade")}
          >
            Upgrade to Premium
          </Button>
        </div>
      </div>
    );
  }

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
