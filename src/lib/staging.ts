export const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";

export const stagingLabel = "TESTIYMPÄRISTÖ - EI OIKEITA KAUPPOJA";

export const testAccounts = [
  { role: "Kuluttaja", email: "kuluttaja.testi@joukko.fi", password: "JoukkoTesti2026!" },
  { role: "Yritys", email: "yritys.testi@joukko.fi", password: "JoukkoTesti2026!" },
  { role: "Admin", email: "admin.testi@joukko.fi", password: "JoukkoTesti2026!" }
];
