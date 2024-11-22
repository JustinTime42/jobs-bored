'use server'
import { Location, User } from "../definitions";
import { supabaseAdmin } from "../utils/supabase/admin";
import { supabase } from "../utils/supabase/client";

type Locations = {
    locations: Location[];
};
export const getUserDetails = async (uid: string) => {

    const { data, error } = await supabaseAdmin
    .from('users')
    .select(`
        *,
        users_locations (
            locations(*)
        )
    `)
    .eq('id', uid);

    if (error) {
        throw new Error('Failed to fetch user data: ' + error.message);
    }

    if (!data || data.length === 0) {
        return null;
    }
    console.log("User Data:", data[0].users_locations.map((loc:Locations) => loc.locations));
    // Handle multiple rows, if expected
    const userData = data.map((user) => ({
        ...user,
        locations: user.users_locations.map((loc:Locations) => loc.locations),
    }));

    // console.log("User Data with Locations:", userData);

    return userData[0] as User;
};

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
