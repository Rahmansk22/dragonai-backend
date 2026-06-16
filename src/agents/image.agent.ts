import { ImageService } from "../services/image.service";
import { StreamService } from "../services/stream.service";
import { ServerResponse } from "http";

export async function imageAgent(
  prompt: string,
  res: ServerResponse
) {
  const url = await ImageService.generate(prompt);
  StreamService.send(res, url);
  StreamService.done(res);
}
