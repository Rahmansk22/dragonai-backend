"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const image_service_1 = require("../image.service");
(0, globals_1.describe)('image.service', () => {
    (0, globals_1.beforeEach)(() => {
        global.fetch = globals_1.jest.fn(() => Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers(),
            redirected: false,
            statusText: 'OK',
            type: 'basic',
            url: '',
            clone: () => ({}),
            body: null,
            bodyUsed: false,
            arrayBuffer: async () => new ArrayBuffer(0),
            blob: async () => new Blob(),
            formData: async () => new FormData(),
            text: async () => '',
            json: async () => ({ data: [{ url: 'http://test.com/image.png' }] })
        }));
    });
    (0, globals_1.afterEach)(() => {
        globals_1.jest.resetAllMocks();
    });
    (0, globals_1.it)('should be defined', () => {
        (0, globals_1.expect)(image_service_1.ImageService).toBeDefined();
    });
    (0, globals_1.it)('generate returns image url', async () => {
        const url = await image_service_1.ImageService.generate('cat');
        (0, globals_1.expect)(url).toBe('http://test.com/image.png');
    });
});
//# sourceMappingURL=image.service.test.js.map