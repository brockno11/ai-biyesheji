import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => mockStorage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
    removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  });
});

describe('lessonProgressService', () => {
  it('returns empty object when localStorage is empty (old users without foundationProgress)', async () => {
    // No data seeded — simulating an old user who has never visited foundation courses
    const { lessonProgressService } = await import('../services/lessonProgressService');
    const progress = lessonProgressService.getProgress();
    expect(progress).toEqual({});
    // Should NOT throw or return undefined/null — no white screen
    expect(typeof progress).toBe('object');
    expect(progress).not.toBeNull();
  });

  it('returns {} when localStorage contains corrupted JSON', async () => {
    mockStorage['ml-platform-foundation-progress'] = '{broken json!!!}';
    const { lessonProgressService } = await import('../services/lessonProgressService');
    const progress = lessonProgressService.getProgress();
    expect(progress).toEqual({});
  });

  it('persists and retrieves lesson completion', async () => {
    const { lessonProgressService } = await import('../services/lessonProgressService');

    lessonProgressService.markLessonComplete('ml-intro-workflow', 'ml-intro-1');
    lessonProgressService.markLessonComplete('ml-intro-workflow', 'ml-intro-2');

    const progress = lessonProgressService.getProgress();
    expect(progress['ml-intro-workflow']).toBeDefined();
    expect(progress['ml-intro-workflow'].completedLessons).toContain('ml-intro-1');
    expect(progress['ml-intro-workflow'].completedLessons).toContain('ml-intro-2');
    expect(progress['ml-intro-workflow'].lastLessonId).toBe('ml-intro-2');
  });

  it('does not duplicate completed lessons', async () => {
    const { lessonProgressService } = await import('../services/lessonProgressService');

    lessonProgressService.markLessonComplete('test-course', 'lesson-1');
    lessonProgressService.markLessonComplete('test-course', 'lesson-1');
    lessonProgressService.markLessonComplete('test-course', 'lesson-1');

    const progress = lessonProgressService.getProgress();
    expect(progress['test-course'].completedLessons).toEqual(['lesson-1']);
  });

  it('saveCheckpointScore persists and does not crash', async () => {
    const { lessonProgressService } = await import('../services/lessonProgressService');

    lessonProgressService.saveCheckpointScore('test-course', 'lesson-1', 85);
    const progress = lessonProgressService.getProgress();
    expect(progress['test-course'].checkpointScores['lesson-1']).toBe(85);
  });

  it('reset clears all progress', async () => {
    const { lessonProgressService } = await import('../services/lessonProgressService');

    lessonProgressService.markLessonComplete('test-course', 'lesson-1');
    lessonProgressService.reset();
    const progress = lessonProgressService.getProgress();
    expect(progress).toEqual({});
  });
});
