import { NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { mockTournaments } from '@/lib/mockData';
import type { Tournament } from '@/types/tournament';

interface CacheFile {
  source: string;
  scrapedAt: string;
  tournaments: Tournament[];
}

export async function GET() {
  const sources: Tournament[] = [];
  const meta: { source: string; scrapedAt: string; count: number }[] = [];

  // Load each scraped source file if it exists
  const cacheFiles = ['usga.json', 'ujga.json'];

  for (const file of cacheFiles) {
    const filePath = join(process.cwd(), 'data', file);
    if (existsSync(filePath)) {
      try {
        const cache: CacheFile = JSON.parse(readFileSync(filePath, 'utf-8'));
        sources.push(...cache.tournaments);
        meta.push({
          source: cache.source,
          scrapedAt: cache.scrapedAt,
          count: cache.tournaments.length,
        });
      } catch {
        // malformed cache — skip
      }
    }
  }

  // Fall back to mock data if no scraped data exists yet
  if (sources.length === 0) {
    return NextResponse.json({
      tournaments: mockTournaments,
      meta: [{ source: 'mock', scrapedAt: null, count: mockTournaments.length }],
      usingMock: true,
    });
  }

  return NextResponse.json({
    tournaments: sources,
    meta,
    usingMock: false,
  });
}
