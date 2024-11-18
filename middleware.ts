// import { type NextRequest } from 'next/server';
// import { NextResponse } from 'next/server';
// import { updateSession } from './src/utils/supabase/middleware';

// export async function middleware(request: NextRequest) {
//   if (request.nextUrl.pathname === '/api/stripe-webhook') {
//     return NextResponse.next(); // Skip all middleware logic
//   }

//   return await updateSession(request); // Continue normal middleware
// }

// export const config = {
//   matcher: [
//     '/((?!_next/static|_next/image|favicon.ico|api/stripe-webhook).*)', // Exclude stripe-webhook
//   ],
// };
