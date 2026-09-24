/**
 * Julkaisun kiinnostuskampanjat: nämä ovat ostotoiveiden vertailupohjia,
 * EIVÄT oikeita tarjouksia, asiakaslukuja tai lupauksia säästöstä.
 * Provisiot ovat ehdotuksia; yrityksen pitää hyväksyä oma palkkionsa.
 */
export type PilotPhase = "aloitus" | "seuraava" | "kumppanihaku";
export type Pilot = {
  slug: string;
  name: string;
  segment: string;
  phase: PilotPhase;
  location: string;
  interestDays: number;
  target: string;
  specification: string[];
  compare: string[];
  fee: string;
  note?: string;
};
export const launchPilots: Pilot[] = [
  {
    slug: "talvirenkaat", name: "Talvirenkaat – neljän renkaan paketti", segment: "Autoilu",
    phase: "aloitus", location: "Suomi", interestDays: 14, target: "Alkuun 30 kiinnostunutta",
    specification: ["4 samanmallista rengasta; hakija valitsee rengaskoon ja kitka-/nastavaihtoehdon", "Renkaan valmistaja, malli, koko, kantavuus- ja nopeusluokka ilmoitetaan", "Toimitusosoite/postinumero; asennus erillisenä valinnaisena hintana"],
    compare: ["4 renkaan kokonaishinta veroineen ja toimituksineen", "Merkki, malli, rengasmerkinnät ja saatavuus", "Toimitusaika, asennus ja takuuehdot"],
    fee: "3 % toteutuneesta verottomasta kaupasta; vähintään 5 €, enintään 300 €"
  },
  {
    slug: "ilmalampopumppu", name: "Ilmalämpöpumppu asennettuna", segment: "Koti ja energia",
    phase: "aloitus", location: "Uusimaa pilottina", interestDays: 21, target: "Alkuun 20 kiinnostunutta",
    specification: ["Omakotitaloon suunniteltu lämmittävä ilmalämpöpumppu; kohteen tiedot kerätään erikseen", "Tarjouksessa eroteltava laitteen hinta, vakioasennuksen sisältö ja mahdolliset lisätyöt", "Kohdekäynnin tarve ja sähkötöiden tekijän pätevyys tarkistetaan yritykseltä"],
    compare: ["Arvioitu kokonaishinta kaikkine ilmoitettuine töineen", "Laitemalli, suoritusarvot ja takuu", "Asennuksen rajaus, lisätyön hinnoittelu ja aikataulu"],
    fee: "3 % toteutuneesta verottomasta kaupasta; vähintään 5 €, enintään 300 €",
    note: "Kohdekohtainen lopullinen hinta vaatii tarvittaessa katselmuksen. JOUKKO ei tee asennustyötä."
  },
  {
    slug: "puhelinliittyma", name: "Rajaton puhelinliittymä", segment: "Arjen sopimukset",
    phase: "aloitus", location: "Suomi, kuuluvuus tarkistettava", interestDays: 21, target: "Alkuun 50 kiinnostunutta",
    specification: ["Rajaton kotimaan data; ilmoitettu liittymän enimmäisnopeus vähintään 200 Mbit/s", "EU-/ETA-verkkovierailudatan määrä ja puhelut/viestit eritellään", "Nykyisen sopimuksen päättymisaika ja numeronsiirron ehdot huomioidaan"],
    compare: ["12 kuukauden kokonaishinta avausmaksuineen", "Kampanjakausi ja hinta kampanjan jälkeen", "Kuuluvuus, nopeus, EU-datamäärä ja sopimuksen kesto"],
    fee: "20 € toteutuneesta, yrityksen vahvistamasta uudesta sopimuksesta; ei toistuvaa veloitusta",
    note: "Käyttäjä vahvistaa liittymäsopimuksen itse operaattorin kanssa."
  },
  {
    slug: "laajakaista", name: "Kodin laajakaista", segment: "Arjen sopimukset",
    phase: "seuraava", location: "Postinumerokohtainen", interestDays: 21, target: "Alkuun 30 kiinnostunutta",
    specification: ["Vähintään 100 Mbit/s ilmoitettu latausnopeus, saatavuus tarkistettava osoitteesta", "Liittymätyyppi, reitittimen tarve ja avausmaksu kerrotaan", "Nykyisen sopimuksen määräaikaisuus huomioidaan"],
    compare: ["12 kuukauden kokonaishinta pakollisine laitteineen ja avausmaksuineen", "Todellinen saatavuus, nopeusehdot ja sopimuskausi", "Hinta kampanjan jälkeen ja irtisanomisehdot"],
    fee: "20 € toteutuneesta, yrityksen vahvistamasta uudesta sopimuksesta"
  },
  {
    slug: "ruokakassi", name: "Viikon perusruokakassi", segment: "Ruoka",
    phase: "seuraava", location: "Siuntio–Kirkkonummi pilottina", interestDays: 7, target: "Alkuun 30 kotitaloutta",
    specification: ["Tarkka ostoskori määritetään erikseen (esim. maito, kaurahiutaleet, pasta, kananmunat, peruna, hedelmät)", "Koko, määrä, paino ja mahdolliset sallitut korvaavat tuotteet näkyvät jokaisessa kampanjassa", "Nouto ja kotiinkuljetus ovat erillisiä vertailuvaihtoehtoja"],
    compare: ["Täsmälleen saman ostoskorin kokonaishinta", "Saatavuus, korvaussäännöt ja tuoreus", "Toimituksen/noudon hinta, aika ja vähimmäisostoraja"],
    fee: "Pilottiehdotus: 1 € toteutuneelta, vähintään 50 €:n ostoskorilta",
    note: "Ei toistuvaa automaattista tilausta ilman erillistä hyväksyntää."
  },
  {
    slug: "sahko", name: "Sähkösopimus – vertailukelpoinen 12 kk", segment: "Arjen sopimukset",
    phase: "seuraava", location: "Suomi", interestDays: 21, target: "Alkuun 50 kiinnostunutta",
    specification: ["Vuosikulutus ja postinumero ilmoitetaan vertailua varten", "Kiinteä/pörssi/hybridi erotetaan eri vertailuihin; määräaika ja aloituspäivä vahvistetaan", "Sähköenergian hinta eritellään, siirtoa ja veroja ei markkinoida kilpailutettavina"],
    compare: ["Arvioitu 12 kk sähköenergian hinta kulutusprofiilin perusteella", "snt/kWh, perusmaksu, marginaali ja sopimusehdot", "Sopimuskausi, hinnanmuutosoikeudet ja aloitusajankohta"],
    fee: "Ehdotus: yrityksen kanssa erikseen hyväksyttävä kiinteä palkkio toteutuneesta sopimuksesta",
    note: "Vain kiinnostuksen keruu ennen sähkön välitysmallin juridista tarkistusta. Ei automaattisia vaihtoja."
  },
  {
    slug: "auto", name: "Uusi auto – saman mallin joukkopyyntö", segment: "Autoilu",
    phase: "kumppanihaku", location: "Suomi", interestDays: 30, target: "Alkuun 10 kiinnostunutta",
    specification: ["Sama valmistaja, malli, voimalinja, varustetaso ja väri- sekä toimitusvalinnat", "Osto ja leasing eritellään eri kampanjoiksi", "Vaihtoauton hyvitystä tai rahoitusta ei sisällytetä vertailuhintaan"],
    compare: ["Auton toimitettu kokonaishinta veroineen", "Tarkka varustelu ja toimitusaika", "Takuu, mahdolliset pakolliset lisäkulut"],
    fee: "Ehdotus: 300 € yrityksen vahvistamasta toteutuneesta autokaupasta",
    note: "Vain kumppanihaku, kunnes automyyjän tarjous- ja maksuprosessi on testattu."
  },
  {
    slug: "talopaketti", name: "Talopaketti – saman toimituslaajuuden vertailu", segment: "Rakentaminen",
    phase: "kumppanihaku", location: "Uusimaa pilottina", interestDays: 60, target: "Alkuun 5 kiinnostunutta",
    specification: ["Esimerkkitarve: noin 110 m², 3 makuuhuonetta; asiakkaan tonttitilanne selvitetään", "Tarjouksen toimitusaste, perustus-, LVIS- ja työosuus erotellaan", "Tontti, luvat, maaperä ja poikkeavat maanrakennustyöt eivät sisälly automaattisesti"],
    compare: ["Vain saman toimitusasteen ja rajauksen kokonaishinnat rinnakkain", "Toimitussisältö, mahdolliset lisäkulut ja toimitusaikataulu", "Urakkarajat, sopimustyyppi, vakuudet ja vastuut"],
    fee: "Ehdotus: 300 € toteutuneesta, yrityksen vahvistamasta talopakettisopimuksesta",
    note: "Kyse on alustavasta kiinnostuksesta, ei hyväksyttävissä olevasta kokonaishintaisesta rakennusurakasta."
  }
];

export const phaseLabel: Record<PilotPhase, string> = {
  aloitus: "Ensimmäiset kampanjat",
  seuraava: "Seuraavaksi",
  kumppanihaku: "Kumppaneita etsitään"
};
