"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const BASE_URL = "https://api.x.ai/v1";
exports.ImageService = {
    async generate(prompt) {
        const res = await fetch(`${BASE_URL}/images/generations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROK_API_KEY}`,
            },
            body: JSON.stringify({
                model: "grok-2-image",
                prompt,
                size: "1024x1024",
            }),
        });
        const data = await res.json();
        return data.data[0].url;
    },
};
//# sourceMappingURL=image.service.js.map