import { NextRequest, NextResponse } from 'next/server';
import { startCrawlWorker } from '@/lib/workers/crawl-worker';

export async function POST(request: NextRequest) {
  try {
    // I produktion skulle du ha proper authentication här
    // För nu är det en enkel implementation
    
    // Starta worker
    await startCrawlWorker();
    
    return NextResponse.json({
      success: true,
      message: 'Crawl worker started successfully',
    });
  } catch (error) {
    console.error('Error starting crawl worker:', error);
    return NextResponse.json(
      { error: 'Failed to start crawl worker' },
      { status: 500 }
    );
  }
}
