"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
// import rateLimit from "@fastify/rate-limit"; // Disabled - version mismatch with Fastify 4.x
const chat_routes_1 = require("./routes/chat.routes");
const image_routes_1 = require("./routes/image.routes");
const health_routes_1 = require("./routes/health.routes");
const auth_routes_1 = require("./routes/auth.routes");
const customBot_routes_1 = require("./routes/customBot.routes");
console.log("[app.ts] authRoutes import:", auth_routes_1.authRoutes);
const message_routes_1 = require("./routes/message.routes");
// Masked log to verify GROQ_API_KEY is loaded (length only)
const groqKey = (process.env.GROQ_API_KEY || "").trim();
const maskedGroq = groqKey ? `${groqKey.slice(0, 4)}...len=${groqKey.length}` : "missing";
console.log("[startup] GROQ_API_KEY:", maskedGroq);
console.log(`[app.ts] GROQ_API_KEY: ${maskedGroq}`);
const cfAcct = (process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
const cfKey = (process.env.CLOUDFLARE_API_KEY || "").trim();
const maskedCfAcct = cfAcct ? `${cfAcct.slice(0, 4)}...len=${cfAcct.length}` : "missing";
const maskedCfKey = cfKey ? `${cfKey.slice(0, 4)}...len=${cfKey.length}` : "missing";
console.log(`[app.ts] CLOUDFLARE_ACCOUNT_ID: ${maskedCfAcct}, CLOUDFLARE_API_KEY: ${maskedCfKey}`);
async function createApp() {
    const app = (0, fastify_1.default)({ logger: true });
    // --- OWASP: Global Rate Limiting (IP + user-based) --- DISABLED for Railway
    // await app.register(rateLimit, {
    //   max: 100,
    //   timeWindow: '15 minutes',
    //   keyGenerator: (req) => {
    //     const userId = req.headers['x-user-id'];
    //     if (userId && typeof userId === 'string') return `user:${userId}`;
    //     if (Array.isArray(userId) && userId[0]) return `user:${userId[0]}`;
    //     return req.ip;
    //   },
    //   errorResponseBuilder: (req, context) => ({
    //     error: 'Too Many Requests',
    //     message: 'You have exceeded the allowed number of requests. Please wait and try again.',
    //     statusCode: 429
    //   }),
    //   allowList: [],
    // });
    app.get("/", async (req, reply) => {
        return { status: "ok", message: "Fastify backend is running." };
    });
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://jv6l2lgz-3000.inc1.devtunnels.ms/",
        "https://dragonai-frontend-hdf60dynn-rahmansk22s-projects.vercel.app",
        "https://dragongpt.vercel.app",
        "http://localhost",
        "*", // Allow all origins for production
    ];
    app.log.info({ allowedOrigins }, "Allowed CORS origins");
    await app.register(cors_1.default, {
        origin: true, // Allow all origins
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "x-user-id", "x-groq-api-key", "x-api-key", "x-cf-account-id", "x-cf-api-key", "x-cf-model", "Accept", "Origin", "X-Requested-With"],
        credentials: false,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    await app.register(health_routes_1.healthRoutes, { prefix: "/api" });
    console.log("[app.ts] Registering authRoutes...");
    await app.register(auth_routes_1.authRoutes, { prefix: "/api" });
    console.log("[app.ts] Registered authRoutes");
    await app.register(customBot_routes_1.customBotRoutes, { prefix: "/api" });
    await app.register(message_routes_1.messageRoutes, { prefix: "/api" });
    await app.register(chat_routes_1.chatRoutes, { prefix: "/api" }); // Use x-user-id header chat routes for dev
    await app.register(image_routes_1.imageRoutes, { prefix: "/api" });
    return app;
}
// await app.register(chatSessionRoutes, { prefix: "/api" }); // Disable Clerk-only routes for now
//# sourceMappingURL=app.js.map