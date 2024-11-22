'use server'
import Stripe from 'stripe';
import { debounce } from 'lodash';
import { supabaseAdmin } from '../utils/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const handleNewUser = debounce(async (user: any) => {
	console.log("handling new user", user);
	try {
	  const customer = await stripe.customers.create({
		email: user.email,
		metadata: { userId: user.id },
	  });
	  const { data, error } = await supabaseAdmin
		.from('users')
		.insert({
			id: user.id, 
			email: user.email, 
			name: user.user_metadata.name,
			avatar_url: user.user_metadata.avatar_url,
			user_name: user.user_metadata.user_name,
			stripe_customer_id: customer.id,
			trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			subscription_status: 'trial',
		})
		.eq('id', user.id);
  
	  if (error) {
		console.error('Error updating user:', error);
		throw error;
	  }
	  console.log("data", data);
	} catch (error) {
	  console.error('Error creating customer:', error);
	  throw error;
	}
  }, 1000);
  

export const handleNewSubscription = async (stripeCustomerId: string) => {
	console.log("API KEY", process.env.STRIPE_SECRET_KEY)
	try {
		const session = await stripe.checkout.sessions.create({
			customer: stripeCustomerId,
			payment_method_types: ['card'],
			line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
			mode: 'subscription',
			success_url: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/dashboard/success`,
			cancel_url: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/dashboard/settings`,
		});

		return session.id;
	} catch (error) {
		console.error('Error creating checkout session:', error);
	}
}

export const handlePortalSession = async (stripeCustomerId: string) => {
	try {
		const session = await stripe.billingPortal.sessions.create({
			customer: stripeCustomerId,
			return_url: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/dashboard/settings`,
		});

		return session.url;
	} catch (error) {
		console.error('Error creating portal session:', error);
	}
}


