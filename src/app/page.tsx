import Link from "next/link";
import { GroupCard } from "@/components/group-card";
import { findSimilarGroups, getCategories, getMetrics } from "@/lib/data";

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = params.q ?? "";
  const [metrics, categories, matches] = await Promise.all([getMetrics(), getCategories(), findSimilarGroups(query)]);

  return (
    <>
      <section className="hero">
        <div>
          <p className="kicker">JOUKKO</p>
          <h1>Mitä haluaisit saada halvemmalla?</h1>
          <p>Ihmiset kertovat mitä haluavat. Samaa haluavat kerääntyvät Joukoksi. Yritykset näkevät kysynnän ja tekevät omat tarjouksensa.</p>
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
            <span>Aktiivista kilpailutusosallistumista</span>
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
          <h2>Pääkategoriat</h2>
          <p className="muted">Osallistumismäärät lasketaan tietokannasta. Tyhjä kanta näyttää nollaa.</p>
        </div>
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
    </>
  );
}
