"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoutes = messageRoutes;
const llm_service_1 = require("../services/llm.service");
const prisma_1 = require("../db/prisma");
const clerk_auth_1 = require("../utils/clerk-auth");
async function messageRoutes(app) {
    // Send message to chat (and get LLM reply)
    app.post("/chats/:chatId/messages", async (req, reply) => {
        const auth = await (0, clerk_auth_1.verifyClerkAuth)(req, reply);
        if (!auth)
            return; // reply already sent in verifyClerkAuth
        const { userId } = auth;
        const chatId = req.params.chatId;
        const { text } = req.body;
        if (!text)
            return reply.code(400).send({ error: "Missing message text" });
        const chat = await prisma_1.prisma.chat.findUnique({ where: { id: chatId, userId } });
        if (!chat)
            return reply.code(404).send({ error: "Chat not found" });
        // Load recent history (last 10 messages to stay within context limits)
        const history = await prisma_1.prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" },
            skip: 0,
            take: 10, // Reduced from 50 to keep context under control
        });
        const messages = history.map((m) => ({ role: m.role, content: m.content }));
        messages.push({ role: "user", content: text });
        // Save user message
        const userMsg = await prisma_1.prisma.message.create({ data: { role: "user", content: text, chatId, userId } });
        // Get LLM reply using history
        try {
            const llmReply = await llm_service_1.LLMService.completeWithMessages(messages);
            // Save assistant message
            const assistantMsg = await prisma_1.prisma.message.create({ data: { role: "assistant", content: llmReply, chatId, userId } });
            return { user: userMsg, assistant: assistantMsg };
        }
        catch (err) {
            console.error("LLM error:", err);
            // If context is still too long, try with even fewer messages
            if (err.message?.includes("context_length_exceeded")) {
                const minimalHistory = history.slice(-5); // Last 5 messages only
                const minimalMessages = minimalHistory.map((m) => ({ role: m.role, content: m.content }));
                minimalMessages.push({ role: "user", content: text });
                const llmReply = await llm_service_1.LLMService.completeWithMessages(minimalMessages);
                const assistantMsg = await prisma_1.prisma.message.create({ data: { role: "assistant", content: llmReply, chatId, userId } });
                return { user: userMsg, assistant: assistantMsg };
            }
            throw err;
        }
    });
    // ...existing code...
    // (Optional) Remove or comment out the streaming POST /messages route if not needed
}
//# sourceMappingURL=message.routes.js.map