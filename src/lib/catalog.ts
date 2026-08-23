import type { Category, Group } from "./types";

export const launchCategories: Category[] = [
  { id: "cat-contracts", name: "Arjen sopimukset", slug: "arjen-sopimukset", parent_id: null, icon: "📱", country_code: "FI", active: true, regulated: true, sort_order: 1, participation_count: 0 },
  { id: "cat-home-energy", name: "Koti & energia", slug: "koti-energia", parent_id: null, icon: "⚡", country_code: "FI", active: true, regulated: true, sort_order: 2, participation_count: 0 },
  { id: "cat-electronics", name: "Elektroniikka & kodinkoneet", slug: "elektroniikka-kodinkoneet", parent_id: null, icon: "🛒", country_code: "FI", active: true, regulated: false, sort_order: 3, participation_count: 0 },
  { id: "cat-car", name: "Autoilu", slug: "autoilu", parent_id: null, icon: "🚗", country_code: "FI", active: true, regulated: false, sort_order: 4, participation_count: 0 },
  { id: "cat-travel", name: "Matkailu & vapaa-aika", slug: "matkailu-vapaa-aika", parent_id: null, icon: "🏨", country_code: "FI", active: true, regulated: true, sort_order: 5, participation_count: 0 },
  { id: "cat-services", name: "Palvelut", slug: "palvelut", parent_id: null, icon: "🧰", country_code: "FI", active: true, regulated: false, sort_order: 6, participation_count: 0 },
  { id: "cat-family", name: "Lasten tuotteet", slug: "lasten-tuotteet", parent_id: null, icon: "🧸", country_code: "FI", active: true, regulated: false, sort_order: 7, participation_count: 0 },
  { id: "cat-food", name: "Ruoka & elintarvikkeet", slug: "ruoka-elintarvikkeet", parent_id: null, icon: "🥕", country_code: "FI", active: true, regulated: false, sort_order: 8, participation_count: 0 },
  { id: "cat-beauty", name: "Kosmetiikka", slug: "kosmetiikka", parent_id: null, icon: "✦", country_code: "FI", active: true, regulated: false, sort_order: 9, participation_count: 0 },
  { id: "cat-clothing", name: "Vaatteet", slug: "vaatteet", parent_id: null, icon: "◼", country_code: "FI", active: true, regulated: false, sort_order: 10, participation_count: 0 }
];

const bySlug = new Map(launchCategories.map((category) => [category.slug, category]));

function starterGroup(name: string, slug: string, categorySlug: string, description: string, regulated = false): Group {
  const category = bySlug.get(categorySlug) ?? launchCategories[0];
  return {
    id: `starter-${slug}`,
    name,
    slug,
    category_id: category.id,
    category_name: category.name,
    category_slug: category.slug,
    category_icon: category.icon,
    description,
    group_type: "open",
    terms: regulated
      ? ["Aloitus-Joukko ilman tekaistuja osallistujia.", "Säännelty kategoria: sitova tarjousketju vaatii juridisen tarkistuksen ennen production-aktivointia."]
      : ["Aloitus-Joukko ilman tekaistuja osallistujia.", "Yritykset voivat tarjota tähän, kun kysyntää kertyy."],
    area: "Suomi",
    target_count: 100,
    follower_count: 0,
    member_count: 0,
    committed_count: 0,
    ready_now_count: 0,
    offer_count: 0,
    new_members_24h: 0,
    new_members_7d: 0,
    status: "active",
    featured: true,
    country_code: "FI",
    currency_code: "EUR",
    locale: "fi-FI",
    timezone: "Europe/Helsinki",
    next_tier_label: "Ole ensimmäisten joukossa",
    created_at: "2026-08-23T00:00:00Z"
  };
}

export const productionStarterGroups: Group[] = [
  starterGroup("Sähkösopimus", "sahkosopimus", "arjen-sopimukset", "Kasvata Joukkoa sähkösopimuksille. Tarjoukset aktivoidaan vasta juridisen tarkistuksen jälkeen.", true),
  starterGroup("Puhelinliittymä", "puhelinliittyma", "arjen-sopimukset", "Liity mukaan, jos haluat paremman hinnan liittymään."),
  starterGroup("Netti / laajakaista", "netti-laajakaista", "arjen-sopimukset", "Kokoa kysyntää netti- ja laajakaistatarjouksille."),
  starterGroup("Vakuutukset", "vakuutukset", "arjen-sopimukset", "Säännelty aloitus-Joukko vakuutuksille. Sitova tarjousketju odottaa juridista tarkistusta.", true),
  starterGroup("65 tuuman televisio", "65-tuuman-televisio", "elektroniikka-kodinkoneet", "Avoin Joukko 65 tuuman televisioille. Eri merkit ja mallit voivat kilpailla."),
  starterGroup("Robotti-imuri", "robotti-imuri", "elektroniikka-kodinkoneet", "Kokoa ostovoimaa robotti-imureihin."),
  starterGroup("Pyykinpesukone", "pyykinpesukone", "elektroniikka-kodinkoneet", "Aloita Joukko pyykinpesukoneille."),
  starterGroup("Jääkaappi/pakastin", "jaakaappi-pakastin", "elektroniikka-kodinkoneet", "Kokoa kysyntää kodinkoneille."),
  starterGroup("Ilmalämpöpumppu", "ilmalampopumppu", "koti-energia", "Avoin Joukko ilmalämpöpumppujen laite- ja asennuspaketeille."),
  starterGroup("Renkaat", "renkaat", "autoilu", "Valtakunnallinen Joukko renkaille ja toimitukselle."),
  starterGroup("Auton huolto", "auton-huolto", "autoilu", "Kerää paikallista kysyntää auton huoltoon."),
  starterGroup("Hotelliviikonloppu", "hotelliviikonloppu", "matkailu-vapaa-aika", "Hotellit voivat tarjota omia pakettejaan samaan avoimeen Joukkoon.", true),
  starterGroup("Lomamatka", "lomamatka", "matkailu-vapaa-aika", "Matkailun sitovat tarjousketjut vaativat juridisen tarkistuksen ennen productionia.", true),
  starterGroup("Siivouspalvelu", "siivouspalvelu", "palvelut", "Kokoa kysyntää siivouspalveluille alueittain."),
  starterGroup("Remontti", "remontti", "palvelut", "Avoin Joukko remonttipalveluille ja kokonaispaketeille."),
  starterGroup("Ruoka/elintarvikkeet", "ruoka-elintarvikkeet", "ruoka-elintarvikkeet", "Aloitus-Joukko arjen ruokakorien ja elintarvikkeiden tarjouksille.")
];

export const growingCategoryLabels = [
  "Aurinkopaneelit",
  "Kotiakku",
  "Sähköauton lataus",
  "Lämpöpumput",
  "Energiaremontit",
  "Älykoti",
  "Lasten tuotteet",
  "Lemmikkipalvelut",
  "Hyvinvointipalvelut",
  "Digipalvelut / ohjelmistot",
  "Kodin huolto",
  "Kierrätys / kunnostus / second life"
];
