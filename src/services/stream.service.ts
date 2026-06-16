import { ServerResponse } from "http";

export const StreamService = {
  init(res: ServerResponse) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
  },

  send(res: ServerResponse, data: string) {
    res.write(`data: ${data}\n\n`);
  },

  done(res: ServerResponse) {
    res.write("data: [DONE]\n\n");
    res.end();
  },
};
