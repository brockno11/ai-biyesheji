export interface User {
  id: string;
  username: string;
  nickname: string;
  role: 'student' | 'admin';
  loginAt: number;
}

export type CourseType = 'foundation' | 'algorithm' | 'project';

export interface CourseConcept {
  title: string;
  description: string;
  example?: string;
}

export interface CourseAnalogy {
  title: string;
  content: string;
}

export interface CourseMisunderstanding {
  wrong: string;
  correct: string;
}

export type InteractionType =
  | "programming-vs-ml"
  | "ai-ml-dl-map"
  | "learning-type-sorter"
  | "task-type-classifier"
  | "workflow-simulator"
  | "algorithm-recommender"
  | "data-table-guide"
  | "feature-label-selector"
  | "xy-splitter"
  | "train-test-split"
  | "regression-metric-lab"
  | "classification-metric-lab"
  | "overfitting-playground"
  | "leakage-detective"
  | "hyperparameter-lab"
  | "cross-validation-simulator";

export interface LessonCheckpointQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonVideo {
  title: string;
  bv?: string;
  watchBefore: string;
  watchAfterQuestions: LessonCheckpointQuestion[];
}

export interface GuidedQuestion {
  id: string;
  prompt: string;
  scenario: string;
  options: string[];
  correctIndex: number;
  correctFeedback: string;
  wrongFeedback: string;
  explanation: string;
  followUpQuestion?: string;
  relatedAlgorithms?: string[];
}

export interface FoundationLesson {
  id: string;
  title: string;
  subtitle: string;
  order: number;
  goal: string;
  story: string;
  explanation: string;
  example: string;
  interactionType: InteractionType;
  keyTakeaway: string;
  commonMistakes: { mistake: string; correction: string }[];
  checkpointQuestions: LessonCheckpointQuestion[];
  aiPrompts: string[];
  video?: LessonVideo;
  openingQuestion?: GuidedQuestion;
  guidedQuestions?: GuidedQuestion[];
  reflectionPrompt?: string;
  relatedAlgorithms?: string[];
}

export interface Algorithm {
  id: string;
  name: string;
  type?: CourseType;
  category: 'regression' | 'classification' | 'tree' | 'clustering' | 'ensemble' | 'basic';
  difficulty: '入门' | '中级' | '进阶';
  description: string;
  intro: string;
  formula?: string;
  steps?: string[];
  advantages?: string[];
  disadvantages?: string[];
  useCases?: string[];
  evaluationGuide?: {
    metrics: string[];
    tuningTips: string[];
    overfittingRisk?: string;
    practicalAdvice?: string[];
  };
  codeExample?: string;
  videoUrl: string;
  icon: string;
  // Foundation course fields
  learningObjectives?: string[];
  concepts?: CourseConcept[];
  analogies?: CourseAnalogy[];
  commonMisunderstandings?: CourseMisunderstanding[];
  visualizationType?: string;
  hasPractice?: boolean;
  hasQuiz?: boolean;
  lessons?: FoundationLesson[];
  estimatedMinutes?: number;
  prerequisites?: string[];
  nextCourseId?: string;
  sortOrder?: number;
  guidedQuestions?: GuidedQuestion[];
}

import type { PythonRuntimeSpec } from '../services/aiTypes';

export interface Exercise {
  id: string;
  algorithmId: string;
  title: string;
  difficulty: '入门' | '中级' | '进阶';
  description: string;
  instructions: string[];
  starterCode: string;
  expectedKeywords: string[];
  checkRules: CheckRule[];
  runtimeSpec?: PythonRuntimeSpec;
  enabled?: boolean;
  source?: 'builtin' | 'custom' | 'ai';
  hints?: string[];
  solutionCode?: string;
  teachingNotes?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface QuizQuestion {
  id: string;
  algorithmId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  enabled?: boolean;
  source?: 'builtin' | 'custom' | 'ai';
  conceptId?: string;
  lessonId?: string;
  difficulty?: '入门' | '中级' | '进阶';
  createdAt?: number;
  updatedAt?: number;
}

export interface CheckRule {
  type: 'keyword' | 'structure' | 'best_practice';
  keyword?: string;
  description: string;
  points: number;
}

export interface AIReviewResult {
  score: number;
  passed: boolean;
  summary: string;
  problems: string[];
  suggestions: string[];
  nextStep: string;
  dimensions?: Array<{
    label: string;
    score: number;
    maxScore: number;
    description: string;
    status: 'good' | 'warning' | 'bad' | 'neutral';
  }>;
}

export interface PracticeRecord {
  exerciseId: string;
  algorithmId: string;
  code: string;
  score: number;
  passed: boolean;
  timestamp: number;
  feedback: string;
}

export interface QuizRecord {
  algorithmId: string;
  score: number;
  total: number;
  timestamp: number;
  answers: Record<string, number>;
}

export interface ProgressData {
  practiceRecords: PracticeRecord[];
  quizRecords: QuizRecord[];
  completedAlgorithms: string[];
  lastActive: number;
}
