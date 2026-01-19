"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAgentPipeline = runAgentPipeline;
const planner_agent_1 = require("./planner.agent");
const coder_agent_1 = require("./coder.agent");
const image_agent_1 = require("./image.agent");
async function runAgentPipeline(prompt, res) {
    const plan = await (0, planner_agent_1.plannerAgent)(prompt);
    if (plan.intent === "image") {
        return (0, image_agent_1.imageAgent)(prompt, res);
    }
    return (0, coder_agent_1.coderAgent)(prompt, res);
}
//# sourceMappingURL=router.agent.js.map