"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const clerk_auth_1 = require("../utils/clerk-auth");
const client_1 = require("@prisma/client");
// Only Clerk authentication and user profile logic below
async function authRoutes(app) {
    const prisma = new client_1.PrismaClient();
    // Get profile (Clerk auth required)
    app.get("/auth/profile", async (req, reply) => {
        const auth = await (0, clerk_auth_1.verifyClerkAuth)(req, reply);
        if (!auth)
            return;
        const { userId, name, email } = auth;
        // Upsert user: create if not exists, or update name/email if changed
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            // User not created yet, require profile setup
            return { id: userId, name: null, email: email || `${userId}@clerk.dev`, requireProfile: true };
        }
        else if (!user.name) {
            // Existing user with missing name: require profile setup
            return { id: user.id, name: user.name, email: user.email, requireProfile: true };
        }
        else {
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
        const auth = await (0, clerk_auth_1.verifyClerkAuth)(req, reply);
        if (!auth)
            return;
        const { userId, email } = auth;
        const { name } = req.body;
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
                },
            });
        }
        else {
            user = await prisma.user.update({ where: { id: userId }, data: { name: name.trim() } });
        }
        return { id: user.id, name: user.name, email: user.email };
    });
}
//# sourceMappingURL=auth.routes.js.map