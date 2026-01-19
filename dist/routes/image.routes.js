"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageRoutes = imageRoutes;
const image_service_1 = require("../services/image.service");
const llm_service_1 = require("../services/llm.service");
async function imageRoutes(app) {
    app.post("/image", async (req) => {
        const { prompt } = req.body;
        const url = await image_service_1.ImageService.generate(prompt);
        return { url };
    });
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