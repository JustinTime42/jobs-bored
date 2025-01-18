'use client';
import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode, useMemo } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { handleAuthCallback } from '@/src/actions/auth';

interface UserContextType {
  user: any;
  loading: boolean;
  error: any;
  isInitialized: boolean;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  isInitialized: false,
  fetchUser: async () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const supabase = createClient();
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const currentSession = useRef<any>(null);

  const fetchUser = useCallback(async (force = false) => {
    try {      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      // Skip if session hasn't changed
      if (!force && JSON.stringify(session) === JSON.stringify(currentSession.current)) {
        setLoading(false);
        return;
      }
      
      currentSession.current = session;

      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userDetails = await handleAuthCallback();
      setUser(userDetails || null);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      setError(error instanceof Error ? error : new Error(error.message));
      setUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip if it's the same session on focus
      if (session?.user?.id === currentSession.current?.user?.id && event === 'SIGNED_IN') {
        return;
      }

      if (event === 'SIGNED_IN') {
        setLoading(true);
        fetchUser(true);
      } else if (event === 'SIGNED_OUT') {
        currentSession.current = null;
        setUser(null);
        setLoading(false);
      }
    });

    if (!window.location.href.includes('code=')) {
      fetchUser();
    }

    return () => {
      authListener.subscription.unsubscribe();
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [fetchUser]);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    isInitialized,
    fetchUser: () => fetchUser(true)
  }), [user, loading, error, isInitialized, fetchUser]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};