import type { AiAnalysisResult, Group, Offer } from "@/lib/types";

export type AiProviderName = "mock" | "openai-compatible";

export type AiSettings = {
  enabled: boolean;
  provider: AiProviderName;
  model: string;
  maxRequestsPerDay: number;
  maxRequestsPerUserHour: number;
  maxCostPerDay: number;
  maxCostPerMonth: number;
};

export type AiDuplicateResult = {
  matches: { groupId: string; score: number; reason: string }[];
  missingFields: string[];
  structuredNeed: Record<string, string | null>;
  confidence: number;
};

export type AiProvider = {
  analyzeGroup(input: { title: string; description: string; category?: string }): Promise<AiDuplicateResult>;
  detectDuplicates(input: { title: string; description: string; groups: Group[] }): Promise<AiDuplicateResult>;
  analyzeOffer(input: { offer: Offer }): Promise<AiAnalysisResult>;
  analyzeTerms(input: { terms: string }): Promise<AiAnalysisResult>;
  classifyDemand(input: { title: string; description: string }): Promise<AiAnalysisResult>;
  summarizeOffer(input: { offer: Offer }): Promise<AiAnalysisResult>;
  detectCommercialOpportunity(input: { group: Group; growth24h: number; growth7d: number }): Promise<AiAnalysisResult>;
};
