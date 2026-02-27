import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
chromium.use(StealthPlugin());

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  for (const year of ['26', '25']) {
    const url = `https://fcg.bluegolf.com/bluegolf/fcg${year}/schedule/index.htm`;
    const page = await context.newPage();
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(2000);
      const title = await page.title();
      const count = await page.evaluate(() => document.querySelectorAll('.vevent').length);
      const sample = await page.evaluate(() => {
        const first = document.querySelector('.vevent .summary a');
        const date = document.querySelector('.vevent .value-title[title]')?.getAttribute('title');
        return first ? `${date} — ${(first as HTMLElement).innerText}` : 'none';
      });
      console.log(`[${resp?.status()}] fcg${year}: "${title}" | ${count} events | Sample: ${sample}`);
    } catch (err: unknown) {
      console.log(`ERR fcg${year}: ${err instanceof Error ? err.message.split('\n')[0] : err}`);
    }
    await page.close();
  }

  await browser.close();
}

main().catch(console.error);
