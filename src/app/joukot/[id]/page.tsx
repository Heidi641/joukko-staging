import { notFound } from "next/navigation";
import { ProgressBar } from "@/components/progress";
import { ShareButton } from "@/components/share-button";
import { DemoAction } from "@/components/demo-action";
import { OfferAcceptanceCard } from "@/components/offer-acceptance-card";
import { getGroup, getOffersForGroup } from "@/lib/data";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await getGroup(id);
  if (!group) notFound();
  const offers = await getOffersForGroup(group.id);

  return (
    <>
      <section className="detail">
        <div>
          <span className="pill">{group.category_icon} {group.category_name}</span>
          <h1>{group.name}</h1>
          <p>{group.description}</p>
          <div className="facts">
            <div><dt>Alue</dt><dd>{group.area ?? "Valtakunnallinen"}</dd></div>
            <div><dt>Maa</dt><dd>{group.country_code} / {group.currency_code}</dd></div>
            <div><dt>Status</dt><dd>{group.status}</dd></div>
          </div>
        </div>
        <aside className="metric">
          <div className="metric-box">
            <span>Mukana</span>
            <strong>{group.member_count.toLocaleString("fi-FI")}</strong>
          </div>
          <div className="facts">
            <div><dt>Seuraa</dt><dd>{group.follower_count.toLocaleString("fi-FI")}</dd></div>
            <div><dt>Sitoutunut ehdoilla</dt><dd>{group.committed_count.toLocaleString("fi-FI")}</dd></div>
            <div><dt>Voi toteuttaa nyt</dt><dd>{group.ready_now_count.toLocaleString("fi-FI")}</dd></div>
          </div>
          <ProgressBar count={group.member_count} target={group.target_count} />
          {group.next_tier_label && <p className="muted">{group.next_tier_label}</p>}
          <div className="actions">
            <a className="button" href="#liity">Liity Joukkoon</a>
            <ShareButton title={group.name} count={group.member_count} />
            <button className="button secondary" type="button">Ilmoita ongelmasta</button>
          </div>
        </aside>
      </section>

      <section className="columns">
        <div className="panel">
          <h2>Ydinehdot</h2>
          <ul>
            {group.terms.map((term) => <li key={term}>{term}</li>)}
          </ul>
          <p className="warning">JOUKKO ei tee juridisesti sitovaa päätöstä puolestasi. Käyttäjä hyväksyy tarjouksen itse.</p>
        </div>
        <form className="panel" id="liity">
          <h2>Kolme tasoa</h2>
          <label>Sähköposti<input type="email" required placeholder="sinä@example.com" /></label>
          <label>Postinumero<input inputMode="numeric" placeholder="00100" /></label>
          <label>Sopimuksen tila<select><option>Ei koske tätä Joukkoa</option><option>Voin vaihtaa heti</option><option>Määräaikainen</option><option>Toistaiseksi voimassa oleva</option><option>En tiedä</option></select></label>
          <label>Päättymispäivä, jos määräaikainen<input type="date" /></label>
          <div className="actions">
            <button className="button secondary" type="button">Seuraan</button>
            <DemoAction label="Olen mukana" doneLabel="Liityit staging-demossa tähän Joukkoon. Tämä ei ole ostositoumus." storageKey={`joukko-demo-joined-${group.id}`} />
          </div>
          <hr />
          <h3>Olet sitoutumassa näihin ehtoihin</h3>
          <label>Enimmäinen kokonaishinta toimitettuna<input type="number" min="0" step="0.01" placeholder="499" /></label>
          <label>Enimmäinen kuukausihinta<input type="number" min="0" step="0.01" placeholder="24.90" /></label>
          <label>Sopimus enintään kuukausina<input type="number" min="1" placeholder="12" /></label>
          <label>Vähimmäissäästö luotettavasta vertailuhinnasta<input type="number" min="0" step="0.01" placeholder="50" /></label>
          <p className="muted">Tämä tallennetaan myöhemmin muuttumattomana hyväksyttynä ehtoversiona ja siihen sidottuna tarjousversiona.</p>
          <DemoAction label="Sitoudun ehdoilla demo" doneLabel="Ehdollinen demo-sitoutuminen tallennettiin vain tähän selaimeen." storageKey={`joukko-demo-commitment-${group.id}`} />
        </form>
      </section>

      <section className="section-head"><h2>Yritysten tarjoukset</h2></section>
      <section className="grid">
        {offers.map((offer) => (
          <article className="card" key={offer.id}>
            <span className="pill">{offer.company_name}</span>
            <h3>{offer.title}</h3>
            <strong className="big">{offer.total_price.toLocaleString("fi-FI")} €</strong>
            <p>{offer.description}</p>
            <p className="muted">Säästöarvio {offer.estimated_saving ?? 0} € · vähintään {offer.minimum_participants} hyväksyjää</p>
            <p>{offer.terms}</p>
            <div className="actions"><DemoAction label="Hyväksy demo" doneLabel="Tarjous hyväksyttiin staging-demossa. Halvempi porras voi soveltua automaattisesti." storageKey={`joukko-demo-accepted-${offer.id}`} /><button className="button secondary" type="button">Hylkää</button></div>
            <button className="button secondary" type="button">Ilmoita ongelmasta</button>
            <OfferAcceptanceCard offer={offer} acceptedCount={group.committed_count} />
          </article>
        ))}
        {offers.length === 0 && <div className="empty">Ei tarjouksia vielä.</div>}
      </section>
    </>
  );
}
