
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

      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setState({ isLoading: false, subscription: defaultState.subscription });
        return;
      }

      setState({
        isLoading: false,
        subscription: {
          status: sub?.status ?? null,
          isPremium: sub?.status === 'active' || sub?.status === 'trialing',
        },
      });
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
      setState({ isLoading: false, subscription: defaultState.subscription });
    }
  };

  useEffect(() => {
    let mounted = true;

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        fetchSubscription();
      } else {
        setState({ isLoading: false, subscription: defaultState.subscription });
      }
    });

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
