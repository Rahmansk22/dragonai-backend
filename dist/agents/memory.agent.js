"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryAgent = void 0;
class MemoryAgent {
    constructor() {
        this.memory = [];
    }
    add(item) { this.memory.push(item); }
    query(_q) { return this.memory; }
}
exports.MemoryAgent = MemoryAgent;
//# sourceMappingURL=memory.agent.js.map