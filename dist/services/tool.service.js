"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolService = void 0;
exports.ToolService = {
    calculator(expr) {
        try {
            const safe = expr.replace(/[^0-9+\-*/().]/g, "");
            return String(Function(`return (${safe})`)());
        }
        catch {
            return "Invalid expression";
        }
    },
};
//# sourceMappingURL=tool.service.js.map