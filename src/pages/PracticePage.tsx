import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle2, BookOpen, Lightbulb } from 'lucide-react';
import { getAlgorithmById } from '../data/algorithms';
import { useCourseById } from '../hooks/useCourses';
import { getExercisesByAlgorithm } from '../data/exercises';
import { checkCode, getMissingKeywords } from '../services/codeCheckService';
import { buildPracticeReview } from '../services/practiceScoringService';
import { runPythonExercise } from '../services/pythonRuntimeService';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import CodeEditor from '../components/CodeEditor';
import ScoreCard from '../components/ScoreCard';
import AICodeReviewCard from '../components/AICodeReviewCard';
import PythonRunResultCard from '../components/PythonRunResultCard';
import type { AIReviewResult, Exercise } from '../types';
import type { AICodeReviewResult, AIMode, PythonRunResult, PythonRuntimeEvent } from '../services/aiTypes';

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
  const [pythonRunning, setPythonRunning] = useState(false);
  const [pythonResult, setPythonResult] = useState<PythonRunResult | null>(null);
  const [pythonEvents, setPythonEvents] = useState<PythonRuntimeEvent[]>([]);

  const exercise = exercises[currentExIndex] as Exercise | undefined;

  useEffect(() => {
    if (exercise) {
      setCode(exercise.starterCode);
      setResult(null);
      setAiReview(null);
      setPythonResult(null);
      setPythonEvents([]);
      setAiFallbackReason(undefined);
    }
  }, [exercise]);

  const pythonStatusText = useMemo(() => {
    if (!pythonRunning) return null;
    if (pythonEvents.length === 0) return 'Python 环境准备中...';
    const latest = pythonEvents[pythonEvents.length - 1];
    switch (latest.phase) {
      case 'booting': return '启动 Python 运行时...';
      case 'loading-packages': return '加载 Python 包...';
      case 'executing': return '执行代码中...';
      case 'testing': return '运行自动测试...';
      case 'complete': return '运行完成';
      case 'failed': return '运行失败';
      case 'unsupported': return '暂未覆盖';
      default: return '运行中...';
    }
  }, [pythonRunning, pythonEvents]);

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
    setResult(null);
    setPythonResult(null);
    setPythonEvents([]);
    setAiFallbackReason(undefined);

    // Keep a brief visible checking phase so students can see that static checks run before Python execution.
    await new Promise((r) => setTimeout(r, 800));
    const checkResult = checkCode(exercise, code);
    setChecking(false);

    setPythonRunning(true);
    let runtimeResult: PythonRunResult | undefined;
    try {
      runtimeResult = await runPythonExercise(exercise, code, {
        onEvent: (event) => setPythonEvents((prev) => [...prev, event]),
      });
      setPythonResult(runtimeResult);
    } catch (e) {
      console.error('[PracticePage] Python runtime failed:', e);
      runtimeResult = undefined;
    } finally {
      setPythonRunning(false);
    }

    const combinedReview = buildPracticeReview(exercise, code, checkResult, runtimeResult);
    setResult(combinedReview);

    storageService.savePracticeRecord({
      exerciseId: exercise.id,
      algorithmId: algorithm.id,
      code,
      score: combinedReview.score,
      passed: combinedReview.passed,
      timestamp: Date.now(),
      feedback: combinedReview.summary,
    });

    // Get structured AI feedback after local rules and runtime checks.
    setAiLoading(true);
    try {
      const missingKeywords = getMissingKeywords(exercise, code);
      const feedback = await aiService.diagnoseCode({
        algorithm,
        exercise,
        userCode: code,
        localReview: combinedReview,
        missingKeywords,
        runtimeResult,
        pagePosition: '代码练习页',
      });
      setAiReview(feedback.data);
      setAiMode(feedback.mode);
      setAiFallbackReason(feedback.fallbackReason);
    } catch {
      setAiReview({
        summary: runtimeResult?.passed
          ? 'AI 助教暂时不可用，但综合评分和 Python 真运行已完成，可先根据运行结果继续优化。'
          : 'AI 助教暂时不可用，请先根据综合评分和 Python 报错继续修改。',
        scoreReason: `当前综合评分为 ${combinedReview.score} 分，Python 运行状态为 ${
          runtimeResult?.status === 'success' ? '通过' : runtimeResult?.status === 'error' ? '失败' : '暂未覆盖'
        }。`,
        problems: runtimeResult?.error
          ? [runtimeResult.error]
          : combinedReview.problems.length
            ? combinedReview.problems
            : ['暂未发现明显规则问题。'],
        suggestions: combinedReview.suggestions.length
          ? combinedReview.suggestions
          : ['继续检查训练、预测和评估流程是否完整。'],
        nextStep: combinedReview.nextStep,
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
                disabled={checking || pythonRunning || aiLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium text-sm hover:shadow-md transition-shadow disabled:opacity-50"
              >
                {checking || pythonRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {pythonRunning && pythonStatusText ? pythonStatusText : checking ? '检查中...' : '运行中...'}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    运行并评分
                  </>
                )}
              </button>
            </div>
            <CodeEditor code={code} onChange={setCode} />
          </div>

          {/* Score Card */}
          {result && <ScoreCard result={result} />}

          <PythonRunResultCard result={pythonResult} loading={pythonRunning} events={pythonEvents} />

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
