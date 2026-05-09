import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Code2, Brain, Trophy, ArrowRight, RotateCcw, Target, BookOpen, Clock, Award } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { storageService } from '../services/storageService';
import ProgressBar from '../components/ProgressBar';

export default function ProgressPage() {
  const algorithms = useCourses();
  const [progress, setProgress] = useState(() => storageService.getProgress());

  const refresh = () => setProgress(storageService.getProgress());

  const totalAlgorithms = algorithms.length;
  const completedAlgorithms = progress.completedAlgorithms.length;

  const totalPractices = progress.practiceRecords.length;
  const bestOverall = progress.practiceRecords.length > 0
    ? Math.max(...progress.practiceRecords.map((r) => r.score))
    : 0;

  const lastPractice = [...progress.practiceRecords]
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  const handleReset = () => {
    if (window.confirm('确定要重置所有学习进度吗？此操作不可恢复！')) {
      storageService.reset();
      refresh();
    }
  };

  const getRecommendedNext = () => {
    for (const algo of algorithms) {
      if (!progress.completedAlgorithms.includes(algo.id)) {
        return algo;
      }
    }
    return algorithms[algorithms.length - 1];
  };

  const nextAlgo = getRecommendedNext();

  return (
    <div className="app-container max-w-6xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-primary-700">学习追踪</p>
        <h1 className="text-2xl font-extrabold text-slate-950 mb-1">学习进度</h1>
        <p className="text-slate-500 text-sm">追踪你的机器学习学习之旅，明确下一步该做什么。</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Target,
            label: '算法完成',
            value: `${completedAlgorithms}/${totalAlgorithms}`,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            icon: Code2,
            label: '练习次数',
            value: String(totalPractices),
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
          {
            icon: Trophy,
            label: '最高得分',
            value: totalPractices > 0 ? `${bestOverall}分` : '-',
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
          },
          {
            icon: Clock,
            label: '测验次数',
            value: String(progress.quizRecords.length),
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="app-card p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="app-card p-6 mb-8">
        <h2 className="app-section-title mb-4">总体进度</h2>
        <ProgressBar
          value={completedAlgorithms}
          max={totalAlgorithms}
          label="算法课程完成情况"
          size="lg"
        />
      </div>

      {/* Per-Algorithm Progress */}
      <div className="mb-8">
        <h2 className="app-section-title mb-4">各算法详情</h2>
        <div className="space-y-4">
          {algorithms.map((algo) => {
            const isCompleted = storageService.isCompleted(algo.id);
            const bestScore = storageService.getBestScore(algo.id);
            const practiceCount = storageService.getPracticeCount(algo.id);
            const quizRecord = progress.quizRecords.find(
              (r) => r.algorithmId === algo.id
            );

            return (
              <div
                key={algo.id}
                className="app-card p-5 transition hover:border-primary-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{algo.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{algo.name}</h3>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        algo.difficulty === '入门' ? 'bg-green-100 text-green-700' :
                        algo.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {algo.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        ✓ 已完成
                      </span>
                    ) : practiceCount > 0 ? (
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                        进行中
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full font-medium">
                        未开始
                      </span>
                    )}
                    <Link
                      to={`/algorithms/${algo.id}`}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      进入课程 →
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-gray-800">{practiceCount}</div>
                    <div className="text-[10px] text-gray-500">练习次数</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-primary-600">
                      {bestScore > 0 ? `${bestScore}分` : '-'}
                    </div>
                    <div className="text-[10px] text-gray-500">最佳得分</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-purple-600">
                      {quizRecord ? `${quizRecord.score}分` : '-'}
                    </div>
                    <div className="text-[10px] text-gray-500">测验成绩</div>
                  </div>
                </div>

                <ProgressBar
                  value={isCompleted ? 100 : Math.min(practiceCount * 33, 90)}
                  max={100}
                  size="sm"
                  showPercent={false}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="app-card p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
            <Award className="w-4 h-4 text-yellow-500" />
            最近活动
          </h3>
          {lastPractice ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                最近练习时间：{new Date(lastPractice.timestamp).toLocaleString('zh-CN')}
              </div>
              <div className="text-sm text-gray-600">
                最近得分：<span className="font-bold text-primary-600">{lastPractice.score} 分</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                {lastPractice.feedback || '暂无反馈'}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">还没有练习记录，开始你的第一次练习吧！</p>
          )}
        </div>

        {/* Recommendation */}
        <div className="rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50 to-accent-50 p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-primary-800 mb-4">
            <Brain className="w-4 h-4" />
            推荐下一步
          </h3>
          {completedAlgorithms < totalAlgorithms ? (
            <div>
              <p className="text-sm text-primary-700 mb-3">
                建议继续学习 <span className="font-bold">{nextAlgo.name}</span>
              </p>
              <p className="text-xs text-primary-500 mb-4">{nextAlgo.intro}</p>
              <Link
                to={`/algorithms/${nextAlgo.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all"
              >
                <BookOpen className="w-4 h-4" />
                开始学习
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-sm text-primary-700 mb-3">
                🎉 太棒了！你已完成所有算法课程！
              </p>
              <p className="text-xs text-primary-500 mb-4">
                建议回顾薄弱环节，或尝试更高难度的练习题。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reset */}
      <div className="text-center">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-red-500 border border-gray-200 rounded-xl hover:border-red-200 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          重置所有进度
        </button>
      </div>
    </div>
  );
}
