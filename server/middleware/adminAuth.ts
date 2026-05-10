import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

const SECRET = process.env.ADMIN_TOKEN_SECRET || 'change-me';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

// Simple token store (in-memory, resets on server restart)
const validTokens = new Set<string>();

function signToken(username: string): string {
  const payload = `${username}:${Date.now()}:${crypto.randomBytes(8).toString('hex')}`;
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64')}.${hmac}`;
}

function verifyToken(token: string): string | null {
  try {
    const [payloadB64, hmac] = token.split('.');
    if (!payloadB64 || !hmac) return null;
    const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const expectedHmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (hmac !== expectedHmac) return null;
    // Also check in-memory store (tokens invalidated on logout)
    if (!validTokens.has(token)) return null;
    return payload.split(':')[0]; // username
  } catch {
    return null;
  }
}

export const adminAuth = {
  login(username: string, password: string): { token: string } | null {
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return null;
    }
    const token = signToken(username);
    validTokens.add(token);
    return { token };
  },

  logout(token: string): void {
    validTokens.delete(token);
  },

  middleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        ok: false,
        error: 'UNAUTHORIZED',
        message: '请先登录管理员账号',
      });
      return;
    }
    const token = authHeader.slice(7);
    const username = verifyToken(token);
    if (!username) {
      res.status(401).json({
        ok: false,
        error: 'UNAUTHORIZED',
        message: '登录已过期，请重新登录',
      });
      return;
    }
    (req as Request & { adminUser?: string }).adminUser = username;
    next();
  },
};
