import Link from "next/link";
import { GroupCard } from "@/components/group-card";
import { findSimilarGroups, getCategories, getGroups, getMetrics } from "@/lib/data";

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = params.q ?? "";
  const [metrics, categories, matches, groups] = await Promise.all([getMetrics(), getCategories(), findSimilarGroups(query), getGroups()]);
  const featuredGroups = (query && matches.length > 0 ? matches : groups).slice(0, 6);

  return (
    <>
      <section className="hero">
        <div>
          <p className="kicker">JOUKKO</p>
          <h1>Yksin olet yksi asiakas.<br />Yhdessä olemme ostovoimaa.</h1>
          <div className="hero-search-block">
            <h2>Mitä haluaisit saada halvemmalla?</h2>
            <p>Kerro mitä haluat. Muut liittyvät mukaan. Yritykset näkevät kysynnän ja tarjoavat.</p>
          </div>
          <form className="search-hero" action="/">
            <input name="q" defaultValue={query} placeholder='Esim. 65" televisio, hotelliviikonloppu Helsingissä, sähkösopimus' />
            <button className="button" type="submit">Etsi Joukko</button>
          </form>
          {query && matches.length === 0 && (
            <div className="actions">
              <Link className="button" href={`/perusta?nimi=${encodeURIComponent(query)}`}>Perusta uusi Joukko</Link>
            </div>
          )}
        </div>
        <aside className="metric">
          <div className="metric-box">
            <span>Ihmistä mukana JOUKOSSA</span>
            <strong>{metrics.uniqueUsers.toLocaleString("fi-FI")}</strong>
          </div>
          <div className="metric-box">
            <span>Aktiivista osallistumista</span>
            <strong>{metrics.activeParticipations.toLocaleString("fi-FI")}</strong>
          </div>
        </aside>
      </section>

      {query && matches.length > 0 && (
        <>
          <section className="section-head">
            <div>
              <h2>Sopivia Joukkoja löytyi</h2>
              <p className="muted">Valitse olemassa oleva Joukko uuden perustamisen sijaan, jos tarve on sama.</p>
            </div>
          </section>
          <section className="grid">
            {matches.map((group) => <GroupCard group={group} key={group.id} />)}
          </section>
        </>
      )}

      <section className="section-head">
        <div>
          <h2>Suositut / kasvavat Joukot</h2>
          <p className="muted">Rajattu näkymä kysyntään. Kaikki Joukot löytyvät omalta sivultaan.</p>
        </div>
        <Link className="button secondary" href="/joukot">Näytä kaikki</Link>
      </section>

      <section className="grid">
        {featuredGroups.map((group) => <GroupCard group={group} key={group.id} />)}
        {featuredGroups.length === 0 && <div className="empty">Ei Joukkoja vielä. Perusta ensimmäinen Joukko.</div>}
      </section>

      <section className="section-head">
        <div>
          <h2>Pääkategoriat</h2>
          <p className="muted">Osallistumismäärät lasketaan tietokannasta. Tyhjä kanta näyttää nollaa.</p>
        </div>
        <Link className="button secondary" href="/joukot">Kaikki kategoriat</Link>
      </section>

      <section className="grid">
        {categories.slice(0, 6).map((category) => (
          <article className="card" key={category.id}>
            <div className="card-top">
              <span className="icon">{category.icon}</span>
              {category.regulated && <span className="pill">Säännelty</span>}
            </div>
            <h3>{category.name}</h3>
            <strong className="big">{category.participation_count.toLocaleString("fi-FI")} osallistumista</strong>
            <p className="muted">FI · EUR · fi-FI</p>
            {category.regulated && <p className="warning">JURIDINEN TARKISTUS VAADITAAN ENNEN AKTIVOINTIA</p>}
            <Link className="button secondary" href={`/joukot?kategoria=${category.slug}`}>Tutki Joukkoja</Link>
          </article>
        ))}
      </section>

      <section className="grid">
        <article className="card"><h3>1. Kerro mitä haluat</h3><p>Kirjoita ostotoive tavallisella kielellä.</p></article>
        <article className="card"><h3>2. Muut liittyvät mukaan</h3><p>Samaa haluavat ihmiset kerääntyvät JOUKOKSI.</p></article>
        <article className="card"><h3>3. Yritykset tarjoavat</h3><p>Yritykset näkevät kysynnän aggregoituna ja tekevät omat tarjouksensa.</p></article>
      </section>

      <section className="panel">
        <h2>Yrityksille</h2>
        <p>Näe todellinen kysyntä ennen kuin tilaat varastoa.</p>
        <Link className="button" href="/yritys">Katso kysyntää</Link>
      </section>
    </>
  );
}
