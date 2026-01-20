"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = chatRoutes;
const zod_1 = require("zod");
const llm_service_1 = require("../services/llm.service");
const prisma_1 = require("../db/prisma");
async function chatRoutes(app) {
    // Get all messages for a chat
    app.get("/chats/:chatId/messages", async (req, reply) => {
        let userId = req.headers["x-user-id"] || "demo-user";
        let chatId = req.params.chatId;
        if (Array.isArray(userId))
            userId = userId[0];
        if (Array.isArray(chatId))
            chatId = chatId[0];
        if (!chatId || typeof chatId !== "string" || !/^[a-zA-Z0-9\-]+$/.test(chatId)) {
            return reply.code(400).send({ error: "Invalid chatId" });
        }
        const chat = await prisma_1.prisma.chat.findFirst({ where: { id: chatId, userId } });
        if (!chat)
            return reply.code(404).send({ error: "Chat not found" });
        const messages = await prisma_1.prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" },
        });
        return reply.send(messages);
    });
    // List all chats for the authenticated user
    app.get("/chats", async (req, reply) => {
        let userId = req.headers["x-user-id"] || "demo-user";
        if (Array.isArray(userId))
            userId = userId[0];
        try {
            const chats = await prisma_1.prisma.chat.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });
            return reply.send(chats);
        }
        catch (err) {
            reply.code(500).send({ error: "Failed to fetch chats", details: err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err) });
        }
    });
    // Create a new chat for the authenticated user
    const chatCreateSchema = zod_1.z.object({
        title: zod_1.z.string().min(1).max(100).optional()
    });
    app.post("/chats", async (req, reply) => {
        let userId = req.headers["x-user-id"] || "demo-user";
        if (Array.isArray(userId))
            userId = userId[0];
        const bodyResult = chatCreateSchema.safeParse(req.body);
        if (!bodyResult.success)
            return reply.code(400).send({ error: "Invalid chat input" });
        const { title } = bodyResult.data;
        try {
            let user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                user = await prisma_1.prisma.user.create({
                    data: { id: userId, email: `${userId}@temp.local`, name: "" },
                });
            }
            const chat = await prisma_1.prisma.chat.create({
                data: {
                    userId: user.id,
                    title: title && typeof title === "string" ? title : "New Chat",
                },
            });
            return reply.send(chat);
        }
        catch (err) {
            reply.code(500).send({ error: "Failed to create chat", details: err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err) });
        }
    });
    // Send a message to a chat and get assistant response
    const chatMsgSchema = zod_1.z.object({
        message: zod_1.z.string().min(1).max(2000)
    });
    app.post("/chat", async (req, reply) => {
        const bodyResult = chatMsgSchema.safeParse(req.body);
        if (!bodyResult.success)
            return reply.code(400).send({ error: "Invalid chat message input" });
        const { message } = bodyResult.data;
        try {
            const content = await llm_service_1.LLMService.complete(message);
            return { role: "assistant", content };
        }
        catch (err) {
            const status = typeof err?.status === "number" ? err.status : 500;
            reply.code(status);
            return {
                error: "llm_error",
                message: String(err?.message ?? "Unknown LLM error"),
            };
        }
    });
    // Update chat title
    const chatTitleSchema = zod_1.z.object({
        title: zod_1.z.string().min(1).max(100)
    });
    app.put("/chats/:chatId/title", async (req, reply) => {
        let userId = req.headers["x-user-id"] || "demo-user";
        let chatId = req.params.chatId;
        if (Array.isArray(userId))
            userId = userId[0];
        if (Array.isArray(chatId))
            chatId = chatId[0];
        if (!chatId || typeof chatId !== "string" || !/^[a-zA-Z0-9\-]+$/.test(chatId)) {
            return reply.code(400).send({ error: "Invalid chatId" });
        }
        const bodyResult = chatTitleSchema.safeParse(req.body);
        if (!bodyResult.success)
            return reply.code(400).send({ error: "Missing or invalid title" });
        const { title } = bodyResult.data;
        const chat = await prisma_1.prisma.chat.findFirst({ where: { id: chatId, userId } });
        if (!chat)
            return reply.code(404).send({ error: "Chat not found" });
        return prisma_1.prisma.chat.update({
            where: { id: chatId },
            data: { title: title.trim() },
        });
    });
}
//# sourceMappingURL=chat.routes.js.map