import { mockAiProvider } from "./mock-provider";
import { openAiProvider } from "./openai-provider";
import { aiIsUsable, getAiSettings } from "./settings";
import type { AiProvider } from "./types";

export function getAiProvider(): AiProvider {
  const settings = getAiSettings();
  if (!aiIsUsable()) return mockAiProvider;
  if (settings.provider === "openai-compatible") {
    return openAiProvider;
  }
  return mockAiProvider;
}

export async function runAiTask<T>(taskName: string, callback: (provider: AiProvider) => Promise<T>) {
  const provider = getAiProvider();
  const started = Date.now();
  try {
    const result = await callback(provider);
    return {
      ok: true,
      taskName,
      provider: getAiSettings().provider,
      model: getAiSettings().model,
      processingTimeMs: Date.now() - started,
      result
    };
  } catch (error) {
    return {
      ok: false,
      taskName,
      provider: getAiSettings().provider,
      model: getAiSettings().model,
      processingTimeMs: Date.now() - started,
      error: error instanceof Error ? error.message : "Unknown AI error"
    };
  }
}
