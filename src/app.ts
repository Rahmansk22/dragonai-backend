
import * as dotenv from "dotenv";
dotenv.config();

import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
// import rateLimit from "@fastify/rate-limit"; // Disabled - version mismatch with Fastify 4.x

import { chatRoutes } from "./routes/chat.routes";
import { imageRoutes } from "./routes/image.routes";
import { healthRoutes } from "./routes/health.routes";
import { authRoutes } from "./routes/auth.routes";


console.log("[app.ts] authRoutes import:", authRoutes);
import { messageRoutes } from "./routes/message.routes";

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

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

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
    "https://jv6l2lgz-3000.inc1.devtunnels.ms",
    "https://dragonai-frontend-hdf60dynn-rahmansk22s-projects.vercel.app",
    "https://dragongpt.vercel.app",
    "http://localhost"
  ];
  app.log.info({ allowedOrigins }, "Allowed CORS origins");

  await app.register(cors, {
    origin: (origin, cb) => {
      app.log.info({ origin }, "CORS check for origin");
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      if (origin?.includes("localhost")) {
        return cb(null, true);
      }
      if (origin?.endsWith(".vercel.app")) {
        return cb(null, true);
      }
      app.log.warn({ origin }, "Blocked by CORS");
      cb(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id", "x-groq-api-key", "x-api-key", "x-cf-account-id", "x-cf-api-key", "x-cf-model"],
    credentials: false,
  });

  await app.register(healthRoutes, { prefix: "/api" });
  console.log("[app.ts] Registering authRoutes...");
  await app.register(authRoutes, { prefix: "/api" });
  console.log("[app.ts] Registered authRoutes");
  await app.register(messageRoutes, { prefix: "/api" });

  await app.register(chatRoutes, { prefix: "/api" }); // Use x-user-id header chat routes for dev
  await app.register(imageRoutes, { prefix: "/api" });

  return app;
}
  // await app.register(chatSessionRoutes, { prefix: "/api" }); // Disable Clerk-only routes for now
