'use server'
import { supabaseAdmin } from "../utils/supabase/admin";

export const getUserDetails = async (uid: string) => {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select(`
            *,
            locations:users_locations (
            location:locations (*)
            )
        `)
        .eq('id', uid);
    if (!data) {
        throw new Error('User not found');
    }
    if (error) throw error;
    return data[0];
}

export const createUserDetails = async (user: any) => {
    const { data, error } = await supabaseAdmin
        .from("users")
        .insert(user)
        .single();
    if (error) throw error;
    return data;
}

export const updateUserDetails = async (user: any) => {
    const { data, error } = await supabaseAdmin
        .from("users")
        .update(user)
        .eq("id", user.id)
        .single();
    if (error) throw error;
    return user;
}


