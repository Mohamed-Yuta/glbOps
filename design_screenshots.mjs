import { chromium } from "playwright";
const errors = [];
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForSelector("text=Globétudes");

// 1. Kanban board (office / Dispatcher view)
await page.click("button:has-text('Kanban')").catch(() => {});
await page.waitForTimeout(400);
await page.screenshot({ path: "design-1-kanban.png" });

// 2. One drawer (open the first project card in list view, or first kanban card)
const card = page.locator(".gt-kanban-card, .gt-projetcard").first();
if (await card.count()) {
  await card.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "design-2-drawer.png" });

  // 3. Historique view — scroll the drawer down to the Historique section
  const drawer = page.locator(".gt-drawer");
  await drawer.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await page.waitForTimeout(300);
  await page.screenshot({ path: "design-3-historique.png" });
}

console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
