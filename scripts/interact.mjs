/**
 * Overlay interaction check — opens each overlay, asserts its ARIA contract,
 * screenshots it, and closes it again. Overlays are the easiest components
 * to ship broken because a static gallery never opens them.
 */
import { chromium } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const CHROME_CANDIDATES = [
  "C:/Users/Chef/.omp/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];

function exe() {
  for (const p of CHROME_CANDIDATES) if (existsSync(p)) return p;
  throw new Error("No Chromium/Chrome/Edge executable found");
}

const url = process.argv[2] ?? "http://localhost:5177";
const outDir = join(process.cwd(), ".server-logs", "shots");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: exe(), headless: true, args: ["--no-sandbox"] });
const results = [];
const fail = (name, detail) => results.push(`FAIL ${name} — ${detail}`);
const pass = (name, detail = "") => results.push(`ok   ${name}${detail ? ` — ${detail}` : ""}`);

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  // A bare "Failed to load resource" console line names no URL, which makes
  // it unactionable. Record the response so the report says what 404'd.
  page.on("response", (r) => {
    if (r.status() >= 400) consoleErrors.push(`HTTP ${r.status()} ${r.url()}`);
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  // --- Focus ring ---------------------------------------------------------
  // Checked first, on a clean page. Run it after an overlay has opened and
  // closed and you are just measuring wherever focus happened to land.
  await page.keyboard.press("Tab");
  const ring = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor };
  });
  if (!ring) fail("focus", "nothing focused after Tab");
  else if (ring.color !== "rgb(32, 240, 255)")
    fail("focus", `ring is ${ring.color}, expected cyan rgb(32, 240, 255)`);
  else pass("focus ring", `${ring.style} ${ring.width} ${ring.color}`);

  // --- Modal ------------------------------------------------------------
  await page.locator("#modal").getByRole("button", { name: "OPEN DIALOG" }).click();
  const dialog = page.getByRole("dialog");
  if (await dialog.isVisible()) {
    const modal = await dialog.evaluate((el) => ({
      ariaModal: el.getAttribute("aria-modal"),
      labelled: !!(el.getAttribute("aria-labelledby") || el.getAttribute("aria-label")),
      focusInside: el.contains(document.activeElement),
    }));
    modal.ariaModal === "true" ? pass("modal aria-modal") : fail("modal", "aria-modal not true");
    modal.labelled ? pass("modal accessible name") : fail("modal", "no accessible name");
    modal.focusInside ? pass("modal focus moved in") : fail("modal", "focus not moved into dialog");
    await page.screenshot({ path: join(outDir, "modal-open.png") });
    await page.keyboard.press("Escape");
    // The exit transition is 100ms; asserting immediately races it.
    await page.waitForTimeout(400);
    (await dialog.count()) === 0 ? pass("modal escape closes") : fail("modal", "Escape did not close");
  } else {
    fail("modal", "did not open");
  }

  // --- Command palette ---------------------------------------------------
  await page.locator("#menus").getByRole("button", { name: "OPEN PALETTE" }).click();
  const palette = page.locator(".kanso-cmdk");
  await page.waitForTimeout(300);
  if ((await palette.count()) > 0) {
    await page.keyboard.type("sync");
    await page.waitForTimeout(150);
    const shown = await page.locator(".kanso-cmdk__row").count();
    shown > 0
      ? pass("palette opens + filters", `${shown} rows for "sync"`)
      : fail("palette", 'filter "sync" matched nothing');
    await page.screenshot({ path: join(outDir, "palette-open.png") });
    await page.keyboard.press("Escape");
    // Assert it actually left the DOM — its scrim swallows pointer events,
    // so a palette that lingers silently breaks every later interaction.
    try {
      await palette.waitFor({ state: "detached", timeout: 2000 });
      pass("palette escape unmounts");
    } catch {
      fail("palette", "still mounted after Escape — scrim will block clicks");
    }
  } else {
    fail("palette", "did not open");
  }

  // --- Dropdown menu ------------------------------------------------------
  // Scroll the trigger in and let the previous overlay's exit finish; the
  // menu anchors to the button's measured rect, so clicking it mid-scroll
  // is a test artefact, not a component fault.
  const menuTrigger = page.locator("#menus").getByRole("button", { name: /ACTIONS/ });
  await menuTrigger.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await menuTrigger.click();
  await page.waitForTimeout(250);
  const menu = page.getByRole("menu");
  if (await menu.isVisible()) {
    const items = await page.getByRole("menuitem").count();
    items > 0 ? pass("menu items", `${items} menuitems`) : fail("menu", "no menuitem roles");
    await page.screenshot({ path: join(outDir, "menu-open.png") });
    await page.keyboard.press("Escape");
    try {
      await menu.waitFor({ state: "detached", timeout: 2000 });
      pass("menu escape unmounts");
    } catch {
      fail("menu", "still mounted after Escape");
    }
  } else {
    fail("menu", "did not open");
  }

  // --- Toast --------------------------------------------------------------
  await page.locator("#transient").getByRole("button", { name: "SUCCESS" }).click();
  await page.locator("#transient").getByRole("button", { name: "PINNED DANGER" }).click();
  await page.waitForTimeout(250);
  const toasts = await page.locator("[role='status'], [aria-live='polite']").count();
  toasts > 0 ? pass("toast raised", `${toasts} live regions`) : fail("toast", "no live region found");
  await page.screenshot({ path: join(outDir, "toast.png") });

  // --- Boot sequence ------------------------------------------------------
  await page.locator("#boot").getByRole("button", { name: "RUN SEQUENCE" }).click();
  await page.waitForTimeout(1200);
  await page.locator("#boot").screenshot({ path: join(outDir, "boot.png") });
  pass("boot sequence runs");

  console.log(results.join("\n"));
  console.log(`\nconsole errors: ${consoleErrors.length}`);
  for (const e of consoleErrors.slice(0, 10)) console.log("  " + e);
  if (results.some((r) => r.startsWith("FAIL"))) process.exitCode = 1;
} finally {
  await browser.close();
}
