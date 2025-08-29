import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

const protectedRoutes = '/dashboard';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === 'GET') {
    try {
             // Try to parse as base64 first (for test login)
       let parsed;
       try {
         const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
         parsed = JSON.parse(decoded);
         console.log('Using base64 session format');
       } catch {
         // Fall back to JWT verification
         parsed = await verifyToken(sessionCookie.value);
         console.log('Using JWT session format');
       }

      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

             // For test sessions, keep using base64 format
       if (parsed.user && parsed.user.id === 'test-user-123') {
         const sessionData = {
           ...parsed,
           expires: expiresInOneDay.toISOString()
         };
         const sessionCookie = Buffer.from(JSON.stringify(sessionData)).toString('base64');
        
        res.cookies.set({
          name: 'session',
          value: sessionCookie,
          httpOnly: true,
          secure: false, // Allow HTTP for local development
          sameSite: 'lax',
          expires: expiresInOneDay
        });
      } else {
        // For real sessions, use JWT
        res.cookies.set({
          name: 'session',
          value: await signToken({
            ...parsed,
            expires: expiresInOneDay.toISOString()
          }),
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          expires: expiresInOneDay
        });
      }
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
