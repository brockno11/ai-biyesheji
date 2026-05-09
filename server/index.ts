import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import aiRouter from './routes/ai';

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'ml-teaching-platform-ai-proxy',
    deepSeekConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
  });
});

app.use('/api/ai', aiRouter);

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

