import type { AiSettings } from "./types";

export function getAiSettings(): AiSettings {
  return {
    enabled: process.env.AI_ENABLED === "true",
    provider: (process.env.AI_PROVIDER === "openai-compatible" ? "openai-compatible" : "mock"),
    model: process.env.AI_MODEL || "mock-v1",
    maxRequestsPerDay: Number(process.env.AI_MAX_REQUESTS_PER_DAY || 100),
    maxRequestsPerUserHour: Number(process.env.AI_MAX_REQUESTS_PER_USER_HOUR || 10),
    maxCostPerDay: Number(process.env.AI_MAX_COST_PER_DAY || 0),
    maxCostPerMonth: Number(process.env.AI_MAX_COST_PER_MONTH || 0)
  };
}

export function aiIsUsable() {
  const settings = getAiSettings();
  if (!settings.enabled) return false;
  if (settings.provider === "openai-compatible" && !process.env.OPENAI_API_KEY) return false;
  return true;
}
