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

// ── Unified error codes ─────────────────────────────────────────────
export const ERROR_CODES = {
  MISSING_API_KEY: { code: 'MISSING_API_KEY', status: 401, message: '未配置 API Key' },
  AUTH_FAILED: { code: 'AUTH_FAILED', status: 401, message: 'API Key 无效' },
  RATE_LIMITED: { code: 'RATE_LIMITED', status: 429, message: '请求过于频繁' },
  DEEPSEEK_SERVER_ERROR: { code: 'DEEPSEEK_SERVER_ERROR', status: 502, message: 'AI 服务暂时不可用' },
  REQUEST_TIMEOUT: { code: 'REQUEST_TIMEOUT', status: 504, message: 'AI 请求超时' },
  NETWORK_ERROR: { code: 'NETWORK_ERROR', status: 502, message: '网络连接异常' },
  EMPTY_RESPONSE: { code: 'EMPTY_RESPONSE', status: 502, message: 'AI 返回为空' },
  INVALID_REQUEST: { code: 'INVALID_REQUEST', status: 400, message: '请求参数无效' },
  INVALID_MESSAGE: { code: 'INVALID_MESSAGE', status: 400, message: '消息格式无效' },
  INVALID_MAX_TOKENS: { code: 'INVALID_MAX_TOKENS', status: 400, message: 'maxTokens 参数无效' },
  INVALID_THINKING: { code: 'INVALID_THINKING', status: 400, message: 'thinking 参数无效' },
  UNKNOWN_ERROR: { code: 'UNKNOWN_ERROR', status: 500, message: '未知错误' },
} as const;
// ────────────────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-v4-flash';
const REQUEST_TIMEOUT_MS = 20000;

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '');
}

/**
 * Try to extract valid JSON from a raw string. If the raw string is
 * already valid JSON, return it as-is. Otherwise, try to extract JSON
 * from markdown code fences. If all else fails, wrap the response in a
 * JSON container: { "result": "..." }.
 */
export function tryParseJson(raw: string): string {
  const trimmed = raw.trim();

  // Already valid JSON object or array
  if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && (trimmed.endsWith('}') || trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {
      // Not valid JSON despite looking like it — fall through
    }
  }

  // Attempt to extract JSON from markdown code blocks
  const mdMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (mdMatch) {
    const inner = mdMatch[1].trim();
    try {
      JSON.parse(inner);
      return inner;
    } catch {
      // Not valid JSON — fall through
    }
  }

  // Wrap raw text in a JSON container
  return JSON.stringify({ result: raw });
}

function getDeepSeekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY || '';
  const baseUrl = normalizeBaseUrl(process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL);
  const model = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;

  // Config loaded from environment

  return { apiKey, baseUrl, model };
}

function mapStatusToCode(status: number) {
  if (status === 401 || status === 403) return ERROR_CODES.AUTH_FAILED.code;
  if (status === 429) return ERROR_CODES.RATE_LIMITED.code;
  if (status >= 500) return ERROR_CODES.DEEPSEEK_SERVER_ERROR.code;
  return ERROR_CODES.UNKNOWN_ERROR.code;
}
// ────────────────────────────────────────────────────────────────────

export async function callDeepSeekChat(payload: DeepSeekChatPayload): Promise<string> {
  const { apiKey, baseUrl, model } = getDeepSeekConfig();

  if (!apiKey) {
    throw new DeepSeekError(
      ERROR_CODES.MISSING_API_KEY.code,
      ERROR_CODES.MISSING_API_KEY.message,
      ERROR_CODES.MISSING_API_KEY.status,
    );
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
        thinking: { type: payload.thinking === 'enabled' ? 'enabled' : 'disabled' },
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
      throw new DeepSeekError(
        ERROR_CODES.EMPTY_RESPONSE.code,
        ERROR_CODES.EMPTY_RESPONSE.message,
        ERROR_CODES.EMPTY_RESPONSE.status,
      );
    }

    return content;
  } catch (error) {
    if (error instanceof DeepSeekError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new DeepSeekError(
        ERROR_CODES.REQUEST_TIMEOUT.code,
        ERROR_CODES.REQUEST_TIMEOUT.message,
        ERROR_CODES.REQUEST_TIMEOUT.status,
      );
    }
    throw new DeepSeekError(
      ERROR_CODES.NETWORK_ERROR.code,
      error instanceof Error ? error.message : ERROR_CODES.NETWORK_ERROR.message,
      ERROR_CODES.NETWORK_ERROR.status,
    );
  } finally {
    clearTimeout(timeout);
  }
}

