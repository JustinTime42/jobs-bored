'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getUser } from "@/src/utils/supabase/client";

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
      const user = await getUser();      
      setUser(user);
    } catch (error: any) {
      console.error("Error fetching user", error);
      if (error.message === "Auth session missing!") {
        setUser(null);
      } else {
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, loading, error, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
