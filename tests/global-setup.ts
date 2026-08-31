import type { FullConfig } from "@playwright/test";

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) throw new Error("PLAYWRIGHT_TEST_BASE_URL puuttuu");

  const readyUrl = new URL("/testaa", baseURL);
  let lastStatus = 0;
  for (let attempt = 1; attempt <= 36; attempt += 1) {
    try {
      const response = await fetch(readyUrl, { redirect: "follow" });
      lastStatus = response.status;
      const body = await response.text();
      if (response.ok && body.toLocaleLowerCase("fi").includes("testaajan sivu")) return;
    } catch {
      lastStatus = 0;
    }
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
  throw new Error(`JOUKKO staging ei valmistunut testiin (viimeinen HTTP-tila ${lastStatus || "ei yhteyttä"})`);
}
