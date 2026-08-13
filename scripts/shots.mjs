/**
 * Section screenshots — captures individual gallery sections at full
 * resolution so UI regressions are reviewable without scrolling a 10k-pixel
 * full-page shot.
 *
 * Usage: node scripts/shots.mjs [url] [...sectionIds]
 * Set CHROME_PATH to choose the browser explicitly.
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { resolveChrome } from "./chrome.mjs";

const [, , url = "http://localhost:5177", ...ids] = process.argv;
const sections = ids.length ? ids : ["meters", "graphs", "fields", "menus"];

const outDir = join(process.cwd(), ".server-logs", "shots");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: resolveChrome(),
  headless: true,
  args: ["--no-sandbox"],
});

try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.goto(url, { waitUntil: "networkidle" });
  // Let the web fonts settle so text metrics match a real load.
  await page.evaluate(() => document.fonts.ready);

  for (const id of sections) {
    const el = page.locator(`#${id}`);
    if ((await el.count()) === 0) {
      console.log(`skip ${id} — not found`);
      continue;
    }
    const path = join(outDir, `${id}.png`);
    await el.screenshot({ path });
    console.log(`shot ${id} -> ${path}`);
  }

  const errors = await page.evaluate(() => (window.__kansoErrors ?? []).length);
  console.log(`console errors: ${errors}`);
} finally {
  await browser.close();
}
