import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft, Play, CheckCircle2, BookOpen, Lightbulb, XCircle,
  Search, Terminal, TestTube, Bot, Loader2, ChevronDown, ChevronUp, Cpu,
} from 'lucide-react';
import { getAlgorithmById } from '../data/algorithms';
import { useCourseById } from '../hooks/useCourses';
import { useAuth } from '../hooks/useAuth';
import { getExercisesByAlgorithm } from '../data/exercises';
import { checkCode, getMissingKeywords } from '../services/codeCheckService';
import { buildPracticeReview } from '../services/practiceScoringService';
import { runPythonExercise } from '../services/pythonRuntimeService';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import CodeEditor from '../components/CodeEditor';
import ScoreCard from '../components/ScoreCard';
import AICodeReviewCard from '../components/AICodeReviewCard';
import LoginModal from '../components/LoginModal';
import PythonRunResultCard from '../components/PythonRunResultCard';
import type { AIReviewResult, Exercise } from '../types';
import type { AICodeReviewResult, AIMode, PythonRunResult, PythonRuntimeEvent } from '../services/aiTypes';

/* ──────────── Step Indicator Component ──────────── */
type StepStatus = 'waiting' | 'running' | 'passed' | 'failed';

const stepsConfig = [
  { key: 'check', icon: Search, label: '规则检查', emoji: '🔍' },
  { key: 'python', icon: Terminal, label: 'Python 运行', emoji: '🐍' },
  { key: 'test', icon: TestTube, label: '自动测试', emoji: '🧪' },
  { key: 'ai', icon: Bot, label: 'AI 诊断', emoji: '🤖' },
] as const;

function StepIndicator({
  checking, pythonRunning, pythonResult, aiLoading, aiReview,
}: {
  checking: boolean;
  pythonRunning: boolean;
  pythonResult: PythonRunResult | null;
  aiLoading: boolean;
  aiReview: AICodeReviewResult | null;
}) {
  const getStatus = (key: string): StepStatus => {
    switch (key) {
      case 'check':
        if (checking) return 'running';
        if (pythonRunning || pythonResult || aiReview) return 'passed';
        return 'waiting';
      case 'python':
        if (pythonRunning) return 'running';
        if (pythonResult) return pythonResult.status === 'success' ? 'passed' : 'failed';
        return 'waiting';
      case 'test':
        if (pythonRunning) return 'running';
        if (pythonResult) return pythonResult.passed ? 'passed' : 'failed';
        return 'waiting';
      case 'ai':
        if (aiLoading) return 'running';
        if (aiReview) return 'passed';
        return 'waiting';
      default:
        return 'waiting';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-5">
      <h3 className="text-sm font-extrabold text-gray-900 tracking-tight mb-4 flex items-center gap-2">
        <Cpu className="w-4 h-4 text-primary-500" />
        执行流水线
      </h3>
      <div className="flex items-center gap-0">
        {stepsConfig.map((step, idx) => {
          const status = getStatus(step.key);
          const Icon = step.icon;

          const iconEl =
            status === 'running' ? (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            ) : status === 'passed' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : status === 'failed' ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <Icon className="w-4 h-4 text-gray-400" />
            );

          const nextStatus = idx < stepsConfig.length - 1 ? getStatus(stepsConfig[idx + 1]?.key ?? '') : 'waiting';
          const connectorActive = status === 'passed' || status === 'running';
          const nextConnectorActive = nextStatus === 'passed' || nextStatus === 'running';

          return (
            <div key={step.key} className="flex-1 flex items-center min-w-0">
              {/* Connector line before (except first) */}
              {idx > 0 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors duration-500 ${connectorActive ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}

              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  status === 'running' ? 'bg-blue-50 ring-2 ring-blue-300' :
                  status === 'passed' ? 'bg-green-50' :
                  status === 'failed' ? 'bg-red-50' :
                  'bg-gray-50'
                }`}>
                  {iconEl}
                </div>
                <span className={`text-[10px] font-semibold whitespace-nowrap ${
                  status === 'running' ? 'text-blue-600' :
                  status === 'passed' ? 'text-green-700' :
                  status === 'failed' ? 'text-red-600' :
                  'text-gray-400'
                }`}>
                  {step.emoji} {step.label}
                </span>
              </div>

              {/* Connector line after (except last) */}
              {idx < stepsConfig.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors duration-500 ${nextConnectorActive ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PracticePage() {
  const { algorithmId } = useParams<{ algorithmId: string }>();
  const algorithm = useCourseById(algorithmId || '') || getAlgorithmById(algorithmId || '');
  const exercises = getExercisesByAlgorithm(algorithmId || '');
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  /* ─── New state: env status, hints ─── */
  const [envStatus, setEnvStatus] = useState<'idle' | 'preparing' | 'ready' | 'error'>('idle');
  const [hintLevel, setHintLevel] = useState(0); // 0=none, 1=hint, 2=snippet, 3=full

  const exercise = exercises[currentExIndex] as Exercise | undefined;

  /* Auto-set env to ready when available */
  useEffect(() => {
    const timer = setTimeout(() => {
      setEnvStatus((prev) => (prev === 'idle' ? 'ready' : prev));
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Build diagnosis basis for AI code review
  const diagnosisBasis = useMemo(() => {
    if (!result) return undefined;
    const basis: string[] = [];
    if (result.dimensions) {
      basis.push(`综合评分: ${result.score} 分 (${result.passed ? '通过' : '未通过'})`);
      for (const d of result.dimensions) {
        basis.push(`${d.label}: ${d.score}/${d.maxScore} 分 — ${d.description}`);
      }
    }
    if (pythonResult) {
      basis.push(`Python 运行: ${pythonResult.status === 'success' ? '通过' : pythonResult.status === 'error' ? '失败' : '未覆盖'}`);
      if (pythonResult.error) basis.push(`运行错误: ${pythonResult.error.slice(0, 100)}`);
    }
    const missing = exercise ? getMissingKeywords(exercise, code) : [];
    if (missing.length) basis.push(`缺失 API: ${missing.join('、')}`);
    return basis;
  }, [result, pythonResult, exercise, code]);

  useEffect(() => {
    if (exercise) {
      setCode(exercise.starterCode);
      setResult(null);
      setAiReview(null);
      setPythonResult(null);
      setPythonEvents([]);
      setAiFallbackReason(undefined);
      setHintLevel(0);
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

  /* ─── Layered hint content ─── */
  const hintContent = useMemo(() => {
    if (!exercise) return null;
    const instructions = exercise.instructions;
    const starterCode = exercise.starterCode;
    return {
      hint: instructions.length > 0 ? `提示：${instructions[0]}` : '请按照操作指引完成代码。',
      snippet: `关键代码片段思路：\n${starterCode.split('\n').slice(0, Math.min(8, starterCode.split('\n').length)).join('\n')}\n# ... 按照指引补全剩余部分`,
      full: `完整参考思路：\n${starterCode}\n# 提示：务必使用 ${exercise.expectedKeywords.join('、')} 等 API`,
    };
  }, [exercise]);

  const hintLabels = [
    { emoji: '💡', text: '提示' },
    { emoji: '📋', text: '代码片段' },
    { emoji: '📄', text: '完整答案' },
  ];

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
    setEnvStatus('preparing');

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
      setEnvStatus('ready');
    } catch (e) {
      console.error('[PracticePage] Python runtime failed:', e);
      runtimeResult = undefined;
      setEnvStatus('error');
    } finally {
      setPythonRunning(false);
    }

    const combinedReview = buildPracticeReview(exercise, code, checkResult, runtimeResult);
    setResult(combinedReview);

    if (user) {
      storageService.savePracticeRecord({
        exerciseId: exercise.id,
        algorithmId: algorithm.id,
        code,
        score: combinedReview.score,
        passed: combinedReview.passed,
        timestamp: Date.now(),
        feedback: combinedReview.summary,
      });
    }

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
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回{algorithm.name}课程
      </Link>

      {!user && (
        <div className="mb-4 bg-amber-50/80 backdrop-blur-sm rounded-xl border border-amber-200 p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>当前为游客模式，练习记录不会保存。登录后可追踪学习进度和查看历史记录。</span>
          </div>
          <button
            onClick={() => setShowLoginModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-white px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-all flex-shrink-0"
          >
            立即登录
          </button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Exercise Header */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6 hover:shadow-md transition-all duration-300">
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
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  上一题
                </button>
                <button
                  onClick={() => setCurrentExIndex(Math.min(exercises.length - 1, currentExIndex + 1))}
                  disabled={currentExIndex === exercises.length - 1}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  下一题
                </button>
              </div>
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">{exercise.title}</h1>
            <p className="text-sm text-gray-500 mb-4">{exercise.description}</p>

            {/* Environment Status Badge */}
            <div className="mb-4">
              {envStatus === 'ready' && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Python 环境已就绪 · Web Worker
                </span>
              )}
              {envStatus === 'preparing' && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  准备中...
                </span>
              )}
              {envStatus === 'error' && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  环境异常
                </span>
              )}
              {envStatus === 'idle' && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  等待操作
                </span>
              )}
            </div>

            <div className="rounded-xl border border-primary-100 bg-primary-50/70 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-primary-800 mb-2">
                <Lightbulb className="w-4 h-4" />
                操作指引
              </h3>
              <ol className="space-y-1.5">
                {exercise.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-primary-700">
                    <span className="font-bold text-primary-400">{i + 1}.</span>
                    {inst}
                  </li>
                ))}
              </ol>
            </div>

            {/* Layered Reference Hints */}
            {hintContent && (
              <div className="mt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 font-medium">参考答案：</span>
                  {hintLabels.map((hl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHintLevel(hintLevel === idx + 1 ? 0 : idx + 1)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition-all duration-200 ${
                        hintLevel === idx + 1
                          ? 'bg-primary-50 border-primary-300 text-primary-700 font-semibold'
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {hl.emoji} {hl.text}
                      {hintLevel === idx + 1 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
                {hintLevel > 0 && hintContent && (
                  <div className="mt-3 bg-white/70 backdrop-blur-md rounded-xl border border-primary-200 shadow-sm p-4">
                    <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
                      {hintLevel === 1 ? hintContent.hint :
                       hintLevel === 2 ? hintContent.snippet :
                       hintContent.full}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step Indicator Pipeline */}
          <StepIndicator
            checking={checking}
            pythonRunning={pythonRunning}
            pythonResult={pythonResult}
            aiLoading={aiLoading}
            aiReview={aiReview}
          />

          {/* Code Editor */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">代码编辑器</h2>
              <button
                onClick={handleCheck}
                disabled={checking || pythonRunning || aiLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium text-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
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
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-5 text-sm text-gray-500">
              AI 助教正在生成结构化诊断报告...
            </div>
          )}

          {aiReview && (
            <AICodeReviewCard
              review={aiReview}
              mode={aiMode}
              fallbackReason={aiFallbackReason}
              diagnosisBasis={diagnosisBasis}
            />
          )}
        </div>

        {/* AI Feedback Sidebar */}
        <div className="xl:w-96 flex-shrink-0 space-y-6">
          <div className="xl:sticky xl:top-24 space-y-6">
            {/* Required Keywords */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-5 hover:shadow-md transition-all duration-300">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-900 tracking-tight mb-3">
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
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-5">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-900 tracking-tight mb-3">
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
      <LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
