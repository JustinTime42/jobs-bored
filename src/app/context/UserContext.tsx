'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { handleAuthCallback } from '@/src/actions/auth'; // New import
import { User } from '@supabase/supabase-js';

interface UserContextProps {
  user: any;
  loading: boolean;
  error: any;
  isInitialized: boolean;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const supabase = createClient();

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (session?.user) {
        const userDetails = await handleAuthCallback();
        setUser({ ...session.user, ...userDetails });
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error('Error fetching user:', error);
      setError(error instanceof Error ? error : new Error(error.message));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  useEffect(() => {
    fetchUser().finally(() => setIsInitialized(true));
  }, [fetchUser]);

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
    if (!user?.id) return;
     const channel = supabase
      .channel('public:users_locations')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'users_locations', 
          filter: `user_id=eq.${user.id}` 
        },
        async () => {
          console.log('Realtime update received for user locations');
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const userDetails = await handleAuthCallback();
            setUser(prevUser => prevUser ? { ...prevUser, ...userDetails } : null);
          }
        }
      )
      .subscribe();
     return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase]);

  const value = {
    user,
    loading,
    isInitialized,
    error,
    fetchUser,
  };

  if (!isInitialized) {
    return <p>Loading...</p>;
  }

  return (
    <UserContext.Provider value={value}>
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
