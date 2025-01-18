'use client';
import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
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
  const lastFetchTime = useRef<number>(Date.now());

  const fetchUser = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (session?.user) {
        const userDetails = await handleAuthCallback();
        if (userDetails) {
          setUser(userDetails);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      lastFetchTime.current = Date.now();
    } catch (error: any) {
      console.error('Error fetching user:', error);
      setError(error instanceof Error ? error : new Error(error.message));
      setUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  // Initial setup and auth state changes
  useEffect(() => {
    let mounted = true;
    let focusTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      if (!isInitialized) {
        try {
          await fetchUser();
        } finally {
          if (mounted) {
            setIsInitialized(true);
          }
        }
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN') {
        await fetchUser();
      }
    });

    // Handle focus events with debounce
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(focusTimeout);
        focusTimeout = setTimeout(() => {
          const lastInteractionTime = (window as any).lastUserInteraction || 0;
          const timeSinceLastFetch = Date.now() - lastFetchTime.current;
          const timeSinceLastInteraction = Date.now() - lastInteractionTime;
          
          if (user?.id && 
              timeSinceLastFetch > 3000000 && 
              timeSinceLastInteraction > 10000) {
            setLoading(true);
            fetchUser();
          }
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      clearTimeout(focusTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      authListener.subscription.unsubscribe();
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [fetchUser, isInitialized, user?.id]);

  // Realtime subscription for user data updates
  useEffect(() => {
    if (!user?.id) return;

    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    realtimeChannelRef.current = supabase
      .channel(`public:users:${user.id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'users',
          filter: `id=eq.${user.id}` 
        },
        async () => {
          await fetchUser();
        }
      )
      .subscribe();

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [user?.id, fetchUser]);

  const value = {
    user,
    loading,
    error,
    isInitialized,
    fetchUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};  