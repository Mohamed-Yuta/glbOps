import { chromium } from "playwright";
const errors = [];
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 500 } });
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForSelector(".gt-topbar-titletext");
await page.waitForTimeout(400);
await page.screenshot({ path: "design-16-header-projets.png" });

await page.click("text=Clients");
await page.waitForTimeout(400);
await page.screenshot({ path: "design-17-header-clients.png" });

console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
