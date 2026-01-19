import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";

import { chatRoutes } from "./routes/chat.routes";
import { imageRoutes } from "./routes/image.routes";
import { healthRoutes } from "./routes/health.routes";
import { authRoutes } from "./routes/auth.routes";
import { chatSessionRoutes } from "./routes/chat.session.routes";
import { messageRoutes } from "./routes/message.routes";

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
    // Health check root endpoint
    app.get("/", async (req, reply) => {
      return { status: "ok", message: "Fastify backend is running." };
    });

  const allowedOrigins = [
    "https://dragonaii.vercel.app"
  ];
  app.log.info({ allowedOrigins }, "Allowed CORS origins");

  await app.register(cors, {
    origin: (origin, cb) => {
      app.log.info({ origin }, "CORS check for origin");
      // Allow server-to-server or curl
      if (!origin) return cb(null, true);
      // Allow main production domain
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      // Allow all Vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return cb(null, true);
      }
      app.log.warn({ origin }, "Blocked by CORS");
      cb(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });


  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(authRoutes, { prefix: "/api" });
  await app.register(chatSessionRoutes, { prefix: "/api" });
  await app.register(messageRoutes, { prefix: "/api" });
  await app.register(chatRoutes, { prefix: "/api" });
  await app.register(imageRoutes, { prefix: "/api" });

  return app;
}
