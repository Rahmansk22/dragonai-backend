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
exports.LLMService = void 0;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
async function resolveFetch() {
    const gf = globalThis.fetch;
    if (typeof gf === "function")
        return gf;
    // Try to load undici (recommended) or node-fetch if available
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
        // node-fetch v3 exports default
        if (nodeFetch && typeof nodeFetch.default === "function")
            return nodeFetch.default;
    }
    catch { }
    throw new Error("Fetch is not available. Upgrade to Node 18+, or install 'undici' or 'node-fetch'.");
}
exports.LLMService = {
    async complete(prompt) {
        const apiKey = (process.env.GROQ_API_KEY || "").trim();
        console.log("[LLM] GROQ_API_KEY present:", apiKey ? `Yes (${apiKey.substring(0, 7)}...)` : "NO - Missing!");
        if (!apiKey) {
            throw new Error("Missing GROQ_API_KEY. Provide your Groq key.");
        }
        const url = GROQ_URL;
        const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
        const _fetch = await resolveFetch();
        let res;
        try {
            res = await _fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: "user", content: prompt }],
                }),
            });
        }
        catch (networkErr) {
            throw new Error(`LLM network error: ${networkErr?.message || String(networkErr)}`);
        }
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            const err = new Error(`LLM request failed: ${res.status} ${res.statusText} - ${text}`);
            err.status = res.status;
            throw err;
        }
        let data;
        try {
            data = await res.json();
        }
        catch (parseErr) {
            const text = await res.text().catch(() => "");
            throw new Error(`Failed to parse LLM response JSON: ${text}`);
        }
        // Attempt common places for content in OpenAI-compatible responses
        const content = data?.choices?.[0]?.message?.content ??
            data?.choices?.[0]?.delta?.content ??
            data?.choices?.[0]?.text ??
            "";
        return typeof content === "string" ? content : JSON.stringify(content);
    },
    async analyzeImage(imageBase64) {
        const apiKey = process.env.GROQ_API_KEY ?? "";
        if (!apiKey) {
            throw new Error("Missing GROQ_API_KEY. Provide your Groq key.");
        }
        const url = GROQ_URL;
        const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
        const _fetch = await resolveFetch();
        try {
            // For now, use text analysis as a placeholder since Groq's vision support is limited
            // In production, you'd integrate with a dedicated vision API like Claude's or GPT-4V
            const prompt = `I have an image (provided as base64). Based on the filename/metadata available, provide a detailed description of what would typically be in such an image. However, note that direct image analysis requires a dedicated vision model.

To fully analyze images, consider:
1. Using Claude 3's vision capabilities
2. Using OpenAI's GPT-4V
3. Using Google's Gemini Vision API

For now, I can help you discuss images if you describe them to me. The image has been received and can be:
- Sent to the chat for context
- Discussed with the assistant
- Used to inform responses

Would you like me to help you work with this image in some way?`;
            const res = await _fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    max_tokens: 512,
                }),
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                console.error("Groq API response:", text);
                throw new Error(`Image analysis failed: ${res.status} - ${text}`);
            }
            const data = await res.json();
            const content = data?.choices?.[0]?.message?.content ??
                data?.choices?.[0]?.delta?.content ??
                data?.choices?.[0]?.text ??
                "Unable to analyze image";
            return typeof content === "string" ? content : JSON.stringify(content);
        }
        catch (err) {
            console.error("Image analysis error:", err.message);
            // Return a helpful message instead of failing
            return "Image received! You can now:\n• Send it to chat for discussion\n• Ask me to analyze specific aspects\n• Use it as context for our conversation\n\nNote: For full AI image analysis, consider using dedicated vision APIs like Claude 3, GPT-4V, or Gemini Vision.";
        }
    },
    async stream(prompt, onToken) {
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
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                stream: true,
            }),
        });
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { value, done } = await reader.read();
            if (done)
                break;
            const chunk = decoder.decode(value);
            for (const line of chunk.split("\n")) {
                if (!line.startsWith("data:"))
                    continue;
                if (line.includes("[DONE]"))
                    return;
                const json = JSON.parse(line.replace("data:", "").trim());
                const token = json.choices?.[0]?.delta?.content;
                if (token)
                    onToken(token);
            }
        }
    },
    async completeWithMessages(messages, apiKeyOverride) {
        const apiKey = (apiKeyOverride || process.env.GROQ_API_KEY || "").trim();
        console.log("[LLM] Using GROQ key:", apiKey ? `${apiKey.slice(0, 4)}...len=${apiKey.length}` : "missing");
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
//# sourceMappingURL=llm.service.js.map