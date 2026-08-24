# JOUKKO — FINAL RELEASE -tarkastus

JOUKKOA ei merkitä julkaisuvalmiiksi ennen kuin koko tämä tarkastus on käyty läpi.

## 1. Kirjautuminen ja näkyvyys
- Kirjautumaton ei voi käyttää JOUKKO-toimintoja edes testitilassa.
- Vain esittely, kirjautuminen, rekisteröinti, testiohje ja lakisivut voivat olla julkisia.
- Suojatut reitit ohjaavat kirjautumiseen ja palauttavat käyttäjän oikeaan paikkaan.
- Asiakas/kuluttaja-, yritys- ja admin-oikeudet eivät sekoitu.

## 2. Kuluttajan koko polku
- Rekisteröityminen ja kirjautuminen.
- Joukkojen selaus, haku ja kategoriat.
- Minä myös / Joukkoon liittyminen.
- Oman Joukon ehdottaminen/perustaminen.
- Tarjousten näkeminen ja hyväksyminen vain oikeassa vaiheessa.
- Minun-sivu näyttää omat Joukot, sitoumukset ja tarvittavat tiedot oikein.
- Päättyneet/perutut Joukot eivät jää aktiivisiksi väärään paikkaan.

## 3. Yrityksen koko polku
- Yritysprofiili ja tarvittavat varmennukset.
- Yritys näkee vain sille tarkoitetut toiminnot ja tiedot.
- Tarjouksen luonti, volyymiportaat, ehdot, voimassaolo ja toimitusaika.
- Tarjouksen muokkaus/peruminen vain sallituissa tilanteissa.
- Sitoutuneiden asiakkaiden tiedot eivät avaudu ennen oikeaa vaihetta.

## 4. Sopimus- ja maksulogiikka
- Kiinnostus ei muutu vahingossa sitovaksi.
- Sitoutuminen tapahtuu vain käyttäjän selkeällä hyväksynnällä.
- Määräaikaiset sopimukset ja myöhempi vaihtopäivä käsitellään oikein.
- Stripe/testimaksut eivät käytä oikeaa veloitusta testissä.
- Alustan provisio ja mahdolliset jatkuvat veloitukset toimivat suunnitellusti ennen live-maksujen avaamista.

## 5. Tietosuoja ja turvallisuus
- Käyttäjät eivät näe toistensa yksityisiä tietoja.
- Yritys ei saa sitoutumattomien henkilötietoja.
- Admin-reitit ja API:t ovat suojattuja.
- Salaisuuksia, API-avaimia tai palvelinympäristön tietoja ei vuoda selaimeen tai repoon.
- Virheilmoitukset eivät paljasta arkaluonteisia tietoja.

## 6. AI-tarkastus
- JOUKKO toimii myös silloin, kun AI on pois päältä.
- Jos AI-avain puuttuu tai AI-palvelu epäonnistuu, turvallinen mock/fallback toimii eikä JOUKKO kaadu.
- AI ei muuta yrityksen tarjoushintaa, sopimusehtoja tai volyymiportaita omin päin.
- AI ei hyväksy tarjousta, sitoutumista tai kauppaa käyttäjän puolesta.
- AI:lle ei lähetetä tarpeettomia henkilötietoja.
- OPENAI/API-avaimia ei koskaan julkaista NEXT_PUBLIC-muuttujina eikä selainkoodissa.
- Rate limit, käyttäjäkohtainen raja ja kustannusrajat testataan.
- AI-virheestä jää hallittu virhetila/loki, mutta käyttäjän alkuperäinen aineisto säilyy.
- Sama sisältö ei aiheuta turhia uusia AI-kutsuja, jos input_hash/cache on käytössä.
- AI:n tekemä analyysi merkitään AI-avusteiseksi eikä sitä esitetä varmana päätöksenä.

## 7. Käytettävyys — ihmisen näkökulma
- Käyttäjä ymmärtää etusivulta heti mikä JOUKKO on ja mitä tehdä seuraavaksi.
- Tärkeät napit löytyvät ilman etsimistä.
- Tekstit ovat ymmärrettävää suomea eikä mukana ole kehittäjä-/testitekstiä väärissä paikoissa.
- Tyhjät tilat, virhetilat ja onnistumiset kertovat selkeästi mitä seuraavaksi.
- Navigaatio on johdonmukainen.
- Mobiilissa ei ole vaakavieritystä, päällekkäisiä elementtejä tai liian pieniä painikkeita.
- Kartat, kuvat, lomakkeet ja pitkät tekstit toimivat puhelimella.

## 8. Automaattinen selaintarkastus
- Playwright ajaa desktop- ja mobiilitarkastukset.
- Julkiset sivut avautuvat ilman selainvirheitä.
- Suojatut sivut eivät avaudu kirjautumattomalle.
- /testi ja /testaajat ohjautuvat /testaa-sivulle.
- 404-, linkki-, lomake-, responsiivisuus-, saavutettavuus- ja perus-tietoturvatarkastukset ajetaan.
- Kuvakaappaukset tarkastetaan myös visuaalisesti, ei vain testituloksen perusteella.

## 9. Julkaisun viimeinen portti
- Build/deploy onnistuu Renderissä.
- Ei avoimia kriittisiä tai korkeita bugeja.
- Kuluttajan ja yrityksen ydintoiminnot testattu alusta loppuun.
- AI-tarkastus on PASS tai AI pidetään turvallisesti pois päältä julkaisuun asti.
- Maksut pidetään testitilassa, kunnes erillinen live-hyväksyntä annetaan.
- Tuotantoa ei avata automaattisesti tämän tarkastuksen seurauksena.

## Valmis vasta kun
FINAL RELEASE = PASS vasta kun yllä olevat kohdat on todennettu. Pelkkä onnistunut build tai vihreä automaatiotesti ei yksin tarkoita, että JOUKKO on julkaisuvalmis.
