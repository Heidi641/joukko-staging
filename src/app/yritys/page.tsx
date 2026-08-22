import { GroupCard } from "@/components/group-card";
import { getCategories, getGroups } from "@/lib/data";

export default async function CompanyPage() {
  const [groups, categories] = await Promise.all([getGroups(), getCategories()]);

  return (
    <>
      <section className="page-title">
        <div>
          <h1>Yritysnäkymä</h1>
          <p>Näe avoimet Joukot, potentiaalinen kysyntä ja tee tarjous ilman yksittäisten käyttäjien henkilötietoja.</p>
        </div>
      </section>

      <form className="filters">
        <input placeholder="Hae Joukkoja" />
        <select><option>Kaikki kategoriat</option>{categories.map((category) => <option key={category.id}>{category.name}</option>)}</select>
        <select><option>Koko Suomi</option><option>Alueellinen</option></select>
        <select><option>Eniten osallistujia</option><option>Tarjouksia saatavilla</option></select>
      </form>

      <section className="grid">
        {groups.map((group) => <GroupCard group={group} key={group.id} />)}
      </section>

      <section className="columns">
        <form className="panel">
          <h2>Tarkista tarjous</h2>
          <p className="muted">Kun tarjous julkaistaan ja kuluttajat alkavat sitoutua siihen, olennaiset kentät lukitaan. Muutokset tehdään uutena tarjousversiona.</p>
          <label>Joukko<select>{groups.map((group) => <option key={group.id}>{group.name}</option>)}</select></label>
          <label>Tarjottava tuote tai palvelu<input placeholder="Täsmällinen tuote/palvelu, ei yleinen markkinointinimi" /></label>
          <label>Tarjousnimi<input placeholder="Esim. JOUKKO-sähkö 12 kk" /></label>
          <label>Kuvaus<textarea placeholder="Mitä tarjous sisältää?"></textarea></label>
          <label>Hinta<input type="number" min="0" step="0.01" placeholder="24.90" /></label>
          <label>Pakolliset lisäkulut<input type="number" min="0" step="0.01" placeholder="0" /></label>
          <label>Normaalihinta<input type="number" min="0" step="0.01" placeholder="29.90" /></label>
          <label>Arvioitu säästö<input type="number" min="0" step="0.01" placeholder="60" /></label>
          <label>Vähimmäisosallistujamäärä<input type="number" min="1" placeholder="500" /></label>
          <label>Toimituskulut<input type="number" min="0" step="0.01" placeholder="0" /></label>
          <label>Toimitustapa<input placeholder="Toimitettuna, nouto, sähköinen" /></label>
          <label>Toimitusaika<input placeholder="Esim. 5-10 arkipäivää" /></label>
          <label>Porrastetut hinnat<textarea placeholder={"500 hyväksyjää = 29,90 €\n1000 hyväksyjää = 27,90 €"}></textarea></label>
          <label>ALV-status<input placeholder="Sisältää ALV:n / ALV 0 % / muu" /></label>
          <label>Sopimuskausi tarvittaessa<input placeholder="Esim. 12 kk" /></label>
          <label>Takuu<input placeholder="Esim. 24 kk" /></label>
          <label>Palautusehdot<textarea placeholder="Myyjän palautusehdot"></textarea></label>
          <label>Peruutusehdot<textarea placeholder="Myyjän peruutusehdot"></textarea></label>
          <label>Tarjous alkaa<input type="datetime-local" /></label>
          <label>Tarjous päättyy<input type="date" /></label>
          <label>Myyjän ehtojen tyyppi<select><option>Teksti</option><option>Linkki</option><option>Dokumenttiviite</option></select></label>
          <label>Myyjän myyntiehdot tekstinä<textarea placeholder="Yritys kirjoittaa omat ehtonsa. JOUKKO ei generoi ehtoja myyjän puolesta."></textarea></label>
          <label>Linkki myyjän ehtoihin<input type="url" placeholder="https://..." /></label>
          <label>Ehtodokumentin viite<input placeholder="storage://seller-terms/..." /></label>
          <label>Ehtoversio<input placeholder="seller-terms-v1" /></label>
          <label>Muut ehdot<textarea></textarea></label>
          <label className="check"><input type="checkbox" required /> Vahvistan, että yrityksellä on oikeus tehdä tarjous ja tiedot ovat oikeita.</label>
          <label className="check"><input type="checkbox" required /> Vahvistan, että nämä ovat yrityksen omat myyntiehdot ja yritys vastaa niiden oikeellisuudesta.</label>
          <button className="button" type="button">Luo tarjousversio ja lähetä tarkistukseen</button>
          <button className="button secondary" type="button">Ilmoita ongelmasta</button>
        </form>

        <aside className="panel">
          <h2>Yrityksen varmennus</h2>
          <div className="facts">
            <div><dt>Tila</dt><dd>unverified</dd></div>
            <div><dt>Seuraava</dt><dd>pending_verification</dd></div>
            <div><dt>Julkaisu</dt><dd>verified</dd></div>
          </div>
          <h2>Aggregoitu kysyntä</h2>
          <p className="muted">Yritys näkee vain osallistujamäärät, aluejakaumat ja sopimusten päättymisjakaumat. Ei nimiä, sähköposteja tai tarkkoja osoitteita.</p>
          <div className="facts">
            <div><dt>Voi vaihtaa heti</dt><dd>0</dd></div>
            <div><dt>0-3 kk</dt><dd>0</dd></div>
            <div><dt>3-6 kk</dt><dd>0</dd></div>
          </div>
          <h2>Tarjouksen tila</h2>
          <div className="facts">
            <div><dt>Hyväksyneet</dt><dd>0</dd></div>
            <div><dt>Saavutettu porras</dt><dd>Ei vielä</dd></div>
            <div><dt>Arvioitu liikevaihto</dt><dd>0 €</dd></div>
          </div>
        </aside>
      </section>
    </>
  );
}
