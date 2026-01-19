import { describe, it, expect } from '@jest/globals';
import * as llmService from '../llm.service';

describe('llm.service', () => {
  it('should be defined', () => {
    expect(llmService).toBeDefined();
  });
});