
type FetchLike = (input: any, init?: any) => Promise<any>;
let _fetch: FetchLike | null = null;
async function getFetch(): Promise<FetchLike> {
  if (_fetch) return _fetch!;
  if (typeof fetch === "function") {
    _fetch = fetch;
    return _fetch!;
  }
  try {
    const undici = await import("undici");
    if (undici && typeof undici.fetch === "function") {
      _fetch = undici.fetch as any;
      return _fetch!;
    }
  } catch {}
  try {
    const nodeFetch = await import("node-fetch");
    if (nodeFetch && typeof nodeFetch.default === "function") {
      _fetch = (input: any, init?: any) => nodeFetch.default(input, init) as unknown as Promise<Response>;
      return _fetch!;
    }
  } catch {}
  throw new Error("Fetch is not available. Upgrade to Node 18+, or install 'undici' or 'node-fetch'.");
}

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export const GeminiService = {
  async completeWithMessages(messages: { role: string; content: string }[]): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY ?? "";
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY. Provide your Gemini key.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const history = messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] }));
    const body = JSON.stringify({ contents: history });
    const fetchFn = await getFetch();
    // Add duplex: "half" if using undici
    const fetchOptions: RequestInit & { duplex?: "half" } = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    };
    // undici requires duplex: "half" for POST with body
    if (fetchFn && fetchFn.name === "fetch" && fetchFn.toString().includes("undici")) {
      (fetchOptions as any).duplex = "half";
    }
    if (!fetchFn) {
      throw new Error("Fetch function is not available.");
    }
    const res = await fetchFn(url, fetchOptions);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Gemini API error: ${res.status} - ${text}`);
    }
    const data = await res.json();
    // Gemini 2.5 Flash returns candidates[0].content.parts[0].text
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.text ||
      JSON.stringify(data)
    );
  },
};
