
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SubscriptionStatus = "active" | "trialing" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "unpaid" | null;

interface SubscriptionContextType {
  isLoading: boolean;
  subscription: {
    status: SubscriptionStatus;
    isPremium: boolean;
  };
  refetchSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isLoading: true,
  subscription: {
    status: null,
    isPremium: false,
  },
  refetchSubscription: async () => {},
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

  const fetchSubscription = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscription({ status: null, isPremium: false });
        return;
      }

      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return;
      }

      const newStatus = sub?.status ?? null;
      const isPremium = newStatus === 'active' || newStatus === 'trialing';

      console.log('Subscription data fetched:', { status: newStatus, isPremium, userId: session.user.id });

      setSubscription({
        status: newStatus,
        isPremium,
      });
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('SubscriptionProvider mounted');
    fetchSubscription();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        if (session?.user) {
          await fetchSubscription();
        } else {
          setSubscription({ status: null, isPremium: false });
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log('SubscriptionProvider unmounting');
      authSubscription.unsubscribe();
    };
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isLoading, subscription, refetchSubscription: fetchSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
