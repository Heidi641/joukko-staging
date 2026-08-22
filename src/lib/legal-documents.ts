import type { LegalDocument } from "./types";

export const legalDocuments: Record<LegalDocument["slug"], LegalDocument> = {
  kayttoehdot: {
    slug: "kayttoehdot",
    title: "Käyttöehdot",
    version: "0.1.0-draft",
    effectiveDate: "LEGAL_REVIEW_REQUIRED",
    updatedAt: "2026-08-22",
    sections: [
      ["Palvelun tarkoitus", "JOUKKO kokoaa kuluttajien kiinnostusta, liittymisiä ja ehdollisia sitoumuksia ostovoimaksi."],
      ["Palveluntarjoaja", "Palveluntarjoajan viralliset tiedot lisätään ennen tuotantojulkaisua. LEGAL_REVIEW_REQUIRED"],
      ["Rekisteröityminen", "Käyttäjä luo tilin Supabase Auth -kirjautumisella. Rekisteröinnissä tallennetaan hyväksytty ehtoversio."],
      ["Käyttäjätili", "Käyttäjä vastaa antamiensa tietojen oikeellisuudesta."],
      ["Joukkoon liittyminen", "Liittyminen kasvattaa kiinnostuneiden määrää mutta ei yksin muodosta ostovelvoitetta."],
      ["Joukon perustaminen", "Aloittajan pitää kuvata tarve riittävän täsmällisesti. Olennaisia ehtoja ei saa muuttaa yksipuolisesti muiden liityttyä."],
      ["Ehdollinen sitoutuminen", "Käyttäjä voi sitoutua ehdoilla. Hyväksytyt ehdot tallennetaan muuttumattomana historiatietona."],
      ["Tarjousten hyväksyminen", "Käyttäjä hyväksyy tai hylkää tarjouksen aktiivisesti."],
      ["Sopimuksen syntyminen", "Sopimuksen syntymisen tarkka hetki ja osapuolet vaativat juridisen tarkistuksen. LEGAL_REVIEW_REQUIRED"],
      ["Määräaikaiset sopimukset", "JOUKKO ei saa aiheuttaa sopimusrikettä käyttäjän puolesta."],
      ["Peruuttaminen ja kuluttajansuoja", "Kuluttajansuojan ja peruuttamisoikeuden yksityiskohdat tarkistetaan ennen julkaisua. LEGAL_REVIEW_REQUIRED"],
      ["Yrityksen ja kuluttajan välinen sopimus", "JOUKKO toimii alustana/välittäjänä määriteltävässä roolissa. LEGAL_REVIEW_REQUIRED"],
      ["Myyjän vastuu", "Myyjä määrittelee omat myyntiehtonsa ja vastaa tuotteesta, palvelusta, toimituksesta, reklamaatioista, takuista ja kuluttajansuojan pakollisista tiedoista oman roolinsa mukaisesti."],
      ["JOUKON asema", "Alustan asema välittäjänä tai markkinapaikkana täsmennetään juridisessa tarkistuksessa."],
      ["Kielletty käyttö", "Laiton sisältö, harhaanjohtavat tarjouspyynnöt ja henkilötietojen julkaisu julkiseen kuvaukseen on kielletty."],
      ["Sisällön moderointi", "Admin voi hyväksyä, piilottaa, keskeyttää tai jäädyttää Joukon."],
      ["Vastuunrajoitukset", "Vastuunrajoitukset tehdään vain lain sallimissa rajoissa. LEGAL_REVIEW_REQUIRED"],
      ["Muutokset palveluun", "Palvelua voidaan kehittää ilman, että hyväksyttyä tarjoushistoriaa ylikirjoitetaan."],
      ["Ehtojen muutokset", "Uusi versio julkaistaan versionumerolla ja hyväksyntä tallennetaan tarvittaessa."],
      ["Sovellettava laki", "Sovellettava laki tarkennetaan ennen tuotantoa. LEGAL_REVIEW_REQUIRED"],
      ["Yhteystiedot", "Yhteystiedot lisätään ennen tuotantojulkaisua."]
    ].map(([title, body]) => ({ title, body }))
  },
  yritysehdot: {
    slug: "yritysehdot",
    title: "Yritysehdot",
    version: "0.1.0-draft",
    effectiveDate: "LEGAL_REVIEW_REQUIRED",
    updatedAt: "2026-08-22",
    sections: [
      ["Yritystilin avaaminen", "Yritys avaa tilin ja ilmoittaa perustiedot."],
      ["Varmentaminen", "Yrityksen henkilöllisyys ja edustusoikeus varmennetaan ennen oikeita kaupallisia tarjouksia."],
      ["Tarjouksen tekeminen", "Tarjous sisältää tuotteen/palvelun, hinnan, pakolliset lisäkulut, toimituksen, minimimäärän ja ehdot."],
      ["Hintaportaat", "Yritys voi määrittää useita portaita, jotka lukitaan saavutettaessa."],
      ["Voimassaolo", "Tarjouksella on voimassaoloaika."],
      ["Yrityksen sitoutuminen", "Julkaistu tarjousversio lukitsee olennaiset ehdot kuluttajien sitoumusten jälkeen."],
      ["Tarjouksen muuttaminen", "Olennaiset heikennykset tehdään uutena tarjousversiona, ei ylikirjoituksena."],
      ["Tarjousversiot", "Versio, julkaisuhetki, hinnat, ehdot ja hyväksynnät tallennetaan audit-historiaan."],
      ["Myyjän omat ehdot", "Yritys antaa ehdot tekstinä, linkkinä tai dokumenttiviitteenä. JOUKKO ei laadi lopullisia myyntiehtoja yrityksen puolesta."],
      ["Toteutuneet asiakkaat", "Toteutuneiden asiakkaiden käsittely ja tietojen luovutus vaatii oikeusperusteen. LEGAL_REVIEW_REQUIRED"],
      ["Alustan palkkiot", "Palkkiomalli määritetään kategoriakohtaisesti administa."],
      ["Laskutus", "Automaattista maksua ei ole MVP:ssä. Laskutusmalli tarkistetaan myöhemmin."],
      ["Kielletty toiminta", "Tekaistut tarjoukset, väärät hinnat ja harhaanjohtavat edut on kielletty."],
      ["Harhaanjohtavat hinnat", "Alennusprosentti vaatii luotettavan vertailuhinnan."],
      ["Keinotekoiset alennukset", "JOUKKO vertaa ensisijaisesti todellista kokonaishintaa."],
      ["Asiakastietojen käyttö", "Yritys ei näe yksittäisiä henkilötietoja ennen asianmukaista hyväksyntää."],
      ["Tietosuoja", "Yritys sitoutuu käsittelemään tietoja sovellettavan lain mukaan."],
      ["Tarjousten keskeyttäminen", "Keskeytys säilyttää historian ja vaatii syyn."],
      ["Yritystilin jäädyttäminen", "Admin voi jäädyttää tilin väärinkäytöksissä."],
      ["Vastuut", "Vastuut täsmennetään juridisesti. LEGAL_REVIEW_REQUIRED"],
      ["Riidat ja laki", "Riidat ja sovellettava laki tarkistetaan ennen tuotantoa. LEGAL_REVIEW_REQUIRED"]
    ].map(([title, body]) => ({ title, body }))
  },
  tietosuoja: {
    slug: "tietosuoja",
    title: "Tietosuojaseloste",
    version: "0.1.0-draft",
    effectiveDate: "LEGAL_REVIEW_REQUIRED",
    updatedAt: "2026-08-22",
    sections: [
      ["Rekisterinpitäjä", "Lisätään ennen tuotantoa. LEGAL_REVIEW_REQUIRED"],
      ["Kerättävät tiedot", "Tilitiedot, Joukkotiedot, sopimuksen päättymistiedot, postinumero, yritystiedot, tarjoushistoria, lokit ja tekniset tiedot."],
      ["Käsittelyn tarkoitus", "Palvelun tarjoaminen, Joukkien hallinta, tarjoukset, ilmoitukset, väärinkäytösten esto ja audit-historia."],
      ["Oikeusperusteet", "Oikeusperusteet tarkennetaan käsittelykohtaisesti. LEGAL_REVIEW_REQUIRED"],
      ["AI:n käyttö", "AI voi auttaa jäsentelyssä ja vertailussa, mutta ei tee lopullista sitovaa päätöstä käyttäjän puolesta."],
      ["Vastaanottajat", "Yrityksille näytetään ennen hyväksyntää vain aggregoituja tietoja."],
      ["Säilytysajat", "Säilytysajat määritetään ennen tuotantoa. LEGAL_REVIEW_REQUIRED"],
      ["Tietojen siirrot", "Supabase/Render-palvelujen sijainnit ja siirrot tarkistetaan ennen tuotantoa."],
      ["Käyttäjän oikeudet", "Käyttäjällä on sovellettavan lain mukaiset oikeudet tietoihinsa."],
      ["Poistopyynnöt", "Poistopyyntöjen vaikutus audit-historiaan määritetään juridisesti. LEGAL_REVIEW_REQUIRED"],
      ["Yhteystiedot", "Lisätään ennen tuotantojulkaisua."]
    ].map(([title, body]) => ({ title, body }))
  },
  tekoaly: {
    slug: "tekoaly",
    title: "Tekoälyn käyttö",
    version: "0.1.0-draft",
    effectiveDate: "LEGAL_REVIEW_REQUIRED",
    updatedAt: "2026-08-22",
    sections: [
      ["Mihin tekoälyä voidaan käyttää", "Joukon ehdotuksen jäsentämiseen, samankaltaisten Joukkien tunnistamiseen, tarjousten vertailuun, kokonaishintojen analyysiin, piilokulujen havaitsemiseen ja yhteenvetoihin."],
      ["Taustapalvelu", "AI toimii palvelukerroksessa taustalla määritellyissä triggereissä. Käyttäjän ei tarvitse painaa erillistä AI-nappia."],
      ["Virhemahdollisuus", "Tekoäly voi tehdä virheitä."],
      ["Myyjän ehdot", "AI ei keksi, muuta tai hyväksy myyjän myyntiehtoja. Yritys antaa tai hyväksyy ehdot itse."],
      ["Ei tekaistuja lukuja", "AI ei saa keksiä tarjouksia, hintoja, osallistujamääriä, alennuksia, yrityksiä tai sopimuksen syntymistä."],
      ["Päätöksenteko", "AI ei tee käyttäjän puolesta lopullista juridisesti sitovaa päätöstä."],
      ["Kustannusrajat ja fallback", "Jos AI on pois päältä, API-avain puuttuu tai kustannusraja täyttyy, JOUKKO jatkaa toimintaansa ilman AI-analyysiä."],
      ["Kaupalliset luvut", "Kaikki kaupalliset luvut tulevat oikeasta datasta."]
    ].map(([title, body]) => ({ title, body }))
  },
  evasteet: {
    slug: "evasteet",
    title: "Evästeet",
    version: "0.1.0-draft",
    effectiveDate: "LEGAL_REVIEW_REQUIRED",
    updatedAt: "2026-08-22",
    sections: [
      ["MVP:n evästeet", "MVP ei lisää tarpeetonta käyttäjäseurantaa."],
      ["Välttämättömät teknologiat", "Kirjautuminen voi käyttää teknisesti välttämättömiä evästeitä Supabase Authin yhteydessä."],
      ["Analytiikka ja markkinointi", "Jos myöhemmin lisätään analytiikkaa tai markkinointiseurantaa, lisätään suostumusten hallinta ennen käyttöönottoa."]
    ].map(([title, body]) => ({ title, body }))
  }
};
