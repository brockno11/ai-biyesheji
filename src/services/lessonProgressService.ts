const STORAGE_KEY = 'ml-platform-foundation-progress';

export interface FoundationProgress {
  [courseId: string]: {
    completedLessons: string[];
    checkpointScores: Record<string, number>;
    interactionCompleted: Record<string, boolean>;
    lastLessonId?: string;
  };
}

const canUseStorage = () =>
  typeof window !== 'undefined' && Boolean(window.localStorage);

function read(): FoundationProgress {
  try {
    if (!canUseStorage()) return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FoundationProgress) : {};
  } catch {
    return {};
  }
}

function write(data: FoundationProgress): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const lessonProgressService = {
  getProgress(): FoundationProgress {
    return read();
  },

  markLessonComplete(courseId: string, lessonId: string): void {
    const data = read();
    const course = data[courseId] || {
      completedLessons: [],
      checkpointScores: {},
      interactionCompleted: {},
    };
    if (!course.completedLessons.includes(lessonId)) {
      course.completedLessons.push(lessonId);
    }
    course.lastLessonId = lessonId;
    data[courseId] = course;
    write(data);
  },

  saveCheckpointScore(
    courseId: string,
    lessonId: string,
    score: number,
  ): void {
    const data = read();
    const course = data[courseId] || {
      completedLessons: [],
      checkpointScores: {},
      interactionCompleted: {},
    };
    course.checkpointScores[lessonId] = score;
    course.lastLessonId = lessonId;
    data[courseId] = course;
    write(data);
  },

  markInteractionComplete(courseId: string, lessonId: string): void {
    const data = read();
    const course = data[courseId] || {
      completedLessons: [],
      checkpointScores: {},
      interactionCompleted: {},
    };
    course.interactionCompleted[lessonId] = true;
    course.lastLessonId = lessonId;
    data[courseId] = course;
    write(data);
  },

  getCourseProgress(courseId: string): {
    total: number;
    completed: number;
  } {
    const data = read();
    const course = data[courseId];
    return {
      total: 0,
      completed: course?.completedLessons?.length ?? 0,
    };
  },

  isLessonCompleted(courseId: string, lessonId: string): boolean {
    const data = read();
    return data[courseId]?.completedLessons?.includes(lessonId) ?? false;
  },

  getLastLesson(courseId: string): string | undefined {
    const data = read();
    return data[courseId]?.lastLessonId;
  },

  reset(): void {
    if (!canUseStorage()) return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
