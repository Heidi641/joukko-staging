import Link from "next/link";

export const metadata = {
  title: "JOUKKO | Kuka vastaa ja milloin palkkio syntyy?",
  description: "JOUKON suunniteltu vastuunjako, maksut ja kaupan eteneminen."
};

export default function ResponsibilitiesPage() {
  return (
    <>
      <section className="page-title">
        <div>
          <p className="kicker">Suunniteltu toimintamalli – oikeudellinen tarkistus kesken</p>
          <h1>Kuka vastaa ja mistä?</h1>
          <p>JOUKKO kokoaa kiinnostuneet ostajat ja antaa yrityksille mahdollisuuden tarjota.
          Kaupan ehdot ja osapuolet on tarkoitus pitää yksiselitteisinä jo ennen tarjouksen hyväksymistä.</p>
        </div>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Ostaja</h2>
          <p>Liittyy kiinnostavaan Joukkoon maksutta. Minä myös ei sido eikä maksa mitään.
          Katsoo todelliset tarjoukset, tarkistaa tarkat ehdot ja tekee itse erikseen päätöksen kaupasta.</p>
          <p>Ostaja maksaa tavaran tai palvelun <strong>suoraan myyjälle</strong>, ei JOUKOLLE.</p>
        </article>
        <article className="card">
          <h2>Myyjäyritys</h2>
          <p>Myy tuotteen tai palvelun <strong>omissa nimissään ostajalle</strong>. Yrityksen nimi, Y-tunnus,
          yhteystiedot, hinnat ja ehdot annetaan ennen sitovaa päätöstä.</p>
          <p>Myyjä vastaa oman sopimuksensa toimituksesta, luvista, asennuksesta, turvallisuudesta,
          takuu- ja virhevastuusta, soveltuvasta peruuttamisesta sekä reklamaatioista.</p>
        </article>
        <article className="card">
          <h2>JOUKKO / alustan ylläpitäjä</h2>
          <p>Järjestää kysynnän kokoamisen, ostotoiveiden ja yritystarjousten esittämisen,
          vertailun sekä sovitut yhteydenvälitystoiminnot.</p>
          <p>JOUKKO vastaa <strong>omasta palvelustaan ja lakisääteisistä velvoitteistaan</strong>,
          kuten oikeasta vastuunjakotiedosta ja tietosuojasta. Mikään vastuuvapauslauseke ei poista
          pakottavan lain mukaista vastuuta.</p>
        </article>
      </section>

      <section className="panel">
        <h2>Milloin JOUKKO saa rahansa?</h2>
        <ol>
          <li>Myyjä näkee juuri oman kilpailunsa palkkioperusteen, laskentapohjan ja ehdot ennen tarjousta.</li>
          <li>Myyjä hyväksyy palkkion erikseen. Asiakkaan kiinnostus tai keskeneräinen tarjous ei maksa mitään.</li>
          <li>Ostaja tekee varsinaisen sopimuksen myyjän kanssa. Kaupan toteutuminen ja palkkion peruste tarkistetaan.</li>
          <li>Peruutukset, palautukset ja kiistat huomioidaan ennen lopullista provisiolaskutusta.</li>
          <li>JOUKKO laskuttaa yritykseltä erillisen palkkion; ostajan kauppahintaa ei kierrätetä JOUKON kautta.</li>
        </ol>
        <p><strong>Ei automaattista 300 €:n kattoa.</strong> Prosentit määräytyvät kilpailutettavan tuotteen mukaan:
        esimerkkeinä tavalliset tuotteet 4 %, laitteet 3 %, asennuskokonaisuudet 3 %,
        autot 1 % ja määritellyt talopaketit 0,75 % sovitusta verottomasta kauppahinnasta.
        Liittymät ja laajakaista käyttävät ehdotuksen mukaan kiinteää toteutuneen sopimuksen palkkiota.
        Lopullinen yrityskohtainen hinnasto hyväksytään kirjallisesti ennen oikeita tarjouksia.</p>
      </section>

      <section className="panel">
        <h2>Talopaketit, autot ja muut suuret ostokset</h2>
        <p>Tarjous vertautuu vain täsmälleen määriteltyyn toimitukseen. Talopaketissa eritellään
        toimitusaste, perustukset, LVIS, maanrakennus ja tonttikohtaiset lisätyöt.
        Autoissa mallin, varustelun, toimituksen ja rahoituksen erot esitetään erillisinä.</p>
        <p>Näin et saa keskenään vertailukelvottomia hintoja. Myyjä tekee ostajalle lopullisen
        kohdekohtaisen sopimuksen ja vastaa siitä, mitä hän on luvannut.</p>
        <Link className="button secondary" href="/kampanjat">Tutustu täsmällisiin kilpailutuspaketteihin</Link>
      </section>

      <section className="notice">
        <h2>Ennen oikeita kauppoja</h2>
        <p>Tämä kuvaa vasta suunniteltua mallia, ei vielä juridisesti tarkastettuja sitovia ehtoja.
        JOUKKO ei vielä ota vastaan kauppahintoja tai aktivoi oikeita Stripe-veloituksia.
        Säänneltyjen toimialojen sitova välitys avataan vasta tarvittavien selvitysten ja sopimusten jälkeen.</p>
        <p><Link href="/kayttoehdot">Käyttöehdot (luonnos)</Link> · {" "}
        <Link href="/yritysehdot">Yritysehdot (luonnos)</Link> · {" "}
        <Link href="/tietosuoja">Tietosuoja (luonnos)</Link></p>
      </section>
    </>
  );
}
