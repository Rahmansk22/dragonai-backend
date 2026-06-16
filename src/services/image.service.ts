const CF_BASE = "https://api.cloudflare.com/client/v4";
// Default to the working model endpoint you confirmed; can be overridden via CF_MODEL
const CF_MODEL = process.env.CF_MODEL || "@cf/bytedance/stable-diffusion-xl-lightning";

export const ImageService = {
  async generate(
    prompt: string,
    opts?: { accountId?: string; apiKey?: string; model?: string }
  ): Promise<string> {
    const accountId = (opts?.accountId || process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
    const apiKey = (opts?.apiKey || process.env.CLOUDFLARE_API_KEY || "").trim();
    if (!accountId || !apiKey) {
      throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_KEY");
    }

    const model = (opts?.model || CF_MODEL).trim();
    const url = `${CF_BASE}/accounts/${accountId}/ai/run/${model}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ prompt, num_steps: 20 }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Cloudflare image error: ${res.status} ${text}`);
    }

    // Cloudflare returns binary image data directly
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    if (!base64) {
      throw new Error("No image data returned from Cloudflare");
    }

    return `data:image/jpeg;base64,${base64}`;
  },
};
