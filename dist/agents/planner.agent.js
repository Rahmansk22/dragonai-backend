"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plannerAgent = plannerAgent;
const llm_service_1 = require("../services/llm.service");
async function plannerAgent(prompt) {
    const result = await llm_service_1.LLMService.complete(`
Classify user intent:
Return JSON only.

Options:
- chat
- code
- image

Prompt:
${prompt}
`);
    return JSON.parse(result);
}
//# sourceMappingURL=planner.agent.js.map