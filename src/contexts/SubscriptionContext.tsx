
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

  const fetchSubscription = async (userId?: string) => {
    try {
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }
        userId = session.user.id;
      }

      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      console.log('Subscription status updated:', sub?.status);

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

  useEffect(() => {
    // Initial fetch
    fetchSubscription();

    // Listen for auth state changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchSubscription(session.user.id);
        } else {
          setSubscription({ status: null, isPremium: false });
        }
      }
    );

    // Subscribe to realtime changes on the subscriptions table
    const channel = supabase
      .channel('subscription-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
        },
        async (payload) => {
          console.log('Subscription table changed:', payload);
          // Refetch subscription data when changes occur
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await fetchSubscription(session.user.id);
          }
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
