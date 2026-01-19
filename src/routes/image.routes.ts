import { FastifyInstance } from "fastify";
import { ImageService } from "../services/image.service";
import { LLMService } from "../services/llm.service";

export async function imageRoutes(app: FastifyInstance) {
  app.post("/image", async (req) => {
    const { prompt } = req.body as any;
    const url = await ImageService.generate(prompt);
    return { url };
  });

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
