import { FastifyInstance } from "fastify";
import { verifyClerkAuth } from "../utils/clerk-auth";
import { PrismaClient } from "@prisma/client";


// Only Clerk authentication and user profile logic below
export async function authRoutes(app: FastifyInstance) {
  const prisma = new PrismaClient();
  // Get profile (Clerk auth required)
  app.get("/auth/profile", async (req, reply) => {
    const auth = await verifyClerkAuth(req, reply);
    if (!auth) return;
    const { userId, name, email } = auth;
    // Upsert user: create if not exists, or update name/email if changed
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      // User not created yet, require profile setup
      return { id: userId, name: null, email: email || `${userId}@clerk.dev`, requireProfile: true };
    } else if (!user.name) {
      // Existing user with missing name: require profile setup
      return { id: user.id, name: user.name, email: user.email, requireProfile: true };
    } else {
      // Existing user with complete profile
      // Optionally update email if changed
      if (email && user.email !== email) {
        user = await prisma.user.update({ where: { id: userId }, data: { email } });
      }
      return { id: user.id, name: user.name, email: user.email };
    }
  });

  // Endpoint to update user profile (display name, etc.)
  app.post("/auth/profile", async (req, reply) => {
    console.log("[POST] /api/auth/profile route hit");
    const auth = await verifyClerkAuth(req, reply);
    if (!auth) return;
    const { userId, email } = auth;
    const { name } = req.body as { name: string };
    if (!name || typeof name !== "string" || !name.trim()) {
      return reply.code(400).send({ error: "Display name is required" });
    }
    // Only create user here if not exists
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: name.trim(),
          email: email || `${userId}@clerk.dev`,
          provider: "clerk",
          providerId: userId,
        },
      });
    } else {
      user = await prisma.user.update({ where: { id: userId }, data: { name: name.trim() } });
    }
    return { id: user.id, name: user.name, email: user.email };
  });
}
