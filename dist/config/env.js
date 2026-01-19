"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    PORT: Number(process.env.PORT || 4000),
    GROQ_API_KEY: process.env.GROQ_API_KEY || "",
    MODEL: "llama-3.1-8b-instant",
};
//# sourceMappingURL=env.js.map