# JOUKKO – ehdotus hallituksi pilottijulkaisuksi (24.9.2026)

**Tila:** toteutus- ja yritysneuvotteluehdotus, ei juridisesti hyväksytty kaupallinen hinnasto eikä julkaisuvaltuutus. Kaikki oikeat maksut pois päältä.

## Kohderyhmä ja järjestys
- Vaihe 1: talvirenkaat (ajankohtainen sesonki), ilmalämpöpumppu + asennus (riittävän korkea ostos), rajaton puhelinliittymä (toistuva vertailtava tarve). Aloita näihin liittyvä yrityshankinta rinnakkain.
- Vaihe 2: kotilaajakaista, tarkka paikallinen ruokakassi (testaa yhdellä ruokakaupalla ja kotiinkuljetuksen ehdot), sähköenergian kiinnostuskysely (ei sitovia sopimuksia ennen oikeudellista tarkistusta).
- Kumppanihaku: uusi saman mallin auto ja rajatulla toimitusasteella talopaketti. Näitä ei pidä avata sitoviksi tilauksiksi ennen myyjien, asiakaskohtaisten tarjousten ja vastuiden varmistusta.
- Vakuutusten jakelu ja varsinaiset matkapaketit jätetään pois ensijulkaisusta: rekisteröinti-/vastuusääntely tarkistettava erikseen.

## Yksi ansaintaperiaate, selkeät näkyvät tuotekohtaiset hinnat
Kuluttaja: 0 € käyttö- tai osallistumismaksua. Myyjä vastaa tavarasta/palvelusta ja asiakas maksaa myyjälle, ei JOUKOLLE. JOUKOLLE tuloutetaan **vain toteutuneesta ja peruutusajan jälkeen vahvistetusta kaupasta** etukäteen hyväksytty palkkio. Jos kauppa purkautuu, palkkiota ei synny / aiempi palkkio hyvitetään. Yrityksen sopimukseen kirjataan mahdolliset vero- ja maksutapakulut; palkkiohinnoissa ei piilokuluja.

- Fyysiset tavarat ja asennukset: ehdotus 3 % myyjän alvittomasta toteutuneesta myyntihinnasta, min. 5 €/kauppa, katto 300 €/kauppa.
- Liittymät / laajakaista: ehdotus 20 €/vahvistettu sopimus, kerran.
- Paikallinen ruokakassi: pilottiehdotus 1 €/valmis vähintään 50 €:n tilaus; varmista kaupalle taloudellisesti järkevä malli.
- Auto ja talopaketti: ehdotus 300 €/myyjän vahvistama toteutunut kauppa, ei pelkästä liidistä; neuvoteltava tapauskohtaisesti ennen aktivointia.
- Sähkö: vain kysynnän kartoitus; provisiomalli ja välitysrooli tarkistettava ennen tarjousten keruuta.
- Ei pakollista yrityskuukausimaksua ensimmäisessä pilotissa. Myöhemmin mahdollinen lisäpalvelujäsenyys erillisellä hinnalla ja ilman kaksoisveloitusta.

## Aikarajat ja tilakone
1. `interest_open`: 7–21 vrk (auto 30, talo 60); "Minä myös" ei sido, määräaikaiset sopimukset odottavat vaihtokelpoisuutta.
2. `offers_open`: yrityksillä 7 vrk ja mahdollisuus tarjota jo kiinnostusvaiheessa; selkeä vahvistus tarjouksen kokonaishinnalle ja ehdoille.
3. `selection`: tarjoukset näkyvät rinnakkain, hintaportaiden ehdot, alustan palkkio yritykselle ja vastuut selvästi esillä.
4. `customer_acceptance`: vähintään 72 h viimeiselle kuluttajan omalle hyväksynnälle; ei hiljaisia sitoumuksia tai automaattisia sopimusvaihtoja.
5. `fulfillment` -> `verified_completed` -> `billable`: myyjän vahvistama toteutus + kuluttajan käytettävissä olevat lakisääteiset oikeudet huomioitu.
6. Jos kiinnostus-/tarjouskynnys ei täyty: erääntyminen; näkyvästi jatko enintään kerran 14 vrk tai sulje ja säilytä ostotoive ilman asiakkaan sitomista.
7. Yrityksen tarjous: varastoraja, hinnan voimassaolo, toimitusaika ja muutosten hyväksyntä ilmoitettava. Materiaaliset muutokset vaativat asiakkaan uuden hyväksynnän.

## Ehdoton julkaisun tarkastus
- Stagingissa on tekaistuja E2E-yrityksiä, osallistujia ja tarjouksia. Niitä EI SAA näkyä oikean palvelun mittareissa, suosituksissa tai tarjouksina. Tuotantokantaan vain 0-aloitusryhmiä.
- Omat tuotekohtaiset minimiehdot ja kokonaiskustannusten vertailu (sopimuksissa 12 kk kokonaishinta), ei pelkkiä prosenttialennuksia.
- Vain varmennettu yritys saa lähettää oikeita tarjouksia; Y-tunnus, maksutiedot ja asiakaspalvelukontakti tarkistetaan.
- Oikeat yrityssopimukset, laskutuskäytäntö ja tietosuoja tarkistetaan. Stripe / Connect vasta erillisen testin ja hyväksynnän jälkeen, ettei raha liiku vahingossa.
- Ilmalämpöpumpun, talopakettien, sähkön, sähköisten viestintäpalveluiden ja muiden erityisalojen ehdot tarkastettava asiantuntijalla ennen sitovaa transaktiota.
- Tietoturva / RLS / testit desktop ja mobiili / lähetysten ja maksujen idempotenssi / käyttöönoton paluutie dokumentoitava.

## Suomen ohjeita
- Tilastokeskuksen vuoden 2025 hyödykepainot: https://stat.fi/fi/julkaisu/cm190981h81o006ukn7pr0w19
- KKV markkinapaikan vastuun selkeys: https://www.kkv.fi/kuluttaja-asiat/verkkokauppa/verkon-markkinapaikka-alustat/
- KKV kokonaishintatiedot: https://www.kkv.fi/kuluttaja-asiat/markkinointi-alennukset-ja-hinnan-ilmoittaminen/hinnan-ilmoittaminen/
- Energiaviraston sähkön vertailu: https://www.sahkonhinta.fi/faq
- Finlex vakuutusten tarjoamisen rekisteröinti: https://finlex.fi/fi/lainsaadanto/2018/234
