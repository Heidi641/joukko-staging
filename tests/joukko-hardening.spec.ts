import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicRoutes = [
  "/",
  "/testaa",
  "/kirjaudu",
  "/rekisteroidy",
  "/kayttoehdot",
  "/tietosuoja",
  "/evasteet",
  "/ota-yhteytta"
];

const protectedRoutes = [
  "/joukot",
  "/perusta",
  "/minun",
  "/tarjoukset",
  "/yritys",
  "/tekoaly",
  "/admin"
];

const suspiciousText = [
  "SUPABASE_SERVICE_ROLE",
  "SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "sk_live_",
  "sk_test_"
];

test.describe("JOUKKO final hardening", () => {
  test("tuntematon osoite palauttaa oikean 404:n", async ({ page }) => {
    const response = await page.goto("/tata-sivua-ei-pitaisi-olla-938475", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(404);
  });

  for (const route of protectedRoutes) {
    test(`suora URL ei ohita kirjautumista: ${route}`, async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(`${route}?probe=1`, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/kirjaudu(?:\?|$)/);
      const target = new URL(page.url()).searchParams.get("next") || "";
      expect(target).toContain(route);
    });
  }

  test("tyhjä kirjautumislomake ei lähde palvelimelle", async ({ page }) => {
    await page.goto("/kirjaudu");
    const form = page.locator("form").first();
    expect(await form.evaluate((el: HTMLFormElement) => el.checkValidity())).toBe(false);
    await page.getByRole("button", { name: /^kirjaudu$/i }).click();
    await expect(page).toHaveURL(/\/kirjaudu/);
  });

  test("virheellinen sähköposti hylätään selaimessa", async ({ page }) => {
    await page.goto("/kirjaudu");
    await page.locator('input[name="email"]').fill("ei-ole-sahkoposti");
    await page.locator('input[name="password"]').fill("testisalasana");
    const valid = await page.locator('input[name="email"]').evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(valid).toBe(false);
  });

  test("rekisteröityminen vaatii ehdot ja pakolliset kentät", async ({ page }) => {
    await page.goto("/rekisteroidy");
    const form = page.locator("form").first();
    expect(await form.evaluate((el: HTMLFormElement) => el.checkValidity())).toBe(false);
    await page.locator('input[name="display_name"]').fill("Testaaja");
    await page.locator('input[name="email"]').fill("testaaja@example.com");
    await page.locator('input[name="password"]').fill("vain-testissa-123");
    expect(await form.evaluate((el: HTMLFormElement) => el.checkValidity())).toBe(false);
    await page.locator('input[name="accept_terms"]').check();
    await page.locator('input[name="accept_privacy"]').check();
    await page.locator('input[name="accept_ai_notice"]').check();
    expect(await form.evaluate((el: HTMLFormElement) => el.checkValidity())).toBe(true);
  });

  test("julkisilla sivuilla ei näy ilmeisiä salaisuuksia", async ({ page }) => {
    for (const route of publicRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const html = await page.content();
      for (const marker of suspiciousText) {
        expect(html, `${marker} ei saa näkyä sivulla ${route}`).not.toContain(marker);
      }
    }
  });

  test("julkisten sivujen sisäiset linkit eivät ole rikki", async ({ page, request, baseURL }) => {
    const checked = new Set<string>();
    for (const route of publicRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const hrefs = await page.locator('a[href]').evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).getAttribute('href') || ''));
      for (const href of hrefs) {
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
        const target = new URL(href, baseURL);
        if (target.origin !== new URL(baseURL!).origin) continue;
        const key = target.pathname + target.search;
        if (checked.has(key)) continue;
        checked.add(key);
        const response = await request.get(target.toString(), { maxRedirects: 0 });
        expect(response.status(), `Rikkinäinen linkki: ${key}`).toBeLessThan(400);
      }
    }
  });

  test("perustason tietoturvaotsakkeet ovat käytössä", async ({ request, baseURL }) => {
    const response = await request.get(baseURL!);
    const headers = response.headers();
    expect(headers["x-content-type-options"], "X-Content-Type-Options puuttuu").toBe("nosniff");
    expect(headers["referrer-policy"], "Referrer-Policy puuttuu").toBeTruthy();
    const frameProtected = Boolean(headers["x-frame-options"] || headers["content-security-policy"]?.includes("frame-ancestors"));
    expect(frameProtected, "Clickjacking-suojaus puuttuu").toBe(true);
  });

  for (const route of publicRoutes) {
    test(`saavutettavuus: ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page }).analyze();
      const blockers = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
      expect(blockers, blockers.map((v) => `${v.id}: ${v.help}`).join(" | ")).toEqual([]);
    });
  }

  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`responsiivisuus ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ["/", "/testaa", "/kirjaudu", "/rekisteroidy"]) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${route} vuotaa vaakasuunnassa ${width}px leveydellä`).toBeLessThanOrEqual(4);
      }
    });
  }

  test("etusivu latautuu kohtuullisessa ajassa", async ({ page }) => {
    const start = Date.now();
    const response = await page.goto("/", { waitUntil: "networkidle", timeout: 15000 });
    const elapsed = Date.now() - start;
    expect(response?.status()).toBeLessThan(400);
    expect(elapsed, `Etusivun lataus kesti ${elapsed} ms`).toBeLessThan(8000);
  });

  test("julkisilla sivuilla ei tule vakavia selainvirheitä", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    for (const route of publicRoutes) {
      await page.goto(route, { waitUntil: "networkidle" });
    }
    expect(errors, errors.join(" | ")).toEqual([]);
  });
});
