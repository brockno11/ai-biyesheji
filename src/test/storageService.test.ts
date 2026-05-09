import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => mockStorage[key] || null),
    setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
    removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  });
});

describe('storageService', () => {
  it('saves and retrieves practice records', async () => {
    const { storageService } = await import('../services/storageService');

    storageService.savePracticeRecord({
      exerciseId: 'lr-ex-1',
      algorithmId: 'linear-regression',
      code: 'test code',
      score: 85,
      passed: true,
      timestamp: Date.now(),
      feedback: 'Good job',
    });

    const progress = storageService.getProgress();
    expect(progress.practiceRecords.length).toBe(1);
    expect(progress.practiceRecords[0].score).toBe(85);
    expect(progress.completedAlgorithms).toContain('linear-regression');
  });

  it('persists custom courses', async () => {
    const { storageService } = await import('../services/storageService');

    storageService.saveCustomCourse({
      id: 'custom-1',
      name: 'Test Course',
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
    videoUrl: '',
    });

    const courses = storageService.getCustomCourses();
    expect(courses.length).toBe(1);
    expect(courses[0].name).toBe('Test Course');
  });
});
