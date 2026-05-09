import { Router } from 'express';
import { callDeepSeekChat, DeepSeekError } from '../services/deepseekService';

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
      res.status(400).json({
        ok: false,
        mode: 'mock',
        error: {
          code: 'INVALID_REQUEST',
          message: 'messages is required.',
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
      res.status(400).json({
        ok: false,
        mode: 'mock',
        fallbackEnabled: isMockFallbackEnabled(),
        error: {
          code: 'INVALID_MESSAGE',
          message: 'Each message must include role and string content.',
        },
      });
      return;
    }

    if (maxTokens !== undefined && (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 4000)) {
      res.status(400).json({
        ok: false,
        mode: 'mock',
        fallbackEnabled: isMockFallbackEnabled(),
        error: {
          code: 'INVALID_MAX_TOKENS',
          message: 'maxTokens must be an integer between 1 and 4000.',
        },
      });
      return;
    }

    if (thinking !== undefined && thinking !== 'enabled' && thinking !== 'disabled') {
      res.status(400).json({
        ok: false,
        mode: 'mock',
        fallbackEnabled: isMockFallbackEnabled(),
        error: {
          code: 'INVALID_THINKING',
          message: 'thinking must be enabled or disabled.',
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
        : new DeepSeekError('UNKNOWN_ERROR', 'AI service failed unexpectedly.', 500);

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
