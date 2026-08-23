import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";
import { isStaging, stagingLabel } from "@/lib/staging";
import "./globals.css";

export const metadata: Metadata = {
  title: "JOUKKO - yhteinen ostovoima",
  description: "JOUKKO kokoaa kuluttajien ostotoiveet ja näyttää yritysten tarjoukset vertailtavaksi.",
  openGraph: {
    title: "JOUKKO - yhteinen ostovoima",
    description: "Kerro mitä haluat. Muut liittyvät mukaan. Yritykset tarjoavat.",
    type: "website"
  },
  robots: isStaging ? { index: false, follow: false } : { index: true, follow: true }
};

const publicNav = [
  ["Etusivu", "/"],
  ["Joukot", "/joukot"],
  ["Perusta Joukko", "/perusta"],
  ["Yrityksille", "/yritys"],
  ["Kirjaudu / Rekisteröidy", "/kirjaudu"]
];

const privateNav = [
  ["Etusivu", "/"],
  ["Joukot", "/joukot"],
  ["Perusta Joukko", "/perusta"],
  ["Yrityksille", "/yritys"],
  ["Minun", "/minun"],
  ["Kirjaudu", "/kirjaudu"]
];

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const nav = data.user ? privateNav : publicNav;

  return (
    <html lang="fi">
      <body>
        {isStaging && <div className="staging-banner">{stagingLabel}</div>}
        <header className="topbar">
          <Link className="brand" href="/">JOUKKO</Link>
          <nav className="desktop-nav" aria-label="Päänavigaatio">
            {nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <Link href="/kayttoehdot">Käyttöehdot</Link>
          <Link href="/yritysehdot">Yritysehdot</Link>
          <Link href="/tietosuoja">Tietosuoja</Link>
          <Link href="/tekoaly">Tekoälyn käyttö</Link>
          <Link href="/evasteet">Evästeet</Link>
          <Link href="/ota-yhteytta">Ota yhteyttä</Link>
          <Link href="/yritys">Yrityksille</Link>
        </footer>
        <nav className="bottom-nav" aria-label="Mobiilinavigaatio">
          <Link href="/">Koti</Link>
          <Link href="/joukot">Joukot</Link>
          <Link className="plus" href="/perusta">*</Link>
          <Link href="/tarjoukset">Tarjoukset</Link>
          {data.user ? <Link href="/minun">Minä</Link> : <Link href="/kirjaudu">Kirjaudu</Link>}
        </nav>
      </body>
    </html>
  );
}
