import { chromium } from "playwright";
const errors = [];
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForSelector("text=Globétudes", { timeout: 5000 }).catch(() => {});
await page.waitForTimeout(600);
await page.screenshot({ path: "design-14-sidebar-v2.png" });

console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
