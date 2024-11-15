'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/src/utils/supabase/client';
import { handleNewUser } from '@/src/actions/stripe';

interface UserContextProps {
  user: any;
  loading: boolean;
  error: any;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
		
        if (!profile?.stripe_customer_id) {
          await handleNewUser(user); // Setup new user if not yet done
        }

        setUser({ ...user, ...profile });
      } else {
        setUser(null); // Handle user being null (e.g., logged out)
      }
    } catch (error: any) {
      console.error('Error fetching user:', error);
      setError(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen to auth state changes and update user accordingly
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchUser(); // Always fetch the user after an auth state change
      }
    });

    // Fetch initial user data
    fetchUser();

    return () => data.subscription.unsubscribe(); // Clean up subscription
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, loading, error, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
