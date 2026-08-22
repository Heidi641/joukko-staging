import { GroupCard } from "@/components/group-card";
import { createGroupAction } from "@/lib/actions";
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
          <p>Kerro vain mitä haluat. Yritykset vastaavat myöhemmin omilla tarjouksillaan ja ehdoillaan.</p>
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

      <form className="panel wizard" action={createGroupAction}>
        <div className="steps">
          <span className="on">1 Tarve</span><span>2 Kategoria</span><span>3 Tarkkuus</span><span>4 Alue</span><span>5 Lähetä</span>
        </div>
        <label>Mitä haluaisit saada halvemmalla?<input name="name" required defaultValue={params.nimi} placeholder='Esim. 65" televisio' /></label>
        <label>Kategoria<select name="category_id" required>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
        <fieldset className="choice">
          <legend>Haluatko juuri tietyn tuotteen?</legend>
          <label className="check"><input type="radio" name="group_type" value="open" defaultChecked /> Ei, vastaava tuote käy</label>
          <label className="check"><input type="radio" name="group_type" value="exact" /> Kyllä, haluan juuri tämän</label>
        </fieldset>
        <label>Vapaaehtoinen tarkennus<textarea name="description" placeholder="Koko, ominaisuus, alue, ajankohta tai muu tärkeä asia. Ei tarvitse kirjoittaa tarjouspyyntöä."></textarea></label>
        <div className="grid two compact">
          <label>Merkki, jos tiedossa<input name="brand" placeholder="Samsung" /></label>
          <label>Malli<input name="model" placeholder="QE65..." /></label>
          <label>Mallikoodi<input name="model_code" placeholder="Tarkka mallikoodi" /></label>
          <label>Alue<input name="area" placeholder="Suomi" /></label>
        </div>
        <label>Tarvittava määrä tai tavoite<input name="target_count" type="number" min="1" placeholder="Esim. 500" /></label>
        <input name="detail_note" type="hidden" value="Asiakas kertoo ostotoiveen. Myyjä määrittelee tarjouksen, hinnan ja ehdot." />
        <div className="notice">Uusi Joukko menee stagingissa tilaan <strong>pending</strong>. Tämä ei ole ostositoumus eikä tarjouspyyntö yrityksen puolesta.</div>
        <button className="button" type="submit">Perusta uusi Joukko</button>
      </form>
    </>
  );
}
