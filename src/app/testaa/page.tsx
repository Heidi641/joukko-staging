import Link from "next/link";

const steps = [
  ["Rekisteröidy", "/rekisteroidy"],
  ["Kirjaudu sisään", "/kirjaudu"],
  ["Selaa Joukkoja", "/joukot"],
  ["Perusta oma Joukko", "/perusta"],
  ["Tarkista Minun-sivu", "/minun"]
] as const;

export default function TestPage() {
  return (
    <>
      <section className="page-title">
        <div>
          <h1>JOUKKO – testaajan sivu</h1>
          <p>Kiitos kun testaat JOUKKOA. Käy polku läpi omalla puhelimella tai tietokoneella ja merkitse havainnot talteen.</p>
        </div>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Testaa nämä</h2>
          <ol>
            {steps.map(([label, href]) => (
              <li key={href} style={{ marginBottom: "0.8rem" }}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ol>
        </article>

        <article className="card">
          <h2>Rastita testatuksi</h2>
          <div style={{ display: "grid", gap: "0.7rem" }}>
            {[
              "Rekisteröityminen onnistui",
              "Kirjautuminen onnistui",
              "Joukkojen selaus toimii",
              "Joukkoon liittyminen / seuraaminen toimii",
              "Oman Joukon perustaminen toimii",
              "Minun-sivu näyttää omat tiedot oikein",
              "Sivut toimivat mobiilissa",
              "Linkit ja napit vievät oikeaan paikkaan"
            ].map((item) => (
              <label key={item} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <input type="checkbox" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </article>

        <article className="card">
          <h2>Testiraportti</h2>
          <p>Kopioi tämä palaute ja täytä vain kohdat, joissa huomasit jotain.</p>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{`Laite: puhelin / tietokone\nSelain:\n\nMikä toimi hyvin:\n- \n\nMikä ei toiminut:\n- \n\nMissä kohdassa ongelma tuli:\n- \n\nMitä odotin tapahtuvan:\n- \n\nMitä tapahtui oikeasti:\n- \n\nMuu palaute / kehitysidea:\n- `}</pre>
        </article>
      </section>

      <div className="notice">Älä käytä testissä oikeita maksutietoja tai muuta arkaluonteista tietoa.</div>
    </>
  );
}
