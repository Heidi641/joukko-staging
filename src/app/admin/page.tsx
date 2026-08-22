import { getCategories, getGroups } from "@/lib/data";

export default async function AdminPage() {
  const [groups, categories] = await Promise.all([getGroups(), getCategories()]);

  return (
    <>
      <section className="page-title">
        <div>
          <h1>Admin</h1>
          <p>Adminin oikeudet pitää suojata Supabase RLS:llä ja palvelinpuolen roolitarkistuksella. Tämä MVP näyttää hallintamallin ilman kovakoodattuja avaimia.</p>
        </div>
      </section>
      <section className="grid">
        <article className="card"><h3>Käyttäjät</h3><strong className="big">0</strong><p className="muted">profiles-taulu</p></article>
        <article className="card"><h3>Yritykset</h3><strong className="big">0</strong><p className="muted">companies-taulu</p></article>
        <article className="card"><h3>Kategoriat</h3><strong className="big">{categories.length}</strong><p className="muted">Lisättävissä tietokannasta</p></article>
        <article className="card"><h3>Raportit</h3><strong className="big">0</strong><p className="muted">Joukot, tarjoukset ja yritykset</p></article>
        <article className="card"><h3>Audit trail</h3><strong className="big">0</strong><p className="muted">Tarjousversiot, sitoumukset, perumiset</p></article>
        <article className="card"><h3>Säännellyt kategoriat</h3><strong className="big">LEGAL</strong><p className="warning">JURIDINEN TARKISTUS VAADITAAN ENNEN AKTIVOINTIA</p></article>
        <article className="card"><h3>AI</h3><strong className="big">OFF</strong><p className="muted">Provider mock · malli mock-v1 · kustannusraja 0 €</p></article>
        <article className="card"><h3>AI-liput</h3><strong className="big">0</strong><p className="muted">Tarkistusta vaativat tarjoukset ja nopeasti kasvavat Joukot</p></article>
        <article className="card"><h3>Toteutuneet kaupat</h3><strong className="big">0 €</strong><p className="muted">Alustapalkkio valmiina laskettavaksi, ei oikeaa veloitusta</p></article>
      </section>
      <section className="section-head"><h2>Joukkojen moderointi</h2></section>
      <section className="grid">
        {groups.map((group) => (
          <article className="card" key={group.id}>
            <span className="pill">{group.status}</span>
            <h3>{group.name}</h3>
            <p>{group.description}</p>
            <div className="actions">
              <button className="button" type="button">Hyväksy</button>
              <button className="button secondary" type="button">Piilota</button>
              <button className="button secondary" type="button">Nosta etusivulle</button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
