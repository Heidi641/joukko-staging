import type { AiAnalysisResult, Group, Offer } from "@/lib/types";
import { mockAiProvider } from "./mock-provider";
import { getAiSettings } from "./settings";
import type { AiDuplicateResult, AiProvider } from "./types";

type JsonObject = Record<string, unknown>;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    riskLevel: { type: "string", enum: ["low_risk", "needs_review", "high_risk"] },
    missingFields: { type: "array", items: { type: "string" } },
    detectedFees: { type: "array", items: { type: "string" } },
    inconsistencies: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    confidence: { type: "number" }
  },
  required: ["riskLevel", "missingFields", "detectedFees", "inconsistencies", "summary", "confidence"]
};

const duplicateSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          groupId: { type: "string" },
          score: { type: "number" },
          reason: { type: "string" }
        },
        required: ["groupId", "score", "reason"]
      }
    },
    missingFields: { type: "array", items: { type: "string" } },
    structuredNeed: {
      type: "object",
      additionalProperties: { type: ["string", "null"] }
    },
    confidence: { type: "number" }
  },
  required: ["matches", "missingFields", "structuredNeed", "confidence"]
};

function apiBaseUrl() {
  return (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
}

function apiKey() {
  return process.env.OPENAI_API_KEY;
}

function compactOffer(offer: Offer): JsonObject {
  return {
    title: offer.title,
    product_or_service: offer.product_or_service,
    brand: offer.brand,
    model: offer.model,
    model_code: offer.model_code,
    description: offer.description,
    price: offer.price,
    mandatory_fees: offer.mandatory_fees,
    delivery_price: offer.delivery_price,
    total_price: offer.total_price,
    delivery_method: offer.delivery_method,
    delivery_time: offer.delivery_time,
    contract_length: offer.contract_length,
    terms_type: offer.terms_type,
    terms_text: offer.terms_text ?? offer.terms,
    terms_version: offer.terms_version,
    tiers: offer.tiers
  };
}

async function createJsonResponse<T>(name: string, prompt: string, schema: JsonObject): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error("OPENAI_API_KEY puuttuu.");
  const settings = getAiSettings();

  const response = await fetch(`${apiBaseUrl()}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify({
      model: settings.model,
      input: prompt,
      max_output_tokens: 900,
      text: {
        format: {
          type: "json_schema",
          name,
          strict: true,
          schema
        }
      }
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI-yhteys epäonnistui (${response.status}): ${message.slice(0, 300)}`);
  }

  const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  const text = payload.output_text ?? payload.output?.flatMap((item) => item.content ?? []).map((content) => content.text).find(Boolean);
  if (!text) throw new Error("OpenAI-vastaus ei sisältänyt JSON-tekstiä.");
  return JSON.parse(text) as T;
}

function analysisPrompt(action: string, input: JsonObject) {
  return [
    "Olet JOUKKO-palvelun avustava analyysikerros.",
    "Älä keksi tarjouksia, hintoja, osallistujamääriä, myyjän ehtoja tai juridisia päätöksiä.",
    "Tunnista puuttuvat kentät, piilokulut, ristiriidat ja asiat jotka vaativat ihmisen tai juridisen tarkistuksen.",
    "Vastaa vain annetun JSON-skeeman mukaisesti.",
    `Tehtävä: ${action}`,
    `Data: ${JSON.stringify(input)}`
  ].join("\n\n");
}

async function safeAnalysis(actionType: string, prompt: string): Promise<AiAnalysisResult> {
  try {
    const result = await createJsonResponse<Omit<AiAnalysisResult, "actionType" | "fallbackUsed">>("joukko_ai_analysis", prompt, responseSchema);
    return { actionType, ...result, fallbackUsed: false };
  } catch (error) {
    const fallback = await mockAiProvider.analyzeTerms({ terms: error instanceof Error ? error.message : "AI fallback" });
    return {
      ...fallback,
      actionType,
      summary: `AI-yhteys ei ollut käytettävissä, käytössä turvallinen mock/fallback. ${fallback.summary}`,
      fallbackUsed: true
    };
  }
}

export const openAiProvider: AiProvider = {
  async analyzeGroup(input) {
    try {
      return await createJsonResponse<AiDuplicateResult>(
        "joukko_group_analysis",
        analysisPrompt("Jäsennä ostotoive ja kerro puuttuvat olennaiset tarkennukset.", input),
        duplicateSchema
      );
    } catch {
      return mockAiProvider.analyzeGroup(input);
    }
  },
  async detectDuplicates(input: { title: string; description: string; groups: Group[] }) {
    const allowedIds = new Set(input.groups.map((group) => group.id));
    try {
      const result = await createJsonResponse<AiDuplicateResult>(
        "joukko_duplicate_detection",
        analysisPrompt("Etsi samankaltaiset Joukot vain annetusta listasta. Älä yhdistä automaattisesti.", {
          title: input.title,
          description: input.description,
          groups: input.groups.map((group) => ({ id: group.id, name: group.name, description: group.description, category: group.category_name, group_type: group.group_type }))
        }),
        duplicateSchema
      );
      return { ...result, matches: result.matches.filter((match) => allowedIds.has(match.groupId)) };
    } catch {
      return mockAiProvider.detectDuplicates(input);
    }
  },
  async analyzeOffer(input: { offer: Offer }) {
    return safeAnalysis("analyzeOffer", analysisPrompt("Tarkista yrityksen tarjous puuttuvien tietojen, piilokulujen ja ristiriitojen varalta.", { offer: compactOffer(input.offer) }));
  },
  async analyzeTerms(input) {
    return safeAnalysis("analyzeTerms", analysisPrompt("Tarkista myyjän ehtoteksti. Älä muuta tai keksi ehtoja.", input));
  },
  async classifyDemand(input) {
    return safeAnalysis("classifyDemand", analysisPrompt("Luokittele ostotoive kategoriaan ja tunnista mahdolliset riskit.", input));
  },
  async summarizeOffer(input: { offer: Offer }) {
    return safeAnalysis("summarizeOffer", analysisPrompt("Tiivistä tarjous kuluttajalle ymmärrettäväksi muuttamatta ehtoja.", { offer: compactOffer(input.offer) }));
  },
  async detectCommercialOpportunity(input) {
    return safeAnalysis("detectCommercialOpportunity", analysisPrompt("Tunnista kaupallinen mahdollisuus aggregoidusta kysynnästä.", {
      group: { id: input.group.id, name: input.group.name, category: input.group.category_name, member_count: input.group.member_count },
      growth24h: input.growth24h,
      growth7d: input.growth7d
    }));
  }
};
