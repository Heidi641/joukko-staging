import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";

export default async function MyPage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!auth.user) redirect("/kirjaudu");

  const [{ data: profile }, { data: memberships }, { data: acceptances }] = supabase ? await Promise.all([
    supabase.from("profiles").select("*").eq("id", auth.user.id).single(),
    supabase.from("group_members").select("*, groups(name, member_count, offer_count)").eq("profile_id", auth.user.id),
    supabase.from("offer_acceptances").select("*, offers(group_id), companies(name)").eq("profile_id", auth.user.id)
  ]) : [{ data: null }, { data: [] }, { data: [] }];

  return (
    <>
      <section className="page-title">
        <div>
          <h1>Minun JOUKKO</h1>
          <p>Kirjautuneena {auth.user.email}. Rooli: {profile?.role ?? "ei profiilia"}.</p>
        </div>
      </section>
      <div className="tabs">
        <button>Omat Joukot</button>
        <button>Perustamani Joukot</button>
        <button>Tarjoukset</button>
        <button>Profiili</button>
      </div>
      <section className="grid">
        <article className="card"><h3>Omat Joukot</h3><strong className="big">{memberships?.length ?? 0}</strong><p>Ryhmät joihin olet liittynyt. Tämä ei ole ostositoumus.</p></article>
        <article className="card">
          <h3>Hyväksymäni tarjoukset</h3>
          <strong className="big">{acceptances?.length ?? 0}</strong>
          {acceptances?.slice(0, 3).map((acceptance) => (
            <p key={acceptance.id}><strong>Hyväksyit {Number(acceptance.accepted_price).toLocaleString("fi-FI")} €</strong>. Nykyinen hintasi {Number(acceptance.current_price).toLocaleString("fi-FI")} €.</p>
          ))}
          <p className="muted">Auto-parannus jatkuu vain, jos hinta laskee eikä olennainen ehto heikkene.</p>
          <button className="button secondary" type="button">Jaa: Meitä tuli lisää ja hintamme laski</button>
        </article>
        <article className="card"><h3>Hyväksymistä odottavat tarjoukset</h3><p>Tarjouksen hyväksyntä tehdään aina erillisellä painikkeella.</p></article>
        <article className="card"><h3>Profiili</h3><p>Postinumero, kieli, maa, ilmoitusasetukset ja tietosuoja.</p></article>
      </section>
    </>
  );
}
