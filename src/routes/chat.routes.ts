import { FastifyInstance, FastifyReply } from "fastify";
import { LLMService } from "../services/llm.service";
import { prisma } from "../db/prisma";
import { verifyClerkAuth } from "../utils/clerk-auth";

export async function chatRoutes(app: FastifyInstance) {
  app.post("/chat", async (req, reply: FastifyReply) => {
    const { message } = req.body as any;
    try {
      const content = await LLMService.complete(message);
      return { role: "assistant", content };
    } catch (err: any) {
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
  app.put("/chats/:chatId/title", async (req, reply: FastifyReply) => {
    const auth = await verifyClerkAuth(req, reply);
    if (!auth) return;
    const { userId } = auth;

    const chatId = (req.params as any).chatId;
    const { title } = req.body as { title?: string };

    if (!chatId || typeof chatId !== "string") {
      return reply.code(400).send({ error: "Invalid chatId" });
    }
    if (!title || typeof title !== "string") {
      return reply.code(400).send({ error: "Missing or invalid title" });
    }

    // Verify user owns this chat
    const chat = await prisma.chat.findUnique({ where: { id: chatId, userId } });
    if (!chat) return reply.code(404).send({ error: "Chat not found" });

    return prisma.chat.update({
      where: { id: chatId },
      data: { title: title.trim() },
    });
  });
      // ...existing code...

  // Delete a chat and its messages
  app.delete("/chats/:chatId", async (req, reply: FastifyReply) => {
    const auth = await verifyClerkAuth(req, reply);
    if (!auth) return;
    const { userId } = auth;

    const { chatId } = req.params as any;
    const id = chatId;

    // Verify user owns this chat
    const chat = await prisma.chat.findUnique({ where: { id, userId } });
    if (!chat) return reply.code(404).send({ error: "Chat not found" });

    await prisma.message.deleteMany({
      where: { chatId: id },
    });
    await prisma.chat.delete({
      where: { id },
    });
    return { success: true };
  });
      // ...existing code...
}

