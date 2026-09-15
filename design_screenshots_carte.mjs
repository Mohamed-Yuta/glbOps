import { chromium } from "playwright";
const errors = [];
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForSelector("text=Globétudes");
await page.click("button:has-text('Carte')");
await page.waitForTimeout(1500);
await page.screenshot({ path: "design-9-carte.png" });

// open a project popup for the popup styling
const marker = page.locator(".gt-map-marker").first();
if (await marker.count()) {
  await marker.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "design-10-carte-popup.png" });
}

console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
