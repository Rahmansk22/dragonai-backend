import { LLMService } from "../services/llm.service";
import { StreamService } from "../services/stream.service";
import { ServerResponse } from "http";

export async function coderAgent(
  prompt: string,
  res: ServerResponse
) {
  await LLMService.stream(prompt, (token) => {
    StreamService.send(res, token);
  });

  StreamService.done(res);
}
