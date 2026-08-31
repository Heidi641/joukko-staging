export type ComparisonField = { key: string; label: string; placeholder: string };

const templates: Record<string, ComparisonField[]> = {
  "koti-energia": [
    { key: "energy_price", label: "Energiahinta", placeholder: "snt/kWh" },
    { key: "monthly_fee", label: "Perusmaksu", placeholder: "€/kk" },
    { key: "contract_type", label: "Sopimustyyppi", placeholder: "määräaikainen / toistaiseksi" }
  ],
  sopimukset: [
    { key: "monthly_fee", label: "Kuukausihinta", placeholder: "€/kk" },
    { key: "contract_length", label: "Sopimuskausi", placeholder: "esim. 12 kk" },
    { key: "included_usage", label: "Sisältö", placeholder: "mitä hintaan sisältyy" }
  ],
  liikkuminen: [
    { key: "specification", label: "Tekniset tiedot", placeholder: "koko, malli tai yhteensopivuus" },
    { key: "installation", label: "Asennus", placeholder: "sisältyy / lisähinta" },
    { key: "warranty", label: "Takuu", placeholder: "esim. 24 kk" }
  ],
  ostokset: [
    { key: "model_code", label: "Mallikoodi", placeholder: "valmistajan tarkka mallikoodi" },
    { key: "warranty", label: "Takuu", placeholder: "esim. 24 kk" },
    { key: "availability", label: "Saatavuus", placeholder: "varastossa / tilauksesta" }
  ],
  matkat: [
    { key: "travel_dates", label: "Ajankohta", placeholder: "päivämäärät" },
    { key: "included_services", label: "Hintaan sisältyy", placeholder: "aamiainen, matkat, matkatavarat…" },
    { key: "cancellation", label: "Peruutusehto", placeholder: "maksuton peruutus / ei palautusta" }
  ]
};

const fallback: ComparisonField[] = [
  { key: "contents", label: "Tarjouksen sisältö", placeholder: "täsmällinen sisältö" },
  { key: "warranty", label: "Takuu tai palvelulupaus", placeholder: "ehdot ja kesto" },
  { key: "availability", label: "Saatavuus", placeholder: "saatavuus tai kapasiteetti" }
];

export function comparisonTemplate(categorySlug: string) {
  return templates[categorySlug] ?? fallback;
}

