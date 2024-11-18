// pages/api/stripe-webhook.ts
import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabaseAdmin } from '../utils/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req:any, res:any) {
  console.log("stripe webhook called")
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    console.error(`Webhook error: ${err}`);
    return res.status(400).send(`Webhook error: ${err}`);
  }

  // Handle subscription events
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription;

    // Update subscription status in Supabase
    const { error } = await supabaseAdmin
      .from('users')
      .update({ subscription_status: subscription.status })
      .eq('stripe_customer_id', subscription.customer);

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).send('Supabase update error');
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;

    // Mark subscription as canceled in Supabase
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ subscription_status: 'canceled' })
      .eq('stripe_customer_id', subscription.customer);

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).send('Supabase update error');
    }
  }

  res.json({ received: true });
}
