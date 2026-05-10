import { useMemo, useRef, useState } from 'react';
import {
  ClipboardList, Code2, CopyPlus, Pencil, Plus, Save, Trash2, X,
  Eye, Download, Upload, AlertTriangle, CheckCircle2, RotateCcw,
  Sparkles, Search, Filter, ToggleLeft, ToggleRight, Loader2,
} from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { exercises as staticExercises, quizQuestions } from '../data/exercises';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import {
  validateExercise, validateQuizQuestion, validateQuizSet, flattenZodErrors,
} from '../services/validationService';
import type { Exercise, QuizQuestion } from '../types';

type PanelMode = 'exercise' | 'quiz';

const difficultyOptions = ['入门', '中级', '进阶'] as const;

const emptyExercise: Exercise = {
  id: '',
  algorithmId: 'linear-regression',
  title: '',
  difficulty: '入门',
  description: '',
  instructions: [''],
  starterCode: '# TODO: 补全代码\n',
  expectedKeywords: [],
  checkRules: [],
  enabled: true,
  source: 'custom',
};

const emptyQuiz: QuizQuestion = {
  id: '',
  algorithmId: 'linear-regression',
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  enabled: true,
  source: 'custom',
  difficulty: '入门',
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

type SourceFilter = 'all' | 'builtin' | 'custom' | 'ai';
type StatusFilter = 'all' | 'enabled' | 'disabled';

export default function AdminQuestionPanel() {
  const courses = useCourses();
  const [mode, setMode] = useState<PanelMode>('exercise');
  const [customExercises, setCustomExercises] = useState(() => storageService.getCustomExercises());
  const [customQuizzes, setCustomQuizzes] = useState(() => storageService.getCustomQuizQuestions());

  // Form state
  const [exerciseForm, setExerciseForm] = useState<Exercise>(emptyExercise);
  const [quizForm, setQuizForm] = useState<QuizQuestion>(emptyQuiz);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [exerciseErrors, setExerciseErrors] = useState<Record<string, string>>({});
  const [quizErrors, setQuizErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // AI generation state
  const [showAIGenExercise, setShowAIGenExercise] = useState(false);
  const [showAIGenQuiz, setShowAIGenQuiz] = useState(false);
  const [aiGenLoading, setAiGenLoading] = useState(false);
  const [aiExerciseInput, setAiExerciseInput] = useState({
    courseId: 'linear-regression',
    difficulty: '入门' as '入门' | '中级' | '进阶',
    requirements: '',
  });
  const [aiQuizInput, setAiQuizInput] = useState({
    courseId: 'linear-regression',
    difficulty: '入门' as '入门' | '中级' | '进阶',
    requirements: '',
    lessonId: '',
    conceptId: '',
  });

  // Preview & toast
  const [previewQuestion, setPreviewQuestion] = useState<QuizQuestion | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Filters
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<SourceFilter>('all');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [filterSearch, setFilterSearch] = useState('');

  const importFileRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  // ── Data merging ──
  const staticQuizList = useMemo(() => Object.values(quizQuestions).flat(), []);
  const customExerciseIds = new Set(customExercises.map((item) => item.id));
  const customQuizIds = new Set(customQuizzes.map((item) => item.id));

  const allExercises: (Exercise & { _source: string })[] = useMemo(() => [
    ...staticExercises.map((item) => {
      const override = customExercises.find((c) => c.id === item.id);
      return { ...item, ...(override || {}), _source: override ? (override.source || 'custom') : 'builtin' };
    }),
    ...customExercises
      .filter((item) => !staticExercises.some((base) => base.id === item.id))
      .map((item) => ({ ...item, _source: item.source || 'custom' })),
  ], [customExercises]);

  const allQuizzes: (QuizQuestion & { _source: string })[] = useMemo(() => [
    ...staticQuizList.map((item) => {
      const override = customQuizzes.find((c) => c.id === item.id);
      return { ...item, ...(override || {}), _source: override ? (override.source || 'custom') : 'builtin' };
    }),
    ...customQuizzes
      .filter((item) => !staticQuizList.some((base) => base.id === item.id))
      .map((item) => ({ ...item, _source: item.source || 'custom' })),
  ], [customQuizzes]);

  // ── Filtering ──
  const filteredExercises = useMemo(() => {
    let list = allExercises;
    if (filterCourse !== 'all') list = list.filter((e) => e.algorithmId === filterCourse);
    if (filterSource !== 'all') list = list.filter((e) => e._source === filterSource);
    if (filterStatus === 'enabled') list = list.filter((e) => e.enabled !== false);
    if (filterStatus === 'disabled') list = list.filter((e) => e.enabled === false);
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    return list;
  }, [allExercises, filterCourse, filterSource, filterStatus, filterSearch]);

  const filteredQuizzes = useMemo(() => {
    let list = allQuizzes;
    if (filterCourse !== 'all') list = list.filter((q) => q.algorithmId === filterCourse);
    if (filterSource !== 'all') list = list.filter((q) => q._source === filterSource);
    if (filterStatus === 'enabled') list = list.filter((q) => q.enabled !== false);
    if (filterStatus === 'disabled') list = list.filter((q) => q.enabled === false);
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      list = list.filter((item) =>
        item.question.toLowerCase().includes(q) ||
        item.options.some((o) => o.toLowerCase().includes(q)) ||
        item.explanation.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allQuizzes, filterCourse, filterSource, filterStatus, filterSearch]);

  // ── Stats ──
  const exStats = useMemo(() => ({
    total: allExercises.length,
    enabled: allExercises.filter((e) => e.enabled !== false).length,
    disabled: allExercises.filter((e) => e.enabled === false).length,
  }), [allExercises]);

  const quizStats = useMemo(() => ({
    total: allQuizzes.length,
    enabled: allQuizzes.filter((q) => q.enabled !== false).length,
    disabled: allQuizzes.filter((q) => q.enabled === false).length,
  }), [allQuizzes]);

  const courseName = (id: string) => courses.find((course) => course.id === id)?.name || id;

  // ── Exercise CRUD ──
  const openNewExercise = () => {
    setExerciseForm({ ...emptyExercise, id: `custom-ex-${Date.now()}`, algorithmId: filterCourse !== 'all' ? filterCourse : 'linear-regression' });
    setExerciseErrors({});
    setShowExerciseForm(true);
  };

  const openEditExercise = (exercise: Exercise & { _source?: string }) => {
    const { _source, ...ex } = exercise;
    setExerciseForm({
      ...ex,
      instructions: [...(ex.instructions || [])],
      expectedKeywords: [...(ex.expectedKeywords || [])],
      checkRules: [...(ex.checkRules || [])],
      enabled: ex.enabled !== false,
    });
    setExerciseErrors({});
    setShowExerciseForm(true);
  };

  const saveExercise = () => {
    const keywords = exerciseForm.expectedKeywords.filter(Boolean);
    const data: Exercise = {
      ...exerciseForm,
      instructions: exerciseForm.instructions.filter(Boolean),
      expectedKeywords: keywords,
      checkRules: exerciseForm.checkRules.length > 0
        ? exerciseForm.checkRules
        : keywordsToRules(keywords),
      updatedAt: Date.now(),
      createdAt: exerciseForm.createdAt || Date.now(),
    };

    // Validate
    if (!data.title.trim()) { setExerciseErrors({ title: '练习标题不能为空' }); showToast('error', '请填写练习标题'); return; }
    if (!data.description.trim()) { setExerciseErrors({ description: '练习描述不能为空' }); showToast('error', '请填写练习描述'); return; }
    if (!data.starterCode.trim()) { setExerciseErrors({ starterCode: '初始代码不能为空' }); showToast('error', '请填写初始代码'); return; }
    if (data.checkRules.length === 0) { setExerciseErrors({ expectedKeywords: '请至少添加一个关键词以生成检查规则' }); showToast('error', '请添加至少一个关键词'); return; }

    const target = courses.find((c) => c.id === data.algorithmId);
    if (!target) { showToast('error', `关联的课程 "${data.algorithmId}" 不存在`); return; }

    setSaving(true);
    try {
      setExerciseErrors({});
      storageService.saveCustomExercise(data);
      setCustomExercises(storageService.getCustomExercises());
      setShowExerciseForm(false);
      showToast('success', '练习已保存');
    } catch {
      showToast('error', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const deleteExercise = (id: string) => {
    storageService.deleteCustomExercise(id);
    setCustomExercises(storageService.getCustomExercises());
    showToast('success', '练习已删除');
  };

  const toggleExerciseEnabled = (exercise: Exercise & { _source: string }) => {
    const { _source, ...ex } = exercise;
    const updated: Exercise = {
      ...ex,
      enabled: ex.enabled === false ? true : false,
      updatedAt: Date.now(),
      createdAt: ex.createdAt || Date.now(),
    };
    storageService.saveCustomExercise(updated);
    setCustomExercises(storageService.getCustomExercises());
    showToast('success', updated.enabled !== false ? '已启用' : '已停用');
  };

  // ── Quiz CRUD ──
  const openNewQuiz = () => {
    setQuizForm({ ...emptyQuiz, id: `custom-quiz-${Date.now()}`, algorithmId: filterCourse !== 'all' ? filterCourse : 'linear-regression' });
    setQuizErrors({});
    setShowQuizForm(true);
  };

  const openEditQuiz = (question: QuizQuestion & { _source?: string }) => {
    const { _source, ...q } = question;
    setQuizForm({ ...q, options: [...(q.options || [])], enabled: q.enabled !== false });
    setQuizErrors({});
    setShowQuizForm(true);
  };

  const saveQuiz = () => {
    const data: QuizQuestion = {
      ...quizForm,
      options: quizForm.options.map((option) => option.trim()),
      updatedAt: Date.now(),
      createdAt: quizForm.createdAt || Date.now(),
    };

    if (!data.question.trim()) { setQuizErrors({ question: '题目不能为空' }); showToast('error', '请填写题目'); return; }
    if (data.options.some((o) => !o.trim())) { setQuizErrors({ options: '所有选项不能为空' }); showToast('error', '请填写全部4个选项'); return; }
    if (!data.explanation.trim()) { setQuizErrors({ explanation: '解析不能为空' }); showToast('error', '请填写解析'); return; }

    const result = validateQuizQuestion(data);
    if (!result.success) { setQuizErrors(flattenZodErrors(result)); showToast('error', '请检查表单中的错误'); return; }

    const target = courses.find((c) => c.id === data.algorithmId);
    if (!target) { showToast('error', `关联的课程 "${data.algorithmId}" 不存在`); return; }

    setSaving(true);
    try {
      setQuizErrors({});
      storageService.saveCustomQuizQuestion(data);
      setCustomQuizzes(storageService.getCustomQuizQuestions());
      setShowQuizForm(false);
      showToast('success', '测验题已保存');
    } catch {
      showToast('error', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = (id: string) => {
    storageService.deleteCustomQuizQuestion(id);
    setCustomQuizzes(storageService.getCustomQuizQuestions());
    showToast('success', '测验题已删除');
  };

  const toggleQuizEnabled = (question: QuizQuestion & { _source: string }) => {
    const { _source, ...q } = question;
    const updated: QuizQuestion = {
      ...q,
      enabled: q.enabled === false ? true : false,
      updatedAt: Date.now(),
      createdAt: q.createdAt || Date.now(),
    };
    storageService.saveCustomQuizQuestion(updated);
    setCustomQuizzes(storageService.getCustomQuizQuestions());
    showToast('success', updated.enabled !== false ? '已启用' : '已停用');
  };

  // ── AI Generation ──
  const handleAIGenerateExercise = async () => {
    const course = courses.find((c) => c.id === aiExerciseInput.courseId);
    if (!course) { showToast('error', '请选择课程'); return; }
    setAiGenLoading(true);
    try {
      const result = await aiService.generateExerciseDraft({
        exerciseDraftInput: {
          courseId: aiExerciseInput.courseId,
          courseName: course.name,
          difficulty: aiExerciseInput.difficulty,
          requirements: aiExerciseInput.requirements || '生成一道基础练习题',
        },
        pagePosition: '管理后台AI练习题生成',
      });
      const draft = result.data;
      setExerciseForm({
        id: `custom-ex-${Date.now()}`,
        algorithmId: aiExerciseInput.courseId,
        title: draft.title,
        difficulty: draft.difficulty,
        description: draft.description,
        instructions: draft.instructions.length > 0 ? draft.instructions : [''],
        starterCode: draft.starterCode,
        expectedKeywords: draft.expectedKeywords,
        checkRules: keywordsToRules(draft.expectedKeywords),
        hints: draft.hints,
        teachingNotes: draft.teachingNotes,
        enabled: true,
        source: 'ai',
        createdAt: Date.now(),
      });
      setExerciseErrors({});
      setShowAIGenExercise(false);
      setShowExerciseForm(true);
      showToast('success', result.mode === 'deepseek' ? 'DeepSeek 已生成练习题草稿' : '已生成 Mock 练习题草稿');
    } catch {
      showToast('error', 'AI 生成失败，请重试');
    } finally {
      setAiGenLoading(false);
    }
  };

  const handleAIGenerateQuiz = async () => {
    const course = courses.find((c) => c.id === aiQuizInput.courseId);
    if (!course) { showToast('error', '请选择课程'); return; }
    setAiGenLoading(true);
    try {
      const result = await aiService.generateQuizDraft({
        quizDraftInput: {
          courseId: aiQuizInput.courseId,
          courseName: course.name,
          difficulty: aiQuizInput.difficulty,
          requirements: aiQuizInput.requirements || '生成一道概念理解题',
          lessonId: aiQuizInput.lessonId || undefined,
          conceptId: aiQuizInput.conceptId || undefined,
        },
        pagePosition: '管理后台AI测验题生成',
      });
      const draft = result.data;
      setQuizForm({
        id: `custom-quiz-${Date.now()}`,
        algorithmId: aiQuizInput.courseId,
        question: draft.question,
        options: draft.options,
        correctIndex: draft.correctIndex,
        explanation: draft.explanation,
        difficulty: draft.difficulty,
        conceptId: draft.conceptId,
        lessonId: draft.lessonId,
        enabled: true,
        source: 'ai',
        createdAt: Date.now(),
      });
      setQuizErrors({});
      setShowAIGenQuiz(false);
      setShowQuizForm(true);
      showToast('success', result.mode === 'deepseek' ? 'DeepSeek 已生成测验题草稿' : '已生成 Mock 测验题草稿');
    } catch {
      showToast('error', 'AI 生成失败，请重试');
    } finally {
      setAiGenLoading(false);
    }
  };

  // ── Export / Import / Restore ──
  const handleExport = () => {
    if (mode === 'exercise') {
      const data = JSON.stringify(customExercises, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-exercises-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', '自定义练习题已导出');
    } else {
      const data = JSON.stringify(customQuizzes, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-quizzes-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', '自定义测验题已导出');
    }
  };

  const handleImport = () => {
    importFileRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const raw = JSON.parse(evt.target?.result as string);
        if (mode === 'quiz') {
          const result = validateQuizSet(raw);
          if (!result.success) {
            showToast('error', `导入失败：JSON 格式不正确`);
            return;
          }
          const invalidAlgIds = result.data.filter((q) => !courses.find((c) => c.id === q.algorithmId));
          if (invalidAlgIds.length > 0) {
            showToast('error', `导入失败：${invalidAlgIds.length} 道题引用了不存在的课程`);
            return;
          }
          for (const q of result.data) {
            storageService.saveCustomQuizQuestion({ ...q, updatedAt: Date.now() });
          }
          setCustomQuizzes(storageService.getCustomQuizQuestions());
          showToast('success', `成功导入 ${result.data.length} 道测验题`);
        } else {
          if (!Array.isArray(raw)) { showToast('error', '导入失败：文件格式不正确'); return; }
          let count = 0;
          for (const item of raw) {
            if (!item.id || !item.title || !item.algorithmId) continue;
            storageService.saveCustomExercise({ ...item, updatedAt: Date.now() });
            count++;
          }
          setCustomExercises(storageService.getCustomExercises());
          showToast('success', `成功导入 ${count} 道练习题`);
        }
      } catch {
        showToast('error', '导入失败：无法解析 JSON 文件');
      }
    };
    reader.readAsText(file);
    if (importFileRef.current) importFileRef.current.value = '';
  };

  const handleRestoreDefaults = () => {
    if (mode === 'exercise') {
      const all = storageService.getCustomExercises();
      for (const item of all) storageService.deleteCustomExercise(item.id);
      setCustomExercises([]);
    } else {
      const all = storageService.getCustomQuizQuestions();
      for (const q of all) storageService.deleteCustomQuizQuestion(q.id);
      setCustomQuizzes([]);
    }
    setShowRestoreConfirm(false);
    showToast('success', '已恢复默认题库，自定义数据已清除');
  };

  // ── Source label helpers ──
  const sourceLabel = (src: string) => {
    if (src === 'builtin') return '内置';
    if (src === 'ai') return 'AI生成';
    return '自定义';
  };
  const sourceBadgeClass = (src: string) => {
    if (src === 'builtin') return 'bg-gray-100 text-gray-600 border-gray-200';
    if (src === 'ai') return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  // ── Render ──
  const isFoundationCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.type === 'foundation';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">题库与练习管理</h2>
          <p className="text-sm text-gray-500">管理练习题和测验题，支持 AI 生成、启用/停用、按课程筛选。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="inline-flex rounded-xl border border-white/60 bg-white/70 backdrop-blur-md p-1 shadow-sm">
            <button
              onClick={() => setMode('exercise')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 ${mode === 'exercise' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Code2 className="h-4 w-4" />
              练习题
            </button>
            <button
              onClick={() => setMode('quiz')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 ${mode === 'quiz' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ClipboardList className="h-4 w-4" />
              测验题
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/70 backdrop-blur-md rounded-xl border border-white/60 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">{mode === 'exercise' ? '练习题总数' : '测验题总数'}</p>
          <p className="text-2xl font-bold text-gray-900">{mode === 'exercise' ? exStats.total : quizStats.total}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-xl border border-white/60 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">已启用</p>
          <p className="text-2xl font-bold text-green-600">{mode === 'exercise' ? exStats.enabled : quizStats.enabled}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-xl border border-white/60 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">已停用</p>
          <p className="text-2xl font-bold text-amber-600">{mode === 'exercise' ? exStats.disabled : quizStats.disabled}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-xl border border-white/60 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">自定义/AI</p>
          <p className="text-2xl font-bold text-purple-600">{mode === 'exercise' ? customExercises.length : customQuizzes.length}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/60 p-3">
        <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white"
        >
          <option value="all">全部课程</option>
          <optgroup label="基础概念课">
            {courses.filter((c) => c.type === 'foundation').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </optgroup>
          <optgroup label="核心算法课">
            {courses.filter((c) => c.type !== 'foundation').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </optgroup>
        </select>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value as SourceFilter)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white"
        >
          <option value="all">全部来源</option>
          <option value="builtin">内置</option>
          <option value="custom">自定义</option>
          <option value="ai">AI 生成</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white"
        >
          <option value="all">全部状态</option>
          <option value="enabled">已启用</option>
          <option value="disabled">已停用</option>
        </select>
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="搜索关键词..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        {(filterCourse !== 'all' || filterSource !== 'all' || filterStatus !== 'all' || filterSearch) && (
          <button
            onClick={() => { setFilterCourse('all'); setFilterSource('all'); setFilterStatus('all'); setFilterSearch(''); }}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={mode === 'exercise' ? openNewExercise : openNewQuiz}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {mode === 'exercise' ? '新增练习' : '新增测验'}
        </button>
        <button
          onClick={() => mode === 'exercise' ? setShowAIGenExercise(true) : setShowAIGenQuiz(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          {mode === 'exercise' ? 'AI 生成练习' : 'AI 生成测验'}
        </button>
        <div className="relative">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            更多操作 ▾
          </button>
          {moreOpen && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[170px]">
              <button
                onClick={() => { handleExport(); setMoreOpen(false); }}
                disabled={(mode === 'exercise' ? customExercises : customQuizzes).length === 0}
                className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 flex items-center gap-2"
              >
                <Download className="h-3.5 w-3.5" />
                导出{mode === 'exercise' ? '练习' : '测验'}题库
              </button>
              <button
                onClick={() => { handleImport(); setMoreOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <Upload className="h-3.5 w-3.5" />
                导入{mode === 'exercise' ? '练习' : '测验'}题库
              </button>
              <input ref={importFileRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
              <hr className="my-1" />
              <button
                onClick={() => { setShowRestoreConfirm(true); setMoreOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                恢复默认题库
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Question List */}
      {mode === 'exercise' ? (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="text-sm font-extrabold text-gray-900 tracking-tight">
              练习题 {filteredExercises.length}/{exStats.total} 道
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredExercises.map((exercise) => (
              <div key={exercise.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{exercise.title}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{courseName(exercise.algorithmId)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${sourceBadgeClass(exercise._source)}`}>
                      {sourceLabel(exercise._source)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      exercise.difficulty === '入门' ? 'bg-green-100 text-green-700' :
                      exercise.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{exercise.difficulty}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{exercise.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Enable/disable toggle */}
                  <button
                    onClick={() => toggleExerciseEnabled(exercise)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                      exercise.enabled !== false
                        ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                        : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                    title={exercise.enabled !== false ? '点击停用' : '点击启用'}
                  >
                    {exercise.enabled !== false ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                    {exercise.enabled !== false ? '启用' : '停用'}
                  </button>
                  <button onClick={() => openEditExercise(exercise)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    {exercise._source === 'builtin' ? <CopyPlus className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    {exercise._source === 'builtin' ? '覆盖编辑' : '编辑'}
                  </button>
                  {exercise._source !== 'builtin' && (
                    <button onClick={() => deleteExercise(exercise.id)} className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredExercises.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-gray-400">
                没有匹配的练习题
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="text-sm font-extrabold text-gray-900 tracking-tight">
              测验题 {filteredQuizzes.length}/{quizStats.total} 道
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredQuizzes.map((question) => (
              <div key={question.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900 line-clamp-2">{question.question}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{courseName(question.algorithmId)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${sourceBadgeClass(question._source)}`}>
                      {sourceLabel(question._source)}
                    </span>
                    {question.difficulty && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        question.difficulty === '入门' ? 'bg-green-100 text-green-700' :
                        question.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{question.difficulty}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">答案：{question.options[question.correctIndex] || '(空)'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleQuizEnabled(question)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                      question.enabled !== false
                        ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                        : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                    title={question.enabled !== false ? '点击停用' : '点击启用'}
                  >
                    {question.enabled !== false ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                    {question.enabled !== false ? '启用' : '停用'}
                  </button>
                  <button
                    onClick={() => setPreviewQuestion(question)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-500 hover:text-primary-600 hover:bg-primary-50"
                    title="预览题目"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => openEditQuiz(question)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    {question._source === 'builtin' ? <CopyPlus className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    {question._source === 'builtin' ? '覆盖编辑' : '编辑'}
                  </button>
                  {question._source !== 'builtin' && (
                    <button onClick={() => deleteQuiz(question.id)} className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredQuizzes.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-gray-400">
                没有匹配的测验题
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exercise Form Modal */}
      {showExerciseForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowExerciseForm(false); }}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto m-4">
          <div className="mb-4 flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-gray-900">{exerciseForm.title || '新增练习题'}</h3>
            <button onClick={() => setShowExerciseForm(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
          </div>

          {/* Section: Course Binding */}
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">绑定课程</p>
          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">算法课程 *（练习仅绑定算法课）</label>
              <select value={exerciseForm.algorithmId} onChange={(e) => setExerciseForm((prev) => ({ ...prev, algorithmId: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <optgroup label="核心算法课">
                  {courses.filter((c) => c.type !== 'foundation').map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">题目ID</label>
              <input value={exerciseForm.id} onChange={(e) => setExerciseForm((prev) => ({ ...prev, id: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono text-xs" />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={exerciseForm.enabled !== false} onChange={(e) => setExerciseForm((prev) => ({ ...prev, enabled: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-600">已启用</span>
              </label>
            </div>
          </div>

          {/* Section: Basic Info */}
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">基础信息</p>
          <div className="grid gap-3 md:grid-cols-3 mb-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">练习标题 *</label>
              <input value={exerciseForm.title} onChange={(e) => { setExerciseForm((prev) => ({ ...prev, title: e.target.value })); setExerciseErrors((prev) => { const n={...prev}; delete n.title; return n; }); }} className={`w-full rounded-lg border px-3 py-2 text-sm ${exerciseErrors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="例：逻辑回归分类器基础实现" />
              {exerciseErrors.title && <p className="text-xs text-red-500 mt-0.5">{exerciseErrors.title}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">难度</label>
              <select value={exerciseForm.difficulty} onChange={(e) => setExerciseForm((prev) => ({ ...prev, difficulty: e.target.value as Exercise['difficulty'] }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                {difficultyOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Section: Content */}
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">练习内容</p>
          <div className="grid gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">练习描述 *</label>
              <textarea value={exerciseForm.description} onChange={(e) => { setExerciseForm((prev) => ({ ...prev, description: e.target.value })); setExerciseErrors((prev) => { const n={...prev}; delete n.description; return n; }); }} className={`min-h-16 rounded-lg border px-3 py-2 text-sm w-full ${exerciseErrors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="描述练习目标和背景..." />
              {exerciseErrors.description && <p className="text-xs text-red-500 mt-0.5">{exerciseErrors.description}</p>}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">步骤说明（每行一条）</label>
                <textarea value={exerciseForm.instructions.join('\n')} onChange={(e) => setExerciseForm((prev) => ({ ...prev, instructions: linesToList(e.target.value) }))} className="min-h-20 rounded-lg border border-gray-200 px-3 py-2 text-sm w-full" placeholder="步骤说明（每行一条）" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">关键词（逗号分隔）</label>
                <textarea value={exerciseForm.expectedKeywords.join(', ')} onChange={(e) => setExerciseForm((prev) => ({ ...prev, expectedKeywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} className={`min-h-20 rounded-lg border px-3 py-2 text-sm w-full ${exerciseErrors.expectedKeywords ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="例：LogisticRegression, fit, predict" />
                {exerciseErrors.expectedKeywords && <p className="text-xs text-red-500 mt-0.5">{exerciseErrors.expectedKeywords}</p>}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">初始代码 *</label>
              <textarea value={exerciseForm.starterCode} onChange={(e) => { setExerciseForm((prev) => ({ ...prev, starterCode: e.target.value })); setExerciseErrors((prev) => { const n={...prev}; delete n.starterCode; return n; }); }} className={`min-h-52 rounded-lg border px-3 py-2 font-mono text-xs w-full ${exerciseErrors.starterCode ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="# Starter Code" />
              {exerciseErrors.starterCode && <p className="text-xs text-red-500 mt-0.5">{exerciseErrors.starterCode}</p>}
            </div>
            {/* Hints & Teaching Notes */}
            <details className="rounded-lg border border-gray-200 p-3">
              <summary className="text-xs font-semibold text-gray-500 cursor-pointer">提示与教学笔记（可选）</summary>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">提示（每行一条）</label>
                  <textarea value={(exerciseForm.hints || []).join('\n')} onChange={(e) => setExerciseForm((prev) => ({ ...prev, hints: linesToList(e.target.value) }))} className="min-h-16 rounded-lg border border-gray-200 px-3 py-2 text-sm w-full" placeholder="给学生的递进提示..." />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">教学笔记</label>
                  <textarea value={exerciseForm.teachingNotes || ''} onChange={(e) => setExerciseForm((prev) => ({ ...prev, teachingNotes: e.target.value }))} className="min-h-16 rounded-lg border border-gray-200 px-3 py-2 text-sm w-full" placeholder="给教师的说明..." />
                </div>
              </div>
            </details>
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-xs text-gray-400">
              关键词 {exerciseForm.expectedKeywords.filter(Boolean).length} 个
              {exerciseForm.checkRules.length > 0 && ` → ${exerciseForm.checkRules.length} 条检查规则`}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setShowExerciseForm(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
              <button onClick={saveExercise} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? '保存中...' : '保存练习'}
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Quiz Form Modal */}
      {showQuizForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowQuizForm(false); }}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto m-4">
          <div className="mb-4 flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-gray-900">{quizForm.question || '新增测验题'}</h3>
            <button onClick={() => setShowQuizForm(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
          </div>

          {/* Section: Course Binding */}
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">绑定课程</p>
          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">课程 *</label>
              <select value={quizForm.algorithmId} onChange={(e) => setQuizForm((prev) => ({ ...prev, algorithmId: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <optgroup label="基础概念课">
                  {courses.filter((c) => c.type === 'foundation').map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </optgroup>
                <optgroup label="核心算法课">
                  {courses.filter((c) => c.type !== 'foundation').map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">难度</label>
              <select value={quizForm.difficulty || '入门'} onChange={(e) => setQuizForm((prev) => ({ ...prev, difficulty: e.target.value as QuizQuestion['difficulty'] }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                {difficultyOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={quizForm.enabled !== false} onChange={(e) => setQuizForm((prev) => ({ ...prev, enabled: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-600">已启用</span>
              </label>
            </div>
          </div>

          {/* Optional: lessonId/conceptId for foundation courses */}
          {isFoundationCourse(quizForm.algorithmId) && (
            <div className="grid gap-3 md:grid-cols-2 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">关联小节ID（可选）</label>
                <input value={quizForm.lessonId || ''} onChange={(e) => setQuizForm((prev) => ({ ...prev, lessonId: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="如 ml-intro-1" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">关联概念ID（可选）</label>
                <input value={quizForm.conceptId || ''} onChange={(e) => setQuizForm((prev) => ({ ...prev, conceptId: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="如 ml-concept-1" />
              </div>
            </div>
          )}

          {/* Section: Question Content */}
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">题目内容</p>
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">题干 *</label>
            <textarea value={quizForm.question} onChange={(e) => { setQuizForm((prev) => ({ ...prev, question: e.target.value })); setQuizErrors((prev) => { const n={...prev}; delete n.question; return n; }); }} className={`min-h-16 rounded-lg border px-3 py-2 text-sm w-full ${quizErrors.question ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="输入题目..." />
            {quizErrors.question && <p className="text-xs text-red-500 mt-0.5">{quizErrors.question}</p>}
          </div>
          <div className="grid gap-2 mb-3">
            {quizForm.options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="radio" name="correctAnswer" checked={quizForm.correctIndex === idx} onChange={() => setQuizForm((prev) => ({ ...prev, correctIndex: idx }))} className="flex-shrink-0" />
                <span className="text-[11px] font-bold text-gray-400 w-5">{String.fromCharCode(65 + idx)}.</span>
                <input value={option} onChange={(e) => { setQuizForm((prev) => ({ ...prev, options: prev.options.map((o, i) => i === idx ? e.target.value : o) })); setQuizErrors((prev) => { const n={...prev}; delete n.options; return n; }); }} className={`flex-1 rounded-lg border px-3 py-2 text-sm ${quizErrors.options ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder={`选项 ${idx + 1}`} />
                {idx === quizForm.correctIndex && <span className="text-[10px] text-green-600 font-semibold flex-shrink-0">✓ 正确答案</span>}
              </div>
            ))}
            {quizErrors.options && <p className="text-xs text-red-500">{quizErrors.options}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">解析 *</label>
            <textarea value={quizForm.explanation} onChange={(e) => { setQuizForm((prev) => ({ ...prev, explanation: e.target.value })); setQuizErrors((prev) => { const n={...prev}; delete n.explanation; return n; }); }} className={`min-h-16 rounded-lg border px-3 py-2 text-sm w-full ${quizErrors.explanation ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="解释为什么这个答案是正确的..." />
            {quizErrors.explanation && <p className="text-xs text-red-500 mt-0.5">{quizErrors.explanation}</p>}
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-xs text-gray-400">点击选项前的 ○ 标记正确答案</span>
            <div className="flex gap-2">
              <button onClick={() => setShowQuizForm(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
              <button onClick={saveQuiz} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? '保存中...' : '保存测验题'}
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* AI Generate Exercise Modal */}
      {showAIGenExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h3 className="font-bold text-gray-900">AI 生成练习题</h3>
              </div>
              <button onClick={() => setShowAIGenExercise(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="h-4 w-4 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">选择课程 *</label>
                <select value={aiExerciseInput.courseId} onChange={(e) => setAiExerciseInput((prev) => ({ ...prev, courseId: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  <optgroup label="核心算法课">
                    {courses.filter((c) => c.type !== 'foundation').map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">难度</label>
                <select value={aiExerciseInput.difficulty} onChange={(e) => setAiExerciseInput((prev) => ({ ...prev, difficulty: e.target.value as '入门' | '中级' | '进阶' }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  {difficultyOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">生成要求</label>
                <textarea
                  value={aiExerciseInput.requirements}
                  onChange={(e) => setAiExerciseInput((prev) => ({ ...prev, requirements: e.target.value }))}
                  className="min-h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm w-full"
                  placeholder={`描述想要的练习题，例如：\n"生成一道 KNN 入门练习，要求学生使用 KNeighborsClassifier、fit、predict，并能通过 accuracy 测试"`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setShowAIGenExercise(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
              <button onClick={handleAIGenerateExercise} disabled={aiGenLoading} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {aiGenLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {aiGenLoading ? '生成中...' : '生成草稿'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Quiz Modal */}
      {showAIGenQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h3 className="font-bold text-gray-900">AI 生成测验题</h3>
              </div>
              <button onClick={() => setShowAIGenQuiz(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="h-4 w-4 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">选择课程 *</label>
                <select value={aiQuizInput.courseId} onChange={(e) => setAiQuizInput((prev) => ({ ...prev, courseId: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  <optgroup label="基础概念课">
                    {courses.filter((c) => c.type === 'foundation').map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </optgroup>
                  <optgroup label="核心算法课">
                    {courses.filter((c) => c.type !== 'foundation').map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">难度</label>
                <select value={aiQuizInput.difficulty} onChange={(e) => setAiQuizInput((prev) => ({ ...prev, difficulty: e.target.value as '入门' | '中级' | '进阶' }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  {difficultyOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {isFoundationCourse(aiQuizInput.courseId) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">关联小节ID（可选）</label>
                    <input value={aiQuizInput.lessonId} onChange={(e) => setAiQuizInput((prev) => ({ ...prev, lessonId: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="如 ml-intro-1" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">关联概念ID（可选）</label>
                    <input value={aiQuizInput.conceptId} onChange={(e) => setAiQuizInput((prev) => ({ ...prev, conceptId: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="如 ml-concept-1" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">生成要求</label>
                <textarea
                  value={aiQuizInput.requirements}
                  onChange={(e) => setAiQuizInput((prev) => ({ ...prev, requirements: e.target.value }))}
                  className="min-h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm w-full"
                  placeholder={`描述想要的测验题，例如：\n"围绕分类指标 precision、recall、F1 生成一道容易混淆的选择题"`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setShowAIGenQuiz(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
              <button onClick={handleAIGenerateQuiz} disabled={aiGenLoading} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {aiGenLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {aiGenLoading ? '生成中...' : '生成草稿'}
              </button>
            </div>
          </div>
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
              <button onClick={() => setPreviewQuestion(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
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
              确定要清除所有自定义{mode === 'exercise' ? '练习题' : '测验题'}并恢复为内置默认题库吗？所有自定义和AI生成的{mode === 'exercise' ? '练习' : '测验'}数据将被永久删除。
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowRestoreConfirm(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">取消</button>
              <button onClick={handleRestoreDefaults} className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600">确认恢复</button>
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
