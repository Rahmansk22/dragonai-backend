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
exports.GeminiService = void 0;
let _fetch = null;
async function getFetch() {
    if (_fetch)
        return _fetch;
    if (typeof fetch === "function") {
        _fetch = fetch;
        return _fetch;
    }
    try {
        const undici = await Promise.resolve().then(() => __importStar(require("undici")));
        if (undici && typeof undici.fetch === "function") {
            _fetch = undici.fetch;
            return _fetch;
        }
    }
    catch { }
    try {
        const nodeFetch = await Promise.resolve().then(() => __importStar(require("node-fetch")));
        if (nodeFetch && typeof nodeFetch.default === "function") {
            _fetch = (input, init) => nodeFetch.default(input, init);
            return _fetch;
        }
    }
    catch { }
    throw new Error("Fetch is not available. Upgrade to Node 18+, or install 'undici' or 'node-fetch'.");
}
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
exports.GeminiService = {
    async completeWithMessages(messages) {
        const apiKey = process.env.GEMINI_API_KEY ?? "";
        if (!apiKey)
            throw new Error("Missing GEMINI_API_KEY. Provide your Gemini key.");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
        const history = messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] }));
        const body = JSON.stringify({ contents: history });
        const fetchFn = await getFetch();
        // Add duplex: "half" if using undici
        const fetchOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
        };
        // undici requires duplex: "half" for POST with body
        if (fetchFn && fetchFn.name === "fetch" && fetchFn.toString().includes("undici")) {
            fetchOptions.duplex = "half";
        }
        if (!fetchFn) {
            throw new Error("Fetch function is not available.");
        }
        const res = await fetchFn(url, fetchOptions);
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Gemini API error: ${res.status} - ${text}`);
        }
        const data = await res.json();
        // Gemini 2.5 Flash returns candidates[0].content.parts[0].text
        return (data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            data?.candidates?.[0]?.content?.text ||
            JSON.stringify(data));
    },
};
//# sourceMappingURL=gemini.service.js.map