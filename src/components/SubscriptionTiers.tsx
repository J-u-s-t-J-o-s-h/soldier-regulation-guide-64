
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type FeatureItem = {
  name: string;
  included: boolean;
};

type TierProps = {
  name: string;
  price: string;
  description: string;
  features: FeatureItem[];
  buttonText: string;
  highlighted?: boolean;
};

const Tier = ({ name, price, description, features, buttonText, highlighted }: TierProps) => (
  <div className={`military-glass p-6 rounded-lg flex flex-col h-full ${
    highlighted ? 'border-2 border-military-gold' : ''
  }`}>
    <div className="mb-6">
      <h3 className="text-xl font-bold text-military-gold mb-2">{name}</h3>
      <div className="mb-3">
        <span className="text-2xl font-bold">{price}</span>
        {price !== "Free" && <span className="text-military-muted">/month</span>}
      </div>
      <p className="text-military-muted">{description}</p>
    </div>
    
    <div className="space-y-3 flex-grow mb-6">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start gap-3">
          {feature.included ? (
            <Check className="text-military-gold shrink-0 mt-1" size={18} />
          ) : (
            <X className="text-military-muted shrink-0 mt-1" size={18} />
          )}
          <span className={feature.included ? "text-military-text" : "text-military-muted"}>
            {feature.name}
          </span>
        </div>
      ))}
    </div>
    
    <Button 
      variant={highlighted ? "default" : "outline"}
      className={`w-full ${
        highlighted 
          ? "bg-military-gold hover:bg-military-gold/90 text-military-dark" 
          : "border-military-gold text-military-gold hover:bg-military-gold/10"
      }`}
    >
      {buttonText}
    </Button>
  </div>
);

export const SubscriptionTiers = () => {
  const freeTier = {
    name: "Free",
    price: "Free",
    description: "Essential tools for basic regulation searches",
    buttonText: "Get Started",
    features: [
      { name: "Basic search functionality", included: true },
      { name: "Limited AI-generated responses per day", included: true },
      { name: "Ad-supported experience", included: true },
      { name: "Offline access", included: false },
      { name: "Bookmarking features", included: false },
      { name: "Advanced search filters", included: false },
    ],
  };

  const premiumTier = {
    name: "Premium",
    price: "$9.99",
    description: "Advanced features for serious professionals",
    buttonText: "Upgrade to Premium",
    features: [
      { name: "Unlimited AI-generated responses", included: true },
      { name: "Ad-free experience", included: true },
      { name: "Advanced search with filters", included: true },
      { name: "Offline access to regulations", included: true },
      { name: "Bookmarking and saving", included: true },
      { name: "Priority support", included: true },
    ],
  };

  return (
    <div className="w-full max-w-5xl animate-fade-up">
      <h2 className="text-center text-2xl font-bold text-military-gold mb-2">
        Choose Your Plan
      </h2>
      <p className="text-center text-military-muted mb-8">
        Select the plan that best fits your needs
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <Tier {...freeTier} />
        <Tier {...premiumTier} highlighted />
      </div>
    </div>
  );
};
