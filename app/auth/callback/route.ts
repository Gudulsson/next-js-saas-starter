import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{}> }
) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const inviteId = searchParams.get('inviteId');

  if (!code) {
    return NextResponse.redirect(new URL('/sign-in?error=No authorization code', request.url));
  }

  try {
    // Exchange code for session
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);
    
    if (error || !data.user) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/sign-in?error=Authentication failed', request.url));
    }

    const { user } = data;

    // Check if user already exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email!))
      .limit(1);

    if (existingUser.length === 0) {
      // Create new user and team
      await createUserAndTeam(user, inviteId);
    } else {
      // Update existing user's Supabase ID if needed
      await db
        .update(users)
        .set({ 
          // Add any additional fields you want to sync
          updatedAt: new Date()
        })
        .where(eq(users.email, user.email!));
    }

    // Set session cookie
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    
    // Create a session token for our app
    const sessionToken = await createSessionToken(user.id);
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/sign-in?error=Authentication failed', request.url));
  }
}

async function createUserAndTeam(supabaseUser: any, inviteId?: string | null) {
  // Create user in our database
  const [newUser] = await db.insert(users).values({
    email: supabaseUser.email!,
    name: supabaseUser.user_metadata?.full_name || supabaseUser.email!.split('@')[0],
    passwordHash: 'supabase_auth', // Placeholder since we're using Supabase Auth
    role: 'owner'
  }).returning();

  let teamId: number;
  let userRole: string = 'owner';

  if (inviteId) {
    // Handle invitation logic
    const invitation = await db
      .select()
      .from(teams)
      .where(eq(teams.id, parseInt(inviteId)))
      .limit(1);

    if (invitation.length > 0) {
      teamId = invitation[0].id;
      userRole = 'member'; // Invited users are members by default
    } else {
      // Create new team if invitation is invalid
      const [newTeam] = await db.insert(teams).values({
        name: `${newUser.email}'s Team`
      }).returning();
      teamId = newTeam.id;
    }
  } else {
    // Create new team
    const [newTeam] = await db.insert(teams).values({
      name: `${newUser.email}'s Team`
    }).returning();
    teamId = newTeam.id;
  }

  // Add user to team
  await db.insert(teamMembers).values({
    userId: newUser.id,
    teamId: teamId,
    role: userRole
  });
}

async function createSessionToken(userId: string): Promise<string> {
  // Create a simple session token
  // In production, you might want to use JWT or similar
  const sessionData = {
    userId,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  return Buffer.from(JSON.stringify(sessionData)).toString('base64');
}
