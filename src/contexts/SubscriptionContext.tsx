
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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

      setCurrentUserId(userId);

      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return;
      }

      const newStatus = sub?.status ?? null;
      const isPremium = newStatus === 'active' || newStatus === 'trialing';

      console.log('Setting subscription status:', { status: newStatus, isPremium });

      setSubscription({
        status: newStatus,
        isPremium,
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
          setCurrentUserId(null);
          setSubscription({ status: null, isPremium: false });
        }
      }).data.subscription;

      // Set up realtime subscription only if we have a user ID
      if (currentUserId) {
        realtimeChannel = supabase
          .channel('subscription-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'subscriptions',
              filter: `user_id=eq.${currentUserId}`,
            },
            async (payload) => {
              if (!mounted) return;
              console.log('Subscription change detected:', payload);
              await fetchSubscription(currentUserId);
            }
          )
          .subscribe((status) => {
            console.log('Realtime subscription status:', status);
          });
      }
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
  }, [fetchSubscription, currentUserId]);

  return (
    <SubscriptionContext.Provider value={{ isLoading, subscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
