import { useState } from 'react';
import {
  BookOpen,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Zap,
  Play,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Algorithm } from '../types';
import AITutorPanel from './AITutorPanel';
import ErrorBoundary from './ErrorBoundary';
import MLWorkflowViz from './MLWorkflowViz';
import FeatureLabelDemo from './FeatureLabelDemo';
import OverfittingDemo from './OverfittingDemo';

interface FoundationCourseContentProps {
  algorithm: Algorithm;
}

const visualizationMap: Record<string, React.ComponentType<{ algorithm?: Algorithm }>> = {
  'ml-workflow': MLWorkflowViz,
  'feature-label': FeatureLabelDemo,
  overfitting: OverfittingDemo,
};

function CollapsibleCard({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/50 transition-colors"
      >
        <span className="text-sm font-extrabold text-gray-900 tracking-tight">{title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-4">{children}</div>
      </div>
    </div>
  );
}

export default function FoundationCourseContent({ algorithm }: FoundationCourseContentProps) {
  const VizComponent = algorithm.visualizationType
    ? visualizationMap[algorithm.visualizationType]
    : undefined;

  return (
    <div className="app-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ===== Course Header ===== */}
      <div className="flex items-start gap-4 mb-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl shadow-lg shadow-primary-500/20 flex-shrink-0">
          {algorithm.icon}
        </div>
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                algorithm.difficulty === '入门'
                  ? 'bg-green-100 text-green-700'
                  : algorithm.difficulty === '中级'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              }`}
            >
              {algorithm.difficulty}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
              基础课程
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            {algorithm.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{algorithm.intro}</p>
        </div>
      </div>

      {/* ===== Section: 学习目标 ===== */}
      {algorithm.learningObjectives && algorithm.learningObjectives.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-4">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm">
              <Target className="w-4 h-4" />
            </span>
            📋 学习目标
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {algorithm.learningObjectives.map((obj, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-4 flex items-start gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{obj}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Section: 核心概念 ===== */}
      {algorithm.concepts && algorithm.concepts.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-4">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-sm">
              <BookOpen className="w-4 h-4" />
            </span>
            💡 核心概念
          </h2>
          <div className="space-y-3">
            {algorithm.concepts.map((concept, i) => (
              <CollapsibleCard key={i} title={concept.title}>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {concept.description}
                </p>
                {concept.example && (
                  <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-100">
                    <h4 className="text-xs font-bold text-amber-700 mb-1">💡 示例</h4>
                    <p className="text-sm text-amber-800 leading-relaxed">{concept.example}</p>
                  </div>
                )}
              </CollapsibleCard>
            ))}
          </div>
        </section>
      )}

      {/* ===== Section: 生活类比 ===== */}
      {algorithm.analogies && algorithm.analogies.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-4">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm">
              <Lightbulb className="w-4 h-4" />
            </span>
            🌟 生活类比
          </h2>
          <div className="space-y-3">
            {algorithm.analogies.map((analogy, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-5 hover:shadow-md transition-all duration-300 border-l-4 border-l-amber-400"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">💬</span>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 tracking-tight mb-1">
                      {analogy.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{analogy.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Section: 交互演示 ===== */}
      {VizComponent && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-4">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            🎮 交互演示
          </h2>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-4 sm:p-6 hover:shadow-md transition-all duration-300">
            <p className="text-gray-500 text-sm mb-4 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              动手体验，加深理解
            </p>
            <ErrorBoundary>
              <VizComponent algorithm={algorithm} />
            </ErrorBoundary>
          </div>
        </section>
      )}

      {/* ===== Section: 常见误区 ===== */}
      {algorithm.commonMisunderstandings && algorithm.commonMisunderstandings.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-4">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-sm">
              <AlertTriangle className="w-4 h-4" />
            </span>
            ⚠️ 常见误区
          </h2>
          <div className="space-y-3">
            {algorithm.commonMisunderstandings.map((mis, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  <div className="bg-red-50/40 p-4">
                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-red-600 mb-2">
                      <span className="text-red-400">✗</span> 错误理解
                    </h4>
                    <p className="text-sm text-red-800 leading-relaxed">{mis.wrong}</p>
                  </div>
                  <div className="bg-green-50/40 p-4">
                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-green-600 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 正确理解
                    </h4>
                    <p className="text-sm text-green-800 leading-relaxed">{mis.correct}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Section: AI 助教 ===== */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 tracking-tight mb-4">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm">
            <Sparkles className="w-4 h-4" />
          </span>
          🤖 AI 助教
        </h2>
        <AITutorPanel algorithm={algorithm} />
      </section>

      {/* ===== Bottom Actions ===== */}
      <div className="flex items-center justify-center gap-4 pt-2 pb-8 flex-wrap">
        {algorithm.hasPractice && (
          <Link
            to={`/practice/${algorithm.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            🧪 去代码练习
            <Play className="w-4 h-4" />
          </Link>
        )}
        {algorithm.hasQuiz && (
          <Link
            to={`/quiz/${algorithm.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            📝 去测验挑战
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          ← 返回课程列表
        </Link>
      </div>
    </div>
  );
}
