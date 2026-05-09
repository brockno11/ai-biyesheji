import type { Algorithm } from '../types';
import { aiMockService } from './aiMockService';
import {
  buildChatMessages,
  buildCodeReviewMessages,
  buildCourseDraftMessages,
  buildQuizReviewMessages,
  buildStudyPlanMessages,
} from './aiPromptService';
import type {
  AIActionType,
  AICodeReviewResult,
  AICourseDraftResult,
  AIMessage,
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
  reasoningEffort?: 'low' | 'medium' | 'high';
  maxTokens?: number;
}): Promise<string> {
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
          reasoningEffort: 'high',
          maxTokens: 1200,
        });
        return parseJsonOrThrow<AICodeReviewResult>(raw);
      },
      () => aiMockService.codeReview(context),
      'diagnoseCode'
    );
  },

  generatePracticeHint(context: AIRequestContext) {
    return chatAction('generatePracticeHint', context, () => aiMockService.diagnoseCodeText(context));
  },

  reviewQuiz(context: AIRequestContext) {
    return withFallback<AIQuizReviewResult>(
      async () => {
        const raw = await callAIProxy({
          messages: buildQuizReviewMessages(context),
          jsonMode: true,
          thinking: 'enabled',
          reasoningEffort: 'high',
          maxTokens: 1200,
        });
        return parseJsonOrThrow<AIQuizReviewResult>(raw);
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
          reasoningEffort: 'high',
          maxTokens: 1200,
        });
        return parseJsonOrThrow<AIStudyPlanResult>(raw);
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
          reasoningEffort: 'high',
          maxTokens: 1400,
        });
        return parseJsonOrThrow<AICourseDraftResult>(raw);
      },
      () => aiMockService.courseDraft(context),
      'generateCourseDraft'
    );
  },

  generateQuiz(context: AIRequestContext) {
    return chatAction('generateQuiz', context, () => aiMockService.generateQuiz(context));
  },

  summarizeLesson(context: AIRequestContext) {
    return chatAction('summarizeLesson', context, () => aiMockService.summarizeLesson(context));
  },

  lifeExample(context: AIRequestContext) {
    return chatAction('lifeExample', context, () => aiMockService.lifeExample(context));
  },

  explainVisualization(context: AIRequestContext) {
    return chatAction('explainVisualization', context, () => aiMockService.askTutor(context));
  },
};

export async function askAI(
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

export async function askAIChat(message: string, algorithm: Algorithm): Promise<string> {
  const result = await aiService.askTutor({
    algorithm,
    userQuestion: message,
    pagePosition: 'AI 助教对话面板',
  });
  return result.data;
}
