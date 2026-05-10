import type { User } from '../types';

const STORAGE_KEY = 'ml-platform-auth';

interface StoredAuth {
  users: (User & { password: string })[];
  currentUserId: string | null;
}

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

function read(): StoredAuth {
  if (!canUseStorage()) return { users: [], currentUserId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { users: [], currentUserId: null };
    const parsed = JSON.parse(raw);
    return { users: parsed.users || [], currentUserId: parsed.currentUserId || null };
  } catch {
    return { users: [], currentUserId: null };
  }
}

function write(data: StoredAuth): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function ensureDemoAccounts(): void {
  const data = read();
  const hasStudent = data.users.some((u) => u.username === 'student');
  const hasAdmin = data.users.some((u) => u.username === 'admin');

  if (!hasStudent) {
    data.users.push({
      id: 'demo-student',
      username: 'student',
      password: '123456',
      nickname: '小明',
      role: 'student',
      loginAt: 0,
    });
  }
  if (!hasAdmin) {
    data.users.push({
      id: 'demo-admin',
      username: 'admin',
      password: '123456',
      nickname: '管理员',
      role: 'admin',
      loginAt: 0,
    });
  }
  write(data);
}

ensureDemoAccounts();

export const authService = {
  getCurrentUser(): User | null {
    const { users, currentUserId } = read();
    if (!currentUserId) return null;
    const found = users.find((u) => u.id === currentUserId);
    if (!found) return null;
    const { password: _, ...user } = found;
    return user;
  },

  login(username: string, password: string): User {
    const data = read();
    const found = data.users.find(
      (u) => u.username === username && u.password === password,
    );
    if (!found) {
      throw new Error('用户名或密码错误');
    }
    found.loginAt = Date.now();
    data.currentUserId = found.id;
    write(data);
    const { password: _, ...user } = found;
    return user;
  },

  register(username: string, password: string, nickname: string): User {
    const data = read();
    if (data.users.some((u) => u.username === username)) {
      throw new Error('用户名已存在');
    }
    const newEntry = {
      id: 'user-' + Date.now(),
      username,
      password,
      nickname,
      role: 'student' as const,
      loginAt: Date.now(),
    };
    data.users.push(newEntry);
    data.currentUserId = newEntry.id;
    write(data);
    const { password: _, ...user } = newEntry;
    return user;
  },

  logout(): void {
    const data = read();
    data.currentUserId = null;
    write(data);
  },

  isAuthenticated(): boolean {
    return authService.getCurrentUser() !== null;
  },

  isAdmin(): boolean {
    return authService.getCurrentUser()?.role === 'admin';
  },
};
