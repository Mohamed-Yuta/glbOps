import { chromium } from "playwright";
const errors = [];
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForSelector("text=Globétudes");
await page.selectOption(".gt-userselect", "Agent Contrôle");
await page.waitForTimeout(300);
await page.selectOption(".gt-userselect >> nth=1", "Émilie Bertrand");
await page.waitForTimeout(400);
await page.screenshot({ path: "cc1-emilie-kanban.png" });

const card = page.locator(".ab-card.actionable").first();
await card.click();
await page.waitForTimeout(300);
await page.screenshot({ path: "cc2-drawer.png" });
await page.click(".gt-iconbtn");
await page.waitForTimeout(200);

await page.click("button:has-text('Agenda')");
await page.waitForTimeout(300);
await page.screenshot({ path: "cc3-agenda.png" });

// other contrôle agent
await page.selectOption(".gt-userselect >> nth=1", "Julien Faure");
await page.waitForTimeout(400);
await page.click("button:has-text('Kanban')");
await page.waitForTimeout(200);
await page.screenshot({ path: "cc4-julien-kanban.png" });

console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
