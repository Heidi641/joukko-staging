import type { Metadata } from "next";
import Link from "next/link";
import { isStaging, stagingLabel } from "@/lib/staging";
import "./globals.css";

export const metadata: Metadata = {
  title: "JOUKKO",
  description: "Kuluttajien yhteisen ostovoiman markkinapaikka"
};

const nav = [
  ["Etusivu", "/"],
  ["Joukot", "/joukot"],
  ["Perusta Joukko", "/perusta"],
  ["Yrityksille", "/yritys"],
  ["Minun", "/minun"],
  ["Kirjaudu", "/kirjaudu"],
  ["Admin", "/admin"]
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
          <Link href="/minun">Minä</Link>
        </nav>
      </body>
    </html>
  );
}
