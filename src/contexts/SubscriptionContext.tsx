
import { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  const fetchSubscription = useCallback(async (userId?: string) => {
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

      if (error) {
        console.error('Error fetching subscription:', error);
        return;
      }

      console.log('Subscription status:', sub?.status);
      
      // Only update state if component is still mounted
      setSubscription({
        status: sub?.status ?? null,
        isPremium: sub?.status === 'active' || sub?.status === 'trialing',
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    const initializeSubscriptions = async () => {
      if (!mounted) return;

      // Initial fetch
      await fetchSubscription();

      // Listen for auth state changes
      authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        if (session?.user) {
          await fetchSubscription(session.user.id);
        } else {
          setSubscription({ status: null, isPremium: false });
        }
      }).data.subscription;

      // Subscribe to realtime changes
      realtimeChannel = supabase
        .channel('subscription-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
          },
          async (payload) => {
            if (!mounted) return;
            
            console.log('Subscription table changed:', payload);
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              await fetchSubscription(session.user.id);
            }
          }
        )
        .subscribe();
    };

    initializeSubscriptions();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [fetchSubscription]);

  return (
    <SubscriptionContext.Provider value={{ isLoading, subscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
