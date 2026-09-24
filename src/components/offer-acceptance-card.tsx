import type { Offer } from "@/lib/types";
import { calculateTotalPrice, matchingTier } from "@/lib/matching";
import { acceptOfferAction } from "@/lib/actions";

function fulfillmentStartLabel(type?: Offer["fulfillment_start_type"]) {
  if (type === "immediately_after_acceptance") return "heti hyväksynnän jälkeen";
  if (type === "fixed_date") return "tiettynä päivänä";
  if (type === "date_range") return "päivämäärävälillä";
  if (type === "company_schedules_with_customer") return "yritys sopii ajan asiakkaan kanssa";
  return "tarjouksen päättymisen jälkeen";
}

function deliveryEstimate(offer: Offer) {
  if (offer.delivery_days_min !== null && offer.delivery_days_min !== undefined && offer.delivery_days_max !== null && offer.delivery_days_max !== undefined) {
    return `${offer.delivery_days_min}-${offer.delivery_days_max} arkipäivää`;
  }
  if (offer.delivery_days_min !== null && offer.delivery_days_min !== undefined) return `vähintään ${offer.delivery_days_min} arkipäivää`;
  if (offer.delivery_time) return offer.delivery_time;
  return "Ei ilmoitettu";
}

export function OfferAcceptanceCard({ offer, acceptedCount }: { offer: Offer; acceptedCount: number }) {
  const currentTier = matchingTier(offer, acceptedCount) ?? null;
  const nextTier = offer.tiers
    .filter((tier) => tier.min_acceptances > acceptedCount)
    .sort((a, b) => a.min_acceptances - b.min_acceptances)[0] ?? null;
  const currentPrice = currentTier ? calculateTotalPrice(currentTier.price, offer.mandatory_fees, offer.delivery_price ?? 0) : offer.total_price;

  return (
    <div className="offer-acceptance">
      <span className="pill">Tarjousversio {offer.version}</span>
      <h3>Ilmaise ehdollinen kiinnostus tähän tarjoukseen</h3>
      <dl className="summary-list">
        <div><dt>Yritys</dt><dd>{offer.company_name} · {offer.company_verification_status}</dd></div>
        <div><dt>Yritystunnus / maa</dt><dd>{offer.company_business_id ?? "Näytetään tarvittaessa hyväksynnän jälkeen"} · {offer.company_country}</dd></div>
        <div><dt>Tuote/palvelu</dt><dd>{offer.product_or_service}</dd></div>
        <div><dt>Nykyinen hintaporras</dt><dd>{currentTier?.label ?? "Ei porrasta vielä"}</dd></div>
        <div><dt>Nykyinen kokonaishinta</dt><dd>{currentPrice.toLocaleString("fi-FI")} € toimitettuna</dd></div>
        <div><dt>Seuraava hintaporras</dt><dd>{nextTier ? nextTier.label : "Ei seuraavaa porrasta"}</dd></div>
        <div><dt>Toimitus</dt><dd>{offer.delivery_method ?? "Ei ilmoitettu"} · {offer.delivery_price ?? 0} € · {offer.delivery_time ?? "Ei ilmoitettu"}</dd></div>
        <div><dt>Tarjous päättyy</dt><dd>{offer.valid_until ?? "Ei ilmoitettu"}</dd></div>
        <div><dt>Toimitus alkaa</dt><dd>{fulfillmentStartLabel(offer.fulfillment_start_type)}{offer.fulfillment_start_date ? ` · ${offer.fulfillment_start_date}` : ""}</dd></div>
        <div><dt>Arvioitu toimitus/toteutus</dt><dd>{deliveryEstimate(offer)}{offer.fulfillment_end_date ? ` · viimeistään ${offer.fulfillment_end_date}` : ""}</dd></div>
        <div><dt>Kapasiteetti</dt><dd>{offer.unlimited_until_close ? "Ei kiinteää maksimia ennen sulkeutumista" : `${offer.max_acceptances ?? offer.stock_limit ?? "Ei ilmoitettu"} hyväksyjää`}</dd></div>
        <div><dt>Sopimuskausi</dt><dd>{offer.contract_length ?? "Ei ilmoitettu"}</dd></div>
        <div><dt>Myyjän ehdot</dt><dd>{offer.terms_version} · {offer.terms_type}</dd></div>
      </dl>
      <details>
        <summary>Näytä täydelliset myyntiehdot</summary>
        <p>{offer.terms_text ?? offer.terms_url ?? offer.terms_document_reference ?? offer.terms}</p>
      </details>
      {offer.fulfillment_note && <p className="muted">{offer.fulfillment_note}</p>}
      <p className="warning">Testissä tämä painike tallentaa vain ehdollisen kiinnostuksesi tarjoukseen.
      Tämä EI ole tilaus eikä sopimus. Lopullinen kauppa ja mahdollinen maksu tehdään
      erikseen tunnistetun myyjän kanssa vasta lainmukaisten ennakkotietojen jälkeen.</p>
      <p className="muted">Myyjä on {offer.company_name} ja vastaa oman kauppasopimuksensa täyttämisestä,
      toimituksesta, soveltuvasta peruuttamisesta ja virhetilanteista. JOUKKO vastaa omasta alustatoiminnastaan.
      JOUKKO ei peri sinulta alustan onnistumispalkkiota.</p>
      <form action={acceptOfferAction}>
        <input type="hidden" name="group_id" value={offer.group_id} />
        <input type="hidden" name="offer_id" value={offer.id} />
        <input type="hidden" name="offer_version_id" value={offer.offer_version_id} />
        <label className="check">
          <input type="checkbox" name="allow_auto_apply" defaultChecked />
          Jos JOUKKO kasvaa ja hinta laskee samoilla tai paremmilla ehdoilla, alempi kiinnostushinta voidaan näyttää automaattisesti. Tämä ei tee tilausta puolestani.
        </label>
        <label className="check">
          <input type="checkbox" name="data_sharing_consent" required />
          Sallin, että jos tämä myyjä valitaan ja teen sen kanssa lopullisen sopimuksen, kaupan valmisteluun tarvittavat vähimmäistiedot voidaan luovuttaa vain tälle valitulle yritykselle.
        </label>
        <button className="button" type="submit">Ilmaise ehdollinen kiinnostus – ei tilausta</button>
      </form>
    </div>
  );
}
