import { FastifyInstance } from "fastify";
import { LLMService } from "../services/llm.service";
import { prisma } from "../db/prisma";
import { verifyClerkAuth } from "../utils/clerk-auth";

export async function messageRoutes(app: FastifyInstance) {
  // Send message to chat (and get LLM reply)
  app.post<{ Params: { chatId: string } }>("/chats/:chatId/messages", async (req, reply) => {
    const auth = await verifyClerkAuth(req, reply);
    if (!auth) return; // reply already sent in verifyClerkAuth
    const { userId } = auth;
    const chatId = req.params.chatId;
    const { text } = req.body as any;
    if (!text) return reply.code(400).send({ error: "Missing message text" });
    const chat = await prisma.chat.findUnique({ where: { id: chatId, userId } });
    if (!chat) return reply.code(404).send({ error: "Chat not found" });

    // Load recent history (last 10 messages to stay within context limits)
    const history = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      skip: 0,
      take: 10, // Reduced from 50 to keep context under control
    });

    const messages = history.map((m: any) => ({ role: m.role, content: m.content }));
    messages.push({ role: "user", content: text });

    // Save user message
    const userMsg = await prisma.message.create({ data: { role: "user", content: text, chatId, userId } });

    // Get LLM reply using history
    try {
      const llmReply = await LLMService.completeWithMessages(messages);
      // Save assistant message
      const assistantMsg = await prisma.message.create({ data: { role: "assistant", content: llmReply, chatId, userId } });
      return { user: userMsg, assistant: assistantMsg };
    } catch (err: any) {
      console.error("LLM error:", err);
      // If context is still too long, try with even fewer messages
      if (err.message?.includes("context_length_exceeded")) {
        const minimalHistory = history.slice(-5); // Last 5 messages only
        const minimalMessages = minimalHistory.map((m: any) => ({ role: m.role, content: m.content }));
        minimalMessages.push({ role: "user", content: text });

        const llmReply = await LLMService.completeWithMessages(minimalMessages);
        const assistantMsg = await prisma.message.create({ data: { role: "assistant", content: llmReply, chatId, userId } });
        return { user: userMsg, assistant: assistantMsg };
      }
      throw err;
    }
  });

  // ...existing code...

  // (Optional) Remove or comment out the streaming POST /messages route if not needed
}
