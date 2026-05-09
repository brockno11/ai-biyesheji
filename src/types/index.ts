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
  | "leakage-detective";

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
}

export interface Algorithm {
  id: string;
  name: string;
  type?: CourseType;
  category: 'regression' | 'classification' | 'tree' | 'clustering' | 'basic';
  difficulty: '入门' | '中级' | '进阶';
  description: string;
  intro: string;
  formula?: string;
  steps?: string[];
  advantages?: string[];
  disadvantages?: string[];
  useCases?: string[];
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

export interface QuizQuestion {
  id: string;
  algorithmId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
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
