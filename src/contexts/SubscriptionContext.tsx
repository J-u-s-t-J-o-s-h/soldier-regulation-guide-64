
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SubscriptionStatus = "active" | "trialing" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "unpaid" | null;

interface SubscriptionContextType {
  isLoading: boolean;
  subscription: {
    status: SubscriptionStatus;
    isPremium: boolean;
  };
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isLoading: true,
  subscription: {
    status: null,
    isPremium: false,
  },
});

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<{
    status: SubscriptionStatus;
    isPremium: boolean;
  }>({
    status: null,
    isPremium: false,
  });

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        const { data: sub, error } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        setSubscription({
          status: sub?.status ?? null,
          isPremium: sub?.status === 'active' || sub?.status === 'trialing',
        });
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();

    // Listen for auth state changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });

    // Subscribe to realtime changes on the subscriptions table
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${supabase.auth.getSession().then(({ data }) => data.session?.user.id)}`,
        },
        () => {
          console.log('Subscription changed, refreshing...');
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      authSubscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isLoading, subscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
