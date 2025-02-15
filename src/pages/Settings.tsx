
import { Settings as SettingsIcon, CreditCard, User, Crown } from "lucide-react";
import { SubscriptionTiers } from "@/components/SubscriptionTiers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useSearchParams } from "react-router-dom";

const Settings = () => {
  const { toast } = useToast();
  const { subscription, isLoading, refetchSubscription } = useSubscription();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [isEmailLoading, setIsEmailLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsEmailLoading(false);
      }
    };
    
    getUser();

    if (searchParams.get('success') === 'true') {
      refetchSubscription();
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been successfully updated.",
      });
    }
  }, [refetchSubscription, searchParams, toast]);

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to manage your subscription",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/functions/v1/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-military-gold flex items-center gap-2">
                <SettingsIcon className="h-8 w-8" />
                Settings
              </h1>
              <p className="text-military-muted">
                Manage your account settings and subscription
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              <div className="military-glass p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-military-gold flex items-center gap-2 mb-4">
                  <Crown className="h-5 w-5" />
                  Current Subscription Status
                </h2>
                <div className="p-4 bg-military-dark/50 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-military-text mb-1">
                        {isLoading ? (
                          <span className="inline-block animate-pulse bg-military-accent/20 rounded h-6 w-32"></span>
                        ) : (
                          subscription.isPremium ? "Premium Plan" : "Free Plan"
                        )}
                      </h3>
                      <p className="text-military-muted text-sm">
                        {subscription.isPremium ? (
                          "Enjoy unlimited access to all premium features"
                        ) : (
                          "Limited access to basic features"
                        )}
                      </p>
                    </div>
                    {!isLoading && (
                      subscription.isPremium ? (
                        <div className="px-3 py-1 bg-military-gold/20 text-military-gold rounded-full text-sm">
                          Active
                        </div>
                      ) : (
                        <div className="px-3 py-1 bg-military-accent/20 text-military-accent rounded-full text-sm">
                          Free Tier
                        </div>
                      )
                    )}
                  </div>
                </div>

                {subscription.isPremium && (
                  <Button
                    onClick={handleManageSubscription}
                    className="w-full bg-military-gold hover:bg-military-gold/90 text-military-dark"
                  >
                    Manage Subscription
                  </Button>
                )}
              </div>

              <div className="military-glass p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-military-gold flex items-center gap-2 mb-4">
                  <User className="h-5 w-5" />
                  Account Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-military-dark/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-military-text">Email Address</h3>
                      <p className="text-military-muted">
                        {isEmailLoading ? (
                          <span className="inline-block animate-pulse bg-military-accent/20 rounded h-4 w-48"></span>
                        ) : (
                          userEmail || "No email found"
                        )}
                      </p>
                    </div>
                    <button className="text-military-gold hover:text-military-gold/80 transition">
                      Change Email
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-military-dark/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-military-text">Password</h3>
                      <p className="text-military-muted">Last changed 30 days ago</p>
                    </div>
                    <button className="text-military-gold hover:text-military-gold/80 transition">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              {!subscription.isPremium && !isLoading && (
                <div className="military-glass p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-military-gold flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5" />
                    Upgrade to Premium
                  </h2>
                  <SubscriptionTiers />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
