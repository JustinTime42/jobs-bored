'use server'
import { Location, User } from "../definitions";
import { createClient } from "../utils/supabase/server"
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type Locations = {
    locations: Location[];
};
export const getUserDetails = async (uid: string, email?: string, name?: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase
    .from('users')
    .select(`
        *,
        users_locations (
            locations(*)
        )
    `)
    .eq('id', uid)
    .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // Profile not found, create new user
            return await createNewUser(supabase, uid, email, name);
        }
        throw new Error('Failed to fetch user data: ' + error.message);
    }

    const userData = {
        ...data,
        locations: data.users_locations?.map((loc: any) => loc.locations) || [],
    };

    return userData as User;
};

async function createNewUser(supabase: any, uid: string, email?: string, name?: string) {
    const customer = await stripe.customers.create({
        email: email!,
        name: name || undefined,
        metadata: {
            uid: uid,
        },
    });


    const { data, error } = await supabase.from('users').insert({
        id: uid,
        email: email,
        name: name,
        stripe_customer_id: customer.id,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        subscription_status: 'trial',
    }).select().single();

    if (error) {
        throw new Error('Failed to create new user: ' + error.message);
    }

    return data as User;
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
