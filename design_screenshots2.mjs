import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForSelector("text=Globétudes");

await page.click("button:has-text('Clients')");
await page.waitForTimeout(400);
await page.screenshot({ path: "design-4-clients.png" });

await page.click("button:has-text('Matériel')");
await page.waitForTimeout(400);
await page.screenshot({ path: "design-5-materiel.png" });

await page.click("button:has-text('Employés')");
await page.waitForTimeout(400);
await page.screenshot({ path: "design-6-employes.png" });

// Open a prestation directly for a rich historique timeline (non-conforme event included)
await page.click("button:has-text('Projets')");
await page.waitForTimeout(300);
await page.click("button:has-text('Kanban')");
await page.waitForTimeout(500);
const card = page.locator(".gt-kanban-card").filter({ hasText: "3 prestation" }).first();
await card.click();
await page.waitForTimeout(400);
const prestRow = page.locator(".gt-listrow").first();
if (await prestRow.count()) {
  await prestRow.click();
  await page.waitForTimeout(400);
  const drawer = page.locator(".gt-drawer").last();
  await drawer.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await page.waitForTimeout(300);
  await page.screenshot({ path: "design-7-prestation-historique.png" });
}

await browser.close();
