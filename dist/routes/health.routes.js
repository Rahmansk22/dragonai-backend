"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = healthRoutes;
async function healthRoutes(app) {
    app.get("/health", async () => {
        return { status: "ok" };
    });
}
//# sourceMappingURL=health.routes.js.map