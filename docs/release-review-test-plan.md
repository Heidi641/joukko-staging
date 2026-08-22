# JOUKKO MVP - release-review-test-plan

Tämä testi pitää ajaa ennen tuotantojulkaisua, kun Supabase Auth ja palvelinpuolen kirjoitukset on kytketty.

## Pakolliset skenaariot

1. Käyttäjä seuraa Joukkoa ilman ostositoumusta.
2. Käyttäjä liittyy Joukkoon ja kasvattaa `group_members`-laskuria.
3. Käyttäjä antaa ehdollisen sitoumuksen ja `conditional_commitments.accepted_terms_snapshot` tallentuu muuttumattomana.
4. Yritys tekee tarjouksen ja useita `offer_price_tiers`-portaita.
5. Match-moottori tunnistaa `conditional_match`-tilan käyttäjän ehtojen ja yrityksen tarjouksen välillä.
6. Minimimäärä täyttyy ja saavutettu porras voidaan lukita `threshold_reached`-tilaan.
7. Julkaistua tarjousversiota ei ylikirjoiteta, vaan muutos luo uuden `offer_versions`-rivin.
8. Määräaikainen sopimus tallentuu eikä käyttäjää lasketa heti vaihtokelpoiseksi ennen päättymistä.
9. Fyysisessä tuotteessa kokonaishinta muodostuu tuotteesta, pakollisista kuluista ja toimituksesta.
10. Käyttäjä ei näe muiden käyttäjien henkilötietoja RLS-politiikkojen läpi.
11. Yritys näkee vain aggregoidut laskurit eikä yksittäisiä käyttäjien tietoja.
12. Admin näkee audit-historian, raportit, peruutuksen syyn ja hyväksytyt juridiset dokumenttiversiot.

## Ostoketjun lisätestit

1. Kuluttaja liittyy Joukkoon mutta ei hyväksy tarjousta. Varmista, ettei ostositoumusta synny.
2. Yritys tekee portaat: 500 = 499 €, 1000 = 469 €. Kuluttaja hyväksyy 499 €.
3. 1000 hyväksyjää täyttyy. Varmista, että kuluttajan hinta muuttuu 469 €:oon ilman uutta hyväksyntää.
4. Yritys yrittää nostaa toimituskuluja hyväksynnän jälkeen. Varmista, ettei vanha hyväksyntä siirry heikentyneeseen tarjousversioon.
5. Yritys muuttaa tuotetta. Varmista, että uusi hyväksyntä vaaditaan.
6. Vähimmäismäärä ei täyty määräaikaan mennessä. Varmista, että tarjous raukeaa ja historia säilyy.
7. Kauppa merkitään toteutuneeksi. Varmista, että alustapalkkio voidaan laskea ilman oikeaa veloitusta.

## AI-kerroksen lisätestit

1. AI pois päältä: palvelu toimii.
2. AI API-avain puuttuu: mock/fallback toimii.
3. Uusi Joukkoteksti luo duplicate/analyysityön tietomalliin.
4. Sama sisältö analysoidaan vain kerran `input_hash`-cachella.
5. Yrityksen tarjous luo analyysityön.
6. AI löytää testidatasta lisämaksun ehtotekstistä.
7. AI epäonnistuu: tarjous säilyy alkuperäisenä.
8. Kustannusraja täyttyy: AI pysähtyy, JOUKKO toimii.
9. Rate limit estää massakutsut.
10. Henkilötietoja minimoidaan ennen AI-kutsua.
11. AI ei muuta yrityksen tarjoushintaa.
12. AI ei hyväksy kauppaa käyttäjän puolesta.

## Julkaisua estävät kohdat

- LEGAL_REVIEW_REQUIRED
- PRIVACY_REVIEW_REQUIRED
- SECURITY_REVIEW_REQUIRED
- PAYMENT_REVIEW_REQUIRED
- END_TO_END_REVIEW_REQUIRED
