import type { Algorithm, PracticeRecord, ProgressData, QuizRecord } from '../types';

const STORAGE_KEY = 'ml-platform-progress';
const COURSES_KEY = 'ml-platform-custom-courses';

function getDefaultData(): ProgressData {
  return {
    practiceRecords: [],
    quizRecords: [],
    completedAlgorithms: [],
    lastActive: Date.now(),
  };
}

function read(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw) as ProgressData;
  } catch {
    return getDefaultData();
  }
}

function write(data: ProgressData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const storageService = {
  getProgress(): ProgressData {
    return read();
  },

  savePracticeRecord(record: PracticeRecord): void {
    const data = read();
    data.lastActive = Date.now();
    const existing = data.practiceRecords.findIndex(
      (r) => r.exerciseId === record.exerciseId
    );
    if (existing >= 0) {
      data.practiceRecords[existing] = record;
    } else {
      data.practiceRecords.push(record);
    }

    // Mark algorithm as "in progress" if practice was attempted
    if (!data.completedAlgorithms.includes(record.algorithmId)) {
      if (record.passed) {
        data.completedAlgorithms.push(record.algorithmId);
      }
    }

    write(data);
  },

  saveQuizRecord(record: QuizRecord): void {
    const data = read();
    data.lastActive = Date.now();
    const existing = data.quizRecords.findIndex(
      (r) => r.algorithmId === record.algorithmId
    );
    if (existing >= 0) {
      data.quizRecords[existing] = record;
    } else {
      data.quizRecords.push(record);
    }
    write(data);
  },

  getBestScore(algorithmId: string): number {
    const data = read();
    const records = data.practiceRecords.filter(
      (r) => r.algorithmId === algorithmId
    );
    if (records.length === 0) return 0;
    return Math.max(...records.map((r) => r.score));
  },

  getPracticeCount(algorithmId: string): number {
    const data = read();
    return data.practiceRecords.filter((r) => r.algorithmId === algorithmId)
      .length;
  },

  isCompleted(algorithmId: string): boolean {
    const data = read();
    return data.completedAlgorithms.includes(algorithmId);
  },

  getLatestFeedback(algorithmId: string): string | null {
    const data = read();
    const records = data.practiceRecords
      .filter((r) => r.algorithmId === algorithmId)
      .sort((a, b) => b.timestamp - a.timestamp);
    if (records.length === 0) return null;
    return records[0].feedback;
  },

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  // ── Custom Course CRUD ──
  getCustomCourses(): Algorithm[] {
    try {
      const raw = localStorage.getItem(COURSES_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Algorithm[];
    } catch {
      return [];
    }
  },

  saveCustomCourse(course: Algorithm): void {
    const courses = this.getCustomCourses();
    const idx = courses.findIndex((c) => c.id === course.id);
    if (idx >= 0) {
      courses[idx] = course;
    } else {
      courses.push(course);
    }
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  },

  deleteCustomCourse(id: string): void {
    const courses = this.getCustomCourses().filter((c) => c.id !== id);
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  },
};
