"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customBotRoutes = customBotRoutes;
const zod_1 = require("zod");
const prisma_1 = require("../db/prisma");
function normalizeUserId(raw) {
    if (Array.isArray(raw))
        return raw[0] ?? null;
    if (typeof raw === "string" && raw.trim())
        return raw.trim();
    return null;
}
async function customBotRoutes(app) {
    const botSchema = zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        persona: zod_1.z.string().min(1).max(1000),
        knowledge: zod_1.z.string().min(1).max(8000),
    });
    app.get("/custom-bot", async (req, reply) => {
        const userId = normalizeUserId(req.headers["x-user-id"]) || "demo-user";
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                customBotName: true,
                customBotPersona: true,
                customBotKnowledge: true,
            },
        });
        if (!user)
            return reply.code(404).send({ error: "User not found" });
        if (!user.customBotName && !user.customBotPersona && !user.customBotKnowledge) {
            return reply.send({ customBot: null });
        }
        return reply.send({
            customBot: {
                name: user.customBotName ?? "",
                persona: user.customBotPersona ?? "",
                knowledge: user.customBotKnowledge ?? "",
            },
        });
    });
    app.post("/custom-bot", async (req, reply) => {
        const userId = normalizeUserId(req.headers["x-user-id"]) || "demo-user";
        const parsed = botSchema.safeParse(req.body);
        if (!parsed.success) {
            return reply.code(400).send({ error: "Invalid custom bot payload" });
        }
        const { name, persona, knowledge } = parsed.data;
        const email = `${userId}@temp.local`;
        const user = await prisma_1.prisma.user.upsert({
            where: { id: userId },
            update: { customBotName: name, customBotPersona: persona, customBotKnowledge: knowledge },
            create: {
                id: userId,
                name: "",
                email,
                customBotName: name,
                customBotPersona: persona,
                customBotKnowledge: knowledge,
            },
        });
        return reply.send({
            customBot: {
                name: user.customBotName ?? "",
                persona: user.customBotPersona ?? "",
                knowledge: user.customBotKnowledge ?? "",
            },
        });
    });
}
//# sourceMappingURL=customBot.routes.js.map