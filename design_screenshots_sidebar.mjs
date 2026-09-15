import { chromium } from "playwright";
const errors = [];
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForSelector("text=Globétudes");
await page.waitForTimeout(500);
await page.screenshot({ path: "design-11-sidebar-expanded.png" });

// collapse sidebar
await page.click('button[data-sidebar="trigger"], [data-slot="sidebar-trigger"]').catch(async () => {
  await page.click(".gt-topbar-title button");
});
await page.waitForTimeout(400);
await page.screenshot({ path: "design-12-sidebar-collapsed.png" });

// expand again and navigate to clients
await page.click(".gt-topbar-title button");
await page.waitForTimeout(300);
await page.click("text=Clients");
await page.waitForTimeout(400);
await page.screenshot({ path: "design-13-sidebar-clients.png" });

console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
