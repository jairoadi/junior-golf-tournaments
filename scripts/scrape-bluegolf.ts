/**
 * BlueGolf Scraper — works for any BlueGolf-hosted schedule page.
 * Currently configured for UJGA (ujga.bluegolf.com) and FCG (fcg.bluegolf.com).
 *
 * Uses playwright-extra with stealth plugin to bypass AWS WAF bot detection.
 *
 * Run: npm run scrape:bluegolf
 */

import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Tournament, AgeGroup, Gender, TournamentStatus } from '../src/types/tournament';

chromium.use(StealthPlugin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sources to scrape — add more BlueGolf URLs here as needed
const SOURCES = [
  {
    name: 'UJGA',
    url: 'https://ujga.bluegolf.com/bluegolf/ujga26/schedule/index.htm',
    output: 'ujga.json',
    defaultState: 'UT',
  },
  // FCG can be added later:
  // { name: 'FCG', url: 'https://fcg.bluegolf.com/bluegolf/fcg25/schedule/index.htm', output: 'fcg.json', defaultState: '' },
];

// "Apr 2-3" or "Apr 11" → { start: "2026-04-02", end: "2026-04-03" }
function parseBlueGolfDate(raw: string, year = 2026): { date: string; endDate?: string } {
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };

  // "Jun 8-12" or "Jun 2-3" or "Apr 11"
  const match = raw.trim().match(/^([A-Za-z]+)\s+(\d+)(?:-(\d+))?$/);
  if (!match) return { date: '' };

  const [, mon, startDay, endDay] = match;
  const month = months[mon] ?? '01';
  const date = `${year}-${month}-${startDay.padStart(2, '0')}`;
  const endDate = endDay ? `${year}-${month}-${endDay.padStart(2, '0')}` : undefined;

  return { date, endDate };
}

// "Southgate GC · St. George, UT" → { course: "Southgate GC", location: "St. George, UT", state: "UT" }
function parseLocation(raw: string): { courseName: string; location: string; state: string } {
  const parts = raw.split('·').map((p) => p.trim());
  const courseName = parts[0] ?? raw;
  const location = parts[1] ?? '';
  const statePart = location.split(',').pop()?.trim() ?? '';
  const state = statePart.length === 2 ? statePart : '';
  return { courseName, location, state };
}

// Infer age group from tournament name
function inferAgeGroups(name: string): AgeGroup[] {
  const lower = name.toLowerCase();
  if (lower.includes('12-under') || lower.includes('12 under') || lower.includes('10-under')) return ['U10', 'U12'];
  if (lower.includes('14-under') || lower.includes('14 under')) return ['U14'];
  if (lower.includes('16-under') || lower.includes('16 under')) return ['U16'];
  return ['U18'];
}

// Infer gender
function inferGender(name: string): Gender {
  const lower = name.toLowerCase();
  if (lower.includes("girls'") || lower.includes('girls') || lower.includes("women's")) return 'Girls';
  if (lower.includes("boys'") || lower.includes('boys')) return 'Boys';
  return 'Mixed';
}

// Infer status from reg deadline and start date
function inferStatus(date: string, regDeadline: string): TournamentStatus {
  const now = new Date();
  const start = new Date(date);
  const reg = new Date(regDeadline);
  if (start < now) return 'Completed';
  if (reg < now) return 'Closed';
  const twoWeeks = 14 * 24 * 60 * 60 * 1000;
  if (start.getTime() - now.getTime() < twoWeeks) return 'Open';
  return 'Upcoming';
}

// Parse entry fee from text like "$150-$175" or "$325" → lower bound as number
function parseEntryFee(text: string): number | undefined {
  const match = text.match(/\$(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

async function scrapeBluegolf(source: typeof SOURCES[0]): Promise<Tournament[]> {
  console.log(`\nScraping ${source.name} from ${source.url}…`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  await page.goto(source.url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const title = await page.title();
  if (title.toLowerCase().includes('verification') || title.toLowerCase().includes('human')) {
    console.error(`⚠️  Bot detection triggered for ${source.name}. Try again or check stealth config.`);
    await browser.close();
    return [];
  }

  console.log(`  Page loaded: "${title}"`);

  // Extract all .vevent rows using exact BlueGolf selectors from HTML inspection
  const events = await page.evaluate(() => {
    const vevents = Array.from(document.querySelectorAll('.vevent'));
    return vevents.map((el) => {
      // ISO start date is in value-title[title] attribute: "2026-04-02"
      const startDateIso = el.querySelector('.value-title[title]')?.getAttribute('title') ?? '';

      // Date text for end date: "Apr 2-3" or "Apr 11"
      const dateText = (el.querySelector('.dtstart span:first-child') as HTMLElement)?.innerText?.trim() ?? '';

      // Tournament name from .summary a
      const name = (el.querySelector('.summary a') as HTMLElement)?.innerText?.trim() ?? '';

      // Event URL
      const eventUrl = (el.querySelector('.summary a') as HTMLAnchorElement)?.href ?? '';

      // Course name
      const courseName = (el.querySelector('.tinfo a.hoverlink.gray') as HTMLElement)?.innerText?.trim() ?? '';

      // Location "St. George, UT" from .address link
      const location = (el.querySelector('.address.gray') as HTMLElement)?.innerText?.trim() ?? '';

      // Registration data from the register link's data attributes
      const regLink = el.querySelector('[data-regend]');
      const regEnd = regLink?.getAttribute('data-regend') ?? '';         // "2026-04-01"
      const regFee = regLink?.getAttribute('data-regfee') ?? '';         // "$150-$175"

      // Status: last td text — "Full", "Register", or empty
      const lastTd = (el.querySelector('td:last-child') as HTMLElement)?.innerText?.trim() ?? '';

      return { startDateIso, dateText, name, eventUrl, courseName, location, regEnd, regFee, lastTd };
    });
  });

  console.log(`  Found ${events.length} events on page`);

  const tournaments: Tournament[] = [];

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (!ev.name || !ev.startDateIso) continue;

    const date = ev.startDateIso; // already ISO: "2026-04-02"

    // Parse end date from dateText "Apr 2-3" → "2026-04-03"
    const { endDate } = parseBlueGolfDate(ev.dateText);

    // Use reg end from data attribute, fallback to 14 days before start
    const regDeadline = ev.regEnd || (() => {
      const d = new Date(date);
      d.setDate(d.getDate() - 14);
      return d.toISOString().split('T')[0];
    })();

    // Location: "St. George, UT" → state = "UT"
    const location = ev.location || source.defaultState;
    const statePart = location.split(',').pop()?.trim() ?? '';
    const state = statePart.length === 2 ? statePart : source.defaultState;

    // Status from last td
    let status: TournamentStatus;
    const lastTd = ev.lastTd.toLowerCase();
    if (lastTd === 'full') {
      status = 'Closed';
    } else if (lastTd.includes('result')) {
      status = 'Completed';
    } else {
      status = inferStatus(date, regDeadline);
    }

    const entryFee = parseEntryFee(ev.regFee);

    tournaments.push({
      id: `${source.name.toLowerCase()}-${i}`,
      name: ev.name,
      date,
      endDate,
      location,
      state,
      courseName: ev.courseName || 'TBD',
      ageGroups: inferAgeGroups(ev.name),
      gender: inferGender(ev.name),
      registrationDeadline: regDeadline,
      status,
      entryFee,
    });
  }

  await browser.close();
  console.log(`  Kept ${tournaments.length} tournaments for ${source.name}`);
  return tournaments;
}

async function main() {
  mkdirSync(join(__dirname, '..', 'data'), { recursive: true });

  for (const source of SOURCES) {
    try {
      const tournaments = await scrapeBluegolf(source);
      const output = {
        source: source.name,
        scrapedAt: new Date().toISOString(),
        tournaments,
      };
      const outputPath = join(__dirname, '..', 'data', source.output);
      writeFileSync(outputPath, JSON.stringify(output, null, 2));
      console.log(`  Saved to ${outputPath}`);
      if (tournaments.length > 0) {
        console.log('  Sample:', JSON.stringify(tournaments[0], null, 2));
      }
    } catch (err) {
      console.error(`Failed to scrape ${source.name}:`, err);
    }
  }
}

main();
