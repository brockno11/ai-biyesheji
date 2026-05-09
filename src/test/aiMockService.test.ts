import { describe, it, expect } from 'vitest';
import { aiMockService } from '../services/aiMockService';
import type { AIRequestContext } from '../services/aiTypes';

const context: AIRequestContext = {
  algorithm: {
    id: 'linear-regression',
    name: '线性回归',
    category: 'regression',
    difficulty: '入门',
    icon: '📈',
    intro: '线性回归是基础的回归算法',
    description: '',
    steps: ['导入数据', '训练模型'],
    advantages: [],
    disadvantages: [],
    useCases: [],
    formula: 'y = wx + b',
    codeExample: '',
    videoUrl: '',
  },
};

describe('aiMockService', () => {
  it('returns a code review result with expected shape', () => {
    const result = aiMockService.codeReview({
      ...context,
      localReview: { score: 70, passed: true, summary: '', problems: [], suggestions: [], nextStep: '' },
    });
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('scoreReason');
    expect(result).toHaveProperty('problems');
    expect(result).toHaveProperty('suggestions');
    expect(result).toHaveProperty('nextStep');
    expect(result).toHaveProperty('encouragement');
    expect(Array.isArray(result.problems)).toBe(true);
  });

  it('explains concepts for any algorithm', () => {
    const result = aiMockService.explainConcept(context);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
