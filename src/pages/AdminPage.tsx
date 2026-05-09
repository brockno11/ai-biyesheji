import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Shield, LayoutDashboard, BookOpen, BarChart3,
  Users, TrendingUp, Database, HardDrive, Activity,
} from 'lucide-react';
import { algorithms as staticAlgorithms } from '../data/algorithms';
import { storageService } from '../services/storageService';
import AdminCoursePanel from '../components/AdminCoursePanel';

type AdminTab = 'dashboard' | 'courses';

const adminTabs: { key: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard', label: '系统概览', icon: LayoutDashboard },
  { key: 'courses', label: '课程管理', icon: BookOpen },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const customCourses = storageService.getCustomCourses();
  const progress = storageService.getProgress();
  const allCourses = [...staticAlgorithms, ...customCourses];
  const totalUsers = 1; // Single-user system

  // System stats
  const stats = {
    totalCourses: allCourses.length,
    builtInCourses: staticAlgorithms.length,
    customCourses: customCourses.length,
    totalExercises: 4, // from static data
    totalQuizzes: 15,
    totalPracticeRecords: progress.practiceRecords.length,
    totalQuizRecords: progress.quizRecords.length,
    completedAlgorithms: progress.completedAlgorithms.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
              <div className="px-3 py-2 mb-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  管理导航
                </div>
              </div>
              <div className="space-y-0.5">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-amber-50 text-amber-700 shadow-sm'
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
                    { icon: BookOpen, label: '课程总数', value: String(stats.totalCourses), sub: `${stats.builtInCourses} 内置 + ${stats.customCourses} 自定义`, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: Database, label: '练习记录', value: String(stats.totalPracticeRecords), sub: '条代码提交', color: 'text-green-600', bg: 'bg-green-50' },
                    { icon: Activity, label: '测验记录', value: String(stats.totalQuizRecords), sub: '次知识测验', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { icon: TrendingUp, label: '完成率', value: `${Math.round((stats.completedAlgorithms / Math.max(stats.totalCourses, 1)) * 100)}%`, sub: `${stats.completedAlgorithms}/${stats.totalCourses} 门`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                          <Icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                        <div className="text-[10px] text-gray-400">{s.sub}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Course Overview */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
                                  {{ regression: '回归', classification: '分类', tree: '树形' }[course.category]}
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
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">内置</span>
                                ) : (
                                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">自定义</span>
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
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <HardDrive className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">存储方式</span>
                    </div>
                    <p className="text-sm text-gray-500">浏览器 localStorage，数据仅存在于本地设备</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">用户模式</span>
                    </div>
                    <p className="text-sm text-gray-500">单用户本地模式，无需登录注册，开箱即用</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">技术栈</span>
                    </div>
                    <p className="text-sm text-gray-500">React 18 + TypeScript + Vite + Tailwind CSS + ECharts + Monaco Editor</p>
                  </div>
                </div>
              </div>
            ) : (
              /* ═══ Course Management ═══ */
              <AdminCoursePanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
