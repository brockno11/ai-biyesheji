import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle2, BookOpen, Lightbulb } from 'lucide-react';
import { getAlgorithmById } from '../data/algorithms';
import { useCourseById } from '../hooks/useCourses';
import { getExercisesByAlgorithm } from '../data/exercises';
import { checkCode } from '../services/codeCheckService';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import CodeEditor from '../components/CodeEditor';
import ScoreCard from '../components/ScoreCard';
import AICodeReviewCard from '../components/AICodeReviewCard';
import type { AIReviewResult, Exercise } from '../types';
import type { AICodeReviewResult, AIMode } from '../services/aiTypes';

export default function PracticePage() {
  const { algorithmId } = useParams<{ algorithmId: string }>();
  const algorithm = useCourseById(algorithmId || '') || getAlgorithmById(algorithmId || '');
  const exercises = getExercisesByAlgorithm(algorithmId || '');

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<AIReviewResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [aiReview, setAiReview] = useState<AICodeReviewResult | null>(null);
  const [aiMode, setAiMode] = useState<AIMode>('mock');
  const [aiFallbackReason, setAiFallbackReason] = useState<string | undefined>();
  const [aiLoading, setAiLoading] = useState(false);

  const exercise = exercises[currentExIndex] as Exercise | undefined;

  useEffect(() => {
    if (exercise) {
      setCode(exercise.starterCode);
      setResult(null);
      setAiReview(null);
    }
  }, [exercise]);

  if (!algorithm || !exercise) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">练习未找到</h2>
        <p className="text-gray-500 mb-4">该算法暂无练习题</p>
        <Link to="/" className="text-primary-600 hover:underline">返回首页</Link>
      </div>
    );
  }

  const handleCheck = async () => {
    setChecking(true);
    setAiReview(null);
    setAiFallbackReason(undefined);

    // Simulate delay
    await new Promise((r) => setTimeout(r, 800));
    const checkResult = checkCode(exercise, code);
    setResult(checkResult);

    // Save to localStorage
    storageService.savePracticeRecord({
      exerciseId: exercise.id,
      algorithmId: algorithm.id,
      code,
      score: checkResult.score,
      passed: checkResult.passed,
      timestamp: Date.now(),
      feedback: checkResult.summary,
    });

    setChecking(false);

    // Get structured AI feedback. Mock fallback keeps the demo usable offline.
    setAiLoading(true);
    try {
      const missingKeywords = exercise.expectedKeywords.filter(
        (kw) => !code.toLowerCase().includes(kw.toLowerCase())
      );
      const feedback = await aiService.diagnoseCode({
        algorithm,
        exercise,
        userCode: code,
        localReview: checkResult,
        missingKeywords,
        pagePosition: '代码练习页',
      });
      setAiReview(feedback.data);
      setAiMode(feedback.mode);
      setAiFallbackReason(feedback.fallbackReason);
    } catch {
      setAiReview({
        summary: 'AI 助教暂时不可用，请先根据本地规则检查结果继续修改。',
        scoreReason: `当前本地规则得分为 ${checkResult.score} 分。`,
        problems: checkResult.problems.length ? checkResult.problems : ['暂未发现明显规则问题。'],
        suggestions: checkResult.suggestions.length ? checkResult.suggestions : ['继续检查训练、预测和评估流程是否完整。'],
        nextStep: checkResult.nextStep,
        encouragement: '先把本地检查跑通，再逐步优化代码质量。',
      });
      setAiMode('mock');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Link
        to={`/algorithms/${algorithm.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回{algorithm.name}课程
      </Link>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Exercise Header */}
          <div className="app-card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  exercise.difficulty === '入门' ? 'bg-green-100 text-green-700' :
                  exercise.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {exercise.difficulty}
                </span>
                <span className="text-xs text-gray-400">
                  第 {currentExIndex + 1}/{exercises.length} 题
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentExIndex(Math.max(0, currentExIndex - 1))}
                  disabled={currentExIndex === 0}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  上一题
                </button>
                <button
                  onClick={() => setCurrentExIndex(Math.min(exercises.length - 1, currentExIndex + 1))}
                  disabled={currentExIndex === exercises.length - 1}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  下一题
                </button>
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{exercise.title}</h1>
            <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>

            <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-2">
                <Lightbulb className="w-4 h-4" />
                操作指引
              </h3>
              <ol className="space-y-1.5">
                {exercise.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                    <span className="font-bold text-blue-400">{i + 1}.</span>
                    {inst}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Code Editor */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">代码编辑器</h2>
              <button
                onClick={handleCheck}
                disabled={checking}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium text-sm hover:shadow-md transition-shadow disabled:opacity-50"
              >
                {checking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    检查中...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    检查代码
                  </>
                )}
              </button>
            </div>
            <CodeEditor code={code} onChange={setCode} />
          </div>

          {/* Score Card */}
          {result && <ScoreCard result={result} />}

          {aiLoading && (
            <div className="app-card p-5 text-sm text-slate-500">
              AI 助教正在生成结构化诊断报告...
            </div>
          )}

          {aiReview && (
            <AICodeReviewCard
              review={aiReview}
              mode={aiMode}
              fallbackReason={aiFallbackReason}
            />
          )}
        </div>

        {/* AI Feedback Sidebar */}
        <div className="xl:w-96 flex-shrink-0 space-y-6">
          <div className="xl:sticky xl:top-24 space-y-6">
            {/* Required Keywords */}
            <div className="app-card p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                <BookOpen className="w-4 h-4 text-primary-500" />
                需要使用的 API
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {exercise.expectedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className={`text-xs px-2 py-1 rounded-lg font-mono ${
                      code.toLowerCase().includes(kw.toLowerCase())
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    {code.toLowerCase().includes(kw.toLowerCase()) ? '✓ ' : '○ '}
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Feedback */}
            {aiLoading && (
              <div className="app-card p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  AI 诊断报告
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                  AI 助教正在分析你的代码...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
