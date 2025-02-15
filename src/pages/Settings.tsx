
import { Settings as SettingsIcon, CreditCard, User } from "lucide-react";
import { SubscriptionTiers } from "@/components/SubscriptionTiers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: sub, error } = await supabase
          .from('subscriptions')
          .select('*, prices(*)')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;
        setSubscription(sub);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

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
      window.location.href = url;
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
                  <User className="h-5 w-5" />
                  Account Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-military-dark/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-military-text">Email Address</h3>
                      <p className="text-military-muted">user@example.com</p>
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

              <div className="military-glass p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-military-gold flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5" />
                  Subscription
                </h2>
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-military-dark/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-military-text">Current Plan</h3>
                      <p className="text-military-muted">
                        {loading ? (
                          "Loading..."
                        ) : subscription ? (
                          `${subscription.status === 'active' ? 'Active' : 'Inactive'} - Premium Plan`
                        ) : (
                          "Free Plan"
                        )}
                      </p>
                    </div>
                    {subscription?.status === 'active' && (
                      <Button
                        onClick={handleManageSubscription}
                        className="bg-military-gold hover:bg-military-gold/90 text-military-dark"
                      >
                        Manage Subscription
                      </Button>
                    )}
                  </div>
                </div>
                {!subscription?.status && <SubscriptionTiers />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
