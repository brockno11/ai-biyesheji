import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import aiRouter from './routes/ai';

// ── In-memory rate limiter ──────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

function rateLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const path = req.path;
  // Skip rate limiting for health and status endpoints
  if (path === '/api/health' || path === '/api/ai/status') {
    return next();
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      ok: false,
      mode: 'mock',
      error: {
        code: 'RATE_LIMITED',
        message: '请求过于频繁，请稍后再试',
      },
    });
  }

  next();
}

// Periodically purge expired entries to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60_000).unref();
// ────────────────────────────────────────────────────────────────────

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimiter);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'ml-teaching-platform-ai-proxy',
    deepSeekConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
  });
});

app.use('/api/ai', aiRouter);

// Global error handler — never expose error.stack to the client
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({
    ok: false,
    mode: 'mock',
    error: {
      code: 'SERVER_ERROR',
      message: 'AI proxy server failed unexpectedly.',
    },
  });
});

app.listen(port, () => {
  console.log(`[api] DeepSeek proxy listening on http://localhost:${port}`);
});

