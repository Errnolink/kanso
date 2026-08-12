/**
 * Kanso browser smoke test — Playwright (playwright-core) driving the
 * already-downloaded Chromium binary. No playwright browser install needed.
 *
 * Usage: node scripts/smoke.mjs [url]
 * Defaults to the vite dev server at http://localhost:5173
 */
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const CHROME_CANDIDATES = [
  // omp's downloaded Chromium (this machine)
  "C:/Users/Chef/.omp/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe",
  // system Chrome
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  // system Edge (last resort)
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];

function resolveExecutable() {
  for (const p of CHROME_CANDIDATES) {
    if (existsSync(p)) return p;
  }
  throw new Error("No Chromium/Chrome/Edge executable found");
}

const url = process.argv[2] ?? "http://localhost:5173";

const browser = await chromium.launch({
  executablePath: resolveExecutable(),
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
