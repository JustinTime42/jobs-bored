import Stripe from 'stripe';
import { supabaseAdmin } from '@/src/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// export const config = {
//   api: {
//     bodyParser: false, // Ensure raw body for Stripe
//   },
// };

// Helper function to convert Request body to a Buffer
async function buffer(req: NextRequest): Promise<Buffer> {
  const readable = Readable.from(req.body as any); // req.body is a ReadableStream in Next.js App Router
  const chunks: any[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event;
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error(`Webhook error: ${(err as Error).message}`);
    return NextResponse.json({ error: `Webhook error: ${(err as Error).message}` }, { status: 400 });
  }

  // Handle subscription events
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription;

    const { error } = await supabaseAdmin
      .from('users')
      .update({ subscription_status: subscription.status })
      .eq('stripe_customer_id', subscription.customer);

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Supabase update error' }, { status: 500 });
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;

    const { error } = await supabaseAdmin
      .from('users')
      .update({ subscription_status: 'canceled' })
      .eq('stripe_customer_id', subscription.customer);

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Supabase update error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
