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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqService = void 0;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
async function resolveFetch() {
    const gf = globalThis.fetch;
    if (typeof gf === "function")
        return gf;
    try {
        const undiciModuleName = "undici";
        const undici = await Promise.resolve(`${undiciModuleName}`).then(s => __importStar(require(s)));
        if (undici && typeof undici.fetch === "function")
            return undici.fetch;
    }
    catch { }
    try {
        const nodeFetchModuleName = "node-fetch";
        const nodeFetch = await Promise.resolve(`${nodeFetchModuleName}`).then(s => __importStar(require(s)));
        if (nodeFetch && typeof nodeFetch.default === "function")
            return nodeFetch.default;
    }
    catch { }
    throw new Error("Fetch is not available. Upgrade to Node 18+, or install 'undici' or 'node-fetch'.");
}
exports.GroqService = {
    async completeWithMessages(messages) {
        const apiKey = process.env.GROQ_API_KEY ?? "";
        if (!apiKey) {
            throw new Error("Missing GROQ_API_KEY. Provide your Groq key.");
        }
        const url = GROQ_URL;
        const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
        const _fetch = await resolveFetch();
        const res = await _fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model, messages }),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            const err = new Error(`LLM request failed: ${res.status} ${res.statusText} - ${text}`);
            err.status = res.status;
            throw err;
        }
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content ??
            data?.choices?.[0]?.delta?.content ??
            data?.choices?.[0]?.text ??
            "";
        return typeof content === "string" ? content : JSON.stringify(content);
    },
};
//# sourceMappingURL=grok.service.js.map