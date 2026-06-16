const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

async function resolveFetch(): Promise<any> {
  const gf = (globalThis as any).fetch;
  if (typeof gf === "function") return gf;
  try {
    const undiciModuleName = "undici";
    const undici: any = await import(undiciModuleName);
    if (undici && typeof undici.fetch === "function") return undici.fetch;
  } catch {}
  try {
    const nodeFetchModuleName = "node-fetch";
    const nodeFetch: any = await import(nodeFetchModuleName);
    if (nodeFetch && typeof nodeFetch.default === "function") return nodeFetch.default;
  } catch {}
  throw new Error(
    "Fetch is not available. Upgrade to Node 18+, or install 'undici' or 'node-fetch'."
  );
}

export const GroqService = {
  async completeWithMessages(messages: { role: string; content: string }[]): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY ?? "";
    if (!apiKey) {
      throw new Error("Missing GROQ_API_KEY. Provide your Groq key.");
    }
    const url = GROQ_URL;
    const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
    const _fetch = await resolveFetch();
    const res: any = await _fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages }),
    } as any);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(
        `LLM request failed: ${res.status} ${res.statusText} - ${text}`
      );
      (err as any).status = res.status;
      throw err;
    }
    const data = await res.json();
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.delta?.content ??
      data?.choices?.[0]?.text ??
      "";
    return typeof content === "string" ? content : JSON.stringify(content);
  },
};
