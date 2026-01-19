"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const chat_routes_1 = require("./routes/chat.routes");
const image_routes_1 = require("./routes/image.routes");
const health_routes_1 = require("./routes/health.routes");
const auth_routes_1 = require("./routes/auth.routes");
const chat_session_routes_1 = require("./routes/chat.session.routes");
const message_routes_1 = require("./routes/message.routes");
async function createApp() {
    const app = (0, fastify_1.default)({ logger: true });
    // Health check root endpoint
    app.get("/", async (req, reply) => {
        return { status: "ok", message: "Fastify backend is running." };
    });
    await app.register(cors_1.default, {
        origin: process.env.CORS_ORIGIN ?? ["http://localhost:3000", "http://localhost:4000"],
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    });
    await app.register(health_routes_1.healthRoutes, { prefix: "/api" });
    await app.register(auth_routes_1.authRoutes, { prefix: "/api" });
    await app.register(chat_session_routes_1.chatSessionRoutes, { prefix: "/api" });
    await app.register(message_routes_1.messageRoutes, { prefix: "/api" });
    await app.register(chat_routes_1.chatRoutes, { prefix: "/api" });
    await app.register(image_routes_1.imageRoutes, { prefix: "/api" });
    return app;
}
//# sourceMappingURL=app.js.map