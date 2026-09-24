export type ComparisonField = { key: string; label: string; placeholder: string };

/**
 * These are category-wide, comparable minimum fields for sellers.
 * Highly specific Joukko package terms are displayed separately and may
 * require an additional manual review before any live offer is accepted.
 */
const templates: Record<string, ComparisonField[]> = {
  "koti-energia": [
    { key: "product_type", label: "Tarkka tuote tai sopimustyyppi", placeholder: "Esim. lämpöpumpun mallikoodi TAI kiinteä 12 kk sähkösopimus" },
    { key: "included_scope", label: "Mitä ilmoitettu hinta sisältää", placeholder: "Laite, vakioasennus, sähköenergian ehdot..." },
    { key: "mandatory_extras", label: "Pakolliset muut kulut ja rajaukset", placeholder: "Asennuslisätyöt, perusmaksu jne." },
    { key: "deliverable", label: "Toimitus, asennus tai sopimuksen aloitus", placeholder: "Aika ja edellytykset" }
  ],
  "arjen-sopimukset": [
    { key: "monthly_fee", label: "Kuukausihinta ja kampanjakausi", placeholder: "€/kk ja kuinka kauan" },
    { key: "contract_length", label: "Sopimuskausi ja päättyminen", placeholder: "12 kk / toistaiseksi" },
    { key: "included_usage", label: "Sovittu vähimmäissisältö", placeholder: "Datamäärä, nopeus, EU-data, avausmaksu" }
  ],
  "ostokset": [
    { key: "model_code", label: "Tarkka mallikoodi / koko", placeholder: "Merkki ja malli; renkaissa 4 kpl ja merkinnät" },
    { key: "warranty", label: "Takuu ja lakisääteinen virhevastuu", placeholder: "Myyjän takuutiedot" },
    { key: "availability", label: "Saatavuus ja toimitus", placeholder: "Varastossa / tilauksesta" }
  ],
  "elektroniikka-kodinkoneet": [
    { key: "model_code", label: "Tarkka mallikoodi ja muisti/koko", placeholder: "Esim. sama älypuhelin tai kodinkone" },
    { key: "warranty", label: "Takuu", placeholder: "Myyjän takuuehdot" },
    { key: "availability", label: "Saatavuus", placeholder: "Varastossa / tilauksesta" }
  ],
  "autoilu": [
    { key: "exact_vehicle", label: "Merkki, malli ja varustetaso", placeholder: "Tarkka auto tai rengaskoko" },
    { key: "excluded_financing", label: "Toimitushinta ilman vaihtoautoa tai rahoitusta", placeholder: "Kokonaishinta ja rajaukset" },
    { key: "availability", label: "Toimitusaika ja takuu", placeholder: "Ajankohta / ehdot" }
  ],
  "liikkuminen": [
    { key: "specification", label: "Tekniset tiedot ja tarkka malli", placeholder: "Merkki, koko, varusteet / yhteensopivuus" },
    { key: "excluded_financing", label: "Hinta ja rajaukset", placeholder: "Vaihtoauto / rahoitus eroteltava tarvittaessa" },
    { key: "warranty", label: "Takuu ja toimitusaika", placeholder: "Myyjän ehdot" }
  ],
  "rakentaminen": [
    { key: "delivery_scope", label: "Talopaketin toimitusaste ja rakennusala", placeholder: "Esim. 110 m², säältä suojaan" },
    { key: "included_works", label: "Sisältyvät perustukset, LVIS ja muut työt", placeholder: "Yksilöi jokainen rajaus" },
    { key: "excluded_works", label: "Tontti, maaperä, luvat ja poissuljetut työt", placeholder: "Tarkat rajaukset" },
    { key: "delivery_schedule", label: "Toimitusaikataulu ja urakkasopimus", placeholder: "Aika, vastuut ja vakuudet" }
  ],
  "ruoka-elintarvikkeet": [
    { key: "basket_version", label: "Kiinteän ruokakorin tuotelista ja määrä", placeholder: "Pakkauskoko, paino, tuoreus" },
    { key: "substitutions", label: "Sallitut korvaavat tuotteet", placeholder: "Etukäteen määritelty sääntö" },
    { key: "basket_delivery", label: "Nouto tai toimitus", placeholder: "Toimituksen kokonaishinta" }
  ],
  "matkat": [
    { key: "travel_dates", label: "Ajankohta", placeholder: "Päivämäärät" },
    { key: "included_services", label: "Hintaan sisältyy", placeholder: "Aamiainen, matkat, matkatavarat" },
    { key: "cancellation", label: "Peruutusehdot", placeholder: "Myyjän täsmälliset ehdot" }
  ]
};

const fallback: ComparisonField[] = [
  { key: "contents", label: "Tarjouksen täsmällinen sisältö", placeholder: "Pakolliset vaatimukset ja poikkeamat" },
  { key: "warranty", label: "Takuu tai palvelulupaus", placeholder: "Ehdot ja kesto" },
  { key: "availability", label: "Saatavuus ja toimitusaika", placeholder: "Kapasiteetti ja aika" }
];

export function comparisonTemplate(categorySlug: string) {
  return templates[categorySlug] ?? fallback;
}
