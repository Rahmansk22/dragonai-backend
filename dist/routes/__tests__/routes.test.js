"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const messageRoutes = __importStar(require("../message.routes"));
const imageRoutes = __importStar(require("../image.routes"));
const healthRoutes = __importStar(require("../health.routes"));
const chatSessionRoutes = __importStar(require("../chat.session.routes"));
const chatRoutes = __importStar(require("../chat.routes"));
const authRoutes = __importStar(require("../auth.routes"));
(0, globals_1.describe)('routes', () => {
    (0, globals_1.it)('should export message routes', () => {
        (0, globals_1.expect)(messageRoutes).toBeDefined();
    });
    (0, globals_1.it)('should export image routes', () => {
        (0, globals_1.expect)(imageRoutes).toBeDefined();
    });
    (0, globals_1.it)('should export health routes', () => {
        (0, globals_1.expect)(healthRoutes).toBeDefined();
    });
    (0, globals_1.it)('should export chat session routes', () => {
        (0, globals_1.expect)(chatSessionRoutes).toBeDefined();
    });
    (0, globals_1.it)('should export chat routes', () => {
        (0, globals_1.expect)(chatRoutes).toBeDefined();
    });
    (0, globals_1.it)('should export auth routes', () => {
        (0, globals_1.expect)(authRoutes).toBeDefined();
    });
});
//# sourceMappingURL=routes.test.js.map