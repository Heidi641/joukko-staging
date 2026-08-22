import Link from "next/link";
import { getCategories, getMetrics } from "@/lib/data";

export default async function HomePage() {
  const [metrics, categories] = await Promise.all([getMetrics(), getCategories()]);

  return (
    <>
      <section className="hero">
        <div>
          <p className="kicker">JOUKKO</p>
          <h1>Yksin olet yksi asiakas. Yhdessä olemme ostovoimaa.</h1>
          <p>Kerro mitä haluat halvemmalla. Liity muiden samaa haluavien joukkoon. Kun ostajia kertyy, yritykset kilpailevat teistä.</p>
          <div className="actions">
            <Link className="button" href="/joukot">Liity Joukkoon</Link>
            <Link className="button secondary" href="/perusta">Perusta Joukko</Link>
          </div>
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
