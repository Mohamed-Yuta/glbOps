import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForSelector("text=Globétudes");
await page.click("button:has-text('Calendrier')");
await page.waitForTimeout(500);
await page.screenshot({ path: "design-8-calendrier.png" });
await browser.close();
