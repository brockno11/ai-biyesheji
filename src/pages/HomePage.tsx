import { Link } from 'react-router-dom';
import {
  ArrowRight, Bot, Code2, BarChart3, BookOpen, TrendingUp, Sparkles,
  Target, ChevronRight, GraduationCap, Play, Zap,
} from 'lucide-react';
import Header from '../components/Header';
import AIWorkflowBanner from '../components/AIWorkflowBanner';
import { useCourses } from '../hooks/useCourses';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCountUp } from '../hooks/useCountUp';
import { storageService } from '../services/storageService';
import { getAllExercises, getAllQuizQuestions } from '../data/exercises';

/* ── Animated stat card used in hero & progress sections ── */
function StatCard({ icon: Icon, value, unit, label, animate }: {
  icon: typeof BookOpen; value: number | string; unit: string; label: string; animate?: boolean;
}) {
  const display = typeof value === 'number' && animate
    ? useCountUp(value, 1400, true)
    : value;
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-5 border border-white/80 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
      <Icon className="w-5 h-5 text-primary-500 mx-auto mb-2" />
      <div className="text-2xl font-extrabold text-gray-900 tabular-nums">
        {display}<span className="text-sm font-medium text-gray-400 ml-0.5">{unit}</span>
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

/* ── Scroll-reveal wrapper ── */
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollReveal(0.12);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Floating orbs for hero background ── */
const heroOrbs = [
  'top-20 left-[10%] w-72 h-72 bg-primary-400/15',
  'bottom-10 right-[5%] w-96 h-96 bg-accent-400/10',
  'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5',
  'top-40 right-[20%] w-48 h-48 bg-purple-400/8',
  'bottom-32 left-[25%] w-56 h-56 bg-cyan-400/8',
];

export default function HomePage() {
  const algorithms = useCourses();
  const progress = storageService.getProgress();
  const completedCount = progress.completedAlgorithms.length;

  const heroStats = [
    { icon: BookOpen, label: '核心算法', value: algorithms.length, unit: '个' },
    { icon: Code2, label: '代码练习', value: getAllExercises().length, unit: '题' },
    { icon: Target, label: '测验题目', value: getAllQuizQuestions().length, unit: '道' },
    { icon: Bot, label: 'AI 助教', value: '24h', unit: '待命' },
  ];

  const catTag: Record<string, string> = {
    regression: 'from-blue-500 to-blue-600',
    classification: 'from-amber-500 to-orange-600',
    tree: 'from-emerald-500 to-green-600',
    clustering: 'from-fuchsia-500 to-purple-600',
  };
  const diffTag: Record<string, string> = {
    '入门': 'bg-green-100 text-green-700',
    '中级': 'bg-yellow-100 text-yellow-700',
    '进阶': 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ════════════════ Hero ════════════════ */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-primary-50/40 to-accent-50/30" />
        {heroOrbs.map((cls, i) => (
          <div
            key={i}
            className={`absolute pointer-events-none rounded-full blur-3xl animate-float ${cls}`}
            style={{
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${8 + i * 2}s`,
            }}
          />
        ))}

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/60 shadow-sm mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-semibold text-gray-600 tracking-wide">
              基于 AI 赋能的交互式学习平台
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-5 tracking-tight">
            用最直观的方式
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-accent-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
              学会机器学习
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            告别晦涩的公式和抽象的概念。通过{' '}
            <strong className="text-gray-700 font-semibold">交互式可视化</strong>{' '}
            理解算法、{' '}
            <strong className="text-gray-700 font-semibold">AI 助教</strong>{' '}
            实时答疑、{' '}
            <strong className="text-gray-700 font-semibold">在线编程</strong>{' '}
            巩固知识 —— 让机器学习从"看不懂"变成"做得出"。
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to={`/algorithms/${algorithms[0]?.id || 'linear-regression'}`}
              className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-primary-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-500/35"
            >
              <Play className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              开始学习
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/progress"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-600 transition-all duration-300 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 hover:shadow-md"
            >
              <TrendingUp className="w-4 h-4" />
              查看学习进度
            </Link>
          </div>

          {/* Hero stats */}
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {heroStats.map((s) => (
                <StatCard
                  key={s.label}
                  icon={s.icon}
                  value={s.value}
                  unit={s.unit}
                  label={s.label}
                  animate={typeof s.value === 'number'}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════ Features ════════════════ */}
      <section className="py-24 md:py-32 max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-bold bg-primary-50 text-primary-700 rounded-full mb-4 tracking-wide uppercase">
              平台特色
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              三个维度，构建学习闭环
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
              从理论理解到代码实践，从 AI 辅助到自我验证，每一步都有支撑
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Bot, title: 'AI 智能助教', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50',
              desc: '机器学习遇到疑问？AI 助教"小智"随时为你解答，解释概念、诊断代码、给出学习建议。',
              points: ['概念解释', '代码诊断', '学习建议', '题目生成'],
            },
            {
              icon: BarChart3, title: '交互式可视化', color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50',
              desc: '拖动滑块、点击图表，直观感受算法运作。线性回归的拟合线、KNN 的邻居投票，一目了然。',
              points: ['参数实时调节', '图表点击交互', 'Loss 曲线追踪', '分类路径演示'],
            },
            {
              icon: Code2, title: '在线代码练习', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50',
              desc: '内置 Monaco Editor 编写 Python 代码。规则检查、Pyodide 真运行和 AI 诊断联动，练到真正会用。',
              points: ['Monaco 编辑器', 'Pyodide 真运行', '即时评分', 'AI 诊断'],
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title}>
                <div
                  className="group relative bg-white rounded-2xl border border-gray-100 p-7 transition-all duration-500 hover:shadow-xl hover:border-primary-100 hover:-translate-y-1"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {/* Gradient icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{f.desc}</p>
                  <div className={`${f.bg} rounded-xl p-4`}>
                    <div className="grid grid-cols-2 gap-2">
                      {f.points.map((p) => (
                        <div key={p} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                          <Zap className="w-3 h-3 text-primary-400 flex-shrink-0" />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ════════════════ Algorithm Cards ════════════════ */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 text-xs font-bold bg-accent-50 text-accent-700 rounded-full mb-4 tracking-wide uppercase">
                课程内容
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                精选核心算法，循序渐进
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
                从线性回归到 K-Means 聚类，覆盖监督学习和无监督学习的核心入门路径
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {algorithms.map((algo, i) => {
              const completed = storageService.isCompleted(algo.id);
              const bestScore = storageService.getBestScore(algo.id);
              const practiceCount = storageService.getPracticeCount(algo.id);

              return (
                <Reveal key={algo.id}>
                  <Link
                    to={`/algorithms/${algo.id}`}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    {/* Color accent bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${catTag[algo.category] || 'from-gray-400 to-gray-500'}`} />

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-2xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                          {algo.icon}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffTag[algo.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                          {algo.difficulty}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 transition-colors group-hover:text-primary-600">
                        {algo.name}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-2">
                        {algo.intro}
                      </p>

                      {/* Progress bar */}
                      <div className="space-y-2 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">学习状态</span>
                          <span className={completed ? 'text-green-600 font-semibold' : practiceCount > 0 ? 'text-primary-600' : 'text-gray-400'}>
                            {completed ? '✓ 已完成' : practiceCount > 0 ? '● 进行中' : '○ 未开始'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700"
                            style={{ width: completed ? '100%' : practiceCount > 0 ? `${Math.min(practiceCount * 40, 80)}%` : '0%' }}
                          />
                        </div>
                        {bestScore > 0 && (
                          <div className="text-xs text-gray-400">最佳得分: <span className="font-semibold text-primary-600">{bestScore}</span> 分</div>
                        )}
                        <div className="flex items-center justify-end gap-1 text-xs font-semibold text-primary-600 transition-all group-hover:gap-2">
                          进入课程 <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ Learning Path ════════════════ */}
      <section className="py-24 md:py-32 max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-full mb-4 tracking-wide uppercase">
              学习路径
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              四步完成一个算法学习
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
              每个算法都遵循"学 → 看 → 练 → 测"的完整路径
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', icon: BookOpen, title: '课程学习', desc: '阅读算法简介、公式推导、核心步骤，结合视频理解原理', color: 'from-primary-500 to-blue-600' },
            { step: '02', icon: BarChart3, title: '可视化探索', desc: '拖动参数滑块，观察模型变化，建立直观感受', color: 'from-blue-500 to-cyan-600' },
            { step: '03', icon: Code2, title: '代码练习', desc: 'Monaco Editor 编写 Python，AI 助教即时反馈与诊断', color: 'from-emerald-500 to-teal-600' },
            { step: '04', icon: Target, title: '测验巩固', desc: '完成选择题测验，验证学习效果，查漏补缺', color: 'from-amber-500 to-orange-600' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.step}>
                <div className="relative group">
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-md transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs font-bold text-gray-300 mb-1">STEP {item.step}</div>
                    <h4 className="text-base font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ════════════════ CTA / Progress ════════════════ */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              {completedCount > 0 ? '继续你的学习之旅' : '开启机器学习之旅'}
            </h2>
            <p className="text-white/70 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              {completedCount > 0
                ? `你已完成 ${completedCount}/${algorithms.length} 个算法，继续保持！每一步都离目标更近。`
                : '从零开始，系统学习机器学习核心算法。AI 助教全程陪伴，让学习不孤单。'}
            </p>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
              {[
                { label: '已完成', value: completedCount, sub: `共 ${algorithms.length} 个算法` },
                { label: '练习次数', value: progress.practiceRecords.length, sub: '次代码提交' },
                { label: '测验次数', value: progress.quizRecords.length, sub: '次知识测验' },
                { label: '最高得分', value: progress.practiceRecords.length > 0 ? Math.max(...progress.practiceRecords.map(r => r.score)) : 0, sub: '分' },
              ].map((s) => {
                const count = useCountUp(s.value, 1200, true);
                return (
                  <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 transition-all hover:bg-white/15">
                    <div className="text-3xl font-extrabold mb-1 tabular-nums">{count}</div>
                    <div className="text-sm text-white/70 font-medium">{s.label}</div>
                    <div className="text-xs text-white/40 mt-0.5">{s.sub}</div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to={`/algorithms/${algorithms[0]?.id || 'linear-regression'}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <GraduationCap className="w-5 h-5" />
              {completedCount > 0 ? '继续学习' : '开始第一课'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/progress"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 text-white rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-white/25 backdrop-blur-sm border border-white/20"
            >
              <TrendingUp className="w-5 h-5" />
              详细进度
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════ AI Workflow ════════════════ */}
      <Reveal>
        <div className="py-16 max-w-5xl mx-auto px-6">
          <AIWorkflowBanner />
        </div>
      </Reveal>

      {/* ════════════════ Footer ════════════════ */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-primary-400" />
            基于 AI 赋能的机器学习算法教学平台
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span>毕业设计项目</span>
            <span>·</span>
            <span>{new Date().getFullYear()}</span>
            <span>·</span>
            <span>React + TypeScript + Tailwind</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
