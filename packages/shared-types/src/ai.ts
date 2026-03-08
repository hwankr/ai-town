export interface AIRequest {
  prompt: string;
  tone: 'calm' | 'playful' | 'observational';
}

export interface AIResponse {
  text: string;
  source: 'mock' | 'provider';
}
