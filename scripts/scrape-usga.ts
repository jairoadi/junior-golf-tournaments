/**
 * USGA Tournament Scraper
 *
 * Uses Playwright to load the USGA championship schedule page and intercept
 * the JSON feed. Filters for junior-relevant events and maps to our Tournament type.
 *
 * Run: npm run scrape:usga
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Tournament, AgeGroup, Gender, TournamentStatus } from '../src/types/tournament';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_PATH = join(__dirname, '..', 'data', 'usga.json');

// USGA abbreviated state names → 2-letter codes
const STATE_MAP: Record<string, string> = {
  'Ala.': 'AL', 'Alaska': 'AK', 'Ariz.': 'AZ', 'Ark.': 'AR', 'Calif.': 'CA',
  'Colo.': 'CO', 'Conn.': 'CT', 'Del.': 'DE', 'Fla.': 'FL', 'Ga.': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Ill.': 'IL', 'Ind.': 'IN', 'Iowa': 'IA',
  'Kan.': 'KS', 'Ky.': 'KY', 'La.': 'LA', 'Maine': 'ME', 'Md.': 'MD',
  'Mass.': 'MA', 'Mich.': 'MI', 'Minn.': 'MN', 'Miss.': 'MS', 'Mo.': 'MO',
  'Mont.': 'MT', 'Neb.': 'NE', 'Nev.': 'NV', 'N.H.': 'NH', 'N.J.': 'NJ',
  'N.M.': 'NM', 'N.Y.': 'NY', 'N.C.': 'NC', 'N.D.': 'ND', 'Ohio': 'OH',
  'Okla.': 'OK', 'Ore.': 'OR', 'Pa.': 'PA', 'R.I.': 'RI', 'S.C.': 'SC',
  'S.D.': 'SD', 'Tenn.': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vt.': 'VT',
  'Va.': 'VA', 'Wash.': 'WA', 'W.Va.': 'WV', 'Wis.': 'WI', 'Wyo.': 'WY',
  'D.C.': 'DC',
};

// "Charleston, S.C." → "SC"
function extractState(location: string): string {
  const parts = location.split(',').map((p) => p.trim());
  const last = parts[parts.length - 1];
  return STATE_MAP[last] ?? last.replace(/\./g, '').toUpperCase().slice(0, 2);
}

// "Thu Jan 15 01:00:00 EST 2026" → "2026-01-15"
function parseUSGADate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

function inferGender(name: string): Gender {
  const lower = name.toLowerCase();
  if (lower.includes("girls'") || lower.includes("women's") || lower.includes('girls')) return 'Girls';
  return 'Mixed';
}

function inferAgeGroups(name: string): AgeGroup[] {
  const lower = name.toLowerCase();
  if (lower.includes('drive, chip') || lower.includes('drive chip')) return ['U10', 'U12', 'U14'];
  return ['U18'];
}

function inferStatus(startDateStr: string, regDeadline: string): TournamentStatus {
  const now = new Date();
  const start = new Date(startDateStr);
  const reg = new Date(regDeadline);
  if (start < now) return 'Completed';
  if (reg < now) return 'Closed';
  const twoWeeks = 14 * 24 * 60 * 60 * 1000;
  if (start.getTime() - now.getTime() < twoWeeks) return 'Open';
  return 'Upcoming';
}

const JUNIOR_KEYWORDS = ['junior', "girls'", 'drive, chip', 'drive chip'];

interface USGAEvent {
  id: string | null;
  name: string;
  oneDayEvent: boolean;
  startDate: string;
  endDate: string;
  courseName: string;
  courseLocation: string;
  courseName2?: string | null;
  courseLocation2?: string | null;
  eventUrl?: string;
  [key: string]: unknown;
}

function mapEvent(ev: USGAEvent, index: number): Tournament | null {
  const name = ev.name ?? '';
  if (!name) return null;

  const lower = name.toLowerCase();
  const isJunior = JUNIOR_KEYWORDS.some((kw) => lower.includes(kw));
  if (!isJunior) return null;

  const date = parseUSGADate(ev.startDate);
  const endDate = ev.endDate ? parseUSGADate(ev.endDate) : undefined;
  if (!date) return null;

  const location = ev.courseLocation ?? '';
  const state = extractState(location);
  const courseName = ev.courseName ?? location;

  const regDeadline = (() => {
    const d = new Date(date);
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  })();

  return {
    id: `usga-${index}`,
    name,
    date,
    endDate,
    location,
    state,
    courseName,
    ageGroups: inferAgeGroups(name),
    gender: inferGender(name),
    registrationDeadline: regDeadline,
    status: inferStatus(date, regDeadline),
    description: ev.eventUrl ? `More info: ${ev.eventUrl}` : undefined,
  };
}

async function scrape(): Promise<Tournament[]> {
  console.log('Launching browser…');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  console.log('Navigating to USGA championship schedule…');

  const [feedResponse] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('usga-events'), { timeout: 25000 }),
    page.goto('https://www.usga.org/championships', { waitUntil: 'commit', timeout: 25000 }),
  ]);

  const feedData = await feedResponse.json();
  console.log(`Feed URL: ${feedResponse.url()}`);
  await browser.close();

  const rawItems: USGAEvent[] = feedData.items ?? [];
  console.log(`Found ${rawItems.length} total USGA championships, filtering for junior events…`);

  const tournaments = rawItems
    .map((ev, i) => mapEvent(ev, i))
    .filter((t): t is Tournament => t !== null);

  console.log(`Kept ${tournaments.length} junior tournaments.`);
  return tournaments;
}

async function main() {
  try {
    const tournaments = await scrape();

    mkdirSync(join(__dirname, '..', 'data'), { recursive: true });

    const output = {
      source: 'USGA',
      scrapedAt: new Date().toISOString(),
      tournaments,
    };

    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log(`\nSaved ${tournaments.length} tournaments to ${OUTPUT_PATH}`);
    if (tournaments.length > 0) {
      console.log('\nSample:');
      console.log(JSON.stringify(tournaments[0], null, 2));
    }
  } catch (err) {
    console.error('Scrape failed:', err);
    process.exit(1);
  }
}

main();
