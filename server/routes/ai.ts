import { Router } from 'express';
import { callDeepSeekChat, DeepSeekError, ERROR_CODES } from '../services/deepseekService';

const router = Router();

const isMockFallbackEnabled = () => process.env.AI_ENABLE_MOCK_FALLBACK !== 'false';

router.get('/status', (_req, res) => {
  res.json({
    ok: true,
    provider: 'deepseek',
    apiKeyConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
    mockFallbackEnabled: isMockFallbackEnabled(),
  });
});

router.post('/chat', async (req, res) => {
  try {
    const { messages, maxTokens, jsonMode, thinking } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(ERROR_CODES.INVALID_REQUEST.status).json({
        ok: false,
        mode: 'mock',
        error: {
          code: ERROR_CODES.INVALID_REQUEST.code,
          message: ERROR_CODES.INVALID_REQUEST.message,
        },
      });
      return;
    }

    const invalidMessage = messages.some(
      (message) =>
        !message ||
        !['system', 'user', 'assistant'].includes(message.role) ||
        typeof message.content !== 'string'
    );

    if (invalidMessage) {
      res.status(ERROR_CODES.INVALID_MESSAGE.status).json({
        ok: false,
        mode: 'mock',
        fallbackEnabled: isMockFallbackEnabled(),
        error: {
          code: ERROR_CODES.INVALID_MESSAGE.code,
          message: ERROR_CODES.INVALID_MESSAGE.message,
        },
      });
      return;
    }

    if (maxTokens !== undefined && (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 4000)) {
      res.status(ERROR_CODES.INVALID_MAX_TOKENS.status).json({
        ok: false,
        mode: 'mock',
        fallbackEnabled: isMockFallbackEnabled(),
        error: {
          code: ERROR_CODES.INVALID_MAX_TOKENS.code,
          message: ERROR_CODES.INVALID_MAX_TOKENS.message,
        },
      });
      return;
    }

    if (thinking !== undefined && thinking !== 'enabled' && thinking !== 'disabled') {
      res.status(ERROR_CODES.INVALID_THINKING.status).json({
        ok: false,
        mode: 'mock',
        fallbackEnabled: isMockFallbackEnabled(),
        error: {
          code: ERROR_CODES.INVALID_THINKING.code,
          message: ERROR_CODES.INVALID_THINKING.message,
        },
      });
      return;
    }

    const content = await callDeepSeekChat({
      messages,
      maxTokens,
      jsonMode,
      thinking,
    });

    res.json({
      ok: true,
      mode: 'deepseek',
      content,
    });
  } catch (error) {
    const normalized =
      error instanceof DeepSeekError
        ? error
        : new DeepSeekError(
            ERROR_CODES.UNKNOWN_ERROR.code,
            ERROR_CODES.UNKNOWN_ERROR.message,
            ERROR_CODES.UNKNOWN_ERROR.status,
          );

    console.error('[ai-route] DeepSeek fallback:', {
      code: normalized.code,
      message: normalized.message,
      status: normalized.status,
    });

    res.status(normalized.status >= 500 ? 502 : normalized.status).json({
      ok: false,
      mode: 'mock',
      fallbackEnabled: isMockFallbackEnabled(),
      error: {
        code: normalized.code,
        message: normalized.message,
      },
    });
  }
});

export default router;
