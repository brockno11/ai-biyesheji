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
  { value: 'regression', label: '回归算法' },
  { value: 'classification', label: '分类算法' },
  { value: 'tree', label: '树形算法' },
  { value: 'clustering', label: '聚类算法' },
];
const DIFFICULTIES: Algorithm['difficulty'][] = ['入门', '中级', '进阶'];

const emptyForm: Algorithm = {
  id: '', name: '', category: 'regression', difficulty: '入门', icon: '📈',
  intro: '', description: '', formula: '', steps: [''], advantages: [''],
  disadvantages: [''], useCases: [''], codeExample: '', videoUrl: '',
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
  });
  const [draftLoading, setDraftLoading] = useState(false);
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
    setShowForm(true);
  };

  const openEdit = (course: Algorithm) => {
    setForm({
      ...course,
      steps: [...course.steps],
      advantages: [...course.advantages],
      disadvantages: [...course.disadvantages],
      useCases: [...course.useCases],
    });
    setEditingId(course.id);
    setShowForm(true);
  };

  const handleSave = () => {
    const result = validateAlgorithm(form);
    if (!result.success) {
      setFieldErrors(flattenZodErrors(result));
      showToast('error', '请检查表单中的错误');
      return;
    }
    setFieldErrors({});
    storageService.saveCustomCourse(form);
    setCustomCourses(storageService.getCustomCourses());
    setShowForm(false);
    showToast('success', editingId ? '课程已更新' : '课程已添加');
  };

  const handleGenerateDraft = async () => {
    if (!draftInput.name.trim()) {
      showToast('error', '请先输入算法名称');
      return;
    }
    setDraftLoading(true);
    try {
      const result = await aiService.generateCourseDraft({
        courseDraftInput: draftInput,
        pagePosition: '管理后台课程生成',
      });
      const draft = result.data;
      setForm({
        id: 'custom-' + Date.now(),
        name: draft.name || draftInput.name,
        category: draftInput.category,
        difficulty: draftInput.difficulty,
        icon: emptyForm.icon,
        intro: draft.intro || '',
        description: draft.description || '',
        formula: draft.formula || '',
        steps: draft.steps?.length ? draft.steps : [''],
        advantages: draft.pros?.length ? draft.pros : [''],
        disadvantages: draft.cons?.length ? draft.cons : [''],
        useCases: draft.useCases?.length ? draft.useCases : [''],
        codeExample: draft.codeExample || '',
        videoUrl: '',
      });
      setEditingId(null);
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

  const updateField = (field: keyof Algorithm, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateArrayItem = (
    field: 'steps' | 'advantages' | 'disadvantages' | 'useCases',
    index: number,
    value: string
  ) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field: 'steps' | 'advantages' | 'disadvantages' | 'useCases') => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (
    field: 'steps' | 'advantages' | 'disadvantages' | 'useCases',
    index: number
  ) => {
    setForm((prev) => {
      const arr = prev[field].filter((_, i) => i !== index);
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
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            添加课程
          </button>
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
            placeholder="算法名称，如 SVM"
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
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">内置</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">自定义</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/algorithms/${course.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                          title="预览"
                        >
                          <Eye className="w-3.5 h-3.5" />
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
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">课程名称 *</label>
                  <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)}
                    placeholder="例如：支持向量机 SVM"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
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
                <input type="text" value={form.intro} onChange={(e) => updateField('intro', e.target.value)}
                  placeholder="用一句话介绍这个算法..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
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
                      {form[field].map((item, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={item} onChange={(e) => updateArrayItem(field, i, e.target.value)}
                            placeholder={`${labels[field]} ${i + 1}...`}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
                          <button onClick={() => removeArrayItem(field, i)}
                            className="px-2 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
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
