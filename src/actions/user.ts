'use server'
import { Location } from "../definitions";
import { createClient } from "../utils/supabase/server"
import Stripe from 'stripe';
import { User } from '@supabase/supabase-js';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type Locations = {
    locations: Location[];
};
export const getUserDetails = async (user: User) => {
    const supabase = await createClient();
    const { data, error } = await supabase
    .from('users')
    .select(`
        *,
        users_locations (
            location_id,
            localized_formatted_address,
            locations(*)
        )
    `)
    .eq('id', user.id)
    .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // Profile not found, create new user
            return await createNewUser(supabase, user);
        }
        throw new Error('Failed to fetch user data: ' + error.message);
    }

    if (!data.avatar_url) {
        await supabase.from('users').update({
            avatar_url: user.user_metadata.avatar_url || undefined,
            user_name: user.user_metadata.user_name || user.user_metadata.full_name || user.user_metadata.name || undefined,
        }).eq('id', user.id).select().single();
        if (error) throw error;
    }
    const userData = {
        ...data,
        locations: data.users_locations?.map((loc: any) => ({
            ...loc.locations,
            localized_formatted_address: loc.localized_formatted_address || loc.locations.formatted_address
        })) || [],
    };

    return userData as User;
};

async function createNewUser(supabase: any, user: User) {
    const customer = await stripe.customers.create({
        email: user.email || user.user_metadata.email,
        name: user.user_metadata.name || user.user_metadata.full_name || undefined,
        metadata: {
            uid: user.id,
        },
    });

    const { data, error } = await supabase.from('users').insert({
        id: user.id,
        email: user.email || user.user_metadata.email,
        name: user.user_metadata.name || user.user_metadata.full_name || undefined,
        user_name: user.user_metadata.user_name || user.user_metadata.full_name || user.user_metadata.name || undefined,
        avatar_url: user.user_metadata.avatar_url || undefined,
        stripe_customer_id: customer.id,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        subscription_status: 'trial',
        is_junior: false
    }).select(`
        *,
        users_locations (
            locations(*)
        )
    `).single();

    if (error) {
        throw new Error('Failed to create new user: ' + error.message);
    }

    return {
        ...data,
        locations: data.users_locations?.map((loc: any) => loc.locations) || []
    } as User;
}


export const updateUserDetails = async (user: any) => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("users")
        .update(user)
        .eq("id", user.id)
        .single();
    if (error) throw error;
    return user;
}

export const toggleJuniorStatus = async (userId: string, isJunior: boolean) => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("users")
        .update({ is_junior: isJunior })
        .eq("id", userId)
        .select();
    
    if (error) throw error;
    return data;
}
