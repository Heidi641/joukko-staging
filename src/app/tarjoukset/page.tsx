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
            <p className="muted">Toimitus {offer.delivery_price ?? 0} € · säästö {offer.estimated_saving ?? 0} € · vähintään {offer.minimum_participants}</p>
            <p>{offer.terms}</p>
            <div className="actions"><button className="button" type="button">Hyväksy demo</button><button className="button secondary" type="button">Hylkää</button></div>
          </article>
        ))}
        {offers.length === 0 && <div className="empty">Tarjouksia ei ole vielä.</div>}
      </section>
    </>
  );
}
