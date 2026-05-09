import type { Algorithm, Exercise, PracticeRecord, ProgressData, QuizQuestion, QuizRecord } from '../types';

const STORAGE_KEY = 'ml-platform-progress';
const COURSES_KEY = 'ml-platform-custom-courses';
const EXERCISES_KEY = 'ml-platform-custom-exercises';
const QUIZZES_KEY = 'ml-platform-custom-quizzes';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

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
    if (!canUseStorage()) return getDefaultData();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw) as ProgressData;
  } catch {
    return getDefaultData();
  }
}

function write(data: ProgressData): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function readList<T>(key: string): T[] {
  try {
    if (!canUseStorage()) return [];
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, value: T[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
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
    if (!canUseStorage()) return;
    localStorage.removeItem(STORAGE_KEY);
  },

  // ── Custom Course CRUD ──
  getCustomCourses(): Algorithm[] {
    return readList<Algorithm>(COURSES_KEY);
  },

  saveCustomCourse(course: Algorithm): void {
    const courses = this.getCustomCourses();
    const idx = courses.findIndex((c) => c.id === course.id);
    if (idx >= 0) {
      courses[idx] = course;
    } else {
      courses.push(course);
    }
    writeList(COURSES_KEY, courses);
  },

  deleteCustomCourse(id: string): void {
    const courses = this.getCustomCourses().filter((c) => c.id !== id);
    writeList(COURSES_KEY, courses);
  },

  getCustomExercises(): Exercise[] {
    return readList<Exercise>(EXERCISES_KEY);
  },

  saveCustomExercise(exercise: Exercise): void {
    const exercises = this.getCustomExercises();
    const index = exercises.findIndex((item) => item.id === exercise.id);
    if (index >= 0) exercises[index] = exercise;
    else exercises.push(exercise);
    writeList(EXERCISES_KEY, exercises);
  },

  deleteCustomExercise(id: string): void {
    writeList(EXERCISES_KEY, this.getCustomExercises().filter((item) => item.id !== id));
  },

  getCustomQuizQuestions(): QuizQuestion[] {
    return readList<QuizQuestion>(QUIZZES_KEY);
  },

  saveCustomQuizQuestion(question: QuizQuestion): void {
    const questions = this.getCustomQuizQuestions();
    const index = questions.findIndex((item) => item.id === question.id);
    if (index >= 0) questions[index] = question;
    else questions.push(question);
    writeList(QUIZZES_KEY, questions);
  },

  deleteCustomQuizQuestion(id: string): void {
    writeList(QUIZZES_KEY, this.getCustomQuizQuestions().filter((item) => item.id !== id));
  },
};
