import { Router, type Request, type Response } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { adminStorageService } from '../services/adminStorageService';

const router = Router();

// All admin routes require auth
router.use(adminAuth.middleware);

// ── Helpers ────────────────────────────────────────────────────────────

function ok(data: unknown) {
  return { ok: true, data };
}

function err(code: string, message: string, status = 400) {
  return { status, body: { ok: false, error: code, message } };
}

function getOperator(req: Request): string {
  return (req as Request & { adminUser?: string }).adminUser || 'admin';
}

// ── Auth routes (no middleware needed — handled before router.use) ───────

const authRouter = Router();

authRouter.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    res.status(400).json({ ok: false, error: 'INVALID_REQUEST', message: '请提供用户名和密码' });
    return;
  }
  const result = adminAuth.login(username, password);
  if (!result) {
    res.status(401).json({ ok: false, error: 'INVALID_CREDENTIALS', message: '用户名或密码错误' });
    return;
  }
  res.json(ok({ token: result.token, user: { username, role: 'admin' } }));
});

authRouter.get('/me', adminAuth.middleware, (req: Request, res: Response) => {
  res.json(ok({ username: getOperator(req), role: 'admin' }));
});

authRouter.post('/logout', adminAuth.middleware, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    adminAuth.logout(authHeader.slice(7));
  }
  res.json(ok({ message: '已退出登录' }));
});

// ── Stats ───────────────────────────────────────────────────────────────

router.get('/stats', (_req: Request, res: Response) => {
  res.json(ok(adminStorageService.getAdminStats()));
});

// ── Courses ─────────────────────────────────────────────────────────────

router.get('/courses', (_req: Request, res: Response) => {
  const db = adminStorageService.readAdminDb();
  res.json(ok({
    customCourses: db.customCourses,
    courseOverrides: db.courseOverrides,
    disabledCourseIds: db.disabledCourseIds,
  }));
});

router.post('/courses', (req: Request, res: Response) => {
  const course = req.body;
  if (!course?.id || !course?.name) {
    res.status(400).json(err('INVALID_REQUEST', '课程 id 和 name 为必填项').body);
    return;
  }
  const db = adminStorageService.readAdminDb();
  const existing = db.customCourses.findIndex((c: any) => c.id === course.id);
  if (existing >= 0) {
    db.customCourses[existing] = { ...db.customCourses[existing], ...course };
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'update', targetType: 'course', targetId: course.id, operator: getOperator(req), detail: `编辑课程: ${course.name}` });
    res.json(ok(db.customCourses[existing]));
  } else {
    db.customCourses.push(course);
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'create', targetType: 'course', targetId: course.id, operator: getOperator(req), detail: `新增课程: ${course.name}` });
    res.status(201).json(ok(course));
  }
});

router.put('/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const db = adminStorageService.readAdminDb();
  const idx = db.customCourses.findIndex((c: any) => c.id === id);
  if (idx >= 0) {
    db.customCourses[idx] = { ...db.customCourses[idx], ...updates, id };
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'update', targetType: 'course', targetId: id, operator: getOperator(req), detail: `编辑课程: ${updates.name || id}` });
    return res.json(ok(db.customCourses[idx]));
  }
  // Check overrides
  const ovIdx = db.courseOverrides.findIndex((c: any) => c.id === id);
  if (ovIdx >= 0) {
    db.courseOverrides[ovIdx] = { ...db.courseOverrides[ovIdx], ...updates, id };
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'update', targetType: 'course', targetId: id, operator: getOperator(req), detail: `覆盖编辑课程: ${updates.name || id}` });
    return res.json(ok(db.courseOverrides[ovIdx]));
  }
  // Create as override for built-in courses
  db.courseOverrides.push({ ...updates, id });
  adminStorageService.writeAdminDb(db);
  adminStorageService.addAuditLog({ action: 'update', targetType: 'course', targetId: id, operator: getOperator(req), detail: `覆盖编辑课程: ${updates.name || id}` });
  res.json(ok(db.courseOverrides[db.courseOverrides.length - 1]));
});

router.delete('/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = adminStorageService.readAdminDb();
  const len = db.customCourses.length;
  db.customCourses = db.customCourses.filter((c: any) => c.id !== id);
  db.courseOverrides = db.courseOverrides.filter((c: any) => c.id !== id);
  if (db.customCourses.length < len) {
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'delete', targetType: 'course', targetId: id, operator: getOperator(req), detail: `删除课程: ${id}` });
    return res.json(ok({ deleted: true }));
  }
  res.status(404).json(err('NOT_FOUND', '课程不存在').body);
});

router.patch('/courses/:id/disable', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = adminStorageService.readAdminDb();
  if (!db.disabledCourseIds.includes(id)) {
    db.disabledCourseIds.push(id);
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'disable', targetType: 'course', targetId: id, operator: getOperator(req), detail: `停用课程: ${id}` });
  }
  res.json(ok({ disabled: true }));
});

router.patch('/courses/:id/enable', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = adminStorageService.readAdminDb();
  db.disabledCourseIds = db.disabledCourseIds.filter((cid) => cid !== id);
  adminStorageService.writeAdminDb(db);
  adminStorageService.addAuditLog({ action: 'enable', targetType: 'course', targetId: id, operator: getOperator(req), detail: `启用课程: ${id}` });
  res.json(ok({ enabled: true }));
});

// ── Exercises ───────────────────────────────────────────────────────────

router.get('/exercises', (_req: Request, res: Response) => {
  const db = adminStorageService.readAdminDb();
  res.json(ok({
    customExercises: db.customExercises,
    exerciseOverrides: db.exerciseOverrides,
    disabledExerciseIds: db.disabledExerciseIds,
  }));
});

router.post('/exercises', (req: Request, res: Response) => {
  const exercise = req.body;
  if (!exercise?.id || !exercise?.title) {
    res.status(400).json(err('INVALID_REQUEST', '练习 id 和 title 为必填项').body);
    return;
  }
  const db = adminStorageService.readAdminDb();
  const existing = db.customExercises.findIndex((e: any) => e.id === exercise.id);
  if (existing >= 0) {
    db.customExercises[existing] = { ...db.customExercises[existing], ...exercise };
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'update', targetType: 'exercise', targetId: exercise.id, operator: getOperator(req), detail: `编辑练习: ${exercise.title}` });
    res.json(ok(db.customExercises[existing]));
  } else {
    db.customExercises.push(exercise);
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'create', targetType: 'exercise', targetId: exercise.id, operator: getOperator(req), detail: `新增练习: ${exercise.title}` });
    res.status(201).json(ok(exercise));
  }
});

router.put('/exercises/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const db = adminStorageService.readAdminDb();
  const idx = db.customExercises.findIndex((e: any) => e.id === id);
  if (idx >= 0) {
    db.customExercises[idx] = { ...db.customExercises[idx], ...updates, id };
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'update', targetType: 'exercise', targetId: id, operator: getOperator(req), detail: `编辑练习: ${updates.title || id}` });
    return res.json(ok(db.customExercises[idx]));
  }
  const ovIdx = db.exerciseOverrides.findIndex((e: any) => e.id === id);
  if (ovIdx >= 0) {
    db.exerciseOverrides[ovIdx] = { ...db.exerciseOverrides[ovIdx], ...updates, id };
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'update', targetType: 'exercise', targetId: id, operator: getOperator(req), detail: `覆盖编辑练习: ${updates.title || id}` });
    return res.json(ok(db.exerciseOverrides[ovIdx]));
  }
  db.exerciseOverrides.push({ ...updates, id });
  adminStorageService.writeAdminDb(db);
  adminStorageService.addAuditLog({ action: 'update', targetType: 'exercise', targetId: id, operator: getOperator(req), detail: `覆盖编辑练习: ${updates.title || id}` });
  res.json(ok(db.exerciseOverrides[db.exerciseOverrides.length - 1]));
});

router.delete('/exercises/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = adminStorageService.readAdminDb();
  const len = db.customExercises.length;
  db.customExercises = db.customExercises.filter((e: any) => e.id !== id);
  db.exerciseOverrides = db.exerciseOverrides.filter((e: any) => e.id !== id);
  if (db.customExercises.length < len) {
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'delete', targetType: 'exercise', targetId: id, operator: getOperator(req), detail: `删除练习: ${id}` });
    return res.json(ok({ deleted: true }));
  }
  res.status(404).json(err('NOT_FOUND', '练习不存在').body);
});

router.patch('/exercises/:id/disable', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = adminStorageService.readAdminDb();
  if (!db.disabledExerciseIds.includes(id)) {
    db.disabledExerciseIds.push(id);
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'disable', targetType: 'exercise', targetId: id, operator: getOperator(req), detail: `停用练习: ${id}` });
  }
  res.json(ok({ disabled: true }));
});

router.patch('/exercises/:id/enable', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = adminStorageService.readAdminDb();
  db.disabledExerciseIds = db.disabledExerciseIds.filter((eid) => eid !== id);
  adminStorageService.writeAdminDb(db);
  adminStorageService.addAuditLog({ action: 'enable', targetType: 'exercise', targetId: id, operator: getOperator(req), detail: `启用练习: ${id}` });
  res.json(ok({ enabled: true }));
});

// ── Quizzes ─────────────────────────────────────────────────────────────

router.get('/quizzes', (_req: Request, res: Response) => {
  const db = adminStorageService.readAdminDb();
  res.json(ok({
    customQuizzes: db.customQuizzes,
    quizOverrides: db.quizOverrides,
    disabledQuizIds: db.disabledQuizIds,
  }));
});

router.post('/quizzes', (req: Request, res: Response) => {
  const quiz = req.body;
  if (!quiz?.id || !quiz?.question) {
    res.status(400).json(err('INVALID_REQUEST', '测验 id 和 question 为必填项').body);
    return;
  }
  const db = adminStorageService.readAdminDb();
  const existing = db.customQuizzes.findIndex((q: any) => q.id === quiz.id);
  if (existing >= 0) {
    db.customQuizzes[existing] = { ...db.customQuizzes[existing], ...quiz };
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'update', targetType: 'quiz', targetId: quiz.id, operator: getOperator(req), detail: `编辑测验: ${quiz.question.slice(0, 30)}` });
    res.json(ok(db.customQuizzes[existing]));
  } else {
    db.customQuizzes.push(quiz);
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'create', targetType: 'quiz', targetId: quiz.id, operator: getOperator(req), detail: `新增测验: ${quiz.question.slice(0, 30)}` });
    res.status(201).json(ok(quiz));
  }
});

router.put('/quizzes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const db = adminStorageService.readAdminDb();
  const idx = db.customQuizzes.findIndex((q: any) => q.id === id);
  if (idx >= 0) {
    db.customQuizzes[idx] = { ...db.customQuizzes[idx], ...updates, id };
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'update', targetType: 'quiz', targetId: id, operator: getOperator(req), detail: `编辑测验: ${updates.question?.slice(0, 30) || id}` });
    return res.json(ok(db.customQuizzes[idx]));
  }
  const ovIdx = db.quizOverrides.findIndex((q: any) => q.id === id);
  if (ovIdx >= 0) {
    db.quizOverrides[ovIdx] = { ...db.quizOverrides[ovIdx], ...updates, id };
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'update', targetType: 'quiz', targetId: id, operator: getOperator(req), detail: `覆盖编辑测验: ${updates.question?.slice(0, 30) || id}` });
    return res.json(ok(db.quizOverrides[ovIdx]));
  }
  db.quizOverrides.push({ ...updates, id });
  adminStorageService.writeAdminDb(db);
  adminStorageService.addAuditLog({ action: 'update', targetType: 'quiz', targetId: id, operator: getOperator(req), detail: `覆盖编辑测验: ${updates.question?.slice(0, 30) || id}` });
  res.json(ok(db.quizOverrides[db.quizOverrides.length - 1]));
});

router.delete('/quizzes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = adminStorageService.readAdminDb();
  const len = db.customQuizzes.length;
  db.customQuizzes = db.customQuizzes.filter((q: any) => q.id !== id);
  db.quizOverrides = db.quizOverrides.filter((q: any) => q.id !== id);
  if (db.customQuizzes.length < len) {
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'delete', targetType: 'quiz', targetId: id, operator: getOperator(req), detail: `删除测验: ${id}` });
    return res.json(ok({ deleted: true }));
  }
  res.status(404).json(err('NOT_FOUND', '测验不存在').body);
});

router.patch('/quizzes/:id/disable', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = adminStorageService.readAdminDb();
  if (!db.disabledQuizIds.includes(id)) {
    db.disabledQuizIds.push(id);
    adminStorageService.writeAdminDb(db);
    adminStorageService.addAuditLog({ action: 'disable', targetType: 'quiz', targetId: id, operator: getOperator(req), detail: `停用测验: ${id}` });
  }
  res.json(ok({ disabled: true }));
});

router.patch('/quizzes/:id/enable', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = adminStorageService.readAdminDb();
  db.disabledQuizIds = db.disabledQuizIds.filter((qid) => qid !== id);
  adminStorageService.writeAdminDb(db);
  adminStorageService.addAuditLog({ action: 'enable', targetType: 'quiz', targetId: id, operator: getOperator(req), detail: `启用测验: ${id}` });
  res.json(ok({ enabled: true }));
});

// ── Audit Logs ──────────────────────────────────────────────────────────

router.get('/audit-logs', (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  res.json(ok(adminStorageService.getAuditLogs(limit)));
});

// ── Import / Export ─────────────────────────────────────────────────────

router.get('/export', (req: Request, res: Response) => {
  const data = adminStorageService.exportData();
  adminStorageService.addAuditLog({ action: 'export', targetType: 'system', targetId: 'export', operator: getOperator(req), detail: '导出管理数据' });
  res.json(ok(data));
});

router.post('/import', (req: Request, res: Response) => {
  const data = req.body;
  if (!data || typeof data !== 'object') {
    res.status(400).json(err('INVALID_REQUEST', '导入数据格式错误').body);
    return;
  }
  adminStorageService.importData(data as any);
  adminStorageService.addAuditLog({ action: 'import', targetType: 'system', targetId: 'import', operator: getOperator(req), detail: '导入管理数据（旧数据已自动备份）' });
  res.json(ok({ imported: true }));
});

// ── Export ───────────────────────────────────────────────────────────────

export { authRouter };
export default router;
