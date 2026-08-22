import type { Offer } from "@/lib/types";
import { matchingTier } from "@/lib/matching";

export function OfferAcceptanceCard({ offer, acceptedCount }: { offer: Offer; acceptedCount: number }) {
  const currentTier = matchingTier(offer, acceptedCount) ?? offer.tiers[0] ?? null;
  const nextTier = offer.tiers
    .filter((tier) => tier.min_acceptances > acceptedCount)
    .sort((a, b) => a.min_acceptances - b.min_acceptances)[0] ?? null;
  const currentPrice = currentTier ? currentTier.price + (offer.delivery_price ?? 0) : offer.total_price;

  return (
    <article className="card offer-acceptance">
      <span className="pill">Tarjousversio {offer.version}</span>
      <h3>Hyväksyt tämän tarjouksen</h3>
      <dl className="summary-list">
        <div><dt>Yritys</dt><dd>{offer.company_name} · {offer.company_verification_status}</dd></div>
        <div><dt>Y-tunnus / maa</dt><dd>{offer.company_business_id} · {offer.company_country}</dd></div>
        <div><dt>Tuote/palvelu</dt><dd>{offer.product_or_service}</dd></div>
        <div><dt>Nykyinen hintaporras</dt><dd>{currentTier?.label ?? "Ei porrasta vielä"}</dd></div>
        <div><dt>Nykyinen kokonaishinta</dt><dd>{currentPrice.toLocaleString("fi-FI")} € toimitettuna</dd></div>
        <div><dt>Seuraava hintaporras</dt><dd>{nextTier ? nextTier.label : "Ei seuraavaa porrasta"}</dd></div>
        <div><dt>Toimitus</dt><dd>{offer.delivery_method ?? "Ei ilmoitettu"} · {offer.delivery_price ?? 0} € · {offer.delivery_time ?? "Ei ilmoitettu"}</dd></div>
        <div><dt>Sopimuskausi</dt><dd>{offer.contract_length ?? "Ei ilmoitettu"}</dd></div>
        <div><dt>Voimassaolo</dt><dd>{offer.starts_at ?? "Heti"} - {offer.valid_until}</dd></div>
        <div><dt>Myyjän ehdot</dt><dd>{offer.terms_version} · {offer.terms_type}</dd></div>
      </dl>
      <details>
        <summary>Näytä täydelliset myyntiehdot</summary>
        <p>{offer.terms_text ?? offer.terms_url ?? offer.terms_document_reference ?? offer.terms}</p>
      </details>
      <p className="muted">JOUKKO toimii alustana ja kysynnän kokoajana. Myyjä vastaa omasta tarjouksestaan, myyntiehdoistaan ja toimituksesta.</p>
      <label className="check">
        <input type="checkbox" />
        Hyväksyn, että jos JOUKKO kasvaa ja hinta laskee samoilla tai paremmilla ehdoilla, alempi hinta voidaan soveltaa automaattisesti ilman uutta hyväksyntää.
      </label>
      <button className="button" type="button">Hyväksy tarjous</button>
    </article>
  );
}
