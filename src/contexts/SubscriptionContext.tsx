
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
        console.log('No session found, setting default subscription state');
        setState({ isLoading: false, subscription: defaultState.subscription });
        return;
      }

      console.log('Starting subscription fetch for user:', session.user.id);

      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setState({ isLoading: false, subscription: defaultState.subscription });
        return;
      }

      console.log('Raw subscription data:', sub);
      console.log('Subscription status:', sub?.status);

      // Check if the subscription is active or trialing
      const isActiveOrTrialing = Boolean(sub?.status === 'active' || sub?.status === 'trialing');
      console.log('Is subscription active or trialing?', isActiveOrTrialing);
      console.log('Status check:', {
        isActive: sub?.status === 'active',
        isTrialing: sub?.status === 'trialing',
        status: sub?.status
      });

      setState({
        isLoading: false,
        subscription: {
          status: sub?.status ?? null,
          isPremium: isActiveOrTrialing,
        },
      });

      console.log('Updated subscription state:', {
        status: sub?.status ?? null,
        isPremium: isActiveOrTrialing,
      });
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
      setState({ isLoading: false, subscription: defaultState.subscription });
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    console.log('Setting up realtime subscription...');
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
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  // Listen for auth changes and fetch subscription
  useEffect(() => {
    let mounted = true;

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, 'Session:', !!session);
      
      if (session?.user) {
        console.log('User is authenticated, fetching subscription');
        fetchSubscription();
      } else {
        console.log('No authenticated user, setting default state');
        setState({ isLoading: false, subscription: defaultState.subscription });
      }
    });

    // Initial fetch
    console.log('Performing initial subscription fetch');
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
