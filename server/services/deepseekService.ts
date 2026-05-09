import 'dotenv/config';

type DeepSeekMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type DeepSeekChatPayload = {
  messages: DeepSeekMessage[];
  maxTokens?: number;
  jsonMode?: boolean;
  thinking?: 'enabled' | 'disabled';
  reasoningEffort?: 'low' | 'medium' | 'high';
};

export class DeepSeekError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 500) {
    super(message);
    this.name = 'DeepSeekError';
    this.code = code;
    this.status = status;
  }
}

const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-v4-flash';
const REQUEST_TIMEOUT_MS = 20000;

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '');
}

function getDeepSeekConfig() {
  return {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: normalizeBaseUrl(process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL),
    model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
  };
}

function mapStatusToCode(status: number) {
  if (status === 401 || status === 403) return 'AUTH_FAILED';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'DEEPSEEK_SERVER_ERROR';
  return 'DEEPSEEK_REQUEST_FAILED';
}

export async function callDeepSeekChat(payload: DeepSeekChatPayload): Promise<string> {
  const { apiKey, baseUrl, model } = getDeepSeekConfig();

  if (!apiKey) {
    throw new DeepSeekError('MISSING_API_KEY', 'DEEPSEEK_API_KEY is not configured.', 401);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: payload.messages,
        stream: false,
        thinking: { type: payload.thinking || 'disabled' },
        reasoning_effort: payload.reasoningEffort,
        max_tokens: payload.maxTokens || 800,
        ...(payload.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new DeepSeekError(
        mapStatusToCode(response.status),
        `DeepSeek request failed with ${response.status}: ${detail}`,
        response.status
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== 'string' || !content.trim()) {
      throw new DeepSeekError('EMPTY_RESPONSE', 'DeepSeek returned an empty message.', 502);
    }

    return content;
  } catch (error) {
    if (error instanceof DeepSeekError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new DeepSeekError('REQUEST_TIMEOUT', 'DeepSeek request timed out.', 504);
    }
    throw new DeepSeekError(
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Unknown network error.',
      502
    );
  } finally {
    clearTimeout(timeout);
  }
}

