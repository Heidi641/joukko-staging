import { notFound } from "next/navigation";
import { ProgressBar } from "@/components/progress";
import { ShareButton } from "@/components/share-button";
import { OfferAcceptanceCard } from "@/components/offer-acceptance-card";
import { joinGroupAction } from "@/lib/actions";
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
            <span>Kiinnostunutta</span>
            <strong>{group.member_count.toLocaleString("fi-FI")}</strong>
          </div>
          <div className="facts">
            <div><dt>Seuraa</dt><dd>{group.follower_count.toLocaleString("fi-FI")}</dd></div>
            <div><dt>Hyväksynyt tarjouksen</dt><dd>{group.committed_count.toLocaleString("fi-FI")}</dd></div>
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
          <h2>{group.group_type === "exact" ? "Tarkka Joukko" : "Avoin Joukko"}</h2>
          <p>{group.group_type === "exact" ? "Yrityksen tarjouksen pitää vastata määriteltyä tuotetta tai palvelua." : "Yritykset saavat tarjota eri merkkejä tai malleja, kun tarjous vastaa olennaista tarvetta."}</p>
          {(group.brand || group.model || group.model_code) && (
            <div className="facts">
              <div><dt>Merkki</dt><dd>{group.brand ?? "Ei tiedossa"}</dd></div>
              <div><dt>Malli</dt><dd>{group.model ?? "Ei tiedossa"}</dd></div>
              <div><dt>Mallikoodi</dt><dd>{group.model_code ?? "Ei tiedossa"}</dd></div>
            </div>
          )}
          <ul>
            {group.terms.map((term) => <li key={term}>{term}</li>)}
          </ul>
          <p className="warning">JOUKKO ei tee juridisesti sitovaa päätöstä puolestasi. Käyttäjä hyväksyy tarjouksen itse.</p>
        </div>
        <form className="panel" id="liity" action={joinGroupAction}>
          <h2>Minä myös</h2>
          <input type="hidden" name="group_id" value={group.id} />
          <label>Postinumero<input name="postal_code" inputMode="numeric" placeholder="00100" /></label>
          <label>Sopimuksen tila<select name="contract_status"><option value="unknown">Ei koske / en tiedä</option><option value="can_switch_now">Voin vaihtaa heti</option><option value="fixed_term">Määräaikainen</option><option value="open_ended">Toistaiseksi voimassa oleva</option></select></label>
          <label>Päättymispäivä, jos määräaikainen<input name="contract_ends_at" type="date" /></label>
          <div className="actions">
            <button className="button" type="submit">Minä myös</button>
          </div>
          <hr />
          <p className="muted">Joukkoon liittyminen kertoo kiinnostuksesta. Se ei ole ostositoumus. Tarjouksen hyväksyntä tehdään erikseen tarjouskortilta.</p>
        </form>
      </section>

      <section className="section-head"><h2>Yritysten tarjoukset</h2></section>
      {offers.length > 1 && (
        <section className="panel compare">
          <h2>Vertaa tarjouksia</h2>
          <div className="compare-table">
            <div></div>
            {offers.map((offer) => <strong key={offer.id}>{offer.brand ?? offer.title}</strong>)}
            <span>Kokonaishinta</span>
            {offers.map((offer) => <span key={`${offer.id}-price`}>{offer.total_price.toLocaleString("fi-FI")} €</span>)}
            <span>Malli</span>
            {offers.map((offer) => <span key={`${offer.id}-model`}>{offer.model ?? offer.product_or_service}</span>)}
            <span>Toimitus</span>
            {offers.map((offer) => <span key={`${offer.id}-delivery`}>{offer.delivery_method ?? "Ei ilmoitettu"}</span>)}
            <span>Saatavuus</span>
            {offers.map((offer) => <span key={`${offer.id}-availability`}>{offer.availability ?? "Ei ilmoitettu"}</span>)}
          </div>
        </section>
      )}
      <section className="grid">
        {offers.map((offer) => (
          <article className="card" key={offer.id}>
            <span className="pill">{offer.company_name}</span>
            <h3>{offer.brand ? `${offer.brand} ${offer.model ?? ""}` : offer.title}</h3>
            <strong className="big">{offer.total_price.toLocaleString("fi-FI")} €</strong>
            <p>{offer.description}</p>
            <p className="muted">{(offer.accepted_count ?? 0).toLocaleString("fi-FI")} hyväksynyt tämän tarjouksen · säästöarvio {offer.estimated_saving ?? 0} € · vähintään {offer.minimum_participants} hyväksyjää</p>
            <p className="muted">Osuvuus: {offer.requirement_match} · kategoria: {offer.category_match}</p>
            <p>{offer.terms}</p>
            <button className="button secondary" type="button">Ilmoita ongelmasta</button>
            <OfferAcceptanceCard offer={offer} acceptedCount={group.committed_count} />
          </article>
        ))}
        {offers.length === 0 && <div className="empty">Ei tarjouksia vielä.</div>}
      </section>
    </>
  );
}
