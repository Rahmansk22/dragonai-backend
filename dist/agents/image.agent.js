"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageAgent = imageAgent;
const image_service_1 = require("../services/image.service");
const stream_service_1 = require("../services/stream.service");
async function imageAgent(prompt, res) {
    const url = await image_service_1.ImageService.generate(prompt);
    stream_service_1.StreamService.send(res, url);
    stream_service_1.StreamService.done(res);
}
//# sourceMappingURL=image.agent.js.map