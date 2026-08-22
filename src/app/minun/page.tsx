export default function MyPage() {
  return (
    <>
      <section className="page-title">
        <div>
          <h1>Minun JOUKKO</h1>
          <p>Oma näkymä kokoaa liittymiset, perustetut Joukot, tarjoukset ja profiilin. Supabase Auth kytketään tähän seuraavassa vaiheessa.</p>
        </div>
      </section>
      <div className="tabs">
        <button>Omat Joukot</button>
        <button>Perustamani Joukot</button>
        <button>Tarjoukset</button>
        <button>Profiili</button>
      </div>
      <section className="grid">
        <article className="card"><h3>Omat Joukot</h3><p>Ryhmät joihin olet liittynyt, osallistujamäärät ja seuraavat hintaportaat.</p></article>
        <article className="card">
          <h3>Hyväksymäni tarjoukset</h3>
          <p><strong>Hyväksyit 499 €</strong></p>
          <p>JOUKKO kasvoi. Nykyinen hintasi 469 €. Säästät vielä 30 €.</p>
          <p className="muted">Auto-parannus jatkuu vain, jos hinta laskee eikä olennainen ehto heikkene.</p>
          <button className="button secondary" type="button">Jaa: Meitä tuli lisää ja hintamme laski</button>
        </article>
        <article className="card"><h3>Hyväksymistä odottavat tarjoukset</h3><p>Demo-hyväksyntä ja hylkäys valmiina UI-tasolla.</p></article>
        <article className="card"><h3>Profiili</h3><p>Postinumero, kieli, maa, ilmoitusasetukset ja tietosuoja.</p></article>
      </section>
    </>
  );
}
