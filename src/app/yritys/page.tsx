import { GroupCard } from "@/components/group-card";
import { createOfferAction } from "@/lib/actions";
import { getCategories, getGroups } from "@/lib/data";

export default async function CompanyPage() {
  const [groups, categories] = await Promise.all([getGroups(), getCategories()]);

  return (
    <>
      <section className="page-title">
        <div>
          <h1>Yritysnäkymä</h1>
          <p>Näe avoimet Joukot, potentiaalinen kysyntä ja tee tarjous ilman yksittäisten käyttäjien henkilötietoja.</p>
        </div>
      </section>

      <form className="filters">
        <input placeholder="Hae Joukkoja" />
        <select><option>Kaikki kategoriat</option>{categories.map((category) => <option key={category.id}>{category.name}</option>)}</select>
        <select><option>Koko Suomi</option><option>Alueellinen</option></select>
        <select><option>Eniten kiinnostuneita</option><option>Kasvavat Joukot</option><option>Joukot ilman tarjousta</option></select>
      </form>

      <section className="section-head">
        <div>
          <h2>Joukot, joihin kaivataan tarjouksia</h2>
          <p className="muted">Yritys näkee aggregoidun kysynnän. Yksittäisiä henkilötietoja ei näytetä.</p>
        </div>
      </section>
      <section className="grid">
        {groups.filter((group) => group.offer_count === 0).slice(0, 6).map((group) => <GroupCard group={group} key={group.id} />)}
      </section>

      <section className="section-head"><h2>Nopeasti kasvavat Joukot</h2></section>
      <section className="grid">
        {groups.slice().sort((a, b) => (b.new_members_7d ?? 0) - (a.new_members_7d ?? 0)).slice(0, 6).map((group) => (
          <article className="card" key={group.id}>
            <span className="pill">{group.category_name}</span>
            <h3>{group.name}</h3>
            <strong className="big">{group.member_count.toLocaleString("fi-FI")} kiinnostunutta</strong>
            <p className="muted">{(group.new_members_24h ?? 0).toLocaleString("fi-FI")} uutta / 24 h · {(group.new_members_7d ?? 0).toLocaleString("fi-FI")} uutta / 7 vrk</p>
            <p>{group.group_type === "exact" ? "Tarkka tarve" : "Avoin tarve, sopivat eri merkit ja mallit"}</p>
          </article>
        ))}
      </section>

      <section className="columns">
        <form className="panel" action={createOfferAction}>
          <h2>Tee tarjous kysyntään</h2>
          <p className="muted">Tarjouksen julkaisu vaatii verified-yrityksen. Kun tarjous julkaistaan ja kuluttajat alkavat sitoutua siihen, olennaiset kentät lukitaan.</p>
          <label>Joukko<select name="group_id">{groups.map((group) => <option value={group.id} key={group.id}>{group.name} · {group.member_count.toLocaleString("fi-FI")} kiinnostunutta · {group.group_type}</option>)}</select></label>
          <label>Tarjottava tuote tai palvelu<input name="product_or_service" required placeholder="Täsmällinen tuote/palvelu" /></label>
          <div className="grid two compact">
            <label>Merkki<input name="brand" placeholder="Samsung, LG, TCL..." /></label>
            <label>Malli<input name="model" placeholder="OLED 65..." /></label>
            <label>Mallikoodi<input name="model_code" placeholder="QE65..." /></label>
            <label>Saatavuus<input name="availability" placeholder="Varastossa / tilauksesta" /></label>
          </div>
          <label>Tarjousnimi<input name="title" required placeholder="Esim. Samsung 65 toimitettuna" /></label>
          <label>Kuvaus<textarea name="description" required placeholder="Mitä tarjous sisältää?"></textarea></label>
          <label>JOUKKO-hinta<input name="price" type="number" min="0" step="0.01" required placeholder="499" /></label>
          <label>Pakolliset lisäkulut<input name="mandatory_fees" type="number" min="0" step="0.01" placeholder="0" /></label>
          <label>Normaalihinta<input name="normal_price" type="number" min="0" step="0.01" placeholder="699" /></label>
          <label>Arvioitu säästö<input name="estimated_saving" type="number" min="0" step="0.01" placeholder="200" /></label>
          <label>Vähimmäisosallistujamäärä<input name="minimum_participants" type="number" min="1" placeholder="500" /></label>
          <div className="grid two compact">
            <label>Maksimi hyväksyjämäärä<input name="max_acceptances" type="number" min="1" placeholder="1000" /></label>
            <label>Varasto-/kapasiteettiraja<input name="stock_limit" type="number" min="1" placeholder="1000" /></label>
          </div>
          <label className="check"><input type="checkbox" name="unlimited_until_close" /> Ei ennalta määritettyä maksimia; hyväksytyt käsitellään tarjouksen sulkeuduttua</label>
          <label>Toimituskulut<input name="delivery_price" type="number" min="0" step="0.01" placeholder="0" /></label>
          <label>Toimitustapa<input name="delivery_method" placeholder="Toimitettuna, nouto, sähköinen" /></label>
          <label>Toimitusaika<input name="delivery_time" placeholder="Esim. 5-10 arkipäivää" /></label>
          <label>Milloin toimitus/toteutus alkaa?
            <select name="fulfillment_start_type" defaultValue="after_offer_closes">
              <option value="immediately_after_acceptance">Heti hyväksynnän jälkeen</option>
              <option value="after_offer_closes">Tarjouksen päättymisen jälkeen</option>
              <option value="fixed_date">Tiettynä päivänä</option>
              <option value="date_range">Päivämäärävälillä</option>
              <option value="company_schedules_with_customer">Yritys sopii ajan asiakkaan kanssa</option>
            </select>
          </label>
          <div className="grid two compact">
            <label>Toteutus alkaa<input name="fulfillment_start_date" type="date" /></label>
            <label>Toteutus päättyy<input name="fulfillment_end_date" type="date" /></label>
            <label>Min. arkipäivää<input name="delivery_days_min" type="number" min="0" placeholder="5" /></label>
            <label>Max. arkipäivää<input name="delivery_days_max" type="number" min="0" placeholder="10" /></label>
          </div>
          <label>Toimitus-/toteutuslisätieto<textarea name="fulfillment_note" placeholder="Esim. toimitus 5-10 arkipäivässä tarjouksen sulkeutumisesta."></textarea></label>
          <label>Porrastetut hinnat<textarea name="tiers" placeholder={"500=499\n1000=469\n2000=439"}></textarea></label>
          <label>ALV-status<input name="vat_status" placeholder="Sisältää ALV:n / ALV 0 % / muu" /></label>
          <label>Sopimuskausi tarvittaessa<input name="contract_length" placeholder="Esim. 12 kk" /></label>
          <label>Takuu<input name="warranty_terms" placeholder="Esim. 24 kk" /></label>
          <label>Tarjous päättyy<input name="valid_until" type="date" /></label>
          <label>Vastaako tarjous Joukon olennaista tarvetta?<select name="requirement_match"><option value="company_confirmed">Kyllä, yritys vahvistaa</option><option value="needs_review">Tarvitsee admin-tarkistuksen</option></select></label>
          <label>Myyjän myyntiehdot tekstinä<textarea name="terms_text" required placeholder="Yritys kirjoittaa omat ehtonsa. JOUKKO ei generoi ehtoja myyjän puolesta."></textarea></label>
          <label>Ehtoversio<input name="terms_version" placeholder="seller-terms-v1" /></label>
          <label>JOUKKO-palkkiomalli
            <select name="commission_type" defaultValue="percentage_of_trade">
              <option value="percentage_of_trade">% completed kaupasta</option>
              <option value="per_completed_customer">€/completed asiakas</option>
              <option value="fixed_campaign_fee">Kiinteä kampanjapalkkio</option>
              <option value="manual_review_required">Admin määrittää myöhemmin</option>
            </select>
          </label>
          <div className="grid two compact">
            <label>Palkkioarvo<input name="commission_value" type="number" min="0" step="0.01" placeholder="3" /></label>
            <label>Palkkioehtojen versio<input name="commission_terms_version" placeholder="commission-v1" /></label>
          </div>
          <label className="check"><input type="checkbox" required /> Vahvistan, että yrityksellä on oikeus tehdä tarjous ja tiedot ovat oikeita.</label>
          <label className="check"><input type="checkbox" required /> Vahvistan, että nämä ovat yrityksen omat myyntiehdot ja yritys vastaa niiden oikeellisuudesta.</label>
          <label className="check"><input type="checkbox" required /> Hyväksyn JOUKON palkkioehdot tälle kampanjalle. Live-Stripe ei ole käytössä stagingissa.</label>
          <button className="button" type="submit">Julkaise staging-tarjous</button>
        </form>

        <aside className="panel">
          <h2>Yrityksen varmennus</h2>
          <div className="facts">
            <div><dt>Tila</dt><dd>verified vaaditaan</dd></div>
            <div><dt>Seuraava</dt><dd>pending_verification</dd></div>
            <div><dt>Julkaisu</dt><dd>verified</dd></div>
          </div>
          <h2>Aggregoitu kysyntä</h2>
          <p className="muted">Yritys näkee vain osallistujamäärät, aluejakaumat ja sopimusten päättymisjakaumat. Ei nimiä, sähköposteja tai tarkkoja osoitteita.</p>
          <div className="facts">
            <div><dt>Kiinnostuneet</dt><dd>{groups.reduce((sum, group) => sum + group.member_count, 0).toLocaleString("fi-FI")}</dd></div>
            <div><dt>Uudet 7 vrk</dt><dd>{groups.reduce((sum, group) => sum + (group.new_members_7d ?? 0), 0).toLocaleString("fi-FI")}</dd></div>
            <div><dt>Ilman tarjousta</dt><dd>{groups.filter((group) => group.offer_count === 0).length}</dd></div>
          </div>
          <h2>Tarjouksen tila</h2>
          <div className="facts">
            <div><dt>Hyväksyneet</dt><dd>0</dd></div>
            <div><dt>Saavutettu porras</dt><dd>Ei vielä</dd></div>
            <div><dt>Arvioitu liikevaihto</dt><dd>0 €</dd></div>
          </div>
        </aside>
      </section>
    </>
  );
}
