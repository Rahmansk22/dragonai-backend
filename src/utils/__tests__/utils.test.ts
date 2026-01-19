import { describe, it, expect } from '@jest/globals';
import * as logger from '../logger';
import * as clerkAuth from '../clerk-auth';
import * as auth from '../auth';

describe('utils', () => {
  it('should export logger', () => {
    expect(logger).toBeDefined();
  });
  it('should export clerk-auth', () => {
    expect(clerkAuth).toBeDefined();
  });
  it('should export auth', () => {
    expect(auth).toBeDefined();
  });
});
