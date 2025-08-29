import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { reports, sites, teams, crawlJobs } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const reportId = parseInt(id);
    if (isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

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

    // Hämta report med site och crawl job information
    const report = await db
      .select({
        id: reports.id,
        title: reports.title,
        summary: reports.summary,
        data: reports.data,
        status: reports.status,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        site: {
          id: sites.id,
          url: sites.url,
          name: sites.name,
          description: sites.description,
        },
        crawlJob: {
          id: crawlJobs.id,
          status: crawlJobs.status,
          startedAt: crawlJobs.startedAt,
          completedAt: crawlJobs.completedAt,
          errorMessage: crawlJobs.errorMessage,
        },
      })
      .from(reports)
      .innerJoin(sites, eq(reports.siteId, sites.id))
      .leftJoin(crawlJobs, eq(reports.crawlJobId, crawlJobs.id))
      .where(
        and(
          eq(reports.id, reportId),
          eq(sites.teamId, team.teamId)
        )
      )
      .limit(1);

    if (report.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report[0]);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
