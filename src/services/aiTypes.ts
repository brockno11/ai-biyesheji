import type { AIReviewResult, Algorithm, Exercise, QuizQuestion } from '../types';

export type AIMode = 'deepseek' | 'mock';

export type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AIActionType =
  | 'askTutor'
  | 'explainConcept'
  | 'diagnoseCode'
  | 'generatePracticeHint'
  | 'reviewQuiz'
  | 'generateStudyPlan'
  | 'generateCourseDraft'
  | 'generateQuiz'
  | 'summarizeLesson'
  | 'lifeExample'
  | 'explainVisualization'
  | 'generateExerciseDraft'
  | 'generateQuizDraft';

export type AIRequestContext = {
  actionType?: AIActionType;
  algorithm?: Algorithm;
  pagePosition?: string;
  userQuestion?: string;
  chatHistory?: AIMessage[];
  exercise?: Exercise;
  userCode?: string;
  localReview?: AIReviewResult;
  missingKeywords?: string[];
  runtimeResult?: PythonRunResult;
  quizQuestions?: QuizQuestion[];
  quizAnswers?: Record<number, number>;
  quizScore?: number;
  completedAlgorithms?: string[];
  courseStats?: Array<{
    algorithmId: string;
    algorithmName: string;
    practiceCount: number;
    bestScore: number;
    quizScore?: number;
    completed: boolean;
  }>;
  recentActivity?: string;
  unfinishedCourses?: string[];
  visualState?: Record<string, string | number | boolean>;
  courseDraftInput?: {
    name: string;
    difficulty: string;
    category: string;
    keywords: string;
    type?: string;
    requirements?: string;
  };
  exerciseDraftInput?: {
    courseId: string;
    courseName: string;
    difficulty: string;
    requirements: string;
  };
  quizDraftInput?: {
    courseId: string;
    courseName: string;
    difficulty: string;
    requirements: string;
    lessonId?: string;
    conceptId?: string;
  };
};

export type PythonRuntimeSpec = {
  packages?: string[];         // e.g. ['numpy', 'scikit-learn']
  setupCode?: string;          // imports, data prep
  testCode?: string;           // verification script
  expectedVariables?: string[];// variables to extract from globals
  timeoutMs?: number;          // default 15000
};

export type PythonRunStatus = 'success' | 'error' | 'unsupported';

export type PythonRuntimePhase =
  | 'booting'
  | 'loading-packages'
  | 'executing'
  | 'testing'
  | 'complete'
  | 'failed'
  | 'unsupported';

export type PythonRuntimeEvent = {
  phase: PythonRuntimePhase;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
};

export type PythonRunResult = {
  supported: boolean;
  status: PythonRunStatus;
  passed: boolean;
  output: string;
  error?: string;
  durationMs: number;
  tests: string[];
  details?: string[];
  events?: PythonRuntimeEvent[];
  packageSource?: string;
};

export type AIServiceResponse<T> = {
  mode: AIMode;
  data: T;
  fallbackReason?: string;
};

export type AICodeReviewResult = {
  summary: string;
  scoreReason: string;
  problems: string[];
  suggestions: string[];
  nextStep: string;
  encouragement: string;
};

export type AIQuizReviewResult = {
  weakPoints: string[];
  wrongQuestionAnalysis: Array<{
    question: string;
    whyWrong: string;
    correctThinking: string;
  }>;
  reviewAdvice: string;
  extraQuestion: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  };
};

export type AIStudyPlanResult = {
  summary: string;
  nextAlgorithm: string;
  reason: string;
  reviewList: string[];
  dailyPlan: string[];
};

export type AICourseDraftResult = {
  name: string;
  intro: string;
  description: string;
  steps: string[];
  pros: string[];
  cons: string[];
  useCases: string[];
  formula: string;
  codeExample: string;
  quizQuestions: unknown[];
  practiceExercise: Record<string, unknown>;
};

export type AIExerciseDraftResult = {
  title: string;
  description: string;
  difficulty: '入门' | '中级' | '进阶';
  instructions: string[];
  starterCode: string;
  expectedKeywords: string[];
  hints: string[];
  teachingNotes: string;
  runtimeSpec?: {
    packages?: string[];
    testCode?: string;
  };
};

export type AIQuizDraftResult = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: '入门' | '中级' | '进阶';
  conceptId?: string;
  lessonId?: string;
};
