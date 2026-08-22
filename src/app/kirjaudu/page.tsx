import Link from "next/link";
import { testAccounts } from "@/lib/staging";

export default function LoginPage() {
  return (
    <>
      <section className="page-title">
        <div>
          <h1>Kirjaudu</h1>
          <p>Supabase Auth kytketään tähän. MVP pitää roolit selkeinä: kuluttaja, yritys ja admin.</p>
        </div>
      </section>
      <form className="panel wizard">
        <label>Sähköposti<input type="email" required placeholder="sina@example.com" /></label>
        <label>Salasana<input type="password" required /></label>
        <button className="button" type="button">Kirjaudu demo</button>
        <p className="muted">Ei tiliä? <Link href="/rekisteroidy">Rekisteröidy</Link></p>
      </form>
      <section className="section-head">
        <div>
          <h2>Staging-testitunnukset</h2>
          <p className="muted">Nämä ovat vain testiympäristöä varten. Kirjautuminen on demotilassa eikä käytä oikeita asiakastietoja.</p>
        </div>
      </section>
      <section className="grid">
        {testAccounts.map((account) => (
          <article className="test-account" key={account.email}>
            <strong>{account.role}</strong>
            <span>{account.email}</span>
            <span>{account.password}</span>
          </article>
        ))}
      </section>
    </>
  );
}
