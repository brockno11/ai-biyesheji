import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw, Lightbulb } from 'lucide-react';
import { getAlgorithmById } from '../data/algorithms';
import { useCourseById } from '../hooks/useCourses';
import { useAuth } from '../hooks/useAuth';
import { getQuizByAlgorithm } from '../data/exercises';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import AIQuizReviewCard from '../components/AIQuizReviewCard';
import LoginModal from '../components/LoginModal';
import type { AIMode, AIQuizReviewResult } from '../services/aiTypes';

export default function QuizPage() {
  const { algorithmId } = useParams<{ algorithmId: string }>();
  const algorithm = useCourseById(algorithmId || '') || getAlgorithmById(algorithmId || '');
  const questions = useMemo(() => getQuizByAlgorithm(algorithmId || ''), [algorithmId]);
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiReview, setAiReview] = useState<AIQuizReviewResult | null>(null);
  const [aiMode, setAiMode] = useState<AIMode>('mock');
  const [aiFallbackReason, setAiFallbackReason] = useState<string | undefined>();
  const [aiLoading, setAiLoading] = useState(false);

  if (!algorithm || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">暂无测验</h2>
        <p className="text-gray-500 mb-4">该算法暂无可用的测验题</p>
        <Link to="/" className="text-primary-600 hover:underline">返回首页</Link>
      </div>
    );
  }

  const question = questions[currentQ];
  const selectedAnswer = answers[currentQ];
  const isCorrect = selectedAnswer === question?.correctIndex;

  const handleSelect = (optionIndex: number) => {
    if (submitted) return;
    setAnswers({ ...answers, [currentQ]: optionIndex });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowExplanation(true);

    // Save record
    const allAnswered = { ...answers };
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (allAnswered[i] === q.correctIndex) correctCount++;
    });

    if (user) {
      storageService.saveQuizRecord({
        algorithmId: algorithm.id,
        score: Math.round((correctCount / questions.length) * 100),
        total: questions.length,
        timestamp: Date.now(),
        answers: allAnswered,
      });
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setShowExplanation(false);
    setAiReview(null);
    setCurrentQ(0);
  };

  const correctCount = Object.entries(answers).filter(
    ([i, ans]) => questions[Number(i)]?.correctIndex === ans
  ).length;
  const allAnswered = Object.keys(answers).length === questions.length;

  const handleAIReview = async () => {
    if (!submitted || aiLoading) return;
    setAiLoading(true);
    setAiFallbackReason(undefined);
    try {
      const review = await aiService.reviewQuiz({
        algorithm,
        quizQuestions: questions,
        quizAnswers: answers,
        quizScore: Math.round((correctCount / questions.length) * 100),
        pagePosition: '测验页',
      });
      setAiReview(review.data);
      setAiMode(review.mode);
      setAiFallbackReason(review.fallbackReason);
    } catch {
      setAiReview(null);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link
        to={`/algorithms/${algorithm.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回{algorithm.name}课程
      </Link>

      {!user && (
        <div className="mb-4 bg-amber-50/80 backdrop-blur-sm rounded-xl border border-amber-200 p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>当前为游客模式，测验成绩不会保存。登录后可追踪学习进度和查看 AI 智能分析。</span>
          </div>
          <button
            onClick={() => setShowLoginModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-white px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-all flex-shrink-0"
          >
            立即登录
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">
            {algorithm.icon} {algorithm.name} · 测验挑战
          </h1>
          <span className="text-sm text-gray-500">
            {currentQ + 1} / {questions.length}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-4">
          {questions.map((q, i) => {
            const ans = answers[i];
            const theme =
              ans === undefined
                ? 'bg-gray-200'
                : submitted && ans === q.correctIndex
                  ? 'bg-green-400'
                  : submitted
                    ? 'bg-red-400'
                    : 'bg-primary-400';
            return (
              <button
                key={q.id}
                onClick={() => {
                  if (!submitted) setCurrentQ(i);
                }}
                className={`h-1.5 flex-1 rounded-full transition-colors ${theme} ${
                  i === currentQ ? 'ring-2 ring-primary-300 ring-offset-1' : ''
                }`}
              />
            );
          })}
        </div>

        {submitted && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-700">正确 {correctCount} 题</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-600">
                错误 {questions.length - correctCount} 题
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-700">
                得分 {Math.round((correctCount / questions.length) * 100)} 分
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Question Card */}
      {question && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="text-sm font-medium text-primary-600 mb-2">
            第 {currentQ + 1} 题
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((opt, i) => {
              let borderColor = 'border-gray-200 hover:border-primary-300';
              let bgColor = 'hover:bg-primary-50';
              let indicator = null;

              if (submitted) {
                if (i === question.correctIndex) {
                  borderColor = 'border-green-400';
                  bgColor = 'bg-green-50';
                  indicator = <CheckCircle className="w-5 h-5 text-green-500" />;
                } else if (i === selectedAnswer && i !== question.correctIndex) {
                  borderColor = 'border-red-400';
                  bgColor = 'bg-red-50';
                  indicator = <XCircle className="w-5 h-5 text-red-400" />;
                }
              } else if (i === selectedAnswer) {
                borderColor = 'border-primary-400 bg-primary-50';
                bgColor = 'bg-primary-50';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={submitted}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${borderColor} ${bgColor} disabled:cursor-default`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      i === selectedAnswer && !submitted
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-gray-800 flex-1">{opt}</span>
                  {indicator}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="mt-6 bg-blue-50 rounded-xl p-4 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-blue-800 mb-1">解析</div>
                <p className="text-sm text-blue-700">{question.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          上一题
        </button>
        <button
          onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
          disabled={currentQ === questions.length - 1}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          下一题
        </button>
        <div className="flex-1" />

        {!submitted && allAnswered && (
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium text-sm hover:shadow-md transition-shadow"
          >
            提交测验
          </button>
        )}

        {submitted && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            重新挑战
          </button>
        )}
      </div>

      {submitted && (
        <div className="mt-6">
          {!aiReview && (
            <button
              onClick={handleAIReview}
              disabled={aiLoading}
              className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
            >
              {aiLoading ? 'AI 正在生成分析报告...' : 'AI 智能分析'}
            </button>
          )}

          {aiReview && (
            <AIQuizReviewCard
              review={aiReview}
              mode={aiMode}
              fallbackReason={aiFallbackReason}
            />
          )}
        </div>
      )}
      <LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
