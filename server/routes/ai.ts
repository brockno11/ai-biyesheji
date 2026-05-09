import { Router } from 'express';
import { callDeepSeekChat, DeepSeekError } from '../services/deepseekService';

const router = Router();

const isMockFallbackEnabled = () => process.env.AI_ENABLE_MOCK_FALLBACK !== 'false';

router.post('/chat', async (req, res) => {
  try {
    const { messages, maxTokens, jsonMode, thinking, reasoningEffort } = req.body || {};

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

    const content = await callDeepSeekChat({
      messages,
      maxTokens,
      jsonMode,
      thinking,
      reasoningEffort,
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
