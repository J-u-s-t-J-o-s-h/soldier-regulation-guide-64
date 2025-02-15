
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

const defaultState = {
  isLoading: true,
  subscription: {
    status: null,
    isPremium: false,
  },
  refetchSubscription: async () => {},
};

const SubscriptionContext = createContext<SubscriptionContextType>(defaultState);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<Omit<SubscriptionContextType, 'refetchSubscription'>>(
    { isLoading: true, subscription: defaultState.subscription }
  );

  const fetchSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setState({ isLoading: false, subscription: defaultState.subscription });
        return;
      }

      console.log('Fetching subscription for user:', session.user.id);

      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .order('created', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setState({ isLoading: false, subscription: defaultState.subscription });
        return;
      }

      console.log('Subscription data:', sub);

      // Update the state based on the active subscription
      setState({
        isLoading: false,
        subscription: {
          status: sub?.status ?? null,
          isPremium: Boolean(sub?.status === 'active' || sub?.status === 'trialing'),
        },
      });
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
      setState({ isLoading: false, subscription: defaultState.subscription });
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('subscription-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
        },
        (payload) => {
          console.log('Subscription change detected:', payload);
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Listen for auth changes and fetch subscription
  useEffect(() => {
    let mounted = true;

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        console.log('Auth state changed, fetching subscription');
        fetchSubscription();
      } else {
        setState({ isLoading: false, subscription: defaultState.subscription });
      }
    });

    // Initial fetch
    fetchSubscription();

    return () => {
      mounted = false;
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  return (
    <SubscriptionContext.Provider 
      value={{ 
        ...state,
        refetchSubscription: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
