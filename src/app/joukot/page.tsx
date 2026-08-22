import { GroupCard } from "@/components/group-card";
import { getCategories, getGroups } from "@/lib/data";

export default async function GroupsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [groups, categories] = await Promise.all([getGroups(), getCategories()]);
  const category = params.kategoria;
  const q = (params.haku ?? "").toLowerCase();
  const filtered = groups
    .filter((group) => !category || group.category_id === category || group.category_slug === category)
    .filter((group) => !q || `${group.name} ${group.description} ${group.area ?? ""}`.toLowerCase().includes(q))
    .sort((a, b) => {
      if (params.jarjestys === "uusimmat") return b.created_at.localeCompare(a.created_at);
      if (params.jarjestys === "tarjouksia") return b.offer_count - a.offer_count;
      return b.member_count - a.member_count;
    });

  return (
    <>
      <section className="page-title">
        <div>
          <h1>Joukot</h1>
          <p>Aktiiviset ostotoiveet kortteina. Suodata kategorian, alueen, suosion ja tarjousten mukaan.</p>
        </div>
      </section>

      <form className="filters">
        <input type="search" name="haku" placeholder="Hae joukkoa, tuotetta tai aluetta" defaultValue={params.haku} />
        <select name="kategoria" defaultValue={category ?? ""}>
          <option value="">Kaikki kategoriat</option>
          {categories.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}
        </select>
        <select name="alue" defaultValue={params.alue ?? ""}>
          <option value="">Kaikki alueet</option>
          <option value="suomi">Suomi</option>
          <option value="paikallinen">Paikallinen</option>
        </select>
        <select name="jarjestys" defaultValue={params.jarjestys ?? "osallistujat"}>
          <option value="osallistujat">Eniten osallistujia</option>
          <option value="uusimmat">Uusimmat</option>
          <option value="tarjouksia">Yritystarjouksia saatavilla</option>
        </select>
        <button className="button" type="submit">Suodata</button>
      </form>

      <section className="grid">
        {filtered.slice(0, 30).map((group) => <GroupCard group={group} key={group.id} />)}
        {filtered.length === 0 && <div className="empty">Ei vielä sopivia Joukkoja. Perusta uusi Joukko.</div>}
      </section>
      {filtered.length > 30 && <p className="muted">Näytetään 30 ensimmäistä. Tarkenna hakua tai suodatinta nähdäksesi lisää.</p>}
    </>
  );
}
