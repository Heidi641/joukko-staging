export default function ContactPage() {
  return (
    <>
      <section className="page-title">
        <div>
          <h1>Ota yhteyttä</h1>
          <p>Stagingissa käytetään turvallisia yhteydenottolinkkejä. Tuotannon viralliset yritystiedot lisätään vain vahvistetuista tiedoista.</p>
        </div>
      </section>
      <section className="grid">
        <article className="card">
          <h2>Asiakaspalvelu</h2>
          <p>Yleiset kysymykset, käyttäjätilit ja Joukkoihin liittyminen.</p>
          <a className="button" href="mailto:asiakaspalvelu@example.com">asiakaspalvelu@example.com</a>
        </article>
        <article className="card">
          <h2>Yrityksille</h2>
          <p>Yritystarjoukset, varmennus ja alustapalkkion malli.</p>
          <a className="button" href="mailto:yritykset@example.com">yritykset@example.com</a>
        </article>
        <article className="card">
          <h2>Tietosuoja</h2>
          <p>Rekisteriasiat ja tietopyynnöt. Virallinen rekisterinpitäjä vahvistetaan ennen tuotantoa.</p>
          <a className="button" href="mailto:tietosuoja@example.com">tietosuoja@example.com</a>
        </article>
      </section>
      <div className="notice">Tuotannon oikea yritysnimi, Y-tunnus ja lopulliset yhteystiedot ovat release-blocker ennen varsinaista tuotantojulkaisua.</div>
    </>
  );
}
