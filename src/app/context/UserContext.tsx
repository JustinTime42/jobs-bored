'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/src/utils/supabase/client';
import { handleNewUser } from '@/src/actions/stripe';
import { getUserDetails } from '@/src/actions/user';

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
  const handleNewUserCalled = useRef(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        console.log('Getting user details...');
        let profile = await getUserDetails(user.id);
        if (!profile?.stripe_customer_id && !handleNewUserCalled.current) {
          console.log('Creating new user...');
          handleNewUserCalled.current = true; 
          await handleNewUser(user);
          profile = await getUserDetails(user.id); 
          handleNewUserCalled.current = false; 
        }
        setUser({ ...user, ...profile });
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error('Error fetching user:', error);
      setError(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUser(); 
      } else {
        setUser(null);
        setLoading(false);
        setError(null);
      }
    });

    return () => data.subscription.unsubscribe(); 
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel('public:users_locations')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users_locations', filter: `user_id=eq.${user.id}` },
          async () => {
            console.log('Realtime update received...');
            const profile = await getUserDetails(user.id);
            setUser((prevUser: any) => ({
              ...prevUser,
              ...profile,
            }));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel); // Clean up channel on unmount
      };
    }
  }, [user]);

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
