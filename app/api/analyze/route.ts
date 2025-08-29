import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { sites, crawlJobs, usageEvents, teams } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { UsageEventType, CrawlJobStatus } from '@/lib/db/schema';

const analyzeSchema = z.object({
  url: z.string().url(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = analyzeSchema.parse(body);

    // Hämta användarens team
    const userTeam = await db
      .select({
        teamId: teams.id,
        planName: teams.planName,
        subscriptionStatus: teams.subscriptionStatus,
      })
      .from(teams)
      .innerJoin(
        (await import('@/lib/db/schema')).teamMembers,
        eq(teams.id, (await import('@/lib/db/schema')).teamMembers.teamId)
      )
      .where(eq((await import('@/lib/db/schema')).teamMembers.userId, user.id))
      .limit(1);

    if (userTeam.length === 0) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 });
    }

    const team = userTeam[0];

    // Kontrollera subscription status
    if (team.subscriptionStatus !== 'active' && team.subscriptionStatus !== 'trialing') {
      return NextResponse.json(
        { error: 'Active subscription required' },
        { status: 402 }
      );
    }

    // Kontrollera kvot (enkel implementation)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayUsage = await db
      .select()
      .from(usageEvents)
      .where(
        and(
          eq(usageEvents.teamId, team.teamId),
          eq(usageEvents.eventType, UsageEventType.CRAWL_STARTED)
        )
      );

    // Kvot baserat på plan (enkel implementation)
    const quota = team.planName === 'Plus' ? 100 : 50;
    if (todayUsage.length >= quota) {
      return NextResponse.json(
        { error: 'Daily quota exceeded' },
        { status: 429 }
      );
    }

    // Skapa eller hitta befintlig site
    let site = await db
      .select()
      .from(sites)
      .where(
        and(
          eq(sites.url, validatedData.url),
          eq(sites.teamId, team.teamId)
        )
      )
      .limit(1);

    let siteId: number;

    if (site.length === 0) {
      // Skapa ny site
      const newSite = await db
        .insert(sites)
        .values({
          url: validatedData.url,
          teamId: team.teamId,
          name: validatedData.name || `Site ${Date.now()}`,
          description: validatedData.description,
        })
        .returning();

      siteId = newSite[0].id;
    } else {
      siteId = site[0].id;
    }

    // Skapa crawl job
    const crawlJob = await db
      .insert(crawlJobs)
      .values({
        siteId,
        status: CrawlJobStatus.PENDING,
        priority: 0,
      })
      .returning();

    // Logga usage event
    await db.insert(usageEvents).values({
      teamId: team.teamId,
      userId: user.id,
      eventType: UsageEventType.CRAWL_STARTED,
      metadata: {
        url: validatedData.url,
        crawlJobId: crawlJob[0].id,
      },
    });

    return NextResponse.json({
      success: true,
      crawlJobId: crawlJob[0].id,
      siteId,
      message: 'Analysis job created successfully',
    });
  } catch (error) {
    console.error('Error in analyze API:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
