'use server'
import { useCallback, useState } from "react";
import { getUser } from "@/src/utils/supabase/client";

const useUser = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchUser = useCallback(async () => {
        console.log("trying to fetch user")
        setLoading(true);
        try {
            const user = await getUser();
            console.log("fetched user", user);
            setUser(user);
        } catch (error:any) {
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

    return { user, loading, error, fetchUser };
}

export default useUser;
