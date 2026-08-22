import Link from "next/link";
import { signInAction, signOutAction } from "@/lib/actions";
import { createSupabaseServerClient } from "@/lib/supabase";
import { testAccounts } from "@/lib/staging";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <>
      <section className="page-title">
        <div>
          <h1>Kirjaudu</h1>
          <p>Staging käyttää Supabase Authia. Roolit ovat kuluttaja, yritys ja admin.</p>
        </div>
      </section>
      {params.virhe && <div className="notice warning">Kirjautuminen epäonnistui. Tarkista testitunnus.</div>}
      {data.user ? (
        <form className="panel wizard" action={signOutAction}>
          <p>Kirjautuneena: <strong>{data.user.email}</strong></p>
          <button className="button secondary" type="submit">Kirjaudu ulos</button>
        </form>
      ) : (
        <form className="panel wizard" action={signInAction}>
          <label>Sähköposti<input name="email" type="email" required placeholder="sina@example.com" /></label>
          <label>Salasana<input name="password" type="password" required /></label>
          <button className="button" type="submit">Kirjaudu</button>
          <p className="muted">Ei tiliä? <Link href="/rekisteroidy">Rekisteröidy</Link></p>
        </form>
      )}
      <section className="section-head">
        <div>
          <h2>Staging-testitunnukset</h2>
          <p className="muted">Nämä ovat vain testiympäristöä varten. Salasana on sama kaikille testirooleille.</p>
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
