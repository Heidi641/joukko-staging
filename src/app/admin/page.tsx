import { redirect } from "next/navigation";
import { approveCompanyAction, approveGroupAction, selectWinningOfferAction, recordVerifiedSaleAction, updateGroupCommissionAction } from "@/lib/actions";
import { getAiSettings, aiIsUsable } from "@/lib/ai/settings";
import { getCategories, getGroups } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!auth.user) redirect("/kirjaudu");

  const { data: profile } = supabase ? await supabase.from("profiles").select("role").eq("id", auth.user.id).single() : { data: null };
  if (profile?.role !== "admin") {
    return <section className="page-title"><div><h1>Ei oikeutta</h1><p>Admin-näkymä vaatii admin-roolin ja RLS-suojauksen.</p></div></section>;
  }

  const [groups, categories] = await Promise.all([getGroups(), getCategories()]);
  const aiSettings = getAiSettings();
  const aiStatus = aiIsUsable() ? "ON" : "OFF";
  const [{ data: pendingCompanies }, { data: activeOffers }] = supabase ? await Promise.all([
    supabase.from("companies").select("id, name, business_id, verification_status, admin_review_status").neq("admin_review_status", "approved").limit(20),
    supabase.from("offers").select("id, group_id, status, companies(name), offer_versions(title, total_price)").in("status", ["active", "published"]).limit(50)
  ]) : [{ data: [] }, { data: [] }];
  const { data: verifyDeals } = supabase ? await supabase
    .from("deals")
    .select("id, status, accepted_total_price")
    .in("status", ["contact_shared", "order_confirmed", "fulfillment_pending", "fulfillment_in_progress"])
    .limit(20) : { data: [] };
  const [{ count: profileCount }, { count: companyCount }, { count: auditCount }, { count: dealCount }, { count: commissionCount }, { count: exceptionCount }] = supabase ? await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("audit_events").select("id", { count: "exact", head: true }),
    supabase.from("deals").select("id", { count: "exact", head: true }),
    supabase.from("commissions").select("id", { count: "exact", head: true }),
    supabase.from("offer_exception_requests").select("id", { count: "exact", head: true })
  ]) : [{ count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }];

  return (
    <>
      <section className="page-title">
        <div>
          <h1>Admin</h1>
          <p>Admin-oikeus tarkistetaan palvelimella ja Supabase RLS:llä. Tämä on staging, ei tuotanto.</p>
        </div>
      </section>
      <section className="grid">
        <article className="card"><h3>Käyttäjät</h3><strong className="big">{profileCount ?? 0}</strong><p className="muted">profiles-taulu</p></article>
        <article className="card"><h3>Yritykset</h3><strong className="big">{companyCount ?? 0}</strong><p className="muted">companies-taulu</p></article>
        <article className="card"><h3>Kategoriat</h3><strong className="big">{categories.length}</strong><p className="muted">Lisättävissä tietokannasta</p></article>
        <article className="card"><h3>Raportit</h3><strong className="big">0</strong><p className="muted">Joukot, tarjoukset ja yritykset</p></article>
        <article className="card"><h3>Audit trail</h3><strong className="big">{auditCount ?? 0}</strong><p className="muted">Tarjousversiot, sitoumukset, perumiset</p></article>
        <article className="card"><h3>Säännellyt kategoriat</h3><strong className="big">LEGAL</strong><p className="warning">JURIDINEN TARKISTUS VAADITAAN ENNEN AKTIVOINTIA</p></article>
        <article className="card"><h3>AI</h3><strong className="big">{aiStatus}</strong><p className="muted">Provider {aiSettings.provider} · malli {aiSettings.model} · päiväkatto {aiSettings.maxCostPerDay} €</p></article>
        <article className="card"><h3>AI-liput</h3><strong className="big">0</strong><p className="muted">Tarkistusta vaativat tarjoukset ja nopeasti kasvavat Joukot</p></article>
        <article className="card"><h3>Dealit</h3><strong className="big">{dealCount ?? 0}</strong><p className="muted">accepted, fulfillment, completed, refund/dispute</p></article>
        <article className="card"><h3>Commissionit</h3><strong className="big">{commissionCount ?? 0}</strong><p className="muted">Koontilaskutus valmiina, live-Stripe pois päältä</p></article>
        <article className="card"><h3>Poikkeuskeskeytykset</h3><strong className="big">{exceptionCount ?? 0}</strong><p className="muted">Admin tarkistaa, LEGAL_REVIEW_REQUIRED</p></article>
      </section>
      <section className="section-head"><h2>Yritysten varmennus</h2></section>
      <section className="grid">
        {pendingCompanies?.map((company) => (
          <article className="card" key={company.id}>
            <span className="pill">{company.verification_status}</span><h3>{company.name}</h3><p>Y-tunnus {company.business_id}</p>
            <form action={approveCompanyAction}>
              <input type="hidden" name="company_id" value={company.id} />
              <label>Admin-huomio<input name="admin_review_note" placeholder="Staging-varmennus" /></label>
              <button className="button" type="submit">Varmenna stagingiin</button>
            </form>
          </article>
        ))}
      </section>
      <section className="section-head"><h2>Tarjouskilpailun voittajan valinta</h2></section>
      <section className="grid">
        {activeOffers?.map((offer) => {
          const version = Array.isArray(offer.offer_versions) ? offer.offer_versions[0] : offer.offer_versions;
          const company = Array.isArray(offer.companies) ? offer.companies[0] : offer.companies;
          return <article className="card" key={offer.id}>
            <span className="pill">{offer.status}</span><h3>{version?.title ?? "Tarjous"}</h3>
            <p>{company?.name ?? "Yritys"} · {Number(version?.total_price ?? 0).toLocaleString("fi-FI")} €</p>
            <form action={selectWinningOfferAction}>
              <input type="hidden" name="group_id" value={offer.group_id} /><input type="hidden" name="offer_id" value={offer.id} />
              <button className="button" type="submit">Valitse voittajaksi ja päätä kilpailu</button>
            </form>
          </article>;
        })}
      </section>
      <section className="section-head"><h2>Myyjän kaupan todentaminen – vain testissä</h2></section>
      <section className="notice">
        Myyjän todellinen myyntisopimus ja veroton sopimusarvo pitää tarkistaa erikseen.
        Pelkkä ostajan kiinnostus tai valittu voittajatarjous ei synnytä provisiota.
        Varmista kaupan toteutuminen sekä palautus- ja peruuttamistilanne ennen vahvistamista.
        Älä lisää asiakasnimiä, maksukorttitietoja tai henkilötunnuksia viitekenttään.
      </section>
      <section className="grid">
        {verifyDeals?.map((deal) => (
          <form className="card" action={recordVerifiedSaleAction} key={deal.id}>
            <h3>Kauppa {deal.id.slice(0, 8)}</h3>
            <p className="muted">{deal.status} · ilmoitettu asiakashinta {Number(deal.accepted_total_price ?? 0).toLocaleString("fi-FI")} €</p>
            <input type="hidden" name="deal_id" value={deal.id} />
            <label>Myyjän todistettu veroton myyntiarvo (€)
              <input name="verified_net_sale_amount" type="number" min="0.01" step="0.01" required />
            </label>
            <label>Tosite-/sopimusviite ilman henkilötietoja
              <input name="sale_reference" minLength={5} maxLength={64} pattern="[A-Za-z0-9./_-]+" required />
            </label>
            <label className="check"><input type="checkbox" name="verified_seller_evidence" required /> Olen tarkistanut myyjän toteutuneen kaupan todisteen.</label>
            <label className="check"><input type="checkbox" name="checked_refunds" required /> Olen tarkistanut, ettei kauppa ole keskeneräinen, peruttu tai hyvityksen alainen.</label>
            <button className="button" type="submit">Varmenna ja merkitse toteutuneeksi</button>
          </form>
        ))}
      </section>
      <section className="section-head"><h2>Joukkojen moderointi ja erilliset palkkiot</h2></section>
      <section className="grid">
        {groups.map((group) => (
          <article className="card" key={group.id}>
            <span className="pill">{group.status}</span>
            <h3>{group.name}</h3>
            <p>{group.description}</p>
            <div className="actions">
              <form action={approveGroupAction}>
                <input type="hidden" name="group_id" value={group.id} />
                <button className="button" type="submit">Hyväksy</button>
              </form>
              <button className="button secondary" type="button">Piilota</button>
              <button className="button secondary" type="button">Nosta etusivulle</button>
            </div>
            <form action={updateGroupCommissionAction} className="wizard compact">
              <input type="hidden" name="group_id" value={group.id} />
              <h4>Juuri tämän Joukon sopimuskohtainen yrityspalkkio</h4>
              <p className="muted">Koskee vain uusia tarjouksia. Vanhat hyväksytyt tarjousversiot säilyttävät ehtonsa.</p>
              <label>Palkkiomalli
                <select name="commission_model" defaultValue={group.commission_model_override ?? "percentage_of_trade"}>
                  <option value="percentage_of_trade">Prosentti verottomasta toteutuneesta kaupasta</option>
                  <option value="cpa_per_completed_customer">€ / varmennettu sopimus tai kauppa</option>
                </select>
              </label>
              <label>Prosentti tai eurot
                <input name="commission_value" type="number" min="0.001" max="10000" step="0.001" defaultValue={group.commission_value_override ?? ""} required />
              </label>
              <p className="muted">Esim. auto 1 %, talopaketti 0,75 %, uusi liittymä 25 €.
              Varmista laskentapohja ja yrityksen hyväksyntä ennen oikeaa tarjousta.</p>
              <button className="button secondary" type="submit">Tallenna tulevien tarjousten palkkio</button>
            </form>
          </article>
        ))}
      </section>
    </>
  );
}
