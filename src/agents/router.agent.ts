import { plannerAgent } from "./planner.agent";
import { coderAgent } from "./coder.agent";
import { imageAgent } from "./image.agent";
import { ServerResponse } from "http";

export async function runAgentPipeline(
  prompt: string,
  res: ServerResponse
) {
  const plan = await plannerAgent(prompt);

  if (plan.intent === "image") {
    return imageAgent(prompt, res);
  }

  return coderAgent(prompt, res);
}
