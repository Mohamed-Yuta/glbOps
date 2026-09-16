import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--no-sandbox"] });

// Short viewport height forces the toolbar+cards to exceed available space even with
// minimal seed content, stress-testing the internal-scroll-vs-page-scroll behavior.
const cases = [
  { w: 1440, h: 420, label: "desktop-short" },
  { w: 1440, h: 800, label: "desktop-normal" },
  { w: 768, h: 700, label: "tablet" },
  { w: 480, h: 800, label: "mobile" },
  { w: 375, h: 700, label: "mobile-small" },
];

for (const c of cases) {
  const page = await browser.newPage({ viewport: { width: c.w, height: c.h } });
  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.click("text=Projets").catch(() => {});
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    const doc = document.documentElement;
    const app = document.querySelector(".gt-app");
    const listpage = document.querySelector(".gt-listpage") || document.querySelector(".gt-projets");
    const measure = (el) => el ? {
      scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, overflowY: getComputedStyle(el).overflowY,
    } : null;
    return {
      pageScrolls: doc.scrollHeight > doc.clientHeight,
      hScrolls: doc.scrollWidth > doc.clientWidth,
      app: measure(app),
      listpage: measure(listpage),
    };
  });
  console.log(`--- ${c.label} (${c.w}x${c.h}) ---`, JSON.stringify(info));
  await page.screenshot({ path: `resp-${c.label}.png` });

  // also check kanban mode
  await page.click("text=Kanban").catch(() => {});
  await page.waitForTimeout(400);
  const kInfo = await page.evaluate(() => {
    const doc = document.documentElement;
    const kanban = document.querySelector(".gt-kanban");
    return {
      pageScrolls: doc.scrollHeight > doc.clientHeight,
      kanban: kanban ? { scrollHeight: kanban.scrollHeight, clientHeight: kanban.clientHeight } : null,
    };
  });
  console.log(`--- ${c.label} kanban ---`, JSON.stringify(kInfo));
  await page.screenshot({ path: `resp-${c.label}-kanban.png` });

  await page.close();
}

await browser.close();
