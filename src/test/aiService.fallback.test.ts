import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('aiService fallback to Mock', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_AI_ENABLE_MOCK_FALLBACK', 'true');
  });

  it('falls back to Mock when proxy is unreachable', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { aiService } = await import('../services/aiService');
    const result = await aiService.explainConcept({
      algorithm: {
        id: 'linear-regression',
        name: '线性回归',
        category: 'regression',
        difficulty: '入门',
        icon: '📈',
        intro: 'test',
        description: '',
        steps: [],
        advantages: [],
        disadvantages: [],
        useCases: [],
        formula: '',
        codeExample: '',
      },
    });

    expect(result.mode).toBe('mock');
    expect(typeof result.data).toBe('string');
    expect(result.fallbackReason).toBeDefined();
  });
});
