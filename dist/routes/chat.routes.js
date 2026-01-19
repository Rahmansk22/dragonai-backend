"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = chatRoutes;
const llm_service_1 = require("../services/llm.service");
const prisma_1 = require("../db/prisma");
const clerk_auth_1 = require("../utils/clerk-auth");
async function chatRoutes(app) {
    app.post("/chat", async (req, reply) => {
        const { message } = req.body;
        try {
            const content = await llm_service_1.LLMService.complete(message);
            return { role: "assistant", content };
        }
        catch (err) {
            const status = typeof err?.status === "number" ? err.status : 500;
            reply.code(status);
            return {
                error: "llm_error",
                message: err?.message ?? "Unknown LLM error",
            };
        }
    });
    // ...existing code...
    // Chat session routes handle chat creation and listing (JWT-protected)
    // Removed duplicate /chats endpoints to avoid Fastify route conflicts.
    // Update chat title
    app.put("/chats/:chatId/title", async (req, reply) => {
        const auth = await (0, clerk_auth_1.verifyClerkAuth)(req, reply);
        if (!auth)
            return;
        const { userId } = auth;
        const chatId = req.params.chatId;
        const { title } = req.body;
        if (!chatId || typeof chatId !== "string") {
            return reply.code(400).send({ error: "Invalid chatId" });
        }
        if (!title || typeof title !== "string") {
            return reply.code(400).send({ error: "Missing or invalid title" });
        }
        // Verify user owns this chat
        const chat = await prisma_1.prisma.chat.findUnique({ where: { id: chatId, userId } });
        if (!chat)
            return reply.code(404).send({ error: "Chat not found" });
        return prisma_1.prisma.chat.update({
            where: { id: chatId },
            data: { title: title.trim() },
        });
    });
    // ...existing code...
    // Delete a chat and its messages
    app.delete("/chats/:chatId", async (req, reply) => {
        const auth = await (0, clerk_auth_1.verifyClerkAuth)(req, reply);
        if (!auth)
            return;
        const { userId } = auth;
        const { chatId } = req.params;
        const id = chatId;
        // Verify user owns this chat
        const chat = await prisma_1.prisma.chat.findUnique({ where: { id, userId } });
        if (!chat)
            return reply.code(404).send({ error: "Chat not found" });
        await prisma_1.prisma.message.deleteMany({
            where: { chatId: id },
        });
        await prisma_1.prisma.chat.delete({
            where: { id },
        });
        return { success: true };
    });
    // ...existing code...
}
//# sourceMappingURL=chat.routes.js.map