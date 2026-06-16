import { FastifyInstance } from "fastify";
import { ImageService } from "../services/image.service";
import { LLMService } from "../services/llm.service";

export async function imageRoutes(app: FastifyInstance) {
  // Image generation via Cloudflare AI (aliases /image and /image/generate)
  const generateHandler = async (req: any, reply: any) => {
    const { prompt } = req.body as any;
    if (!prompt || typeof prompt !== "string") {
      return reply.code(400).send({ error: "Prompt is required" });
    }

    const headerAccount = (req.headers["x-cf-account-id"] || "") as string;
    const headerApiKey = (req.headers["x-cf-api-key"] || "") as string;
    const headerModel = (req.headers["x-cf-model"] || "") as string;

    if (headerAccount || headerApiKey || headerModel) {
      const mask = (v: string) => (v ? `${v.slice(0, 4)}...len=${v.length}` : "");
      req.log.info({
        cfAccount: mask(typeof headerAccount === "string" ? headerAccount.trim() : ""),
        cfApiKey: mask(typeof headerApiKey === "string" ? headerApiKey.trim() : ""),
        cfModel: typeof headerModel === "string" ? headerModel.trim() : "",
      }, "Using CF overrides from headers");
    }

    try {
      req.log.info({ prompt: prompt.slice(0, 50) }, "[Image Gen] Generating with prompt");
      const url = await ImageService.generate(prompt, {
        accountId: typeof headerAccount === "string" ? headerAccount.trim() : undefined,
        apiKey: typeof headerApiKey === "string" ? headerApiKey.trim() : undefined,
        model: typeof headerModel === "string" && headerModel.trim() ? headerModel.trim() : undefined,
      });
      req.log.info({ url: url.slice(0, 50) }, "[Image Gen] Generated URL");
      return reply.code(200).send({ url });
    } catch (err: any) {
      req.log.error({ error: err.message, stack: err.stack }, "[Image Gen] Error");
      return reply.code(500).send({ error: err.message || "Image generation failed" });
    }
  };

  app.post("/image", generateHandler);
  app.post("/image/generate", generateHandler);

  // Analyze image
  app.post("/image/analyze", async (req, reply) => {
    const { image } = req.body as any;
    if (!image) {
      return reply.code(400).send({ error: "Image data is required" });
    }

    try {
      const analysis = await LLMService.analyzeImage(image);
      return { analysis };
    } catch (err: any) {
      console.error("Image analysis error:", err);
      return reply.code(500).send({ error: err.message || "Failed to analyze image" });
    }
  });
}
