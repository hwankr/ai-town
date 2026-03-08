import type { AIRequest, AIResponse } from '@ai-town/shared-types';

export interface AIProvider {
  complete(request: AIRequest): Promise<AIResponse>;
}

export class MockAIProvider implements AIProvider {
  async complete(request: AIRequest): Promise<AIResponse> {
    return {
      text: `[mock:${request.tone}] ${request.prompt}`,
      source: 'mock'
    };
  }
}

export function createMockAIProvider(): AIProvider {
  return new MockAIProvider();
}
