import { z } from 'zod';

const CATEGORIES = ['regression', 'classification', 'tree', 'clustering'] as const;
const DIFFICULTIES = ['入门', '中级', '进阶'] as const;
const RULE_TYPES = ['keyword', 'structure', 'best_practice'] as const;

export const checkRuleSchema = z.object({
  type: z.enum(RULE_TYPES),
  keyword: z.string().optional(),
  points: z.number().min(1, '分值至少为 1').max(100, '分值最大为 100'),
  description: z.string().min(1, '规则描述不能为空'),
});

export const exerciseSchema = z.object({
  id: z.string().min(1, '练习 ID 不能为空'),
  algorithmId: z.string().min(1, '必须关联一个算法'),
  title: z.string().min(1, '练习标题不能为空'),
  difficulty: z.enum(DIFFICULTIES),
  description: z.string().min(1, '练习描述不能为空'),
  instructions: z.array(z.string()),
  starterCode: z.string().min(1, '初始代码不能为空'),
  expectedKeywords: z.array(z.string()),
  checkRules: z.array(checkRuleSchema).min(1, '至少需要 1 条检查规则'),
});

export const quizQuestionSchema = z.object({
  id: z.string().min(1, '题目 ID 不能为空'),
  algorithmId: z.string().min(1, '必须关联一个算法'),
  question: z.string().min(1, '题目不能为空'),
  options: z.array(z.string()).length(4, '必须恰好 4 个选项'),
  correctIndex: z.number().int().min(0, '最小为 0').max(3, '最大为 3'),
  explanation: z.string().min(1, '解析不能为空'),
});

const CATEGORIES_ALL = ['regression', 'classification', 'tree', 'clustering', 'basic', 'ensemble'] as const;

export const algorithmSchema = z.object({
  id: z.string().min(1, '算法 ID 不能为空'),
  name: z.string().min(1, '算法名称不能为空'),
  type: z.enum(['foundation', 'algorithm', 'project']).optional(),
  category: z.enum(CATEGORIES_ALL),
  difficulty: z.enum(DIFFICULTIES),
  icon: z.string().min(1, '图标不能为空'),
  intro: z.string().min(1, '简介不能为空'),
  description: z.string(),
  steps: z.array(z.string()).optional().default([]),
  advantages: z.array(z.string()).optional().default([]),
  disadvantages: z.array(z.string()).optional().default([]),
  useCases: z.array(z.string()).optional().default([]),
  formula: z.string().optional().default(''),
  codeExample: z.string().optional().default(''),
  videoUrl: z.string().optional().default(''),
});

export const quizSetSchema = z.array(quizQuestionSchema).min(1, '至少需要 1 道题');

export type AlgorithmValidation = z.infer<typeof algorithmSchema>;
export type ExerciseValidation = z.infer<typeof exerciseSchema>;
export type QuizQuestionValidation = z.infer<typeof quizQuestionSchema>;

export function validateAlgorithm(data: unknown) {
  return algorithmSchema.safeParse(data);
}

export function validateExercise(data: unknown) {
  return exerciseSchema.safeParse(data);
}

export function validateQuizQuestion(data: unknown) {
  return quizQuestionSchema.safeParse(data);
}

export function validateQuizSet(data: unknown) {
  return quizSetSchema.safeParse(data);
}

export function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

/* ── AI Output Validation Schemas ─────────────────────────────── */

export const aiCodeReviewSchema = z.object({
  summary: z.string().min(1),
  scoreReason: z.string().min(1),
  problems: z.array(z.string()),
  suggestions: z.array(z.string()),
  nextStep: z.string().min(1),
  encouragement: z.string().min(1),
});

export const aiQuizReviewSchema = z.object({
  weakPoints: z.array(z.string()),
  wrongQuestionAnalysis: z.array(z.object({
    question: z.string(),
    whyWrong: z.string(),
    correctThinking: z.string(),
  })),
  reviewAdvice: z.string(),
  extraQuestion: z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    answer: z.number().int().min(0).max(3),
    explanation: z.string(),
  }),
});

export const aiStudyPlanSchema = z.object({
  summary: z.string().min(1),
  nextAlgorithm: z.string().min(1),
  reason: z.string().min(1),
  reviewList: z.array(z.string()),
  dailyPlan: z.array(z.string()),
});

export const aiCourseDraftSchema = z.object({
  name: z.string().min(1),
  intro: z.string().min(1),
  description: z.string(),
  steps: z.array(z.string()),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  useCases: z.array(z.string()),
  formula: z.string(),
  codeExample: z.string(),
  quizQuestions: z.array(z.unknown()).default([]),
  practiceExercise: z.record(z.string(), z.unknown()).default({}),
});

/** Validate and return parsed AI output; on failure, throws with details for fallback */
export function validateAIOutput<T>(schema: z.ZodSchema<T>, raw: unknown, label: string): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`[AI Validation] ${label} 输出格式异常: ${issues}`);
  }
  return result.data;
}

/** Return a flat Record<fieldPath, errorMessage> for form field-level display. */
export function flattenZodErrors<T>(result: { success: true; data: T } | { success: false; error: z.ZodError }): Record<string, string> {
  if (result.success) return {};
  const flat: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.');
    if (!flat[key]) {
      flat[key] = issue.message;
    }
  }
  return flat;
}
