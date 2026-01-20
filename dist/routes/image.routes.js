"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageRoutes = imageRoutes;
const image_service_1 = require("../services/image.service");
const llm_service_1 = require("../services/llm.service");
async function imageRoutes(app) {
    // Image generation via Cloudflare AI (aliases /image and /image/generate)
    const generateHandler = async (req, reply) => {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== "string") {
            return reply.code(400).send({ error: "Prompt is required" });
        }
        const headerAccount = (req.headers["x-cf-account-id"] || "");
        const headerApiKey = (req.headers["x-cf-api-key"] || "");
        const headerModel = (req.headers["x-cf-model"] || "");
        if (headerAccount || headerApiKey || headerModel) {
            const mask = (v) => (v ? `${v.slice(0, 4)}...len=${v.length}` : "");
            req.log.info({
                cfAccount: mask(typeof headerAccount === "string" ? headerAccount.trim() : ""),
                cfApiKey: mask(typeof headerApiKey === "string" ? headerApiKey.trim() : ""),
                cfModel: typeof headerModel === "string" ? headerModel.trim() : "",
            }, "Using CF overrides from headers");
        }
        try {
            req.log.info({ prompt: prompt.slice(0, 50) }, "[Image Gen] Generating with prompt");
            const url = await image_service_1.ImageService.generate(prompt, {
                accountId: typeof headerAccount === "string" ? headerAccount.trim() : undefined,
                apiKey: typeof headerApiKey === "string" ? headerApiKey.trim() : undefined,
                model: typeof headerModel === "string" && headerModel.trim() ? headerModel.trim() : undefined,
            });
            req.log.info({ url: url.slice(0, 50) }, "[Image Gen] Generated URL");
            return reply.code(200).send({ url });
        }
        catch (err) {
            req.log.error({ error: err.message, stack: err.stack }, "[Image Gen] Error");
            return reply.code(500).send({ error: err.message || "Image generation failed" });
        }
    };
    app.post("/image", generateHandler);
    app.post("/image/generate", generateHandler);
    // Analyze image
    app.post("/image/analyze", async (req, reply) => {
        const { image } = req.body;
        if (!image) {
            return reply.code(400).send({ error: "Image data is required" });
        }
        try {
            const analysis = await llm_service_1.LLMService.analyzeImage(image);
            return { analysis };
        }
        catch (err) {
            console.error("Image analysis error:", err);
            return reply.code(500).send({ error: err.message || "Failed to analyze image" });
        }
    });
}
//# sourceMappingURL=image.routes.js.map