import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, User, Code2, Trophy, Target, BookOpen, Settings,
  ChevronRight, RotateCcw, Award, Brain, Shield,
} from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { storageService } from '../services/storageService';
import ProgressBar from '../components/ProgressBar';

export default function ProfilePage() {
  const [progress, setProgress] = useState(() => storageService.getProgress());
  const algorithms = useCourses();

  const refresh = () => setProgress(storageService.getProgress());

  const completedCount = progress.completedAlgorithms.length;
  const totalPractices = progress.practiceRecords.length;
  const bestOverall = totalPractices > 0
    ? Math.max(...progress.practiceRecords.map((r) => r.score))
    : 0;

  const lastPractice = progress.practiceRecords
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  const handleReset = () => {
    if (window.confirm('确定要重置所有学习进度吗？此操作不可恢复！')) {
      storageService.reset();
      refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">个人中心</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
              同学
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">机器学习爱好者</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {completedCount === 0
                  ? '刚刚开始机器学习之旅，加油！'
                  : `已坚持学习，完成了 ${completedCount} 门算法课程`}
              </p>
            </div>
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-all"
              title="管理员入口"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">管理员入口</span>
            </Link>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Target, label: '已完成算法', value: `${completedCount}/${algorithms.length}`, color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Code2, label: '代码练习', value: String(totalPractices), sub: '次', color: 'text-green-600', bg: 'bg-green-50' },
            { icon: Trophy, label: '最高得分', value: totalPractices > 0 ? String(bestOverall) : '-', sub: '分', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { icon: Brain, label: '知识测验', value: String(progress.quizRecords.length), sub: '次', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className={`text-2xl font-bold ${s.color}`}>
                  {s.value}{s.sub && <span className="text-sm font-normal text-gray-400">{s.sub}</span>}
                </div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── Overall Progress ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">总体学习进度</h3>
          <ProgressBar value={completedCount} max={algorithms.length} label="算法课程完成情况" size="lg" />
        </div>

        {/* ── Per-Algorithm Detail ── */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">各算法学习详情</h3>
          <div className="space-y-3">
            {algorithms.map((algo) => {
              const isCompleted = storageService.isCompleted(algo.id);
              const bestScore = storageService.getBestScore(algo.id);
              const practiceCount = storageService.getPracticeCount(algo.id);
              const quizRecord = progress.quizRecords.find((r) => r.algorithmId === algo.id);

              return (
                <div key={algo.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{algo.icon}</span>
                      <div>
                        <span className="font-bold text-gray-900">{algo.name}</span>
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          algo.difficulty === '入门' ? 'bg-green-100 text-green-700' :
                          algo.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{algo.difficulty}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">✓ 已完成</span>
                      ) : practiceCount > 0 ? (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">进行中</span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full font-medium">未开始</span>
                      )}
                      <Link to={`/algorithms/${algo.id}`}
                        className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                        进入 <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded-xl">
                      <div className="text-lg font-bold text-gray-800">{practiceCount}</div>
                      <div className="text-[10px] text-gray-500">练习次数</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-xl">
                      <div className="text-lg font-bold text-primary-600">{bestScore > 0 ? `${bestScore}分` : '-'}</div>
                      <div className="text-[10px] text-gray-500">最佳得分</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-xl">
                      <div className="text-lg font-bold text-purple-600">{quizRecord ? `${quizRecord.score}分` : '-'}</div>
                      <div className="text-[10px] text-gray-500">测验成绩</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={isCompleted ? 100 : Math.min(practiceCount * 33, 90)} size="sm" showPercent={false} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Activity ── */}
        {lastPractice && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
              <Award className="w-4 h-4 text-yellow-500" />最近活动
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>最近练习：{new Date(lastPractice.timestamp).toLocaleString('zh-CN')}</div>
              <div>得分：<span className="font-bold text-primary-600">{lastPractice.score} 分</span></div>
              <div className="bg-gray-50 rounded-xl p-3">{lastPractice.feedback || '暂无反馈'}</div>
            </div>
          </div>
        )}

        {/* ── Reset ── */}
        <div className="text-center">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-red-500 border border-gray-200 rounded-xl hover:border-red-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            重置所有学习进度
          </button>
        </div>
      </div>
    </div>
  );
}
