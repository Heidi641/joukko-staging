import { signUpAction } from "@/lib/actions";
import { legalDocuments } from "@/lib/legal-documents";

export default function RegisterPage() {
  const terms = legalDocuments.kayttoehdot;
  const privacy = legalDocuments.tietosuoja;
  const ai = legalDocuments.tekoaly;

  return (
    <>
      <section className="page-title">
        <div>
          <h1>Rekisteröidy</h1>
          <p>Luo ostajan tili. Yrityksenä tarjoaminen aktivoidaan erillisestä yritysprofiilista ja vaatii varmennuksen.</p>
        </div>
      </section>
      <form className="panel wizard" action={signUpAction}>
        <input type="hidden" name="terms_version" value={terms.version} />
        <input type="hidden" name="privacy_version" value={privacy.version} />
        <input type="hidden" name="ai_notice_version" value={ai.version} />
        <label>Nimi<input name="display_name" required /></label>
        <label>Sähköposti<input name="email" type="email" required /></label>
        <label>Salasana<input name="password" type="password" required /></label>
        <div className="grid two compact">
          <label>Yrityksen nimi, jos ostat yritykselle<input name="buyer_company_name" /></label>
          <label>Y-tunnus, jos tarvitset sen ostoon<input name="buyer_business_id" /></label>
        </div>
        <p className="muted">Nämä ovat ostajan vapaaehtoisia tietoja eivätkä tee tilistä myyjää. Yrityksenä tarjoaminen tehdään erikseen kohdasta “Tarjoa yrityksenä”.</p>

        <details className="legal-preview">
          <summary>{terms.title} · {terms.version}</summary>
          {terms.sections.slice(0, 8).map((section) => (
            <div key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </div>
          ))}
          <a href="/kayttoehdot" target="_blank" rel="noreferrer">Avaa täydet käyttöehdot</a>
        </details>
        <details className="legal-preview">
          <summary>{privacy.title} · {privacy.version}</summary>
          {privacy.sections.slice(0, 8).map((section) => (
            <div key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </div>
          ))}
          <a href="/tietosuoja" target="_blank" rel="noreferrer">Avaa täysi tietosuojaseloste</a>
        </details>
        <details className="legal-preview">
          <summary>{ai.title} · {ai.version}</summary>
          <p>{ai.sections[0].body}</p>
          <a href="/tekoaly" target="_blank" rel="noreferrer">Avaa tekoälyn käyttöä koskeva tieto</a>
        </details>

        <label className="check"><input name="accept_terms" type="checkbox" required /> Hyväksyn käyttöehdot version {terms.version}.</label>
        <label className="check"><input name="accept_privacy" type="checkbox" required /> Olen lukenut tietosuojaselosteen version {privacy.version}.</label>
        <label className="check"><input name="accept_ai_notice" type="checkbox" required /> Olen lukenut tekoälyn käyttöä koskevan tiedon version {ai.version}.</label>
        <label className="check"><input name="marketing_consent" type="checkbox" /> Haluan saada markkinointiviestejä. Tämä ei ole pakollinen palvelun käytölle.</label>
        <button className="button" type="submit">Luo tili</button>
      </form>
    </>
  );
}
