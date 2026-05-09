export interface Algorithm {
  id: string;
  name: string;
  category: 'regression' | 'classification' | 'tree';
  difficulty: '入门' | '中级' | '进阶';
  description: string;
  intro: string;
  formula: string;
  steps: string[];
  advantages: string[];
  disadvantages: string[];
  useCases: string[];
  codeExample: string;
  videoUrl: string;
  icon: string;
}

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
