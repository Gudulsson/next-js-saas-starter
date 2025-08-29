import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Check if user exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (existingUser.length === 0) {
      // Create new user and team
      const [newUser] = await db.insert(users).values({
        email: user.email,
        name: user.user_metadata?.full_name || user.email.split('@')[0],
        passwordHash: 'supabase_auth',
        role: 'owner'
      }).returning();

      // Create default team
      const [newTeam] = await db.insert(teams).values({
        name: `${newUser.email}'s Team`
      }).returning();

      // Add user to team
      await db.insert(teamMembers).values({
        userId: newUser.id,
        teamId: newTeam.id,
        role: 'owner'
      });

      return NextResponse.json({ 
        success: true, 
        message: 'User and team created successfully' 
      });
    } else {
      // Update existing user
      await db
        .update(users)
        .set({
          name: user.user_metadata?.full_name || existingUser[0].name,
          updatedAt: new Date()
        })
        .where(eq(users.email, user.email));

      return NextResponse.json({ 
        success: true, 
        message: 'User updated successfully' 
      });
    }

  } catch (error) {
    console.error('Auth sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync user data' },
      { status: 500 }
    );
  }
}
