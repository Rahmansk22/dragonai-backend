import { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../db/prisma";

type CustomBotFields = {
  customBotName: string | null;
  customBotPersona: string | null;
  customBotKnowledge: string | null;
};

function normalizeUserId(raw: unknown): string | null {
  if (Array.isArray(raw)) return raw[0] ?? null;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return null;
}

export async function customBotRoutes(app: FastifyInstance) {
  const botSchema = z.object({
    name: z.string().min(1).max(100),
    persona: z.string().min(1).max(1000),
    knowledge: z.string().min(1).max(8000),
  });

  const botSelect = {
    customBotName: true,
    customBotPersona: true,
    customBotKnowledge: true,
  } as const;

  app.get("/custom-bot", async (req, reply: FastifyReply) => {
    const userId = normalizeUserId(req.headers["x-user-id"]) || "demo-user";
    const user = (await prisma.user.findUnique({
      where: { id: userId },
      select: botSelect as any,
    })) as (CustomBotFields | null);
    if (!user) return reply.code(404).send({ error: "User not found" });

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

  app.post("/custom-bot", async (req, reply: FastifyReply) => {
    const userId = normalizeUserId(req.headers["x-user-id"]) || "demo-user";
    const parsed = botSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid custom bot payload" });
    }

    const { name, persona, knowledge } = parsed.data;
    const email = `${userId}@temp.local`;

    const user = (await prisma.user.upsert({
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
    } as any)) as CustomBotFields;

    return reply.send({
      customBot: {
        name: user.customBotName ?? "",
        persona: user.customBotPersona ?? "",
        knowledge: user.customBotKnowledge ?? "",
      },
    });
  });
}
