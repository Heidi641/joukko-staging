import { test, expect, type Page } from "@playwright/test";

const protectedRoutes = [
  "/joukot",
  "/perusta",
  "/minun",
  "/tarjoukset",
  "/yritys",
  "/tekoaly",
  "/admin"
];

const publicRoutes = ["/", "/testaa", "/kirjaudu", "/rekisteroidy"];

async function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
  expect(overflow, "Sivu ei saa vuotaa vaakasuunnassa ruudun yli").toBeLessThanOrEqual(4);
}

for (const profile of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 }
]) {
  test.describe(profile.name, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: profile.width, height: profile.height });
    });

    for (const route of publicRoutes) {
      test(`julkinen sivu ${route} avautuu ja näyttää ehjältä`, async ({ page }, testInfo) => {
        const errors = await collectConsoleErrors(page);
        const response = await page.goto(route, { waitUntil: "networkidle" });
        expect(response?.status(), `${route} ei saa palauttaa virhesivua`).toBeLessThan(400);
        await expect(page.locator("body")).toBeVisible();
        await expectNoHorizontalOverflow(page);

        await page.screenshot({
          path: testInfo.outputPath(`${profile.name}-${route === "/" ? "etusivu" : route.slice(1)}.png`),
          fullPage: true
        });

        expect(errors, `Selainvirheitä sivulla ${route}: ${errors.join(" | ")}`).toEqual([]);
      });
    }

    test("testisivu sisältää testaajan tärkeät polut", async ({ page }) => {
      await page.goto("/testaa", { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: /testaajan sivu/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /rekisteröidy/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /kirjaudu sisään/i })).toBeVisible();
      await expect(page.getByText(/selaa joukkoja/i)).toBeVisible();
      await expect(page.getByText(/perusta oma joukko/i)).toBeVisible();
      await expect(page.getByText(/tarkista minun-sivu/i)).toBeVisible();
    });

    for (const route of protectedRoutes) {
      test(`kirjautumaton ei pääse sivulle ${route}`, async ({ page }) => {
        await page.goto(route, { waitUntil: "networkidle" });
        await expect(page).toHaveURL(/\/kirjaudu(?:\?|$)/);
        const current = new URL(page.url());
        expect(current.searchParams.get("next"), `Paluuosoitteen pitää säilyä reitille ${route}`).toContain(route);
      });
    }

    test("testi- ja testaajat-osoitteet päätyvät testisivulle", async ({ page }) => {
      for (const alias of ["/testi", "/testaajat"]) {
        await page.goto(alias, { waitUntil: "networkidle" });
        await expect(page).toHaveURL(/\/testaa\/?$/);
        await expect(page.getByRole("heading", { name: /testaajan sivu/i })).toBeVisible();
      }
    });
  });
}
