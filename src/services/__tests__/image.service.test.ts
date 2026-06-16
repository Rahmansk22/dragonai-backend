import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ImageService } from '../image.service';

describe('image.service', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        redirected: false,
        statusText: 'OK',
        type: 'basic',
        url: '',
        clone: () => ({} as Response),
        body: null,
        bodyUsed: false,
        arrayBuffer: async () => new ArrayBuffer(0),
        blob: async () => new Blob(),
        formData: async () => new FormData(),
        text: async () => '',
        json: async () => ({ data: [{ url: 'http://test.com/image.png' }] })
      } as Response)
    );
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(ImageService).toBeDefined();
  });

  it('generate returns image url', async () => {
    const url = await ImageService.generate('cat');
    expect(url).toBe('http://test.com/image.png');
  });
});