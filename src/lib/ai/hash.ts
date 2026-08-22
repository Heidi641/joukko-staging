export async function contentHash(value: unknown) {
  const text = JSON.stringify(value);
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function minimizeForAi<T extends Record<string, unknown>>(input: T) {
  const blocked = new Set(["email", "phone", "name", "address", "ssn", "payment"]);
  return Object.fromEntries(Object.entries(input).filter(([key]) => !blocked.has(key.toLowerCase())));
}
