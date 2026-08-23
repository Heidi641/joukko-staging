import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";

export default async function MyPage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!auth.user) redirect("/kirjaudu");

  const [{ data: profile }, { data: memberships }, { data: acceptances }, { data: deals }] = supabase ? await Promise.all([
    supabase.from("profiles").select("*").eq("id", auth.user.id).single(),
    supabase.from("group_members").select("*, groups(name, member_count, offer_count)").eq("profile_id", auth.user.id),
    supabase.from("offer_acceptances").select("*, offers(group_id), companies(name)").eq("profile_id", auth.user.id),
    supabase.from("deals").select("*, companies(name)").eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(10)
  ]) : [{ data: null }, { data: [] }, { data: [] }, { data: [] }];

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
        <article className="card">
          <h3>Dealit ja toteutus</h3>
          <strong className="big">{deals?.length ?? 0}</strong>
          {deals?.slice(0, 3).map((deal) => (
            <p key={deal.id}><strong>{deal.companies?.name ?? "Yritys"}</strong>: {deal.status}. Toimitus/toteutus: {String(deal.accepted_fulfillment_terms?.delivery_days_min ?? "?")}-{String(deal.accepted_fulfillment_terms?.delivery_days_max ?? "?")} arkipäivää.</p>
          ))}
          <p className="muted">Hyväksynnän jälkeen syntyy oma deal. Yritys saa vain kaupan toteuttamiseen tarvittavat tiedot.</p>
        </article>
        <article className="card"><h3>Profiili</h3><p>Postinumero, kieli, maa, ilmoitusasetukset ja tietosuoja.</p></article>
      </section>
    </>
  );
}
