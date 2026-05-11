const ADMIN_BASE = '/api/admin';
const AUTH_BASE = '/api/admin/auth';

interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

let cachedToken: string | null = null;

function getToken(): string | null {
  if (cachedToken) return cachedToken;
  try {
    cachedToken = localStorage.getItem('ml-admin-token');
  } catch {
    cachedToken = null;
  }
  return cachedToken;
}

function setToken(token: string | null): void {
  cachedToken = token;
  try {
    if (token) {
      localStorage.setItem('ml-admin-token', token);
    } else {
      localStorage.removeItem('ml-admin-token');
    }
  } catch {
    // ignore
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${ADMIN_BASE}${path}`, {
      ...options,
      headers,
    });
    const json = await res.json();
    return json as ApiResponse<T>;
  } catch {
    return {
      ok: false,
      error: 'BACKEND_OFFLINE',
      message: '后端管理服务不可用，请确认服务器已启动',
    };
  }
}

export const adminApiService = {
  isBackendOnline(): Promise<boolean> {
    return fetch('/api/admin/health')
      .then((r) => r.ok)
      .catch(() => false);
  },

  // ── Auth ────────────────────────────────────────────────────────────

  async loginAdmin(username: string, password: string) {
    const res = await request<{ token: string; user: { username: string; role: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ username, password }) },
    );
    if (res.ok && res.data?.token) {
      setToken(res.data.token);
    }
    return res;
  },

  async getAdminMe() {
    return request<{ username: string; role: string }>('/auth/me');
  },

  async logoutAdmin() {
    await request('/auth/logout', { method: 'POST' });
    setToken(null);
  },

  isLoggedIn(): boolean {
    return getToken() !== null;
  },

  // ── Stats ───────────────────────────────────────────────────────────

  getAdminStats() {
    return request<Record<string, number>>('/stats');
  },

  // ── Courses ─────────────────────────────────────────────────────────

  getAdminCourses() {
    return request<{
      customCourses: Record<string, unknown>[];
      courseOverrides: Record<string, unknown>[];
      disabledCourseIds: string[];
    }>('/courses');
  },

  createAdminCourse(course: Record<string, unknown>) {
    return request('/courses', { method: 'POST', body: JSON.stringify(course) });
  },

  updateAdminCourse(id: string, updates: Record<string, unknown>) {
    return request(`/courses/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(updates) });
  },

  deleteAdminCourse(id: string) {
    return request(`/courses/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  disableAdminCourse(id: string) {
    return request(`/courses/${encodeURIComponent(id)}/disable`, { method: 'PATCH' });
  },

  enableAdminCourse(id: string) {
    return request(`/courses/${encodeURIComponent(id)}/enable`, { method: 'PATCH' });
  },

  // ── Exercises ───────────────────────────────────────────────────────

  getAdminExercises() {
    return request<{
      customExercises: Record<string, unknown>[];
      exerciseOverrides: Record<string, unknown>[];
      disabledExerciseIds: string[];
    }>('/exercises');
  },

  createAdminExercise(exercise: Record<string, unknown>) {
    return request('/exercises', { method: 'POST', body: JSON.stringify(exercise) });
  },

  updateAdminExercise(id: string, updates: Record<string, unknown>) {
    return request(`/exercises/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(updates) });
  },

  deleteAdminExercise(id: string) {
    return request(`/exercises/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  disableAdminExercise(id: string) {
    return request(`/exercises/${encodeURIComponent(id)}/disable`, { method: 'PATCH' });
  },

  enableAdminExercise(id: string) {
    return request(`/exercises/${encodeURIComponent(id)}/enable`, { method: 'PATCH' });
  },

  // ── Quizzes ─────────────────────────────────────────────────────────

  getAdminQuizzes() {
    return request<{
      customQuizzes: Record<string, unknown>[];
      quizOverrides: Record<string, unknown>[];
      disabledQuizIds: string[];
    }>('/quizzes');
  },

  createAdminQuiz(quiz: Record<string, unknown>) {
    return request('/quizzes', { method: 'POST', body: JSON.stringify(quiz) });
  },

  updateAdminQuiz(id: string, updates: Record<string, unknown>) {
    return request(`/quizzes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(updates) });
  },

  deleteAdminQuiz(id: string) {
    return request(`/quizzes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  disableAdminQuiz(id: string) {
    return request(`/quizzes/${encodeURIComponent(id)}/disable`, { method: 'PATCH' });
  },

  enableAdminQuiz(id: string) {
    return request(`/quizzes/${encodeURIComponent(id)}/enable`, { method: 'PATCH' });
  },

  // ── Audit Logs ──────────────────────────────────────────────────────

  getAdminAuditLogs(limit = 50) {
    return request<Record<string, unknown>[]>(`/audit-logs?limit=${limit}`);
  },

  // ── Import / Export ─────────────────────────────────────────────────

  exportAdminData() {
    return request<Record<string, unknown>>('/export');
  },

  importAdminData(data: Record<string, unknown>) {
    return request('/import', { method: 'POST', body: JSON.stringify(data) });
  },
};
