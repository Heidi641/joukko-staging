import type { AiAnalysisResult } from "@/lib/types";
import type { AiDuplicateResult, AiProvider } from "./types";

function base(actionType: string): AiAnalysisResult {
  return {
    actionType,
    riskLevel: "low_risk",
    missingFields: [],
    detectedFees: [],
    inconsistencies: [],
    summary: "Tekoälyn mock-yhteenveto. Tarkista aina alkuperäiset myyjän ehdot.",
    confidence: 0.72,
    fallbackUsed: true
  };
}

export const mockAiProvider: AiProvider = {
  async analyzeGroup(input) {
    const missingFields = /samsung|tv|televisio/i.test(input.title + input.description) && !/\b[A-Z0-9]{4,}\b/.test(input.title)
      ? ["Tarkka mallinumero puuttuu"]
      : [];
    return {
      matches: [],
      missingFields,
      structuredNeed: {
        product_type: /tv|televisio/i.test(input.title) ? "televisio" : null,
        brand: /samsung/i.test(input.title) ? "Samsung" : null,
        model: missingFields.length ? null : "tunnistamaton"
      },
      confidence: 0.68
    };
  },
  async detectDuplicates(input) {
    const query = `${input.title} ${input.description}`.toLowerCase();
    const matches: AiDuplicateResult["matches"] = input.groups
      .filter((group) => query.includes(group.name.toLowerCase().split(" ")[0]))
      .map((group) => ({ groupId: group.id, score: 0.8, reason: "Mock-semanttinen osuma otsikon perusteella" }));
    return { matches, missingFields: [], structuredNeed: {}, confidence: matches.length ? 0.8 : 0.4 };
  },
  async analyzeOffer(input) {
    const result = base("analyzeOffer");
    if (input.offer.delivery_price === null) result.missingFields.push("Toimituskulut puuttuvat");
    if (/avausmaksu|lisämaksu|toimituskulu/i.test(input.offer.terms_text ?? input.offer.terms)) {
      result.detectedFees.push("Ehtotekstissä mainitaan mahdollinen lisämaksu");
      result.riskLevel = "needs_review";
    }
    return result;
  },
  async analyzeTerms(input) {
    const result = base("analyzeTerms");
    if (/avausmaksu|palautuskulu|automaattisesti jatkuu/i.test(input.terms)) {
      result.detectedFees.push("Pitkissä ehdoissa havaittiin mahdollinen lisäkulu tai jatkuvuusehto");
      result.riskLevel = "needs_review";
    }
    return result;
  },
  async classifyDemand() {
    return base("classifyDemand");
  },
  async summarizeOffer() {
    return base("summarizeOffer");
  },
  async detectCommercialOpportunity(input) {
    const result = base("detectCommercialOpportunity");
    if (input.growth24h > 100 || input.growth7d > 500) {
      result.summary = "KAUPALLINEN MAHDOLLISUUS: nopeasti kasvava Joukko. Suositus: hanki tarjoajia.";
      result.riskLevel = "needs_review";
    }
    return result;
  }
};
