'use server'
import { useEffect, useCallback, useState } from "react";
import { supabase } from "@/src/utils/supabase/client";

const useUser = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user);
      console.log(user)
    } catch (error: any) {
      console.error("Error fetching user", error);
      setError(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          // Fetch updated user info
          await fetchUser();
        }
      }
    );

    // Initial fetch
    fetchUser();

    return () => {
      data.subscription.unsubscribe();
    };
  }, [fetchUser]);

  return { user, loading, error, fetchUser };
};

export default useUser;

