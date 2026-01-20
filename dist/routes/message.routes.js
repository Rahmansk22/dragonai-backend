"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoutes = messageRoutes;
const llm_service_1 = require("../services/llm.service");
const prisma_1 = require("../db/prisma");
async function messageRoutes(app) {
    // Send message to chat (and get LLM reply)
    app.post("/chats/:chatId/messages", async (req, reply) => {
        let userId = req.headers["x-user-id"] || "demo-user";
        if (Array.isArray(userId))
            userId = userId[0];
        const chatId = req.params.chatId;
        const { text, model } = req.body;
        const headerGroqKey = (req.headers["x-groq-api-key"] || req.headers["x-api-key"] || "");
        const groqKey = typeof headerGroqKey === "string" ? headerGroqKey.trim() : "";
        if (groqKey) {
            const masked = `${groqKey.slice(0, 4)}...len=${groqKey.length}`;
            req.log.info({ maskedGroqKey: masked }, "Using request Groq key override");
        }
        if (!text)
            return reply.code(400).send({ error: "Missing message text" });
        const chat = await prisma_1.prisma.chat.findUnique({ where: { id: chatId, userId } });
        if (!chat)
            return reply.code(404).send({ error: "Chat not found" });
        // Count existing user messages to determine if this is the first one
        const existingUserMessages = await prisma_1.prisma.message.count({
            where: { chatId, role: "user" },
        });
        // Load recent history (last 10 messages)
        const history = await prisma_1.prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" },
            skip: 0,
            take: 10,
        });
        const messages = history.map((m) => ({ role: m.role, content: m.content }));
        messages.push({ role: "user", content: text });
        // Save user message
        const userMsg = await prisma_1.prisma.message.create({ data: { role: "user", content: text, chatId, userId } });
        // Update chat title with first user message (truncate to 50 chars)
        if (existingUserMessages === 0) {
            const titleText = text.length > 50 ? text.slice(0, 47) + "..." : text;
            await prisma_1.prisma.chat.update({
                where: { id: chatId },
                data: { title: titleText },
            });
            req.log.info({ chatId, title: titleText }, "Updated chat title with first message");
        }
        // Use only Groq LLM (LLMService)
        let llmReply = "";
        try {
            llmReply = await llm_service_1.LLMService.completeWithMessages(messages, groqKey || undefined);
            // Save assistant message
            const assistantMsg = await prisma_1.prisma.message.create({ data: { role: "assistant", content: llmReply, chatId, userId } });
            return { user: userMsg, assistant: assistantMsg };
        }
        catch (err) {
            console.error("LLM error:", err);
            reply.code(err.status || 500).send({ error: "llm_error", message: String(err.message) });
        }
    });
    // ...existing code...
    // (Optional) Remove or comment out the streaming POST /messages route if not needed
}
//# sourceMappingURL=message.routes.js.map