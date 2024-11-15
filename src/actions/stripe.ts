'use server'
import Stripe from 'stripe';
import { supabaseAdmin } from '../utils/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ||"");

export const handleNewUser = async(user:any) => {
    console.log("handling new user", user)
    try {
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: { userId: user.id },
          });
        
          // Update Supabase user profile with trial info
          const { data, error } = await supabaseAdmin
            .from('users')
            .update({
              stripe_customer_id: customer.id,
              trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              subscription_status: 'trialing',
            })
            .eq('id', user.id);
            console.log("data", data)
                console.error('Error updating user:', error);
                // throw error;
    } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
    }

}


