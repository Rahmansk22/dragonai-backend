import { describe, it, expect } from '@jest/globals';
import * as messageRoutes from '../message.routes';
import * as imageRoutes from '../image.routes';
import * as healthRoutes from '../health.routes';
import * as chatSessionRoutes from '../chat.session.routes';
import * as chatRoutes from '../chat.routes';
import * as authRoutes from '../auth.routes';

describe('routes', () => {
  it('should export message routes', () => {
    expect(messageRoutes).toBeDefined();
  });
  it('should export image routes', () => {
    expect(imageRoutes).toBeDefined();
  });
  it('should export health routes', () => {
    expect(healthRoutes).toBeDefined();
  });
  it('should export chat session routes', () => {
    expect(chatSessionRoutes).toBeDefined();
  });
  it('should export chat routes', () => {
    expect(chatRoutes).toBeDefined();
  });
  it('should export auth routes', () => {
    expect(authRoutes).toBeDefined();
  });
});
