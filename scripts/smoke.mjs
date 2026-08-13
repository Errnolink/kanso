/**
 * Kanso browser smoke test — Playwright (playwright-core) driving whatever
 * Chromium is already on the machine. No playwright browser install needed.
 *
 * Usage: node scripts/smoke.mjs [url]
 * Defaults to the vite dev server at http://localhost:5173
 * Set CHROME_PATH to choose the browser explicitly.
 */
import { chromium } from "playwright-core";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveChrome } from "./chrome.mjs";

const url = process.argv[2] ?? "http://localhost:5173";

const browser = await chromium.launch({
  executablePath: resolveChrome(),
  headless: true,
  args: ["--no-sandbox"],
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  console.log(`URL:      ${page.url()}`);
  console.log(`Title:    ${await page.title()}`);
  console.log(`UA:       ${(await page.evaluate(() => navigator.userAgent)).slice(0, 60)}...`);
  const info = await page.evaluate(() => ({
    h1s: [...document.querySelectorAll("h1")].map((e) => e.textContent?.trim()),
    buttons: document.querySelectorAll("button").length,
    inputs: document.querySelectorAll("input").length,
    bodyText: document.body.innerText.slice(0, 200),
  }));
  console.log("Content:  " + JSON.stringify(info, null, 2));

  const shot = join(process.cwd(), ".server-logs", "smoke.png");
  await page.screenshot({ path: shot, fullPage: true });
  console.log(`Screenshot: ${shot}`);
} finally {
  await browser.close();
}
