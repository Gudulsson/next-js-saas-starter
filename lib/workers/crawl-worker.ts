import { db } from '@/lib/db/drizzle';
import { crawlJobs, reports, sites } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { CrawlJobStatus, ReportStatus } from '@/lib/db/schema';

export async function processCrawlJobs() {
  try {
    // Hämta alla pending crawl jobs
    const pendingJobs = await db
      .select()
      .from(crawlJobs)
      .where(eq(crawlJobs.status, CrawlJobStatus.PENDING))
      .orderBy(crawlJobs.priority, crawlJobs.createdAt);

    for (const job of pendingJobs) {
      await processCrawlJob(job.id);
    }
  } catch (error) {
    console.error('Error processing crawl jobs:', error);
  }
}

async function processCrawlJob(jobId: number) {
  try {
    // Uppdatera job status till running
    await db
      .update(crawlJobs)
      .set({
        status: CrawlJobStatus.RUNNING,
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(crawlJobs.id, jobId));

    // Simulera crawl processing (i verkligheten skulle detta vara en riktig web crawler)
    await simulateCrawl(jobId);

    // Uppdatera job status till completed
    await db
      .update(crawlJobs)
      .set({
        status: CrawlJobStatus.COMPLETED,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(crawlJobs.id, jobId));

    // Skapa report
    await createReport(jobId);

  } catch (error) {
    console.error(`Error processing crawl job ${jobId}:`, error);
    
    // Uppdatera job status till failed
    await db
      .update(crawlJobs)
      .set({
        status: CrawlJobStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date(),
      })
      .where(eq(crawlJobs.id, jobId));
  }
}

async function simulateCrawl(jobId: number) {
  // Simulera crawl tid (2-5 sekunder)
  const crawlTime = Math.random() * 3000 + 2000;
  await new Promise(resolve => setTimeout(resolve, crawlTime));

  // Simulera att 10% av jobben misslyckas
  if (Math.random() < 0.1) {
    throw new Error('Simulated crawl failure');
  }
}

async function createReport(jobId: number) {
  const job = await db
    .select({
      id: crawlJobs.id,
      siteId: crawlJobs.siteId,
    })
    .from(crawlJobs)
    .where(eq(crawlJobs.id, jobId))
    .limit(1);

  if (job.length === 0) {
    throw new Error('Crawl job not found');
  }

  const site = await db
    .select({
      id: sites.id,
      url: sites.url,
      name: sites.name,
    })
    .from(sites)
    .where(eq(sites.id, job[0].siteId))
    .limit(1);

  if (site.length === 0) {
    throw new Error('Site not found');
  }

  // Simulera crawl data
  const crawlData = {
    url: site[0].url,
    title: `Analysis of ${site[0].name || site[0].url}`,
    summary: `Comprehensive analysis of ${site[0].url}`,
    metrics: {
      pageLoadTime: Math.random() * 3000 + 500,
      seoScore: Math.floor(Math.random() * 40) + 60,
      accessibilityScore: Math.floor(Math.random() * 30) + 70,
      performanceScore: Math.floor(Math.random() * 25) + 75,
    },
    issues: [
      'Missing meta description',
      'Images missing alt text',
      'Slow page load time',
    ],
    recommendations: [
      'Add meta description for better SEO',
      'Include alt text for all images',
      'Optimize images for faster loading',
    ],
    timestamp: new Date().toISOString(),
  };

  // Skapa report
  await db.insert(reports).values({
    siteId: job[0].siteId,
    crawlJobId: jobId,
    title: crawlData.title,
    summary: crawlData.summary,
    data: crawlData,
    status: ReportStatus.COMPLETED,
  });
}

// Funktion för att starta worker (kan anropas från cron job eller API)
export async function startCrawlWorker() {
  console.log('Starting crawl worker...');
  await processCrawlJobs();
  console.log('Crawl worker completed');
}
