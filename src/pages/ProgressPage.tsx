import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Code2, Brain, Trophy, ArrowRight, RotateCcw,
  Target, BookOpen, Clock, Award, History, BarChart3, Zap,
} from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { storageService } from '../services/storageService';
import { useScrollReveal } from '../hooks/useScrollReveal';
import ProgressBar from '../components/ProgressBar';
import { aiService } from '../services/aiService';
import AIStudyPlanCard from '../components/AIStudyPlanCard';
import type { AIMode, AIStudyPlanResult } from '../services/aiTypes';

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollReveal(0.08);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

export default function ProgressPage() {
  const algorithms = useCourses();
  const [progress, setProgress] = useState(() => storageService.getProgress());
  const [aiPlan, setAiPlan] = useState<AIStudyPlanResult | null>(null);
  const [aiMode, setAiMode] = useState<AIMode>('mock');
  const [aiFallbackReason, setAiFallbackReason] = useState<string | undefined>();
  const [aiLoading, setAiLoading] = useState(false);

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

  const generateAIPlan = async () => {
    setAiLoading(true);
    setAiFallbackReason(undefined);
    try {
      const courseStats = algorithms.map((algo) => ({
        algorithmId: algo.id,
        algorithmName: algo.name,
        practiceCount: storageService.getPracticeCount(algo.id),
        bestScore: storageService.getBestScore(algo.id),
        quizScore: progress.quizRecords.find((r) => r.algorithmId === algo.id)?.score,
        completed: progress.completedAlgorithms.includes(algo.id),
      }));
      const latest = [...progress.practiceRecords, ...progress.quizRecords]
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      const plan = await aiService.generateStudyPlan({
        completedAlgorithms: progress.completedAlgorithms,
        courseStats,
        unfinishedCourses: algorithms
          .filter((algo) => !progress.completedAlgorithms.includes(algo.id))
          .map((algo) => algo.name),
        recentActivity: latest ? new Date(latest.timestamp).toLocaleString('zh-CN') : '暂无',
        pagePosition: '学习中心',
      });
      setAiPlan(plan.data);
      setAiMode(plan.mode);
      setAiFallbackReason(plan.fallbackReason);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    generateAIPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-container max-w-6xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-primary-600">学习追踪</p>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1 bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
          学习进度
        </h1>
        <p className="text-gray-500 text-sm">追踪你的机器学习学习之旅，明确下一步该做什么。</p>
      </div>

      {/* Stats Grid */}
      <Section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Target,
              label: '算法完成',
              value: `${completedAlgorithms}/${totalAlgorithms}`,
              gradient: 'from-blue-500 to-cyan-500',
            },
            {
              icon: Code2,
              label: '练习次数',
              value: String(totalPractices),
              gradient: 'from-emerald-500 to-teal-500',
            },
            {
              icon: Trophy,
              label: '最高得分',
              value: totalPractices > 0 ? `${bestOverall}分` : '-',
              gradient: 'from-amber-500 to-yellow-500',
            },
            {
              icon: Clock,
              label: '测验次数',
              value: String(progress.quizRecords.length),
              gradient: 'from-violet-500 to-purple-500',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Overall Progress */}
      <Section className="mb-8">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6">
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight mb-4">总体进度</h2>
          <ProgressBar
            value={completedAlgorithms}
            max={totalAlgorithms}
            label="算法课程完成情况"
            size="lg"
          />
        </div>
      </Section>

      <Section className="mb-8">
        {aiPlan ? (
          <AIStudyPlanCard
            plan={aiPlan}
            mode={aiMode}
            fallbackReason={aiFallbackReason}
            loading={aiLoading}
            onRefresh={generateAIPlan}
          />
        ) : (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6">
            <div className="text-sm text-gray-500">
              {aiLoading ? 'AI 正在生成学习路径推荐...' : 'AI 学习路径推荐暂不可用'}
            </div>
          </div>
        )}
      </Section>

      {/* Algorithm Mastery Matrix */}
      <Section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">算法掌握矩阵</h2>
        </div>
        <div className="space-y-4">
          {algorithms.map((algo) => {
            const isCompleted = storageService.isCompleted(algo.id);
            const bestScore = storageService.getBestScore(algo.id);
            const practiceCount = storageService.getPracticeCount(algo.id);
            const quizRecord = progress.quizRecords.find(
              (r) => r.algorithmId === algo.id
            );
            const progressPct = isCompleted ? 100 : Math.min(practiceCount * 33, 90);

            const statusBadge = isCompleted
              ? { text: '已完成', cls: 'bg-green-100 text-green-700 border-green-200' }
              : practiceCount > 0
                ? { text: '进行中', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
                : { text: '未开始', cls: 'bg-gray-100 text-gray-500 border-gray-200' };

            return (
              <div
                key={algo.id}
                className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-xl">
                      {algo.icon}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 tracking-tight">{algo.name}</h3>
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
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusBadge.cls}`}>
                      {statusBadge.text}
                    </span>
                    <Link
                      to={`/algorithms/${algo.id}`}
                      className="text-xs text-primary-600 hover:underline font-medium"
                    >
                      {isCompleted ? '回顾 →' : practiceCount > 0 ? '继续 →' : '开始 →'}
                    </Link>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">掌握度</span>
                    <span className="text-xs font-bold text-gray-700">{progressPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                        practiceCount > 0 ? 'bg-gradient-to-r from-primary-400 to-accent-500' :
                        'bg-gray-200'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2.5 bg-gray-50/70 rounded-xl border border-gray-100">
                    <div className="text-lg font-extrabold text-gray-800">{practiceCount}</div>
                    <div className="text-[10px] text-gray-500">练习次数</div>
                  </div>
                  <div className="text-center p-2.5 bg-gray-50/70 rounded-xl border border-gray-100">
                    <div className="text-lg font-extrabold text-primary-600">
                      {bestScore > 0 ? `${bestScore}分` : '-'}
                    </div>
                    <div className="text-[10px] text-gray-500">最佳得分</div>
                  </div>
                  <div className="text-center p-2.5 bg-gray-50/70 rounded-xl border border-gray-100">
                    <div className="text-lg font-extrabold text-purple-600">
                      {quizRecord ? `${quizRecord.score}分` : '-'}
                    </div>
                    <div className="text-[10px] text-gray-500">测验成绩</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Recent Timeline & Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent Learning Timeline */}
        <Section>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6 h-full">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-900 tracking-tight mb-4">
              <History className="w-4 h-4 text-primary-500" />
              最近学习时间线
            </h3>
            {progress.practiceRecords.length > 0 || progress.quizRecords.length > 0 ? (
              <div className="space-y-3">
                {[...progress.practiceRecords, ...progress.quizRecords]
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .slice(0, 5)
                  .map((record, idx) => {
                    const isQuiz = 'total' in record;
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            isQuiz ? 'bg-purple-400' : 'bg-primary-400'
                          }`} />
                          {idx < 4 && (
                            <div className="w-px h-full bg-gray-200 mt-1" style={{ minHeight: '20px' }} />
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="text-xs text-gray-500">
                            {new Date(record.timestamp).toLocaleString('zh-CN')}
                          </div>
                          <div className="text-sm text-gray-700 font-medium mt-0.5">
                            {isQuiz
                              ? `📝 完成测验 · 得分 ${(record as { score: number }).score} 分`
                              : `💻 代码练习 · 得分 ${(record as { score: number }).score} 分`
                            }
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Zap className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">还没有学习记录</p>
                <p className="text-xs text-gray-400 mt-1">开始你的第一次练习吧！</p>
              </div>
            )}
          </div>
        </Section>

        {/* Recommendation */}
        <Section>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6 border-l-4 border-l-primary-500 h-full">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-900 tracking-tight mb-4">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              推荐下一步
            </h3>
            {completedAlgorithms < totalAlgorithms ? (
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  建议继续学习 <span className="font-bold text-primary-600">{nextAlgo.name}</span>
                </p>
                <p className="text-xs text-gray-500 mb-4">{nextAlgo.intro}</p>
                <Link
                  to={`/algorithms/${nextAlgo.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-medium hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <BookOpen className="w-4 h-4" />
                  开始学习
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-700 mb-3">
                  太棒了！你已完成所有算法课程！
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  建议回顾薄弱环节，或尝试更高难度的练习题。
                </p>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Reset */}
      <div className="text-center pb-8">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-red-500 border border-gray-200 rounded-xl hover:border-red-200 transition-all duration-300"
        >
          <RotateCcw className="w-3 h-3" />
          重置所有进度
        </button>
      </div>
    </div>
  );
}
