import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Save, X, Search, Eye, AlertTriangle, CheckCircle2, GraduationCap,
  Sparkles, Download, Upload,
} from 'lucide-react';
import { algorithms as staticAlgorithms } from '../data/algorithms';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { validateAlgorithm, flattenZodErrors } from '../services/validationService';
import type { Algorithm } from '../types';

const DEFAULT_ICONS = ['📈', '🎯', '🌳', '🧠', '🤖', '📊', '🔍', '💡', '⚡', '🔬', '📐', '🎓'];
const CATEGORIES: { value: Algorithm['category']; label: string }[] = [
  { value: 'basic', label: '基础课程' },
  { value: 'regression', label: '回归算法' },
  { value: 'classification', label: '分类算法' },
  { value: 'tree', label: '树形算法' },
  { value: 'clustering', label: '聚类算法' },
  { value: 'ensemble', label: '集成学习' },
];
const VISUALIZATION_TYPES = ['', 'linear-regression', 'knn', 'logistic-regression', 'decision-tree', 'k-means', 'random-forest'];
const INTERACTION_TYPES = ['programming-vs-ml', 'ai-ml-dl-map', 'task-type-classifier', 'workflow-simulator', 'data-table-guide', 'feature-label-selector', 'xy-splitter', 'train-test-split', 'regression-metric-lab', 'classification-metric-lab', 'overfitting-playground', 'hyperparameter-lab', 'cross-validation-simulator', 'leakage-detective'];
const DIFFICULTIES: Algorithm['difficulty'][] = ['入门', '中级', '进阶'];

const emptyForm: Algorithm = {
  id: '', type: 'algorithm', name: '', category: 'regression', difficulty: '入门', icon: '📈',
  intro: '', description: '', formula: '', steps: [''], advantages: [''],
  disadvantages: [''], useCases: [''], codeExample: '', videoUrl: '',
  hasPractice: false, hasQuiz: true, visualizationType: '', sortOrder: 10,
};

export default function AdminCoursePanel() {
  const [customCourses, setCustomCourses] = useState<Algorithm[]>(() =>
    storageService.getCustomCourses()
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Algorithm>(emptyForm);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [draftInput, setDraftInput] = useState({
    name: '',
    difficulty: '入门' as Algorithm['difficulty'],
    category: 'regression' as Algorithm['category'],
    keywords: '',
    requirements: '',
    audience: '零基础' as string,
    needInteraction: true,
    needQuiz: true,
    needCodeExample: true,
    style: '通俗' as string,
  });
  const [draftLoading, setDraftLoading] = useState(false);
  const [showDraftDetails, setShowDraftDetails] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [previewCourse, setPreviewCourse] = useState<Algorithm | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const allCourses = [...staticAlgorithms, ...customCourses];
  const staticIds = new Set(staticAlgorithms.map((a) => a.id));

  const filtered = allCourses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.includes(search.toLowerCase())
  );

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const openAdd = () => {
    setForm({ ...emptyForm, id: 'custom-' + Date.now() });
    setEditingId(null);
    setFieldErrors({});
    setShowForm(true);
  };

  const openEdit = (course: Algorithm) => {
    setForm({
      ...course,
      steps: [...(course.steps || [])],
      advantages: [...(course.advantages || [])],
      disadvantages: [...(course.disadvantages || [])],
      useCases: [...(course.useCases || [])],
    });
    setEditingId(course.id);
    setFieldErrors({});
    setShowForm(true);
  };

  const handleSave = () => {
    // Basic validation
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = '课程名称不能为空';
    if (!form.intro.trim()) errs.intro = '简介不能为空';
    if (!form.description.trim()) errs.description = '描述不能为空';
    if (form.type === 'foundation' && (!form.lessons || form.lessons.length === 0))
      errs.lessons = '基础课至少需要1个小节';
    if (form.type !== 'foundation' && (!form.steps || form.steps.filter((s) => s.trim()).length === 0))
      errs.steps = '算法课至少需要1个步骤';
    if (form.visualizationType && !VISUALIZATION_TYPES.includes(form.visualizationType))
      errs.visualizationType = '不支持的可视化类型';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      showToast('error', '请检查表单中的错误');
      return;
    }

    const result = validateAlgorithm(form);
    if (!result.success) {
      setFieldErrors(flattenZodErrors(result));
      showToast('error', '请检查表单中的错误');
      return;
    }
    setFieldErrors({});
    // Auto-set hasPractice based on type
    const toSave = { ...form, hasPractice: form.type === 'foundation' ? false : (form.hasPractice ?? false) };
    storageService.saveCustomCourse(toSave as Algorithm);
    setCustomCourses(storageService.getCustomCourses());
    setShowForm(false);
    showToast('success', editingId ? '课程已更新' : '课程已添加');
  };

  const handleGenerateDraft = async () => {
    if (!draftInput.name.trim()) {
      showToast('error', '请先输入课程名称');
      return;
    }
    setDraftLoading(true);
    try {
      const requirements = [
        `面向对象：${draftInput.audience}`,
        draftInput.needInteraction ? '需要互动实验' : '',
        draftInput.needQuiz ? '需要配套测验' : '',
        draftInput.needCodeExample ? '需要代码示例' : '',
        `课程风格：${draftInput.style}`,
        draftInput.requirements || '',
      ].filter(Boolean).join('；');
      const result = await aiService.generateCourseDraft({
        courseDraftInput: {
          ...draftInput,
          type: form.type || 'algorithm',
          requirements,
        } as typeof draftInput & { type?: string; requirements?: string },
        pagePosition: '管理后台课程生成',
      });
      const draft = result.data;
      const isFoundation = form.type === 'foundation';
      setForm({
        id: 'custom-' + Date.now(),
        type: form.type || 'algorithm',
        name: draft.name || draftInput.name,
        category: isFoundation ? 'basic' : draftInput.category,
        difficulty: draftInput.difficulty,
        icon: isFoundation ? '📚' : emptyForm.icon,
        intro: draft.intro || '',
        description: draft.description || '',
        formula: isFoundation ? '' : (draft.formula || ''),
        steps: isFoundation ? [] : (draft.steps?.length ? draft.steps : ['']),
        advantages: isFoundation ? [] : (draft.pros?.length ? draft.pros : ['']),
        disadvantages: isFoundation ? [] : (draft.cons?.length ? draft.cons : ['']),
        useCases: isFoundation ? [] : (draft.useCases?.length ? draft.useCases : ['']),
        codeExample: isFoundation ? '' : (draft.codeExample || ''),
        videoUrl: '',
        hasPractice: !isFoundation,
        hasQuiz: true,
        sortOrder: 10,
      });
      setEditingId(null);
      setFieldErrors({});
      setShowForm(true);
      showToast('success', result.mode === 'deepseek' ? 'DeepSeek 已生成课程草稿' : '已生成 Mock 课程草稿');
    } catch {
      showToast('error', '课程草稿生成失败');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    storageService.deleteCustomCourse(id);
    setCustomCourses(storageService.getCustomCourses());
    setDeleteConfirm(null);
    showToast('success', '课程已删除');
  };

  const handleExportCourses = () => {
    const data = JSON.stringify(customCourses, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-courses-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', '自定义课程已导出');
  };

  const handleImportCourses = () => {
    importFileRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const raw = JSON.parse(evt.target?.result as string);
        if (!Array.isArray(raw)) {
          showToast('error', '导入失败：文件格式不正确，应为数组');
          return;
        }
        const allIds = new Set([...staticAlgorithms, ...customCourses].map((c) => c.id));
        const imported: Algorithm[] = [];
        for (const item of raw) {
          const result = validateAlgorithm(item);
          if (!result.success) {
            showToast('error', `导入失败：课程 "${item.name || '(无名称)'}" 校验不通过`);
            return;
          }
          // Warn on ID conflict, auto-rename
          if (allIds.has(result.data.id)) {
            result.data.id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          }
          allIds.add(result.data.id);
          imported.push(result.data);
        }
        for (const course of imported) {
          storageService.saveCustomCourse(course);
        }
        setCustomCourses(storageService.getCustomCourses());
        showToast('success', `成功导入 ${imported.length} 门课程`);
      } catch {
        showToast('error', '导入失败：无法解析 JSON 文件');
      }
    };
    reader.readAsText(file);
    if (importFileRef.current) importFileRef.current.value = '';
  };

  const updateField = (field: keyof Algorithm, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateArrayItem = (
    field: 'steps' | 'advantages' | 'disadvantages' | 'useCases',
    index: number,
    value: string
  ) => {
    setForm((prev) => {
      const arr = [...(prev[field] as string[] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field: 'steps' | 'advantages' | 'disadvantages' | 'useCases') => {
    setForm((prev) => ({ ...prev, [field]: [...(prev[field] as string[] || []), ''] }));
  };

  const removeArrayItem = (
    field: 'steps' | 'advantages' | 'disadvantages' | 'useCases',
    index: number
  ) => {
    setForm((prev) => {
      const arr = (prev[field] as string[] | undefined || []).filter((_, i) => i !== index);
      return { ...prev, [field]: arr.length === 0 ? [''] : arr };
    });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">课程管理</h2>
          <p className="text-sm text-gray-500">
            内置 {staticAlgorithms.length} 门 + 自定义 {customCourses.length} 门
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索课程..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCourses}
              disabled={customCourses.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              title="导出自定义课程"
            >
              <Download className="h-3.5 w-3.5" />
              导出
            </button>
            <button
              onClick={handleImportCourses}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              title="导入课程 JSON"
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
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              添加课程
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 to-accent-50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI 生成课程草稿</h3>
            <p className="text-xs text-slate-500">生成后会先填入表单，确认后再保存。</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_1.5fr_auto]">
          <input
            value={draftInput.name}
            onChange={(e) => setDraftInput((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="课程名称，如 SVM"
            className="rounded-xl border border-white/80 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <select
            value={draftInput.category}
            onChange={(e) => setDraftInput((prev) => ({ ...prev, category: e.target.value as Algorithm['category'] }))}
            className="rounded-xl border border-white/80 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            value={draftInput.difficulty}
            onChange={(e) => setDraftInput((prev) => ({ ...prev, difficulty: e.target.value as Algorithm['difficulty'] }))}
            className="rounded-xl border border-white/80 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {DIFFICULTIES.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          <input
            value={draftInput.keywords}
            onChange={(e) => setDraftInput((prev) => ({ ...prev, keywords: e.target.value }))}
            placeholder="关键词，如 间隔 最大化 核函数"
            className="rounded-xl border border-white/80 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <button
            onClick={handleGenerateDraft}
            disabled={draftLoading}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {draftLoading ? '生成中...' : '生成草稿'}
          </button>
        </div>
        <button
          onClick={() => setShowDraftDetails(!showDraftDetails)}
          className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          {showDraftDetails ? '收起课程设计要求 ▲' : '展开课程设计要求 ▼'}
        </button>
        {showDraftDetails && (
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">面向对象</label>
              <select value={draftInput.audience} onChange={(e) => setDraftInput((prev) => ({ ...prev, audience: e.target.value }))} className="w-full rounded-xl border border-white/80 bg-white px-3 py-2 text-sm">
                <option value="零基础">零基础</option>
                <option value="有 Python 基础">有 Python 基础</option>
                <option value="中级">中级</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">课程风格</label>
              <select value={draftInput.style} onChange={(e) => setDraftInput((prev) => ({ ...prev, style: e.target.value }))} className="w-full rounded-xl border border-white/80 bg-white px-3 py-2 text-sm">
                <option value="通俗">通俗易懂</option>
                <option value="严谨">严谨学术</option>
                <option value="答辩展示友好">答辩展示友好</option>
              </select>
            </div>
            <div className="flex items-end gap-4 pb-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={draftInput.needInteraction} onChange={(e) => setDraftInput((prev) => ({ ...prev, needInteraction: e.target.checked }))} className="rounded" />
                <span className="text-xs text-gray-600">含互动</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={draftInput.needQuiz} onChange={(e) => setDraftInput((prev) => ({ ...prev, needQuiz: e.target.checked }))} className="rounded" />
                <span className="text-xs text-gray-600">含测验</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={draftInput.needCodeExample} onChange={(e) => setDraftInput((prev) => ({ ...prev, needCodeExample: e.target.checked }))} className="rounded" />
                <span className="text-xs text-gray-600">含代码</span>
              </label>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">额外要求</label>
              <input
                value={draftInput.requirements}
                onChange={(e) => setDraftInput((prev) => ({ ...prev, requirements: e.target.value }))}
                placeholder="想包含的知识点等"
                className="w-full rounded-xl border border-white/80 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Course Table */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">课程</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">分类</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">难度</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">类型</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((course) => {
                const isStatic = staticIds.has(course.id);
                return (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{course.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{course.name}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">{course.intro}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {CATEGORIES.find((c) => c.value === course.category)?.label || course.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        course.difficulty === '入门' ? 'bg-green-100 text-green-700' :
                        course.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {course.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isStatic ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium border border-gray-200">内置</span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium border border-blue-200">自定义</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewCourse(course)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                          title="预览课程"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/algorithms/${course.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-accent-500 hover:bg-accent-50 transition-colors"
                          title="在页面中查看"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </Link>
                        <button
                          onClick={() => openEdit(course)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          title="编辑"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {!isStatic && (
                          <button
                            onClick={() => setDeleteConfirm(course.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                    没有找到匹配的课程
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-gray-900">
                  {editingId ? '编辑课程' : '添加新课程'}
                </h3>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">课程类型 *</label>
                  <select value={form.type || 'algorithm'} onChange={(e) => { const t = e.target.value as Algorithm['type']; updateField('type', t); if (t === 'foundation') { updateField('category', 'basic'); updateField('hasPractice', false); } }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400">
                    <option value="algorithm">核心算法课</option>
                    <option value="foundation">基础概念课</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">课程名称 *</label>
                  <input type="text" value={form.name} onChange={(e) => { updateField('name', e.target.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.name; return next; }); }}
                    placeholder="例如：支持向量机 SVM"
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 ${fieldErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                  {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">图标</label>
                  <select value={form.icon} onChange={(e) => updateField('icon', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400">
                    {DEFAULT_ICONS.map((ic) => (<option key={ic} value={ic}>{ic}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">分类</label>
                  <select value={form.category} onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400">
                    {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">难度</label>
                  <select value={form.difficulty} onChange={(e) => updateField('difficulty', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400">
                    {DIFFICULTIES.map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">一句话简介 *</label>
                <input type="text" value={form.intro} onChange={(e) => { updateField('intro', e.target.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.intro; return next; }); }}
                  placeholder="用一句话介绍这个算法..."
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 ${fieldErrors.intro ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                {fieldErrors.intro && <p className="mt-1 text-xs text-red-500">{fieldErrors.intro}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">详细描述</label>
                <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)}
                  rows={3} placeholder="算法的详细描述..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">核心公式（Markdown）</label>
                <textarea value={form.formula} onChange={(e) => updateField('formula', e.target.value)}
                  rows={4} placeholder="## 公式名称&#10;y = wx + b&#10;..."
                  className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Python 代码示例</label>
                <textarea value={form.codeExample} onChange={(e) => updateField('codeExample', e.target.value)}
                  rows={5} placeholder="import numpy as np&#10;..."
                  className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">B 站视频 URL</label>
                <input type="text" value={form.videoUrl} onChange={(e) => updateField('videoUrl', e.target.value)}
                  placeholder="https://player.bilibili.com/player.html?bvid=..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
              </div>

              {(['steps', 'advantages', 'disadvantages', 'useCases'] as const).map((field) => {
                const labels = { steps: '算法步骤', advantages: '优点', disadvantages: '缺点', useCases: '适用场景' };
                return (
                  <div key={field}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-600">{labels[field]}</label>
                      <button type="button" onClick={() => addArrayItem(field)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium">+ 添加一项</button>
                    </div>
                    <div className="space-y-2">
                      {(form[field] as string[] || []).map((item, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={item} onChange={(e) => updateArrayItem(field, i, e.target.value)}
                            placeholder={`${labels[field]} ${i + 1}...`}
                            className={`flex-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 ${fieldErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                          <button onClick={() => removeArrayItem(field, i)}
                            className="px-2 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {fieldErrors[field] && <p className="mt-1 text-xs text-red-500">{fieldErrors[field]}</p>}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                取消
              </button>
              <button onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-medium text-sm hover:shadow-lg">
                <Save className="w-4 h-4" />保存课程
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">确认删除</h4>
                <p className="text-sm text-gray-500">此操作不可恢复</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              确定要删除"{customCourses.find((c) => c.id === deleteConfirm)?.name}"吗？
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">取消</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600">确认删除</button>
            </div>
          </div>
        </div>
      )}

      {/* Course Preview Modal */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">{previewCourse.icon}</span>
                <h3 className="text-lg font-bold text-gray-900">{previewCourse.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  previewCourse.difficulty === '入门' ? 'bg-green-100 text-green-700' :
                  previewCourse.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>{previewCourse.difficulty}</span>
              </div>
              <button onClick={() => setPreviewCourse(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">简介</p>
                <p className="text-sm text-gray-700">{previewCourse.intro}</p>
              </div>
              {previewCourse.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">详细描述</p>
                  <p className="text-sm text-gray-700">{previewCourse.description}</p>
                </div>
              )}
              {previewCourse.formula && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">核心公式</p>
                  <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-3 font-mono whitespace-pre-wrap">{previewCourse.formula}</pre>
                </div>
              )}
              {(previewCourse.steps || []).length > 0 && (previewCourse.steps || [])[0] !== '' && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">算法步骤</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {(previewCourse.steps || []).filter(Boolean).map((s, i) => (
                      <li key={i} className="text-sm text-gray-700">{s}</li>
                    ))}
                  </ol>
                </div>
              )}
              {(previewCourse.advantages || []).length > 0 && (previewCourse.advantages || [])[0] !== '' && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">优点</p>
                  <ul className="list-disc list-inside space-y-1">
                    {(previewCourse.advantages || []).filter(Boolean).map((a, i) => (
                      <li key={i} className="text-sm text-green-700">{a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(previewCourse.disadvantages || []).length > 0 && (previewCourse.disadvantages || [])[0] !== '' && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">缺点</p>
                  <ul className="list-disc list-inside space-y-1">
                    {(previewCourse.disadvantages || []).filter(Boolean).map((d, i) => (
                      <li key={i} className="text-sm text-red-700">{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(previewCourse.useCases || []).length > 0 && (previewCourse.useCases || [])[0] !== '' && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">适用场景</p>
                  <ul className="list-disc list-inside space-y-1">
                    {(previewCourse.useCases || []).filter(Boolean).map((u, i) => (
                      <li key={i} className="text-sm text-blue-700">{u}</li>
                    ))}
                  </ul>
                </div>
              )}
              {previewCourse.codeExample && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Python 代码示例</p>
                  <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-3 font-mono whitespace-pre-wrap">{previewCourse.codeExample}</pre>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => setPreviewCourse(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                关闭预览
              </button>
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
