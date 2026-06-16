import { LLMService } from "../services/llm.service";

export async function plannerAgent(prompt: string) {
  const result = await LLMService.complete(`
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
