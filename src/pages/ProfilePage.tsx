import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  Code2,
  Flame,
  LogOut,
  RotateCcw,
  Shield,
  Target,
  Trophy,
  User,
} from 'lucide-react';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import { useCourses } from '../hooks/useCourses';
import { useAuth } from '../hooks/useAuth';
import { storageService } from '../services/storageService';

const difficultyStyles: Record<string, string> = {
  入门: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  中级: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  进阶: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
};

function formatActivityTime(timestamp?: number) {
  if (!timestamp) return '暂无记录';
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProfilePage() {
  const [progress, setProgress] = useState(() => storageService.getProgress());
  const algorithms = useCourses();
  const { user, logout } = useAuth();

  const refresh = () => setProgress(storageService.getProgress());

  const dashboard = useMemo(() => {
    const completedCount = progress.completedAlgorithms.length;
    const completionPct =
      algorithms.length > 0 ? Math.round((completedCount / algorithms.length) * 100) : 0;
    const bestOverall =
      progress.practiceRecords.length > 0
        ? Math.max(...progress.practiceRecords.map((r) => r.score))
        : 0;
    const averagePractice =
      progress.practiceRecords.length > 0
        ? Math.round(
            progress.practiceRecords.reduce((sum, record) => sum + record.score, 0) /
              progress.practiceRecords.length
          )
        : 0;
    const quizAverage =
      progress.quizRecords.length > 0
        ? Math.round(
            progress.quizRecords.reduce((sum, record) => sum + record.score, 0) /
              progress.quizRecords.length
          )
        : 0;
    const activityTimestamps = [
      ...progress.practiceRecords.map((record) => record.timestamp),
      ...progress.quizRecords.map((record) => record.timestamp),
    ].filter(Boolean);
    const lastActive = activityTimestamps.length > 0 ? Math.max(...activityTimestamps) : progress.lastActive;
    const activeDays = new Set(
      activityTimestamps.map((timestamp) => new Date(timestamp).toLocaleDateString('zh-CN'))
    ).size;
    const nextAlgorithm =
      algorithms.find((algorithm) => !progress.completedAlgorithms.includes(algorithm.id)) ||
      algorithms[algorithms.length - 1];

    const algorithmStats = algorithms.map((algorithm) => {
      const practiceCount = storageService.getPracticeCount(algorithm.id);
      const bestScore = storageService.getBestScore(algorithm.id);
      const quizRecord = progress.quizRecords.find((record) => record.algorithmId === algorithm.id);
      const isCompleted = progress.completedAlgorithms.includes(algorithm.id);
      const estimatedProgress = isCompleted
        ? 100
        : Math.min(90, practiceCount * 25 + (quizRecord ? 25 : 0) + (bestScore >= 60 ? 25 : 0));

      return {
        algorithm,
        bestScore,
        estimatedProgress,
        isCompleted,
        practiceCount,
        quizScore: quizRecord?.score,
      };
    });

    const recentActivities = [
      ...progress.practiceRecords.map((record) => ({
        id: `practice-${record.exerciseId}`,
        label: '代码练习',
        score: record.score,
        timestamp: record.timestamp,
        tone: record.passed ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50',
      })),
      ...progress.quizRecords.map((record) => ({
        id: `quiz-${record.algorithmId}`,
        label: '知识测验',
        score: record.score,
        timestamp: record.timestamp,
        tone: record.score >= 60 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50',
      })),
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return {
      activeDays,
      algorithmStats,
      averagePractice,
      bestOverall,
      completedCount,
      completionPct,
      lastActive,
      nextAlgorithm,
      quizAverage,
      recentActivities,
    };
  }, [algorithms, progress]);

  const handleReset = () => {
    if (window.confirm('确定要重置所有学习进度吗？此操作不可恢复！')) {
      storageService.reset();
      refresh();
    }
  };

  const ringStyle = {
    background: `conic-gradient(#2563eb ${dashboard.completionPct * 3.6}deg, #e2e8f0 0deg)`,
  };

  return (
    <div className="app-page">
      <Header />

      <main className="app-container pt-24">
        <section className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="app-card-soft overflow-hidden">
            <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[auto,minmax(0,1fr)]">
              <div className="flex items-center gap-4">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full" style={ringStyle}>
                  <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white shadow-inner">
                    <User className="h-8 w-8 text-primary-600" />
                  </div>
                  <span className="absolute -bottom-1 rounded-full bg-slate-950 px-2 py-1 text-xs font-bold text-white">
                    {dashboard.completionPct}%
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-primary-700">
                      {user?.role === 'admin' ? '管理员' : '个人中心'}
                    </p>
                    {user?.role === 'admin' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                        管理员
                      </span>
                    )}
                  </div>
                  <h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                    {user?.nickname || '同学'} 的学习仪表盘
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    已完成 {dashboard.completedCount}/{algorithms.length} 门算法课程，最近活跃于{' '}
                    {formatActivityTime(dashboard.lastActive)}。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2">
                {[
                  { icon: Target, label: '完成课程', value: `${dashboard.completedCount}/${algorithms.length}` },
                  { icon: Code2, label: '练习次数', value: String(progress.practiceRecords.length) },
                  { icon: Trophy, label: '最高得分', value: dashboard.bestOverall ? `${dashboard.bestOverall}` : '-' },
                  { icon: Flame, label: '活跃天数', value: String(dashboard.activeDays) },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3">
                      <Icon className="mb-2 h-4 w-4 text-primary-600" />
                      <div className="text-xl font-extrabold text-slate-950">{item.value}</div>
                      <div className="text-xs font-medium text-slate-500">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="app-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent-600" />
              <h2 className="app-section-title">推荐下一步</h2>
            </div>
            {dashboard.nextAlgorithm ? (
              <>
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl">
                    {dashboard.nextAlgorithm.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-950">{dashboard.nextAlgorithm.name}</div>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                      {dashboard.nextAlgorithm.intro}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/algorithms/${dashboard.nextAlgorithm.id}`}
                  className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  继续学习
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <p className="app-muted">课程数据暂不可用。</p>
            )}
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: BarChart3, label: '平均练习分', value: dashboard.averagePractice ? `${dashboard.averagePractice} 分` : '暂无', hint: '来自代码练习记录' },
            { icon: Award, label: '平均测验分', value: dashboard.quizAverage ? `${dashboard.quizAverage} 分` : '暂无', hint: '来自知识测验记录' },
            { icon: CalendarDays, label: '最近活跃', value: formatActivityTime(dashboard.lastActive), hint: '按练习和测验综合计算' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="app-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <Icon className="h-5 w-5 text-primary-600" />
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                    学习情况
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-slate-950">{item.value}</div>
                <div className="mt-1 text-sm font-semibold text-slate-600">{item.label}</div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{item.hint}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="app-card p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="app-section-title">课程掌握情况</h2>
                <p className="app-muted mt-1">结合完成状态、练习次数、最佳得分和测验成绩估算。</p>
              </div>
              <ProgressBar value={dashboard.completedCount} max={algorithms.length} label="总体完成度" />
            </div>

            <div className="grid gap-3">
              {dashboard.algorithmStats.map(({ algorithm, bestScore, estimatedProgress, isCompleted, practiceCount, quizScore }) => (
                <Link
                  key={algorithm.id}
                  to={`/algorithms/${algorithm.id}`}
                  className="group rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-primary-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                        {algorithm.icon}
                      </span>
                      <div>
                        <div className="font-bold text-slate-950 group-hover:text-primary-700">
                          {algorithm.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${difficultyStyles[algorithm.difficulty]}`}>
                            {algorithm.difficulty}
                          </span>
                          <span className="text-xs font-medium text-slate-400">
                            {isCompleted ? '已完成' : practiceCount > 0 ? '进行中' : '未开始'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center sm:w-64">
                      <div>
                        <div className="text-sm font-extrabold text-slate-950">{practiceCount}</div>
                        <div className="text-[11px] text-slate-400">练习</div>
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-primary-700">{bestScore || '-'}</div>
                        <div className="text-[11px] text-slate-400">最佳</div>
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-accent-700">{quizScore ?? '-'}</div>
                        <div className="text-[11px] text-slate-400">测验</div>
                      </div>
                    </div>
                  </div>
                  <ProgressBar value={estimatedProgress} size="sm" showPercent={false} />
                </Link>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="app-card p-5">
              <h2 className="app-section-title mb-4">最近活动</h2>
              {dashboard.recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentActivities.map((activity) => (
                    <div key={`${activity.id}-${activity.timestamp}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                      <div>
                        <div className="text-sm font-bold text-slate-800">{activity.label}</div>
                        <div className="text-xs text-slate-400">{formatActivityTime(activity.timestamp)}</div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${activity.tone}`}>
                        {activity.score} 分
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                  还没有练习或测验记录。先完成一节课程，仪表盘会自动更新。
                </div>
              )}
            </div>

            <div className="app-card p-5">
              <h2 className="app-section-title mb-4">账户与管理</h2>
              <div className="grid gap-3">
                <Link
                  to="/admin"
                  className="focus-ring inline-flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800"
                >
                  <span className="inline-flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    管理后台入口
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={logout}
                  className="focus-ring inline-flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                >
                  <span className="inline-flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </span>
                </button>
                <button
                  onClick={handleReset}
                  className="focus-ring inline-flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <span className="inline-flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    重置所有学习进度
                  </span>
                </button>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
