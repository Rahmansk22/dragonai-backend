const BASE_URL = "https://api.x.ai/v1";

export const ImageService = {
  async generate(prompt: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-2-image",
        prompt,
        size: "1024x1024",
      }),
    });

    const data = await res.json();
    return data.data[0].url;
  },
};
