import { describe, it, expect } from '@jest/globals';
import * as prisma from '../prisma';

describe('db', () => {
  it('should export prisma', () => {
    expect(prisma).toBeDefined();
  });
});
