import { getGroups, getOffersForGroup } from "@/lib/data";

export default async function OffersPage() {
  const groups = await getGroups();
  const offers = (await Promise.all(groups.map(async (group) => {
    const groupOffers = await getOffersForGroup(group.id);
    return groupOffers.map((offer) => ({ ...offer, groupName: group.name }));
  }))).flat();

  return (
    <>
      <section className="page-title">
        <div>
          <h1>Tarjoukset</h1>
          <p>Vertailu näyttää kokonaishinnan, säästön, toimituskulut, ehdot ja vähimmäisosallistujamäärän. Halvinta numeroa ei merkitä automaattisesti parhaaksi.</p>
        </div>
      </section>
      <section className="grid">
        {offers.map((offer) => (
          <article className="card" key={offer.id}>
            <span className="pill">{offer.groupName}</span>
            <h3>{offer.company_name}: {offer.title}</h3>
            <strong className="big">{offer.total_price.toLocaleString("fi-FI")} € kokonaishinta</strong>
            <p>{offer.description}</p>
            <p className="muted">{offer.brand ?? "Myyjän tuote"} {offer.model ?? ""} · {offer.accepted_count ?? 0} hyväksyntää</p>
            <p className="muted">Toimitus {offer.delivery_price ?? 0} € · säästö {offer.estimated_saving ?? 0} € · vähintään {offer.minimum_participants}</p>
            <p className="muted">Päättyy {offer.valid_until ?? "ei ilmoitettu"} · toteutus {offer.delivery_days_min && offer.delivery_days_max ? `${offer.delivery_days_min}-${offer.delivery_days_max} arkipäivää` : offer.delivery_time ?? "ei ilmoitettu"}</p>
            <p>{offer.terms}</p>
            <div className="actions"><a className="button" href={`/joukot/${offer.group_id}`}>Katso tarjous</a></div>
          </article>
        ))}
        {offers.length === 0 && <div className="empty">Tarjouksia ei ole vielä.</div>}
      </section>
    </>
  );
}
