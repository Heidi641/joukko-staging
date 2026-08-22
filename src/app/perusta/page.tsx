import { GroupCard } from "@/components/group-card";
import { findSimilarGroups, getCategories } from "@/lib/data";

export default async function CreateGroupPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [categories, similar] = await Promise.all([
    getCategories(),
    findSimilarGroups(params.nimi ?? "")
  ]);

  return (
    <>
      <section className="page-title">
        <div>
          <h1>+ Perusta Joukko</h1>
          <p>Ohjattu vaiheistus pitää Joukon vertailukelpoisena ja estää ostovoiman turhaa hajautumista.</p>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="notice">
          <h2>Tälle tarpeelle saattaa jo olla Joukko</h2>
          <div className="grid">
            {similar.map((group) => <GroupCard group={group} key={group.id} />)}
          </div>
        </section>
      )}

      <form className="panel wizard">
        <div className="steps">
          <span className="on">1 Kategoria</span><span>2 Alakategoria</span><span>3 Tarve</span><span>4 Ehdot</span><span>5 Alue</span><span>6 Ajankohta</span><span>7 Tavoite</span><span>8 Tarkistus</span>
        </div>
        <label>Pääkategoria<select required>{categories.map((category) => <option key={category.id}>{category.name}</option>)}</select></label>
        <label>Alakategoria<input placeholder="Esim. sähkösopimus, renkaat, hotelli, puhelinliittymä" /></label>
        <label>Mitä haluat kilpailuttaa?<input name="nimi" required defaultValue={params.nimi} placeholder="Kirjoita tarkka tuote tai palvelu" /></label>
        <label>Tarkat ehdot<textarea required placeholder="Mallinumero, palveluehdot, toimitus, sopimuksen pituus, laatuvaatimukset"></textarea></label>
        <label>Alue<input placeholder="Fyysisissä tuotteissa oletus on valtakunnallinen" /></label>
        <label>Ajankohta<input placeholder="Heti, päivämäärä tai aikaväli" /></label>
        <label>Tavoitemäärä<input type="number" min="1" placeholder="Esim. 500" /></label>
        <div className="notice">Uusi käyttäjän perustama Joukko menee tilaan <strong>pending</strong>. Kun muita on liittynyt, olennaisia ehtoja ei saa muuttaa yksipuolisesti. Muutos vaatii uuden hyväksynnän tai uuden Joukon.</div>
        <button className="button" type="button">Lähetä tarkistukseen</button>
      </form>
    </>
  );
}
