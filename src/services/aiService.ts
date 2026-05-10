import type { Algorithm } from '../types';
import { aiMockService } from './aiMockService';
import {
  buildChatMessages,
  buildCodeReviewMessages,
  buildCourseDraftMessages,
  buildExerciseDraftMessages,
  buildQuizDraftMessages,
  buildQuizReviewMessages,
  buildStudyPlanMessages,
} from './aiPromptService';
import {
  validateAIOutput,
  aiCodeReviewSchema,
  aiQuizReviewSchema,
  aiStudyPlanSchema,
  aiCourseDraftSchema,
  aiExerciseDraftSchema,
  aiQuizDraftSchema,
} from './validationService';
import type {
  AIActionType,
  AICodeReviewResult,
  AICourseDraftResult,
  AIExerciseDraftResult,
  AIMessage,
  AIQuizDraftResult,
  AIQuizReviewResult,
  AIRequestContext,
  AIServiceResponse,
  AIStudyPlanResult,
} from './aiTypes';

type ProxyResponse = {
  ok: boolean;
  mode: 'deepseek' | 'mock';
  content?: string;
  fallbackEnabled?: boolean;
  error?: {
    code: string;
    message: string;
  };
};

class AIProxyError extends Error {
  fallbackEnabled?: boolean;

  constructor(message: string, fallbackEnabled?: boolean) {
    super(message);
    this.name = 'AIProxyError';
    this.fallbackEnabled = fallbackEnabled;
  }
}

const AI_PROXY_URL = '/api/ai/chat';

function fallbackEnabled() {
  const value = import.meta.env?.VITE_AI_ENABLE_MOCK_FALLBACK;
  return value !== 'false';
}

async function callAIProxy(options: {
  messages: AIMessage[];
  jsonMode?: boolean;
  thinking?: 'enabled' | 'disabled';
  maxTokens?: number;
}): Promise<string> {
  // Client timeout (22s) > Server timeout (20s) to ensure graceful fallback:
  // the server will timeout first and return a structured error, so the
  // frontend never races into an AbortError before the server responds.
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 22000);

  try {
    const response = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(options),
    });

    const data = (await response.json().catch(() => null)) as ProxyResponse | null;

    if (!response.ok || !data?.ok || !data.content) {
      throw new AIProxyError(
        data?.error?.message || `AI proxy failed with ${response.status}`,
        data?.fallbackEnabled
      );
    }

    return data.content;
  } finally {
    // Always clear the timer so it doesn't fire after the request completes
    window.clearTimeout(timeout);
  }
}

function extractJsonObject(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

function parseJsonOrThrow<T>(raw: string): T {
  return JSON.parse(extractJsonObject(raw)) as T;
}

async function withFallback<T>(
  realCall: () => Promise<T>,
  mockCall: () => T,
  label: string
): Promise<AIServiceResponse<T>> {
  try {
    const data = await realCall();
    return { mode: 'deepseek', data };
  } catch (error) {
    console.error(`[aiService] ${label} failed, using Mock fallback:`, error);
    if (!fallbackEnabled()) throw error;
    if (error instanceof AIProxyError && error.fallbackEnabled === false) throw error;
    return {
      mode: 'mock',
      data: mockCall(),
      fallbackReason: error instanceof Error ? error.message : 'AI 请求失败',
    };
  }
}

function chatAction(
  actionType: AIActionType,
  context: AIRequestContext,
  mockCall: () => string
) {
  return withFallback<string>(
    () =>
      callAIProxy({
        messages: buildChatMessages(actionType, context),
        thinking: 'disabled',
        maxTokens: 800,
      }),
    mockCall,
    actionType
  );
}

export const aiService = {
  askTutor(context: AIRequestContext) {
    return chatAction('askTutor', context, () => aiMockService.askTutor(context));
  },

  explainConcept(context: AIRequestContext) {
    return chatAction('explainConcept', context, () => aiMockService.explainConcept(context));
  },

  diagnoseCode(context: AIRequestContext) {
    return withFallback<AICodeReviewResult>(
      async () => {
        const raw = await callAIProxy({
          messages: buildCodeReviewMessages(context),
          jsonMode: true,
          thinking: 'enabled',
          maxTokens: 1200,
        });
        const parsed = parseJsonOrThrow<unknown>(raw);
        return validateAIOutput(aiCodeReviewSchema, parsed, '代码诊断');
      },
      () => aiMockService.codeReview(context),
      'diagnoseCode'
    );
  },

  generatePracticeHint(context: AIRequestContext) {
    return chatAction('generatePracticeHint', context, () => aiMockService.suggestStudy(context));
  },

  reviewQuiz(context: AIRequestContext) {
    return withFallback<AIQuizReviewResult>(
      async () => {
        const raw = await callAIProxy({
          messages: buildQuizReviewMessages(context),
          jsonMode: true,
          thinking: 'enabled',
          maxTokens: 1200,
        });
        const parsed = parseJsonOrThrow<unknown>(raw);
        return validateAIOutput(aiQuizReviewSchema, parsed, '错题讲解');
      },
      () => aiMockService.quizReview(context),
      'reviewQuiz'
    );
  },

  generateStudyPlan(context: AIRequestContext) {
    return withFallback<AIStudyPlanResult>(
      async () => {
        const raw = await callAIProxy({
          messages: buildStudyPlanMessages(context),
          jsonMode: true,
          thinking: 'enabled',
          maxTokens: 1200,
        });
        const parsed = parseJsonOrThrow<unknown>(raw);
        return validateAIOutput(aiStudyPlanSchema, parsed, '学习计划');
      },
      () => aiMockService.studyPlan(context),
      'generateStudyPlan'
    );
  },

  generateCourseDraft(context: AIRequestContext) {
    return withFallback<AICourseDraftResult>(
      async () => {
        const raw = await callAIProxy({
          messages: buildCourseDraftMessages(context),
          jsonMode: true,
          thinking: 'enabled',
          maxTokens: 1400,
        });
        const parsed = parseJsonOrThrow<unknown>(raw);
        return validateAIOutput(aiCourseDraftSchema, parsed, '课程草稿');
      },
      () => aiMockService.courseDraft(context),
      'generateCourseDraft'
    );
  },

  generateQuiz(context: AIRequestContext) {
    return chatAction('generateQuiz', context, () => aiMockService.generateQuiz(context));
  },

  generateExerciseDraft(context: AIRequestContext) {
    return withFallback<AIExerciseDraftResult>(
      async () => {
        const raw = await callAIProxy({
          messages: buildExerciseDraftMessages(context),
          jsonMode: true,
          thinking: 'enabled',
          maxTokens: 1200,
        });
        const parsed = parseJsonOrThrow<unknown>(raw);
        return validateAIOutput(aiExerciseDraftSchema, parsed, '练习题草稿');
      },
      () => aiMockService.exerciseDraft(context),
      'generateExerciseDraft'
    );
  },

  generateQuizDraft(context: AIRequestContext) {
    return withFallback<AIQuizDraftResult>(
      async () => {
        const raw = await callAIProxy({
          messages: buildQuizDraftMessages(context),
          jsonMode: true,
          thinking: 'enabled',
          maxTokens: 1000,
        });
        const parsed = parseJsonOrThrow<unknown>(raw);
        return validateAIOutput(aiQuizDraftSchema, parsed, '测验题草稿');
      },
      () => aiMockService.quizDraft(context),
      'generateQuizDraft'
    );
  },

  summarizeLesson(context: AIRequestContext) {
    return chatAction('summarizeLesson', context, () => aiMockService.summarizeLesson(context));
  },

  lifeExample(context: AIRequestContext) {
    return chatAction('lifeExample', context, () => aiMockService.lifeExample(context));
  },

  explainVisualization(context: AIRequestContext) {
    return chatAction('explainVisualization', context, () => aiMockService.explainVisualization(context));
  },
};

async function askAI(
  type: 'explain' | 'diagnose' | 'suggest' | 'quiz',
  algorithm: Algorithm,
  context?: string
): Promise<string> {
  const baseContext: AIRequestContext = {
    algorithm,
    userQuestion: context,
    pagePosition: '兼容旧版 askAI 调用',
  };
  const result =
    type === 'explain'
      ? await aiService.explainConcept(baseContext)
      : type === 'suggest'
        ? await aiService.askTutor({ ...baseContext, userQuestion: '请给我学习建议' })
        : type === 'quiz'
          ? await aiService.generateQuiz(baseContext)
          : await aiService.askTutor({ ...baseContext, userQuestion: context || '请诊断代码' });
  return result.data;
}

async function askAIChat(message: string, algorithm: Algorithm): Promise<string> {
  const result = await aiService.askTutor({
    algorithm,
    userQuestion: message,
    pagePosition: 'AI 助教对话面板',
  });
  return result.data;
}
