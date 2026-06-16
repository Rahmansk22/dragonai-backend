import { describe, it, expect } from '@jest/globals';
import * as models from '../models';
import * as env from '../env';

describe('config', () => {
  it('should export models config', () => {
    expect(models).toBeDefined();
  });
  it('should export env config', () => {
    expect(env).toBeDefined();
  });
});
