# JOUKKO MVP

JOUKKO on kuluttajien yhteisen ostovoiman markkinapaikka.

Tämä on ensimmäinen MVP erillisenä Next.js + TypeScript -verkkosovelluksena. Se ei ole WordPress-lisäosa.

## Teknologia

- Next.js App Router
- TypeScript
- React
- Supabase-valmis datakerros
- Supabase PostgreSQL -migraatiot ja RLS-politiikat
- Render-valmis `render.yaml`

## Käynnistys

```bash
pnpm install
pnpm run dev
```

Avaa:

```text
http://localhost:3000
```

## Ympäristömuuttujat

Kopioi `.env.example` tiedostoksi `.env.local` ja täytä arvot:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_ENABLED=false
AI_PROVIDER=mock
AI_MODEL=mock-v1
OPENAI_API_KEY=
AI_MAX_REQUESTS_PER_DAY=100
AI_MAX_REQUESTS_PER_USER_HOUR=10
AI_MAX_COST_PER_DAY=0
AI_MAX_COST_PER_MONTH=0
```

Älä lisää oikeita API-avaimia GitHubiin.

## Supabase

Migraatio:

```text
supabase/migrations/001_initial_schema.sql
```

Kehityksen demodata:

```text
supabase/seed/demo.sql
```

Demodata on erillinen ja sen voi jättää ajamatta tuotannossa. Etusivun päämittarit lasketaan `profiles`- ja `group_members`-tauluista. Tyhjä kanta näyttää 0.

## MVP:n sivut

- `/` etusivu ja päämittarit
- `/joukot` Joukkolista ja suodattimet
- `/joukot/[id]` Joukon oma sivu
- `/perusta` ohjattu Joukon perustaminen
- `/yritys` yritysnäkymä ja tarjouslomake
- `/tarjoukset` tarjousten vertailu
- `/minun` käyttäjän oma näkymä
- `/kirjaudu` kirjautumisen MVP-näkymä
- `/rekisteroidy` kuluttaja- ja yritysrekisteröinnin MVP-näkymä
- `/admin` adminin moderointinäkymä
- `/kayttoehdot` käyttöehdot, juridista tarkistusta vaativat kohdat merkitty
- `/yritysehdot` yritysehdot, tarjousversiot ja yrityksen sitoutuminen
- `/tietosuoja` tietosuojaseloste
- `/tekoaly` tekoälyn käytön avoin kuvaus
- `/evasteet` evästeet ja seuranta
- `/ota-yhteytta` yhteydenoton paikka

## Pakollisen lisäyksen rakenteet

- Kolme kuluttajatasoa: seuraan, olen mukana, sitoudun ehdoilla
- Ehdollisen sitoutumisen tietomalli ja MVP-lomake
- Match-moottorin peruslogiikka: kokonaishinta, tarjousporras ja tilat
- Ostohyväksynnän tietomalli: tarjousversio, hyväksytty hinta, ehtoversio ja auto-parannussääntö
- Myyjän omat ehdot: teksti, linkki tai dokumenttiviite
- Tarjousversiot ja olennaisten kenttien lukitusmalli
- AI-palvelukerros provider-rajapinnalla ja mock/fallbackilla
- AI-kustannusrajat, jobit, tulokset, käyttölogit ja admin-kytkimet tietomallissa
- Audit trail, raportit ja kiellettyjen termien tietomalli
- Juridisten dokumenttien versionointi ja hyväksyntöjen tietomalli
- Yrityksen varmennustilat: `unverified`, `pending_verification`, `verified`, `suspended`
- Säänneltyjen kategorioiden varoitus: `LEGAL_REVIEW_REQUIRED`
- Alustapalkkion tietomalli tulevaa laskutusta varten

## Pakollinen release-review ennen julkaisua

Ennen tuotantoa tehdään:

```text
LEGAL + PRIVACY + SECURITY + PAYMENT + END-TO-END RELEASE REVIEW
```

MVP ei julkaise palvelua, ota maksuja käyttöön, lähetä oikeita tarjouksia eikä aktivoi juridisesti epävarmoja toimintoja.

## Testauspolut, jotka arkkitehtuuri tukee

- käyttäjä seuraa Joukkoa
- käyttäjä liittyy Joukkoon
- käyttäjä antaa ehdollisen sitoumuksen
- yritys tekee tarjousversion ja hintaportaat
- match-moottori vertaa käyttäjän ehtoja yrityksen tarjoukseen
- minimimäärä täyttyy ja tila voi muuttua `threshold_reached`
- tarjousversio säilyy historiassa eikä sitä ylikirjoiteta
- hyväksyntä säilyy, kun hinta laskee samoilla tai paremmilla ehdoilla
- uusi hyväksyntä vaaditaan, jos tuote, toimitus, sopimuskausi, pakolliset maksut tai myyjän ehtoversio heikkenee
- määräaikainen sopimus erotetaan heti vaihdettavista käyttäjistä
- fyysisen tuotteen toimitus huomioidaan kokonaishinnassa
- yritys näkee vain aggregoidun kysynnän
- admin näkee audit-, raportti- ja sääntelykohdat
- hyväksytty juridinen dokumenttiversio voidaan tallentaa
- AI toimii fallbackilla ilman API-avainta eikä muuta hintoja, tarjouksia tai hyväksyntöjä

## Mitä ei ole vielä rakennettu

- Oikeat maksut
- Stripe
- Pankki-, sähköyhtiö- tai yrityshakuintegraatiot
- Oikea AI-rajapinta
- Automaattiset sopimuksen vaihdot
- Tuotannon kirjautumisvirrat loppuun asti

## Seuraava tuotantovaihe

Kytke Supabase-projekti, aja migraatio, lisää Auth UI ja muuta MVP-lomakkeet palvelinpuolen kirjoituksiksi Supabaseen. RLS on jo mallinnettu niin, ettei rooleihin luoteta pelkän frontendin perusteella.
