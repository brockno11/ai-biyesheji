import { useMemo, useRef, useState } from 'react';
import {
  ClipboardList, Code2, CopyPlus, Pencil, Plus, Save, Trash2, X,
  Eye, Download, Upload, AlertTriangle, CheckCircle2, RotateCcw,
} from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { exercises as staticExercises, quizQuestions } from '../data/exercises';
import { storageService } from '../services/storageService';
import {
  validateExercise, validateQuizQuestion, validateQuizSet, flattenZodErrors,
} from '../services/validationService';
import type { Exercise, QuizQuestion } from '../types';

type PanelMode = 'exercise' | 'quiz';

const emptyExercise: Exercise = {
  id: '',
  algorithmId: 'linear-regression',
  title: '',
  difficulty: '入门',
  description: '',
  instructions: [''],
  starterCode: '',
  expectedKeywords: [],
  checkRules: [],
};

const emptyQuiz: QuizQuestion = {
  id: '',
  algorithmId: 'linear-regression',
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
};

function keywordsToRules(keywords: string[]) {
  const points = Math.max(1, Math.floor(100 / Math.max(keywords.length, 1)));
  return keywords.map((keyword) => ({
    type: 'keyword' as const,
    keyword,
    description: `使用 ${keyword}`,
    points,
  }));
}

function linesToList(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminQuestionPanel() {
  const courses = useCourses();
  const [mode, setMode] = useState<PanelMode>('exercise');
  const [customExercises, setCustomExercises] = useState(() => storageService.getCustomExercises());
  const [customQuizzes, setCustomQuizzes] = useState(() => storageService.getCustomQuizQuestions());
  const [exerciseForm, setExerciseForm] = useState<Exercise>(emptyExercise);
  const [quizForm, setQuizForm] = useState<QuizQuestion>(emptyQuiz);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [exerciseErrors, setExerciseErrors] = useState<Record<string, string>>({});
  const [quizErrors, setQuizErrors] = useState<Record<string, string>>({});
  const [previewQuestion, setPreviewQuestion] = useState<QuizQuestion | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const staticQuizList = useMemo(() => Object.values(quizQuestions).flat(), []);
  const customExerciseIds = new Set(customExercises.map((item) => item.id));
  const customQuizIds = new Set(customQuizzes.map((item) => item.id));
  const exerciseList = [
    ...staticExercises.map((item) => ({ ...item, source: customExerciseIds.has(item.id) ? '覆盖' : '内置' })),
    ...customExercises
      .filter((item) => !staticExercises.some((base) => base.id === item.id))
      .map((item) => ({ ...item, source: '自定义' })),
  ];
  const quizList = [
    ...staticQuizList.map((item) => ({ ...item, source: customQuizIds.has(item.id) ? '覆盖' : '内置' })),
    ...customQuizzes
      .filter((item) => !staticQuizList.some((base) => base.id === item.id))
      .map((item) => ({ ...item, source: '自定义' })),
  ];

  const courseName = (id: string) => courses.find((course) => course.id === id)?.name || id;

  const openNewExercise = () => {
    setExerciseForm({ ...emptyExercise, id: `custom-ex-${Date.now()}` });
    setExerciseErrors({});
    setShowExerciseForm(true);
  };

  const openEditExercise = (exercise: Exercise) => {
    setExerciseForm({
      ...exercise,
      instructions: [...exercise.instructions],
      expectedKeywords: [...exercise.expectedKeywords],
      checkRules: [...exercise.checkRules],
    });
    setExerciseErrors({});
    setShowExerciseForm(true);
  };

  const saveExercise = () => {
    const keywords = exerciseForm.expectedKeywords.filter(Boolean);
    const data = {
      ...exerciseForm,
      instructions: exerciseForm.instructions.filter(Boolean),
      expectedKeywords: keywords,
      checkRules: keywordsToRules(keywords),
    };
    const result = validateExercise(data);
    if (!result.success) {
      setExerciseErrors(flattenZodErrors(result));
      showToast('error', '请检查表单中的错误');
      return;
    }
    // Data integrity: check algorithmId references an existing algorithm
    const target = courses.find((c) => c.id === data.algorithmId);
    if (!target) {
      showToast('error', `关联的算法 "${data.algorithmId}" 不存在，请选择有效算法`);
      return;
    }
    setExerciseErrors({});
    storageService.saveCustomExercise(data);
    setCustomExercises(storageService.getCustomExercises());
    setShowExerciseForm(false);
    showToast('success', '练习已保存');
  };

  const deleteExercise = (id: string) => {
    storageService.deleteCustomExercise(id);
    setCustomExercises(storageService.getCustomExercises());
  };

  const openNewQuiz = () => {
    setQuizForm({ ...emptyQuiz, id: `custom-quiz-${Date.now()}` });
    setQuizErrors({});
    setShowQuizForm(true);
  };

  const openEditQuiz = (question: QuizQuestion) => {
    setQuizForm({ ...question, options: [...question.options] });
    setQuizErrors({});
    setShowQuizForm(true);
  };

  const saveQuiz = () => {
    const data = {
      ...quizForm,
      options: quizForm.options.map((option) => option.trim()),
    };
    const result = validateQuizQuestion(data);
    if (!result.success) {
      setQuizErrors(flattenZodErrors(result));
      showToast('error', '请检查表单中的错误');
      return;
    }
    // Data integrity: check algorithmId references an existing algorithm
    const target = courses.find((c) => c.id === data.algorithmId);
    if (!target) {
      showToast('error', `关联的算法 "${data.algorithmId}" 不存在，请选择有效算法`);
      return;
    }
    setQuizErrors({});
    storageService.saveCustomQuizQuestion(data);
    setCustomQuizzes(storageService.getCustomQuizQuestions());
    setShowQuizForm(false);
    showToast('success', '测验题已保存');
  };

  const deleteQuiz = (id: string) => {
    storageService.deleteCustomQuizQuestion(id);
    setCustomQuizzes(storageService.getCustomQuizQuestions());
    showToast('success', '测验题已删除');
  };

  const handleExportQuizzes = () => {
    const data = JSON.stringify(customQuizzes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-quizzes-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', '自定义测验题已导出');
  };

  const handleImportQuizzes = () => {
    importFileRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const raw = JSON.parse(evt.target?.result as string);
        const result = validateQuizSet(raw);
        if (!result.success) {
          showToast('error', `导入失败：JSON 格式不正确（${result.error.issues.length} 个错误）`);
          return;
        }
        // Data integrity: check each question's algorithmId
        const invalidAlgIds = result.data.filter(
          (q) => !courses.find((c) => c.id === q.algorithmId),
        );
        if (invalidAlgIds.length > 0) {
          showToast(
            'error',
            `导入失败：${invalidAlgIds.length} 道题引用了不存在的算法（${[...new Set(invalidAlgIds.map((q) => q.algorithmId))].join(', ')}）`,
          );
          return;
        }
        // Merge into storage
        for (const q of result.data) {
          storageService.saveCustomQuizQuestion(q);
        }
        setCustomQuizzes(storageService.getCustomQuizQuestions());
        showToast('success', `成功导入 ${result.data.length} 道测验题`);
      } catch {
        showToast('error', '导入失败：无法解析 JSON 文件');
      }
    };
    reader.readAsText(file);
    // Reset file input so the same file can be re-imported
    if (importFileRef.current) importFileRef.current.value = '';
  };

  const handleRestoreDefaults = () => {
    const all = storageService.getCustomQuizQuestions();
    for (const q of all) {
      storageService.deleteCustomQuizQuestion(q.id);
    }
    setCustomQuizzes([]);
    setShowRestoreConfirm(false);
    showToast('success', '已恢复默认题库');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">题库与练习管理</h2>
          <p className="text-sm text-gray-500">支持新增题目，也支持对内置题目做本地覆盖编辑。</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setMode('exercise')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'exercise' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Code2 className="h-4 w-4" />
              练习题
            </button>
            <button
              onClick={() => setMode('quiz')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'quiz' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ClipboardList className="h-4 w-4" />
              测验题
            </button>
          </div>
          {mode === 'quiz' && (
            <>
              <button
                onClick={handleExportQuizzes}
                disabled={customQuizzes.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                title="导出自定义测验"
              >
                <Download className="h-3.5 w-3.5" />
                导出
              </button>
              <button
                onClick={handleImportQuizzes}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                title="导入测验 JSON"
              >
                <Upload className="h-3.5 w-3.5" />
                导入
              </button>
              <input
                ref={importFileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                onClick={() => setShowRestoreConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                title="清除所有自定义题目，恢复内置题库"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                恢复默认题库
              </button>
            </>
          )}
        </div>
      </div>

      {mode === 'exercise' ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="text-sm font-bold text-gray-900">练习题共 {exerciseList.length} 道</div>
            <button onClick={openNewExercise} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              新增练习
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {exerciseList.map((exercise) => (
              <div key={exercise.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{exercise.title}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{courseName(exercise.algorithmId)}</span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{exercise.source}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{exercise.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditExercise(exercise)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    {exercise.source === '内置' ? <CopyPlus className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    {exercise.source === '内置' ? '覆盖编辑' : '编辑'}
                  </button>
                  {exercise.source !== '内置' && (
                    <button onClick={() => deleteExercise(exercise.id)} className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="text-sm font-bold text-gray-900">测验题共 {quizList.length} 道</div>
            <button onClick={openNewQuiz} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              新增测验
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {quizList.map((question) => (
              <div key={question.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{question.question}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{courseName(question.algorithmId)}</span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{question.source}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">正确答案：{question.options[question.correctIndex]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewQuestion(question)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-500 hover:text-primary-600 hover:bg-primary-50"
                    title="预览题目"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => openEditQuiz(question)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    {question.source === '内置' ? <CopyPlus className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    {question.source === '内置' ? '覆盖编辑' : '编辑'}
                  </button>
                  {question.source !== '内置' && (
                    <button onClick={() => deleteQuiz(question.id)} className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showExerciseForm && (
        <div className="rounded-2xl border border-primary-100 bg-white p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">编辑练习题</h3>
            <button onClick={() => setShowExerciseForm(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <input value={exerciseForm.id} onChange={(e) => { setExerciseForm((prev) => ({ ...prev, id: e.target.value })); setExerciseErrors((prev) => { const next = { ...prev }; delete next.id; return next; }); }} className={`rounded-xl border px-3 py-2 text-sm w-full ${exerciseErrors.id ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="ID" />
              {exerciseErrors.id && <p className="mt-1 text-xs text-red-500">{exerciseErrors.id}</p>}
            </div>
            <div>
              <select value={exerciseForm.algorithmId} onChange={(e) => { setExerciseForm((prev) => ({ ...prev, algorithmId: e.target.value })); setExerciseErrors((prev) => { const next = { ...prev }; delete next.algorithmId; return next; }); }} className={`rounded-xl border px-3 py-2 text-sm w-full ${exerciseErrors.algorithmId ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
              </select>
              {exerciseErrors.algorithmId && <p className="mt-1 text-xs text-red-500">{exerciseErrors.algorithmId}</p>}
            </div>
            <div className="md:col-span-2">
              <input value={exerciseForm.title} onChange={(e) => { setExerciseForm((prev) => ({ ...prev, title: e.target.value })); setExerciseErrors((prev) => { const next = { ...prev }; delete next.title; return next; }); }} className={`rounded-xl border px-3 py-2 text-sm w-full ${exerciseErrors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="练习标题" />
              {exerciseErrors.title && <p className="mt-1 text-xs text-red-500">{exerciseErrors.title}</p>}
            </div>
            <div className="md:col-span-2">
              <textarea value={exerciseForm.description} onChange={(e) => { setExerciseForm((prev) => ({ ...prev, description: e.target.value })); setExerciseErrors((prev) => { const next = { ...prev }; delete next.description; return next; }); }} className={`min-h-20 rounded-xl border px-3 py-2 text-sm w-full ${exerciseErrors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="练习描述" />
              {exerciseErrors.description && <p className="mt-1 text-xs text-red-500">{exerciseErrors.description}</p>}
            </div>
            <textarea value={exerciseForm.instructions.join('\n')} onChange={(e) => setExerciseForm((prev) => ({ ...prev, instructions: linesToList(e.target.value) }))} className="min-h-24 rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="步骤说明，每行一条" />
            <div>
              <textarea value={exerciseForm.expectedKeywords.join(', ')} onChange={(e) => setExerciseForm((prev) => ({ ...prev, expectedKeywords: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) }))} className="min-h-24 rounded-xl border border-gray-200 px-3 py-2 text-sm w-full" placeholder="关键词，用逗号分隔" />
            </div>
            <div className="md:col-span-2">
              <textarea value={exerciseForm.starterCode} onChange={(e) => { setExerciseForm((prev) => ({ ...prev, starterCode: e.target.value })); setExerciseErrors((prev) => { const next = { ...prev }; delete next.starterCode; return next; }); }} className={`min-h-52 rounded-xl border px-3 py-2 font-mono text-xs w-full ${exerciseErrors.starterCode ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="Starter Code" />
              {exerciseErrors.starterCode && <p className="mt-1 text-xs text-red-500">{exerciseErrors.starterCode}</p>}
            </div>
            {exerciseErrors.checkRules && <p className="md:col-span-2 text-xs text-red-500">{exerciseErrors.checkRules}</p>}
          </div>
          <button onClick={saveExercise} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
            <Save className="h-4 w-4" />
            保存练习
          </button>
        </div>
      )}

      {showQuizForm && (
        <div className="rounded-2xl border border-primary-100 bg-white p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">编辑测验题</h3>
            <button onClick={() => setShowQuizForm(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <input value={quizForm.id} onChange={(e) => { setQuizForm((prev) => ({ ...prev, id: e.target.value })); setQuizErrors((prev) => { const next = { ...prev }; delete next.id; return next; }); }} className={`rounded-xl border px-3 py-2 text-sm w-full ${quizErrors.id ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="ID" />
              {quizErrors.id && <p className="mt-1 text-xs text-red-500">{quizErrors.id}</p>}
            </div>
            <div>
              <select value={quizForm.algorithmId} onChange={(e) => { setQuizForm((prev) => ({ ...prev, algorithmId: e.target.value })); setQuizErrors((prev) => { const next = { ...prev }; delete next.algorithmId; return next; }); }} className={`rounded-xl border px-3 py-2 text-sm w-full ${quizErrors.algorithmId ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
              </select>
              {quizErrors.algorithmId && <p className="mt-1 text-xs text-red-500">{quizErrors.algorithmId}</p>}
            </div>
            <div className="md:col-span-2">
              <textarea value={quizForm.question} onChange={(e) => { setQuizForm((prev) => ({ ...prev, question: e.target.value })); setQuizErrors((prev) => { const next = { ...prev }; delete next.question; return next; }); }} className={`min-h-20 rounded-xl border px-3 py-2 text-sm w-full ${quizErrors.question ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="题干" />
              {quizErrors.question && <p className="mt-1 text-xs text-red-500">{quizErrors.question}</p>}
            </div>
            {quizForm.options.map((option, index) => (
              <div key={index}>
                <input value={option} onChange={(e) => { setQuizForm((prev) => ({ ...prev, options: prev.options.map((item, i) => (i === index ? e.target.value : item)) })); setQuizErrors((prev) => { const next = { ...prev }; delete next.options; return next; }); }} className={`rounded-xl border px-3 py-2 text-sm w-full ${quizErrors.options ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder={`选项 ${index + 1}`} />
              </div>
            ))}
            {quizErrors.options && <p className="md:col-span-2 text-xs text-red-500">{quizErrors.options}</p>}
            <div>
              <select value={quizForm.correctIndex} onChange={(e) => { setQuizForm((prev) => ({ ...prev, correctIndex: Number(e.target.value) })); setQuizErrors((prev) => { const next = { ...prev }; delete next.correctIndex; return next; }); }} className={`rounded-xl border px-3 py-2 text-sm w-full ${quizErrors.correctIndex ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                {quizForm.options.map((_, index) => <option key={index} value={index}>正确答案：选项 {index + 1}</option>)}
              </select>
              {quizErrors.correctIndex && <p className="mt-1 text-xs text-red-500">{quizErrors.correctIndex}</p>}
            </div>
            <div className="md:col-span-2">
              <textarea value={quizForm.explanation} onChange={(e) => { setQuizForm((prev) => ({ ...prev, explanation: e.target.value })); setQuizErrors((prev) => { const next = { ...prev }; delete next.explanation; return next; }); }} className={`min-h-20 rounded-xl border px-3 py-2 text-sm w-full ${quizErrors.explanation ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="解析" />
              {quizErrors.explanation && <p className="mt-1 text-xs text-red-500">{quizErrors.explanation}</p>}
            </div>
          </div>
          <button onClick={saveQuiz} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
            <Save className="h-4 w-4" />
            保存测验题
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">题目预览（学生视角）</h3>
              <button onClick={() => setPreviewQuestion(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="text-sm font-semibold text-gray-900">{previewQuestion.question}</div>
              <div className="space-y-2">
                {previewQuestion.options.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                      idx === previewQuestion.correctIndex
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === previewQuestion.correctIndex
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm text-gray-700">{opt}</span>
                    {idx === previewQuestion.correctIndex && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">解析</p>
                <p className="text-sm text-blue-800">{previewQuestion.explanation}</p>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirm Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">恢复默认题库</h4>
                <p className="text-sm text-gray-500">此操作不可恢复</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              确定要清除所有自定义测验题目并恢复为内置默认题库吗？自定义题目数据将被永久删除。
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowRestoreConfirm(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">取消</button>
              <button onClick={handleRestoreDefaults}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600">确认恢复</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
