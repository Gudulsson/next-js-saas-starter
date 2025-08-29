import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { reports, sites, teams } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Hämta användarens team
    const userTeam = await db
      .select({
        teamId: teams.id,
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

    // Hämta reports för teamets sites
    const reportsList = await db
      .select({
        id: reports.id,
        title: reports.title,
        summary: reports.summary,
        status: reports.status,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        site: {
          id: sites.id,
          url: sites.url,
          name: sites.name,
        },
      })
      .from(reports)
      .innerJoin(sites, eq(reports.siteId, sites.id))
      .where(eq(sites.teamId, team.teamId))
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    // Hämta total count för pagination
    const totalCount = await db
      .select({ count: db.fn.count() })
      .from(reports)
      .innerJoin(sites, eq(reports.siteId, sites.id))
      .where(eq(sites.teamId, team.teamId));

    return NextResponse.json({
      reports: reportsList,
      pagination: {
        total: Number(totalCount[0].count),
        limit,
        offset,
        hasMore: offset + limit < Number(totalCount[0].count),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
