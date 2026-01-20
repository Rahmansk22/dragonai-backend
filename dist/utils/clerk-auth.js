"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyClerkAuth = verifyClerkAuth;
const backend_1 = require("@clerk/backend");
/**
 * Verifies Clerk JWT using Clerk backend SDK. Attaches user payload to req if valid.
 */
async function verifyClerkAuth(req, reply) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "Missing auth token" });
    }
    const token = authHeader.replace("Bearer ", "");
    try {
        const payload = await (0, backend_1.verifyToken)(token, {});
        req.user = payload;
        if (typeof payload.sub !== "string") {
            return reply.status(401).send({ error: "Invalid Clerk token: missing sub" });
        }
        return {
            userId: payload.sub,
            name: typeof payload.name === "string" ? payload.name : undefined,
            email: typeof payload.email === "string" ? payload.email : undefined,
        };
    }
    catch (err) {
        return reply.status(401).send({ error: "Invalid Clerk token" });
    }
}
//# sourceMappingURL=clerk-auth.js.map