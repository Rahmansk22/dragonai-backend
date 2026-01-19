import { FastifyInstance } from "fastify";
import { verifyClerkAuth } from "../utils/clerk-auth";
import { prisma } from "../db/prisma";

export async function chatSessionRoutes(app: FastifyInstance) {

  // List chats for the authenticated user only
  app.get("/chats", async (req, reply) => {
    const auth = await verifyClerkAuth(req, reply);
    if (!auth) return;
    const { userId } = auth;
    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    return chats;
  });


  // Create new chat (Clerk user or fallback to public-user for dev)
  app.post("/chats", async (req, reply) => {
    const auth = await verifyClerkAuth(req, reply);
    const userId = auth?.userId || "public-user";
    try {
      const chat = await prisma.chat.create({ data: { userId } });
      return chat;
    } catch (err: any) {
      reply.code(500).send({ error: "Failed to create chat", details: err?.message || String(err) });
    }
  });

  // Get messages for a chat
  app.get("/chats/:chatId/messages", async (req, reply) => {
    const auth = await verifyClerkAuth(req, reply);
    if (!auth) return;
    const { userId } = auth;
    const chatId = (req.params as { chatId: string }).chatId;
    const chat = await prisma.chat.findUnique({ where: { id: chatId, userId } });
    if (!chat) return reply.code(404).send({ error: "Chat not found" });
    const messages = await prisma.message.findMany({ where: { chatId }, orderBy: { createdAt: "asc" } });
    return messages;
  });

  // Delete all chats for the user
  app.delete("/chats", async (req, reply) => {
    const auth = await verifyClerkAuth(req, reply);
    if (!auth) return;
    const { userId } = auth;

    // Delete all messages for this user's chats
    const userChats = await prisma.chat.findMany({ where: { userId } });
    const chatIds = userChats.map((c: any) => c.id);

    if (chatIds.length > 0) {
      await prisma.message.deleteMany({
        where: { chatId: { in: chatIds } },
      });
    }

    // Delete all chats for the user
    await prisma.chat.deleteMany({
      where: { userId },
    });

    return { success: true, message: "All chats deleted" };
  });
}
