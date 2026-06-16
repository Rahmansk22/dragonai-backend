import { FastifyRequest, FastifyReply } from "fastify";

import { verifyToken } from "@clerk/backend";

/**
 * Verifies Clerk JWT using Clerk backend SDK. Attaches user payload to req if valid.
 */
export async function verifyClerkAuth(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<{ userId: string; name?: string; email?: string } | null> {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Missing auth token" });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = await verifyToken(token, {});
    (req as any).user = payload;
    if (typeof payload.sub !== "string") {
      return reply.status(401).send({ error: "Invalid Clerk token: missing sub" });
    }
    return {
      userId: payload.sub,
      name: typeof payload.name === "string" ? payload.name : undefined,
      email: typeof payload.email === "string" ? payload.email : undefined,
    };
  } catch (err) {
    return reply.status(401).send({ error: "Invalid Clerk token" });
  }
}
