import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Code2, Sparkles, Lightbulb, ThumbsUp, AlertCircle,
  Play, Target, BookOpen, ChevronRight, X, CheckCircle2, HelpCircle, Trophy,
} from 'lucide-react';
import { useState } from 'react';
import type { GuidedQuestion } from '../types';
import { useCourseById } from '../hooks/useCourses';
import { getAlgorithmById } from '../data/algorithms';
import { getExercisesByAlgorithm } from '../data/exercises';
import { useScrollReveal } from '../hooks/useScrollReveal';
import AITutorPanel from '../components/AITutorPanel';
import VideoEmbed from '../components/VideoEmbed';
import LinearRegressionViz from '../components/LinearRegressionViz';
import LogisticRegressionViz from '../components/LogisticRegressionViz';
import KNNViz from '../components/KNNViz';
import DecisionTreeViz from '../components/DecisionTreeViz';
import RandomForestViz from '../components/RandomForestViz';
import KMeansViz from '../components/KMeansViz';
import ErrorBoundary from '../components/ErrorBoundary';
import type { Algorithm } from '../types';

const vizComponents: Record<string, React.ComponentType<{ algorithm?: Algorithm }>> = {
  'linear-regression': LinearRegressionViz,
  'logistic-regression': LogisticRegressionViz,
  knn: KNNViz,
  'decision-tree': DecisionTreeViz,
  'random-forest': RandomForestViz,
  'k-means': KMeansViz,
};

const categoryLabels: Record<Algorithm['category'], string> = {
  regression: '回归算法',
  classification: '分类算法',
  tree: '树形算法',
  clustering: '聚类算法',
  basic: '基础课程',
  ensemble: '集成学习',
};

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

export default function AlgorithmPage() {
  const { id } = useParams<{ id: string }>();
  const algorithm = useCourseById(id || '') || getAlgorithmById(id || '');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  if (!algorithm) {
    return (
      <div className="app-container max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">算法未找到</h2>
        <p className="text-gray-500 mb-4">请检查 URL 是否正确</p>
        <Link to="/" className="text-primary-600 hover:underline">返回首页</Link>
      </div>
    );
  }

  const VizComponent = vizComponents[algorithm.id];
  const exercises = getExercisesByAlgorithm(algorithm.id);

  return (
    <div className="app-container">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回课程列表
      </Link>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Page Title */}
          <Section>
            <div className="flex items-start gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl shadow-lg shadow-primary-500/20 flex-shrink-0">
                {algorithm.icon}
              </div>
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    algorithm.difficulty === '入门' ? 'bg-green-100 text-green-700' :
                    algorithm.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {algorithm.difficulty}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {categoryLabels[algorithm.category]}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  {algorithm.name}
                </h1>
              </div>
            </div>
          </Section>

          {/* Section 1: 本节学习目标 */}
          <Section className="mt-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6 md:p-8 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-3">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm">
                  <Target className="w-4 h-4" />
                </span>
                本节学习目标
              </h2>
              <p className="text-gray-500 leading-relaxed">{algorithm.intro}</p>
            </div>
          </Section>

          {/* Section 2: 核心思想 */}
          <Section className="mt-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6 md:p-8 border-l-4 border-l-primary-500 hover:shadow-md transition-all duration-300">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-4">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm">
                  <Lightbulb className="w-4 h-4" />
                </span>
                核心思想
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">{algorithm.description}</p>

              {/* Pros & Cons */}
              {(algorithm.advantages || algorithm.disadvantages) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {algorithm.advantages && algorithm.advantages.length > 0 && (
                    <div className="bg-green-50/70 rounded-xl p-4 border border-green-100">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-green-700 mb-3">
                        <ThumbsUp className="w-4 h-4" />
                        优点
                      </h3>
                      <ul className="space-y-2">
                        {algorithm.advantages.map((adv, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                            <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                            {adv}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {algorithm.disadvantages && algorithm.disadvantages.length > 0 && (
                    <div className="bg-red-50/70 rounded-xl p-4 border border-red-100">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-3">
                        <AlertCircle className="w-4 h-4" />
                        缺点
                      </h3>
                      <ul className="space-y-2">
                        {algorithm.disadvantages.map((dis, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                            <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                            {dis}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* B 站教学视频 */}
          {algorithm.videoUrl && (
            <Section className="mt-6">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6 md:p-8 hover:shadow-md transition-all duration-300">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-4">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-sm">
                    <Play className="w-4 h-4" />
                  </span>
                  B 站教学视频
                </h2>
                <VideoEmbed url={algorithm.videoUrl} title={`${algorithm.name} - B站视频教程`} />
              </div>
            </Section>
          )}

          {/* Section 3: 公式与步骤 */}
          {(algorithm.formula || (algorithm.steps && algorithm.steps.length > 0)) && (
            <Section className="mt-6">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6 md:p-8 hover:shadow-md transition-all duration-300">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-4">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-sm">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  公式与步骤
                </h2>

                {/* Formula */}
                {algorithm.formula && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                      核心公式
                    </h3>
                    <div className="bg-gray-900 text-gray-100 rounded-xl p-5 overflow-x-auto border border-gray-700">
                      <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap">
                        {algorithm.formula}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Steps */}
                {(algorithm.steps && algorithm.steps.length > 0) && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                      算法步骤
                    </h3>
                    <div className="space-y-3">
                      {(algorithm.steps || []).map((step, i) => (
                        <div key={i} className="flex items-start gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 text-primary-700 flex items-center justify-center flex-shrink-0 text-sm font-bold group-hover:bg-gradient-to-br group-hover:from-primary-500 group-hover:to-accent-500 group-hover:text-white group-hover:shadow-md transition-all duration-300">
                            {i + 1}
                          </div>
                          <p className="text-sm text-gray-700 pt-1.5 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Section 4: 交互式可视化 */}
          {VizComponent && (
            <Section className="mt-6">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6 md:p-8 hover:shadow-md transition-all duration-300">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  交互式可视化
                </h2>
                <p className="text-gray-500 text-sm mb-4 flex items-center gap-1.5">
                  <span className="text-base">💡</span>
                  试试拖动参数观察变化
                </p>
                <ErrorBoundary>
                  <VizComponent algorithm={algorithm} />
                </ErrorBoundary>
              </div>
            </Section>
          )}

          {/* Guided Questions — mini-interactions below visualization */}
          {algorithm.guidedQuestions && algorithm.guidedQuestions.length > 0 && (
            <Section className="mt-6">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6 md:p-8 hover:shadow-md transition-all duration-300">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm">
                    <HelpCircle className="w-4 h-4" />
                  </span>
                  引导思考
                </h2>
                <p className="text-gray-500 text-sm mb-4">回答以下问题，检验你对这个算法的理解</p>
                <GuidedQuestionsInline questions={algorithm.guidedQuestions} algorithmId={algorithm.id} />
              </div>
            </Section>
          )}

          {/* Section 5: Python 代码示例 */}
          {algorithm.codeExample && (
            <Section className="mt-6">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6 md:p-8 hover:shadow-md transition-all duration-300">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-4">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm">
                    <Code2 className="w-4 h-4" />
                  </span>
                  Python 代码示例
                </h2>
                <div className="bg-gray-900 text-gray-100 rounded-xl p-5 overflow-x-auto border border-gray-700">
                  <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap">
                    {algorithm.codeExample}
                  </pre>
                </div>
              </div>
            </Section>
          )}

          {/* Spacer for bottom sticky bar */}
          <div className="h-28" />
        </div>

        {/* AI Tutor Sidebar (desktop) */}
        <div className="hidden xl:block xl:w-96 flex-shrink-0">
          <div className="xl:sticky xl:top-24">
            <AITutorPanel algorithm={algorithm} />
          </div>
        </div>
      </div>

      {/* Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-white/60 shadow-lg shadow-gray-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center gap-4 flex-wrap">
          {exercises.length > 0 && (
            <Link
              to={`/practice/${algorithm.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              🧪 去代码练习 ({exercises.length} 题)
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            to={`/quiz/${algorithm.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            📝 去测验挑战
            <ChevronRight className="w-4 h-4" />
          </Link>

          {/* Mobile: Open AI Tutor drawer */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="xl:hidden inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            🤖 AI 助教
          </button>
        </div>
      </div>

      {/* Mobile AI Tutor Bottom Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-gray-100 rounded-t-3xl px-5 py-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900">AI 助教</h3>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              <AITutorPanel algorithm={algorithm} />
            </div>
          </div>
        </div>
      )}

      {/* Add slide-up animation keyframe via style tag */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Inline guided questions mini-interaction
function GuidedQuestionsInline({ questions, algorithmId }: { questions: GuidedQuestion[]; algorithmId: string }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (!questions || questions.length === 0) return null;

  const q = questions[currentIdx];
  const isCorrect = selectedIndex === q.correctIndex;
  const correctCount = Object.entries(answers).filter(([i, a]) => a === questions[parseInt(i)].correctIndex).length;

  const algoNameMap: Record<string, string> = {
    'linear-regression': '线性回归', 'knn': 'KNN', 'logistic-regression': '逻辑回归',
    'decision-tree': '决策树', 'k-means': 'K-Means', 'random-forest': '随机森林',
  };

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelectedIndex(idx);
    setRevealed(true);
    setAnswers((prev) => ({ ...prev, [currentIdx]: idx }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">第 {currentIdx + 1} / {questions.length} 题</span>
        {Object.keys(answers).length > 0 && <span className="text-xs text-primary-600 font-semibold">已答 {Object.keys(answers).length} 题</span>}
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500" style={{ width: `${((currentIdx + (revealed ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>
      {q.scenario && (
        <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-100">
          <h4 className="text-xs font-bold text-blue-700 mb-1">场景</h4>
          <p className="text-sm text-blue-800 leading-relaxed">{q.scenario}</p>
        </div>
      )}
      <p className="text-sm font-semibold text-gray-800 leading-relaxed">{q.prompt}</p>
      <div className="space-y-2">
        {q.options.map((opt, idx) => {
          const sel = selectedIndex === idx;
          const showCorrect = revealed && idx === q.correctIndex;
          const showWrong = revealed && sel && !isCorrect;
          let style = 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50';
          if (revealed) {
            if (showCorrect) style = 'border-green-400 bg-green-50 text-green-800 font-semibold';
            else if (showWrong) style = 'border-red-400 bg-red-50 text-red-800';
            else style = 'border-slate-100 bg-slate-50 text-slate-400';
          } else if (sel) style = 'border-blue-400 bg-blue-50 text-blue-800 font-semibold';
          return (
            <button key={idx} onClick={() => handleSelect(idx)} disabled={revealed} className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${style} ${revealed ? 'cursor-default' : 'cursor-pointer'}`}>
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{String.fromCharCode(65 + idx)}</span>
              <span className="flex-1">{opt.replace(/^[A-D]\.\s*/, '')}</span>
              {revealed && showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
              {revealed && showWrong && <X className="w-5 h-5 text-red-500 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className={`rounded-xl p-4 border ${isCorrect ? 'bg-green-50/70 border-green-200' : 'bg-red-50/70 border-red-200'}`}>
          <div className="flex items-start gap-2 mb-2">
            {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> : <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
            <div>
              <h4 className={`text-sm font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{isCorrect ? '回答正确！' : '回答有误'}</h4>
              <p className={`text-sm mt-1 leading-relaxed ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{isCorrect ? q.correctFeedback : q.wrongFeedback}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200/50">
            <h4 className="text-xs font-bold text-slate-600 mb-1">知识点</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{q.explanation}</p>
          </div>
          {q.relatedAlgorithms && q.relatedAlgorithms.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200/50">
              <h4 className="text-xs font-bold text-primary-600 mb-1">这个知识点会在以下算法中用到</h4>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {q.relatedAlgorithms.map((algId) => (
                  <span key={algId} className="inline-block px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">{algoNameMap[algId] || algId}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {revealed && (
        <button onClick={() => { if (currentIdx < questions.length - 1) { setCurrentIdx((p) => p + 1); setSelectedIndex(null); setRevealed(false); } }} className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
          {currentIdx < questions.length - 1 ? '下一题' : '完成'}
        </button>
      )}
      {revealed && currentIdx === questions.length - 1 && Object.keys(answers).length === questions.length && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /><span className="text-sm font-extrabold text-amber-800">得分: {correctCount}/{questions.length}</span></div>
        </div>
      )}
    </div>
  );
}
