"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyClerkAuth = verifyClerkAuth;
/**
 * Extracts Clerk userId from Authorization header (JWT) in Fastify request.
 * Returns userId string if valid, else sends 401 and returns null.
 */
async function verifyClerkAuth(req, reply) {
    // Debug log for Authorization header
    console.log("[verifyClerkAuth] Authorization header:", req.headers["authorization"]);
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        reply.code(401).send({ error: "Missing or invalid authorization header" });
        return null;
    }
    const token = authHeader.replace("Bearer ", "");
    const base64Payload = token.split(".")[1];
    if (!base64Payload) {
        reply.code(401).send({ error: "Invalid token" });
        return null;
    }
    try {
        const decoded = JSON.parse(Buffer.from(base64Payload, "base64").toString());
        if (!decoded || !decoded.sub) {
            reply.code(401).send({ error: "Invalid token" });
            return null;
        }
        // Log the full decoded JWT for debugging
        console.log("[Clerk JWT FULL]", decoded);
        // Always prefer given_name + family_name if present
        let name = decoded.name;
        if (decoded.given_name) {
            name = decoded.given_name + (decoded.family_name ? ` ${decoded.family_name}` : "");
        }
        // Debug log for user identity
        console.log("[Clerk JWT] userId:", decoded.sub, "name:", name, "email:", decoded.email);
        return { userId: decoded.sub, name, email: decoded.email };
    }
    catch {
        reply.code(401).send({ error: "Invalid token" });
        return null;
    }
}
//# sourceMappingURL=clerk-auth.js.map