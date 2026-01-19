"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamService = void 0;
exports.StreamService = {
    init(res) {
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });
    },
    send(res, data) {
        res.write(`data: ${data}\n\n`);
    },
    done(res) {
        res.write("data: [DONE]\n\n");
        res.end();
    },
};
//# sourceMappingURL=stream.service.js.map