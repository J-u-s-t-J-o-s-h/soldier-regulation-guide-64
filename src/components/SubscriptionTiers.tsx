
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type FeatureItem = {
  name: string;
  included: boolean;
};

type TierProps = {
  name: string;
  price: string;
  paymentLink: string;
  description: string;
  features: FeatureItem[];
  buttonText: string;
  highlighted?: boolean;
};

const Tier = ({ name, price, paymentLink, description, features, buttonText, highlighted }: TierProps) => {
  const handleSubscribe = () => {
    window.open(paymentLink, '_blank', 'noopener,noreferrer');
  };

  return (
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
        onClick={handleSubscribe}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export const SubscriptionTiers = () => {
  const freeTier = {
    name: "Free",
    price: "Free",
    paymentLink: "", // No payment link for free tier
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

  const monthlyPremiumTier = {
    name: "Premium Monthly",
    price: "$9.99",
    paymentLink: "https://buy.stripe.com/test_5kA2b4d2I68GdOg5kl",
    description: "Advanced features billed monthly",
    buttonText: "Start Monthly Plan",
    features: [
      { name: "Unlimited AI-generated responses", included: true },
      { name: "Ad-free experience", included: true },
      { name: "Advanced search with filters", included: true },
      { name: "Offline access to regulations", included: true },
      { name: "Bookmarking and saving", included: true },
      { name: "Priority support", included: true },
    ],
  };

  const annualPremiumTier = {
    name: "Premium Annual",
    price: "$99.99",
    paymentLink: "https://buy.stripe.com/test_fZe6rk0fWcx4fWodQQ",
    description: "Save 17% with annual billing",
    buttonText: "Start Annual Plan",
    features: [
      { name: "Unlimited AI-generated responses", included: true },
      { name: "Ad-free experience", included: true },
      { name: "Advanced search with filters", included: true },
      { name: "Offline access to regulations", included: true },
      { name: "Bookmarking and saving", included: true },
      { name: "Priority support", included: true },
      { name: "17% discount vs monthly", included: true },
    ],
  };

  return (
    <div className="w-full max-w-6xl animate-fade-up">
      <h2 className="text-center text-2xl font-bold text-military-gold mb-2">
        Choose Your Plan
      </h2>
      <p className="text-center text-military-muted mb-8">
        Select the plan that best fits your needs
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        <Tier {...freeTier} />
        <Tier {...monthlyPremiumTier} />
        <Tier {...annualPremiumTier} highlighted />
      </div>
    </div>
  );
};
