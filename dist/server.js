"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const env_1 = require("./config/env");
async function start() {
    const app = await (0, app_1.createApp)();
    try {
        await app.listen({ port: env_1.config.PORT, host: "0.0.0.0" });
        console.log(`🚀 AI backend running on http://localhost:${env_1.config.PORT}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map