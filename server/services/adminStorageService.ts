import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = path.resolve(import.meta.dirname, '..', 'data', 'admin-db.json');
const BACKUP_DIR = path.resolve(import.meta.dirname, '..', 'data', 'backups');

// ── Types ─────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'disable' | 'enable' | 'import' | 'export';
  targetType: 'course' | 'exercise' | 'quiz' | 'system';
  targetId: string;
  operator: string;
  detail: string;
  timestamp: number;
}

export interface AdminDb {
  customCourses: Record<string, unknown>[];
  courseOverrides: Record<string, unknown>[];
  disabledCourseIds: string[];
  customExercises: Record<string, unknown>[];
  exerciseOverrides: Record<string, unknown>[];
  disabledExerciseIds: string[];
  customQuizzes: Record<string, unknown>[];
  quizOverrides: Record<string, unknown>[];
  disabledQuizIds: string[];
  auditLogs: AuditLog[];
  updatedAt: number | null;
}

// ── Helpers ────────────────────────────────────────────────────────────

function atomicWrite(filePath: string, data: string): void {
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, data, 'utf-8');
  fs.renameSync(tmp, filePath);
}

// ── Public API ─────────────────────────────────────────────────────────

export const adminStorageService = {
  readAdminDb(): AdminDb {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw) as AdminDb;
    } catch {
      return {
        customCourses: [],
        courseOverrides: [],
        disabledCourseIds: [],
        customExercises: [],
        exerciseOverrides: [],
        disabledExerciseIds: [],
        customQuizzes: [],
        quizOverrides: [],
        disabledQuizIds: [],
        auditLogs: [],
        updatedAt: null,
      };
    }
  },

  writeAdminDb(data: AdminDb): void {
    data.updatedAt = Date.now();
    atomicWrite(DB_PATH, JSON.stringify(data, null, 2));
  },

  backupAdminDb(): string {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `admin-db-${ts}.json`);
    fs.copyFileSync(DB_PATH, backupFile);
    return backupFile;
  },

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      ...entry,
    };
    const db = this.readAdminDb();
    db.auditLogs.push(log);
    // Keep only last 500 logs
    if (db.auditLogs.length > 500) {
      db.auditLogs = db.auditLogs.slice(-500);
    }
    this.writeAdminDb(db);
    return log;
  },

  getAdminStats() {
    const db = this.readAdminDb();
    return {
      customCourseCount: db.customCourses.length,
      courseOverrideCount: db.courseOverrides.length,
      disabledCourseCount: db.disabledCourseIds.length,
      customExerciseCount: db.customExercises.length,
      disabledExerciseCount: db.disabledExerciseIds.length,
      customQuizCount: db.customQuizzes.length,
      disabledQuizCount: db.disabledQuizIds.length,
      auditLogCount: db.auditLogs.length,
      updatedAt: db.updatedAt,
    };
  },

  getAuditLogs(limit = 50): AuditLog[] {
    const db = this.readAdminDb();
    return db.auditLogs.slice(-limit).reverse();
  },

  exportData(): AdminDb {
    return this.readAdminDb();
  },

  importData(data: AdminDb): void {
    this.backupAdminDb();
    data.updatedAt = Date.now();
    if (!data.auditLogs) data.auditLogs = [];
    atomicWrite(DB_PATH, JSON.stringify(data, null, 2));
  },
};
