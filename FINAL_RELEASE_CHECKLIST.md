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

## 6. Käytettävyys — ihmisen näkökulma
- Käyttäjä ymmärtää etusivulta heti mikä JOUKKO on ja mitä tehdä seuraavaksi.
- Tärkeät napit löytyvät ilman etsimistä.
- Tekstit ovat ymmärrettävää suomea eikä mukana ole kehittäjä-/testitekstiä väärissä paikoissa.
- Tyhjät tilat, virhetilat ja onnistumiset kertovat selkeästi mitä seuraavaksi.
- Navigaatio on johdonmukainen.
- Mobiilissa ei ole vaakavieritystä, päällekkäisiä elementtejä tai liian pieniä painikkeita.
- Kartat, kuvat, lomakkeet ja pitkät tekstit toimivat puhelimella.

## 7. Automaattinen selaintarkastus
- Playwright ajaa desktop- ja mobiilitarkastukset.
- Julkiset sivut avautuvat ilman selainvirheitä.
- Suojatut sivut eivät avaudu kirjautumattomalle.
- /testi ja /testaajat ohjautuvat /testaa-sivulle.
- Kuvakaappaukset tarkastetaan myös visuaalisesti, ei vain testituloksen perusteella.

## 8. Julkaisun viimeinen portti
- Build/deploy onnistuu Renderissä.
- Ei avoimia kriittisiä tai korkeita bugeja.
- Kuluttajan ja yrityksen ydintoiminnot testattu alusta loppuun.
- Maksut pidetään testitilassa, kunnes erillinen live-hyväksyntä annetaan.
- Tuotantoa ei avata automaattisesti tämän tarkastuksen seurauksena.

## Valmis vasta kun
FINAL RELEASE = PASS vasta kun yllä olevat kohdat on todennettu. Pelkkä onnistunut build tai vihreä automaatiotesti ei yksin tarkoita, että JOUKKO on julkaisuvalmis.
