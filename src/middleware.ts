
import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (req.nextUrl.pathname.startsWith('/api/stripe-webhook')) {
    return NextResponse.next();
  }
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_ends_at')
    .eq('id', session.user.id)
    .single();

  const isTrialActive = new Date(profile?.trial_ends_at) > new Date();
  const isPaid = profile?.subscription_status === 'active';

  if (!isTrialActive && !isPaid) {
    return NextResponse.redirect(new URL('/subscribe', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/premium/:path*'], // Protect premium routes
};
