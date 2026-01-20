
import * as dotenv from "dotenv";
dotenv.config();

import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";

import { chatRoutes } from "./routes/chat.routes";
import { imageRoutes } from "./routes/image.routes";
import { healthRoutes } from "./routes/health.routes";
import { authRoutes } from "./routes/auth.routes";

console.log("[app.ts] authRoutes import:", authRoutes);
import { messageRoutes } from "./routes/message.routes";

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  // --- OWASP: Global Rate Limiting (IP + user-based) ---
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes',
    keyGenerator: (req) => {
      const userId = req.headers['x-user-id'];
      if (userId && typeof userId === 'string') return `user:${userId}`;
      if (Array.isArray(userId) && userId[0]) return `user:${userId[0]}`;
      return req.ip;
    },
    errorResponseBuilder: (req, context) => ({
      error: 'Too Many Requests',
      message: 'You have exceeded the allowed number of requests. Please wait and try again.',
      statusCode: 429
    }),
    allowList: [],
  });

  app.get("/", async (req, reply) => {
    return { status: "ok", message: "Fastify backend is running." };
  });

  const allowedOrigins = [
    "http://localhost:3000",
    "https://jv6l2lgz-3000.inc1.devtunnels.ms"
  ];
  app.log.info({ allowedOrigins }, "Allowed CORS origins");

  await app.register(cors, {
    origin: (origin, cb) => {
      app.log.info({ origin }, "CORS check for origin");
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      if (origin.endsWith(".vercel.app")) {
        return cb(null, true);
      }
      app.log.warn({ origin }, "Blocked by CORS");
      cb(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
    credentials: true,
  });

  await app.register(healthRoutes, { prefix: "/api" });
  console.log("[app.ts] Registering authRoutes...");
  await app.register(authRoutes, { prefix: "/api" });
  console.log("[app.ts] Registered authRoutes");
  await app.register(messageRoutes, { prefix: "/api" });
  await app.register(chatRoutes, { prefix: "/api" });
  await app.register(imageRoutes, { prefix: "/api" });

  return app;
}
