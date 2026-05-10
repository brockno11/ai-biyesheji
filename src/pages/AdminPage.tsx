import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Shield, LayoutDashboard, BookOpen, BarChart3,
  Users, TrendingUp, Database, HardDrive, Activity, ClipboardList,
  Server, FileText, LogIn, AlertCircle, Wifi, WifiOff, Clock,
} from 'lucide-react';
import { algorithms as staticAlgorithms } from '../data/algorithms';
import { getAllExercises, getAllQuizQuestions } from '../data/exercises';
import { storageService } from '../services/storageService';
import { useAuth } from '../hooks/useAuth';
import { adminApiService } from '../services/adminApiService';
import AdminCoursePanel from '../components/AdminCoursePanel';
import AdminQuestionPanel from '../components/AdminQuestionPanel';

type AdminTab = 'dashboard' | 'courses' | 'questions' | 'audit';

const adminTabs: { key: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard', label: '系统概览', icon: LayoutDashboard },
  { key: 'courses', label: '课程管理', icon: BookOpen },
  { key: 'questions', label: '题库管理', icon: ClipboardList },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const { user } = useAuth();

  // Backend admin state
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => adminApiService.isLoggedIn());
  const [adminLoginUser, setAdminLoginUser] = useState('');
  const [adminLoginPass, setAdminLoginPass] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<Record<string, unknown>[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [backendStats, setBackendStats] = useState<Record<string, number> | null>(null);

  const checkBackend = useCallback(async () => {
    const online = await adminApiService.isBackendOnline();
    setBackendOnline(online);
    if (online && adminLoggedIn) {
      try {
        const res = await adminApiService.getAdminStats();
        if (res.ok) setBackendStats(res.data as Record<string, number>);
        const logsRes = await adminApiService.getAdminAuditLogs(20);
        if (logsRes.ok) setAuditLogs(logsRes.data as Record<string, unknown>[]);
      } catch { /* ignore */ }
    }
  }, [adminLoggedIn]);

  useEffect(() => { checkBackend(); }, [checkBackend]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoginLoading(true);
    try {
      const res = await adminApiService.loginAdmin(adminLoginUser, adminLoginPass);
      if (res.ok) {
        setAdminLoggedIn(true);
        setAdminLoginPass('');
        checkBackend();
      } else {
        setAdminLoginError(res.message || '登录失败');
      }
    } catch {
      setAdminLoginError('后端服务不可用');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    adminApiService.logoutAdmin();
    setAdminLoggedIn(false);
    setBackendStats(null);
    setAuditLogs([]);
  };

  const loadAuditLogs = async () => {
    setAuditLogsLoading(true);
    try {
      const res = await adminApiService.getAdminAuditLogs(50);
      if (res.ok) setAuditLogs(res.data as Record<string, unknown>[]);
    } finally {
      setAuditLogsLoading(false);
    }
  };

  const customCourses = storageService.getCustomCourses();
  const progress = storageService.getProgress();
  const allCourses = [...staticAlgorithms, ...customCourses];

  // System stats
  const stats = {
    totalCourses: allCourses.length,
    builtInCourses: staticAlgorithms.length,
    customCourses: customCourses.length,
    totalExercises: getAllExercises().length,
    totalQuizzes: getAllQuizQuestions().length,
    totalPracticeRecords: progress.practiceRecords.length,
    totalQuizRecords: progress.quizRecords.length,
    completedAlgorithms: progress.completedAlgorithms.length,
  };

  // Dynamic admin tabs
  const currentTabs = adminLoggedIn
    ? [...adminTabs, { key: 'audit' as AdminTab, label: '操作日志', icon: FileText }]
    : adminTabs;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回个人中心
            </Link>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">管理后台</span>
              <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                管理员
              </span>
            </div>
          </div>
          <Link
            to="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            返回前台 →
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Admin Sidebar */}
          <aside className="lg:w-52 flex-shrink-0">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-3">
              <div className="px-3 py-2 mb-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  管理导航
                </div>
              </div>
              <div className="space-y-0.5">
                {currentTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 shadow-sm border border-amber-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'dashboard' ? (
              /* ═══ Dashboard ═══ */
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">系统概览</h2>
                  <p className="text-sm text-gray-500">平台运行数据一览</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: BookOpen, label: '课程总数', value: String(stats.totalCourses), sub: `${stats.builtInCourses} 内置 + ${stats.customCourses} 自定义`, gradient: 'from-blue-500 to-cyan-500' },
                    { icon: Database, label: '练习记录', value: String(stats.totalPracticeRecords), sub: '条代码提交', gradient: 'from-emerald-500 to-teal-500' },
                    { icon: Activity, label: '测验记录', value: String(stats.totalQuizRecords), sub: '次知识测验', gradient: 'from-violet-500 to-purple-500' },
                    { icon: TrendingUp, label: '完成率', value: `${Math.round((stats.completedAlgorithms / Math.max(stats.totalCourses, 1)) * 100)}%`, sub: `${stats.completedAlgorithms}/${stats.totalCourses} 门`, gradient: 'from-amber-500 to-yellow-500' },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{s.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                        <div className="text-[10px] text-gray-400">{s.sub}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Course Overview */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">课程清单</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">图标</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">名称</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">分类</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">难度</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">类型</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">练习次数</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">最佳得分</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {allCourses.map((course) => {
                          const isStatic = staticAlgorithms.some((s) => s.id === course.id);
                          const practiceCount = storageService.getPracticeCount(course.id);
                          const bestScore = storageService.getBestScore(course.id);
                          return (
                            <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-3 text-lg">{course.icon}</td>
                              <td className="px-5 py-3">
                                <div className="text-sm font-semibold text-gray-900">{course.name}</div>
                                <div className="text-xs text-gray-400 truncate max-w-[200px]">{course.intro}</div>
                              </td>
                              <td className="px-5 py-3">
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                  {{ regression: '回归', classification: '分类', tree: '树形', clustering: '聚类', basic: '基础', ensemble: '集成学习' }[course.category]}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  course.difficulty === '入门' ? 'bg-green-100 text-green-700' :
                                  course.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>{course.difficulty}</span>
                              </td>
                              <td className="px-5 py-3">
                                {isStatic ? (
                                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium border border-gray-200">内置</span>
                                ) : (
                                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium border border-blue-200">自定义</span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-sm text-gray-600">{practiceCount} 次</td>
                              <td className="px-5 py-3">
                                <span className={`text-sm font-bold ${bestScore >= 80 ? 'text-green-600' : bestScore > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                                  {bestScore > 0 ? `${bestScore}分` : '-'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* System Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <HardDrive className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">存储方式</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {adminLoggedIn && backendOnline ? 'Express 后端 + 服务端 JSON' : '浏览器 localStorage'}
                    </p>
                    {backendStats?.updatedAt && (
                      <p className="text-xs text-gray-400 mt-1">最近更新：{new Date(backendStats.updatedAt as number).toLocaleString('zh-CN')}</p>
                    )}
                  </div>
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Server className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">后端状态</span>
                    </div>
                    {backendOnline === null ? (
                      <span className="text-sm text-gray-400">检测中...</span>
                    ) : backendOnline ? (
                      <span className="text-sm text-green-600 flex items-center gap-1"><Wifi className="w-3.5 h-3.5" />在线 — :8787</span>
                    ) : (
                      <span className="text-sm text-red-500 flex items-center gap-1"><WifiOff className="w-3.5 h-3.5" />离线</span>
                    )}
                    {adminLoggedIn && (
                      <button onClick={handleAdminLogout} className="mt-2 block text-xs text-amber-600 hover:underline">退出后端登录</button>
                    )}
                  </div>
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-gray-700">技术栈</span>
                    </div>
                    <p className="text-sm text-gray-500">React 18 + TypeScript + Vite + Express + Tailwind</p>
                  </div>
                </div>

                {/* Backend admin login */}
                {!adminLoggedIn && (
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Server className="w-5 h-5 text-amber-600" />
                      <h3 className="text-base font-bold text-gray-900">管理员后端登录</h3>
                      {backendOnline === null ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">检测中...</span>
                      ) : backendOnline ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1"><Wifi className="w-3 h-3" />在线</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1"><WifiOff className="w-3 h-3" />离线</span>
                      )}
                    </div>
                    {backendOnline === false && (
                      <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        后端管理服务未运行，当前使用本地 localStorage 模式。
                      </div>
                    )}
                    {backendOnline && (
                      <form onSubmit={handleAdminLogin} className="flex flex-wrap gap-3 items-end">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">用户名</label>
                          <input value={adminLoginUser} onChange={(e) => setAdminLoginUser(e.target.value)} placeholder="admin" className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-gray-50/50 w-36" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">密码</label>
                          <input type="password" value={adminLoginPass} onChange={(e) => setAdminLoginPass(e.target.value)} placeholder="123456" className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-gray-50/50 w-36" />
                        </div>
                        <button type="submit" disabled={adminLoginLoading} className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                          {adminLoginLoading ? '登录中...' : '登录后端'}
                        </button>
                        {adminLoginError && <span className="text-xs text-red-600 ml-2">{adminLoginError}</span>}
                      </form>
                    )}
                    <p className="mt-3 text-xs text-gray-400">默认：admin / 123456（.env 中配置）</p>
                  </div>
                )}
              </div>
            ) : activeTab === 'courses' ? (
              /* ═══ Course Management ═══ */
              <AdminCoursePanel />
            ) : activeTab === 'audit' ? (
              /* ═══ Audit Logs ═══ */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">操作日志</h2>
                    <p className="text-sm text-gray-500">管理员操作记录（最近 50 条）</p>
                  </div>
                  <button
                    onClick={loadAuditLogs}
                    disabled={auditLogsLoading}
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all disabled:opacity-50"
                  >
                    {auditLogsLoading ? '加载中...' : '刷新'}
                  </button>
                </div>
                {auditLogs.length === 0 ? (
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-8 text-center text-sm text-gray-500">
                    暂无操作日志
                  </div>
                ) : (
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase w-16">操作</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase w-16">类型</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">详情</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase w-44">时间</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {auditLogs.map((log: any) => {
                            const actionStyles: Record<string, string> = {
                              create: 'bg-green-100 text-green-700',
                              update: 'bg-blue-100 text-blue-700',
                              delete: 'bg-red-100 text-red-700',
                              disable: 'bg-yellow-100 text-yellow-700',
                              enable: 'bg-emerald-100 text-emerald-700',
                              import: 'bg-purple-100 text-purple-700',
                              export: 'bg-violet-100 text-violet-700',
                            };
                            const actionLabels: Record<string, string> = {
                              create: '新增', update: '编辑', delete: '删除',
                              disable: '停用', enable: '启用', import: '导入', export: '导出',
                            };
                            const targetLabels: Record<string, string> = {
                              course: '课程', exercise: '练习', quiz: '测验', system: '系统',
                            };
                            return (
                              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-5 py-3">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionStyles[log.action as string] || 'bg-gray-100 text-gray-600'}`}>
                                    {actionLabels[log.action as string] || log.action}
                                  </span>
                                </td>
                                <td className="px-5 py-3 text-xs text-gray-500">
                                  {targetLabels[log.targetType as string] || log.targetType}
                                </td>
                                <td className="px-5 py-3 text-sm text-gray-700">{log.detail}</td>
                                <td className="px-5 py-3 text-xs text-gray-400">
                                  {new Date(log.timestamp as number).toLocaleString('zh-CN')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <AdminQuestionPanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
