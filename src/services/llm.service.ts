const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

async function resolveFetch(): Promise<any> {
  const gf = (globalThis as any).fetch;
  if (typeof gf === "function") return gf;

  // Try to load undici (recommended) or node-fetch if available
  try {
    const undiciModuleName = "undici";
    const undici: any = await import(undiciModuleName);
    if (undici && typeof undici.fetch === "function") return undici.fetch;
  } catch {}

  try {
    const nodeFetchModuleName = "node-fetch";
    const nodeFetch: any = await import(nodeFetchModuleName);
    // node-fetch v3 exports default
    if (nodeFetch && typeof nodeFetch.default === "function") return nodeFetch.default;
  } catch {}

  throw new Error(
    "Fetch is not available. Upgrade to Node 18+, or install 'undici' or 'node-fetch'."
  );
}

export const LLMService = {
  async complete(prompt: string): Promise<string> {
    const apiKey = (process.env.GROQ_API_KEY || "").trim();
    console.log("[LLM] GROQ_API_KEY present:", apiKey ? `Yes (${apiKey.substring(0, 7)}...)` : "NO - Missing!");
    if (!apiKey) {
      throw new Error("Missing GROQ_API_KEY. Provide your Groq key.");
    }

    const url = GROQ_URL;
    const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;

    const _fetch = await resolveFetch();
    let res: any;
    try {
      res = await _fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      } as any);
    } catch (networkErr: any) {
      throw new Error(
        `LLM network error: ${networkErr?.message || String(networkErr)}`
      );
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(
        `LLM request failed: ${res.status} ${res.statusText} - ${text}`
      );
      (err as any).status = res.status;
      throw err;
    }

    let data: any;
    try {
      data = await res.json();
    } catch (parseErr) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to parse LLM response JSON: ${text}`);
    }

    // Attempt common places for content in OpenAI-compatible responses
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.delta?.content ??
      data?.choices?.[0]?.text ??
      "";

    return typeof content === "string" ? content : JSON.stringify(content);
  },

  async analyzeImage(imageBase64: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY ?? "";
    if (!apiKey) {
      throw new Error("Missing GROQ_API_KEY. Provide your Groq key.");
    }

    const url = GROQ_URL;
    const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;

    const _fetch = await resolveFetch();
    try {
      // For now, use text analysis as a placeholder since Groq's vision support is limited
      // In production, you'd integrate with a dedicated vision API like Claude's or GPT-4V
      const prompt = `I have an image (provided as base64). Based on the filename/metadata available, provide a detailed description of what would typically be in such an image. However, note that direct image analysis requires a dedicated vision model.

To fully analyze images, consider:
1. Using Claude 3's vision capabilities
2. Using OpenAI's GPT-4V
3. Using Google's Gemini Vision API

For now, I can help you discuss images if you describe them to me. The image has been received and can be:
- Sent to the chat for context
- Discussed with the assistant
- Used to inform responses

Would you like me to help you work with this image in some way?`;

      const res: any = await _fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 512,
        }),
      } as any);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Groq API response:", text);
        throw new Error(`Image analysis failed: ${res.status} - ${text}`);
      }

      const data = await res.json();
      const content =
        data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.delta?.content ??
        data?.choices?.[0]?.text ??
        "Unable to analyze image";
      return typeof content === "string" ? content : JSON.stringify(content);
    } catch (err: any) {
      console.error("Image analysis error:", err.message);
      // Return a helpful message instead of failing
      return "Image received! You can now:\n• Send it to chat for discussion\n• Ask me to analyze specific aspects\n• Use it as context for our conversation\n\nNote: For full AI image analysis, consider using dedicated vision APIs like Claude 3, GPT-4V, or Gemini Vision.";
    }
  },

  async stream(prompt: string, onToken: (t: string) => void) {
    const apiKey = process.env.GROQ_API_KEY ?? "";
    if (!apiKey) {
      throw new Error("Missing GROQ_API_KEY. Provide your Groq key.");
    }
    const url = GROQ_URL;
    const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
    const _fetch = await resolveFetch();
    const res = await _fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    } as any);
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data:")) continue;
        if (line.includes("[DONE]")) return;
        const json = JSON.parse(line.replace("data:", "").trim());
        const token = json.choices?.[0]?.delta?.content;
        if (token) onToken(token);
      }
    }
  },

  async completeWithMessages(
    messages: { role: string; content: string }[],
    apiKeyOverride?: string
  ): Promise<string> {
    const apiKey = (apiKeyOverride || process.env.GROQ_API_KEY || "").trim();
    console.log("[LLM] Using GROQ key:", apiKey ? `${apiKey.slice(0, 4)}...len=${apiKey.length}` : "missing");
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
