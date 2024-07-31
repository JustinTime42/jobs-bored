import { supabase } from "../utils/supabase/client";

export const getUserDetails = async (uid: string) => {
    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", uid)
        .single();
    if (!user) {
        const user = await createUserDetails({ id: uid });
        return user;
    }
    if (error) throw error;
    return user;
}

export const createUserDetails = async (user: any) => {
    const { data, error } = await supabase
        .from("users")
        .insert(user)
        .single();
    if (error) throw error;
    return data;
}

export const updateUserDetails = async (user: any) => {
    const { data, error } = await supabase
        .from("users")
        .update(user)
        .eq("id", user.id)
        .single();
    if (error) throw error;
    return user;
}


