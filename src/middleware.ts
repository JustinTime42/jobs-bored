
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'
import { createClient } from './utils/supabase/server'
import { getUser } from './utils/supabase/client'

export async function middleware(request: NextRequest) {
	const session = await updateSession(request)
	//  if (!user) { return NextResponse.redirect('/login');
  	return session // await updateSession(request)
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
	'/dashboard/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next(); // Create the response object
//   const cookies = req.cookies;
  
//   console.log('Incoming cookies:', req.cookies.getAll());
//   // Skip auth checks for public routes
//   if (req.nextUrl.pathname.startsWith('/api/stripe-webhook') || req.nextUrl.pathname === '/login') {
//     return res;
//   }

//   const supabase = createMiddlewareClient({ req, res }); 
//   const {
//     data: { session },
//     error,
//   } = await supabase.auth.getSession();
//   console.log('Session:', session);
//   if (error || !session) {
//     console.log('No session found or session error:', session);
//     return NextResponse.redirect(new URL('/', req.url));
//   }

//   const userId = session.user.id;

//   const { data: profile } = await supabase
//     .from('users')
//     .select('subscription_status, trial_ends_at')
//     .eq('id', userId)
//     .single();

//   const isTrialActive = new Date(profile?.trial_ends_at) > new Date();
//   const isPaid = profile?.subscription_status === 'active';

//   if (!isTrialActive && !isPaid) {
//     return NextResponse.redirect(new URL('/subscribe', req.url));
//   }

//   return res; // Return the response
// }

// export const config = {
//   matcher: ['/dashboard/:path*'], // Apply middleware to these routes
// };
