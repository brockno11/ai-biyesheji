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
  | 'explainVisualization';

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
  };
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

