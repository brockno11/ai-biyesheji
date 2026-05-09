import { describe, it, expect } from 'vitest';
import { checkCode, getMissingKeywords } from '../services/codeCheckService';
import type { Exercise } from '../types';

const mockExercise: Exercise = {
  id: 'test-ex-1',
  algorithmId: 'linear-regression',
  title: '测试练习',
  difficulty: '入门' as const,
  description: '测试用练习',
  instructions: [],
  starterCode: '',
  expectedKeywords: ['LinearRegression', 'fit', 'predict'],
  checkRules: [
    { type: 'keyword' as const, keyword: 'LinearRegression', points: 30, description: '导入模型' },
    { type: 'keyword' as const, keyword: 'fit', points: 30, description: '训练' },
    { type: 'keyword' as const, keyword: 'predict', points: 40, description: '预测' },
  ],
};

describe('checkCode', () => {
  it('returns full score when all keywords present', () => {
    const code = 'from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X, y)\npred = model.predict(X_test)';
    const result = checkCode(mockExercise, code);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('deducts score when TODOs are present', () => {
    const code = '# TODO: import model\nLinearRegression\n# TODO: train\nfit\n# TODO: predict\npredict';
    const result = checkCode(mockExercise, code);
    const problems = result.problems.join('');
    expect(problems).toContain('TODO');
  });
});

describe('getMissingKeywords', () => {
  it('returns keywords not in code', () => {
    const code = 'LinearRegression()\nmodel.fit(X, y)';
    const missing = getMissingKeywords(mockExercise, code);
    expect(missing).toContain('predict');
    expect(missing).not.toContain('LinearRegression');
    expect(missing).not.toContain('fit');
  });
});
