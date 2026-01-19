"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coderAgent = coderAgent;
const llm_service_1 = require("../services/llm.service");
const stream_service_1 = require("../services/stream.service");
async function coderAgent(prompt, res) {
    await llm_service_1.LLMService.stream(prompt, (token) => {
        stream_service_1.StreamService.send(res, token);
    });
    stream_service_1.StreamService.done(res);
}
//# sourceMappingURL=coder.agent.js.map