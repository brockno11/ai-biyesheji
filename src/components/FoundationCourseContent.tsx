import { useEffect, useCallback, useState } from 'react';
import {
  BookOpen,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Play,
  ArrowLeft,
  ArrowRight,
  Clock,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Algorithm, GuidedQuestion } from '../types';
import { getAlgorithmById } from '../data/algorithms';
import AITutorPanel from './AITutorPanel';
import InteractiveTask from './InteractiveTask';
import { lessonProgressService } from '../services/lessonProgressService';
import { aiService } from '../services/aiService';

interface FoundationCourseContentProps {
  algorithm: Algorithm;
}

function Section({
  icon: Icon,
  title,
  children,
  className = '',
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}
    >
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
          <Icon className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
          {title}
        </h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function MistakeCard({
  wrong,
  correct,
}: {
  wrong: string;
  correct: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-white/50 rounded-xl border border-gray-100 overflow-hidden">
      <div className="bg-red-50/40 p-4">
        <h4 className="flex items-center gap-1.5 text-xs font-bold text-red-600 mb-2">
          <span className="text-red-400 font-bold">✗</span> 错误理解
        </h4>
        <p className="text-sm text-red-800 leading-relaxed">{wrong}</p>
      </div>
      <div className="bg-green-50/40 p-4">
        <h4 className="flex items-center gap-1.5 text-xs font-bold text-green-600 mb-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> 正确理解
        </h4>
        <p className="text-sm text-green-800 leading-relaxed">{correct}</p>
      </div>
    </div>
  );
}

function OpeningQuestionBlock({
  question,
  onAnswered,
}: {
  question: GuidedQuestion;
  onAnswered: (selectedIndex: number) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const isCorrect = selectedIndex === question.correctIndex;

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelectedIndex(idx);
    setRevealed(true);
  };

  const handleContinue = () => {
    onAnswered(selectedIndex ?? -1);
  };

  const algorithmNameMap: Record<string, string> = {
    'linear-regression': '线性回归',
    'knn': 'K近邻(KNN)',
    'decision-tree': '决策树',
    'k-means': 'K-Means聚类',
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden transition-all duration-300 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
          <HelpCircle className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
          思考一下再学习
        </h3>
        <span className="ml-auto text-xs text-blue-500 font-semibold">
          先回答，再看内容
        </span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Scenario */}
        <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-100">
          <h4 className="text-xs font-bold text-blue-700 mb-1">场景</h4>
          <p className="text-sm text-blue-800 leading-relaxed">{question.scenario}</p>
        </div>

        {/* Prompt */}
        <p className="text-sm font-semibold text-gray-800 leading-relaxed">
          {question.prompt}
        </p>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const showCorrect = revealed && idx === question.correctIndex;
            const showWrong = revealed && isSelected && !isCorrect;

            let buttonStyle = 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50';
            if (revealed) {
              if (showCorrect) {
                buttonStyle = 'border-green-400 bg-green-50 text-green-800 font-semibold';
              } else if (showWrong) {
                buttonStyle = 'border-red-400 bg-red-50 text-red-800';
              } else {
                buttonStyle = 'border-slate-100 bg-slate-50 text-slate-400';
              }
            } else if (isSelected) {
              buttonStyle = 'border-blue-400 bg-blue-50 text-blue-800 font-semibold';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${buttonStyle} ${revealed ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt.replace(/^[A-D]\.\s*/, '')}</span>
                {revealed && showCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                {revealed && showWrong && (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback after selection */}
        {revealed && (
          <div className={`rounded-xl p-4 border ${isCorrect ? 'bg-green-50/70 border-green-200' : 'bg-red-50/70 border-red-200'}`}>
            <div className="flex items-start gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className={`text-sm font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '回答正确！' : '回答有误'}
                </h4>
                <p className={`text-sm mt-1 leading-relaxed ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? question.correctFeedback : question.wrongFeedback}
                </p>
              </div>
            </div>

            {/* Explanation */}
            <div className="mt-3 pt-3 border-t border-slate-200/50">
              <h4 className="text-xs font-bold text-slate-600 mb-1">知识点</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{question.explanation}</p>
            </div>

            {/* Related algorithms */}
            {question.relatedAlgorithms && question.relatedAlgorithms.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200/50">
                <h4 className="text-xs font-bold text-primary-600 mb-1">这个知识点后面会在这些算法中用到</h4>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {question.relatedAlgorithms.map((algId) => {
                    const name = algorithmNameMap[algId] || algId;
                    return (
                      <span
                        key={algId}
                        className="inline-block px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100"
                      >
                        {name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Follow-up question hint */}
            {question.followUpQuestion && (
              <div className="mt-3 pt-3 border-t border-slate-200/50">
                <h4 className="text-xs font-bold text-amber-600 mb-1">进阶思考</h4>
                <p className="text-sm text-amber-800 leading-relaxed">{question.followUpQuestion}</p>
                <p className="text-xs text-amber-500 mt-1">（学完本节后可以用右侧 AI 助教讨论这个问题）</p>
              </div>
            )}
          </div>
        )}

        {/* Continue button */}
        {revealed && (
          <button
            onClick={handleContinue}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            开始学习本节内容
          </button>
        )}
      </div>
    </div>
  );
}

export default function FoundationCourseContent({
  algorithm,
}: FoundationCourseContentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessons = algorithm.lessons || [];
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  const progressData = lessonProgressService.getProgress();
  const courseProgress = progressData[algorithm.id];
  const completedLessons = courseProgress?.completedLessons || [];

  // Opening question state
  const [openingAnswered, setOpeningAnswered] = useState(false);
  const [openingUserAnswer, setOpeningUserAnswer] = useState<number | null>(null);

  // AI summary state
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState<string | null>(null);
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

  // Determine current lesson from URL param or default to first incomplete
  const lessonParam = searchParams.get('lesson');
  const currentLesson = lessonParam
    ? sortedLessons.find((l) => l.id === lessonParam) || sortedLessons[0]
    : sortedLessons.find((l) => !completedLessons.includes(l.id)) ||
      sortedLessons[0];

  const currentLessonIndex = sortedLessons.findIndex(
    (l) => l.id === currentLesson?.id,
  );

  // Reset opening question state when lesson changes
  useEffect(() => {
    setOpeningAnswered(false);
    setOpeningUserAnswer(null);
  }, [currentLesson?.id]);

  // Sync lesson param if not set
  useEffect(() => {
    if (!lessonParam && currentLesson) {
      setSearchParams({ lesson: currentLesson.id }, { replace: true });
    }
  }, [lessonParam, currentLesson, setSearchParams]);

  const navigateToLesson = useCallback(
    (lessonId: string) => {
      setSearchParams({ lesson: lessonId });
    },
    [setSearchParams],
  );

  // Mark unfinished lesson as in-progress (at least opened)
  const goToPrevLesson = () => {
    if (currentLessonIndex > 0) {
      navigateToLesson(sortedLessons[currentLessonIndex - 1].id);
    }
  };

  const goToNextLesson = () => {
    // Auto-mark current as complete when moving forward
    if (currentLesson) {
      lessonProgressService.markLessonComplete(
        algorithm.id,
        currentLesson.id,
      );
    }
    if (currentLessonIndex < sortedLessons.length - 1) {
      navigateToLesson(sortedLessons[currentLessonIndex + 1].id);
    }
  };

  const handleAISummary = async () => {
    setAiSummaryLoading(true);
    setAiSummaryError(null);
    setAiSummaryText(null);
    try {
      const result = await aiService.summarizeLesson({
        algorithm,
        userQuestion: `请为"${currentLesson.title}"这一节做总结`,
        pagePosition: '基础课学习 - AI 总结本节',
      });
      setAiSummaryText(result.data);
    } catch (e) {
      setAiSummaryError(e instanceof Error ? e.message : 'AI 总结请求失败');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  if (!currentLesson) {
    return (
      <div className="app-container max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">暂无课程内容</h2>
        <p className="text-gray-500 mb-4">该课程还没有添加小节内容</p>
        <Link to="/" className="text-primary-600 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="app-container max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ─── Top Bar ─── */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xl shadow-sm">
            {algorithm.icon}
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">
              {algorithm.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
                基础课程
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  algorithm.difficulty === '入门'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {algorithm.difficulty}
              </span>
            </div>
          </div>
        </div>

        {algorithm.estimatedMinutes && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500 ml-auto">
            <Clock className="w-4 h-4" />
            <span>约{algorithm.estimatedMinutes}分钟</span>
          </div>
        )}
      </div>

      {/* ─── Three-Column Layout ─── */}
      <div className="flex gap-6 justify-center">
        {/* CENTER: Lesson Content */}
        <div className="w-full max-w-[820px] space-y-6">
          {/* Lesson Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                第{currentLesson.order}节 / 共{sortedLessons.length}节
              </span>
              {completedLessons.includes(currentLesson.id) && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  已完成
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {currentLesson.title}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {currentLesson.subtitle}
            </p>
          </div>

          {/* Opening Question (before content) */}
          {currentLesson.openingQuestion && !openingAnswered && (
            <OpeningQuestionBlock
              question={currentLesson.openingQuestion}
              onAnswered={(selectedIndex) => {
                setOpeningUserAnswer(selectedIndex);
                setOpeningAnswered(true);
              }}
            />
          )}

          {/* Main lesson content — shown if no opening question, or after answering */}
          {(openingAnswered || !currentLesson.openingQuestion) && (
            <>
              {/* Goal */}
              <Section icon={Target} title="本节目标">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {currentLesson.goal}
                </p>
              </Section>

              {/* Story */}
              <Section
                icon={BookOpen}
                title="场景故事"
                className="bg-blue-50/50 border-blue-100"
              >
                <p className="text-sm text-gray-700 leading-relaxed">
                  {currentLesson.story}
                </p>
              </Section>

              {/* Explanation */}
              <Section icon={Lightbulb} title="通俗解释">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {currentLesson.explanation}
                </p>
                {currentLesson.example && (
                  <div className="mt-3 bg-amber-50/80 rounded-xl p-4 border border-amber-100">
                    <h4 className="text-xs font-bold text-amber-700 mb-1">
                      💡 示例
                    </h4>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      {currentLesson.example}
                    </p>
                  </div>
                )}
              </Section>

              {/* Interactive Task */}
              <Section icon={Play} title="动手试试">
                <p className="text-gray-500 text-sm mb-4">
                  完成以下互动练习，加深理解
                </p>
                <InteractiveTask
                  type={currentLesson.interactionType}
                  onComplete={(passed) => {
                    lessonProgressService.markInteractionComplete(
                      algorithm.id,
                      currentLesson.id,
                    );
                    if (passed) {
                      lessonProgressService.markLessonComplete(
                        algorithm.id,
                        currentLesson.id,
                      );
                    }
                  }}
                />
              </Section>

              {/* Common Mistakes */}
              {currentLesson.commonMistakes &&
                currentLesson.commonMistakes.length > 0 && (
                  <Section icon={AlertTriangle} title="常见误区">
                    <div className="space-y-3">
                      {currentLesson.commonMistakes.map((m, i) => (
                        <MistakeCard
                          key={i}
                          wrong={m.mistake}
                          correct={m.correction}
                        />
                      ))}
                    </div>
                  </Section>
                )}

              {/* Checkpoint Quiz */}
              {currentLesson.checkpointQuestions &&
                currentLesson.checkpointQuestions.length > 0 && (
                  <Section icon={CheckCircle2} title="本节小测">
                    <CheckpointQuizInline
                      questions={currentLesson.checkpointQuestions}
                      lessonId={currentLesson.id}
                      courseId={algorithm.id}
                      currentScore={
                        courseProgress?.checkpointScores?.[currentLesson.id]
                      }
                    />
                  </Section>
                )}

              {/* Key Takeaway */}
              <div className="bg-gradient-to-r from-primary-50 to-violet-50 rounded-2xl p-5 border border-primary-100">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-extrabold text-primary-700 mb-1">
                      核心要点
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {currentLesson.keyTakeaway}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI 总结本节 */}
              <div className="pt-2">
                {!aiSummaryLoading && !aiSummaryText && !aiSummaryError && (
                  <button
                    onClick={handleAISummary}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/60 border border-purple-200 text-purple-700 rounded-xl font-medium text-sm hover:bg-purple-50 hover:border-purple-300 hover:shadow-sm transition-all duration-300"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI 总结本节
                  </button>
                )}
                {aiSummaryLoading && (
                  <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50/60 rounded-xl px-4 py-3 border border-purple-100">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    AI 正在总结本节内容...
                  </div>
                )}
                {aiSummaryError && (
                  <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
                    <p className="text-sm text-red-700">{aiSummaryError}</p>
                    <button
                      onClick={handleAISummary}
                      className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                    >
                      重试
                    </button>
                  </div>
                )}
                {aiSummaryText && (
                  <div className="bg-purple-50/40 rounded-xl border border-purple-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI 总结
                      </h4>
                      <button
                        onClick={() => setAiSummaryText(null)}
                        className="text-xs text-purple-400 hover:text-purple-600 transition-colors"
                      >
                        收起
                      </button>
                    </div>
                    <p className="text-sm text-purple-900 leading-relaxed whitespace-pre-line">
                      {aiSummaryText}
                    </p>
                    <button
                      onClick={handleAISummary}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-purple-500 hover:text-purple-700 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      重新生成
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 pb-8">
                <button
                  onClick={goToPrevLesson}
                  disabled={currentLessonIndex === 0}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  上一节
                </button>

                {currentLessonIndex < sortedLessons.length - 1 ? (
                <button
                  onClick={goToNextLesson}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  下一节
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-green-600 font-semibold mb-2">
                    恭喜完成本课程所有小节！
                  </p>
                  {algorithm.nextCourseId && (
                    <Link
                      to={`/algorithms/${algorithm.nextCourseId}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                    >
                      开始下一门课
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT: AI Assistant */}
        <div className="w-80 shrink-0 hidden xl:block sticky top-20 self-start">
          <AITutorPanel
            algorithm={algorithm}
            context={
              currentLesson.openingQuestion && openingUserAnswer !== null
                ? `基础课 - ${currentLesson.title}\n【已答引导题】\n题目：${currentLesson.openingQuestion.prompt}\n学生回答：${currentLesson.openingQuestion.options[openingUserAnswer]?.replace(/^[A-D]\.\s*/, '') || '未知'}\n正确答案：${currentLesson.openingQuestion.options[currentLesson.openingQuestion.correctIndex]?.replace(/^[A-D]\.\s*/, '') || ''}\n${currentLesson.relatedAlgorithms ? `关联算法：${currentLesson.relatedAlgorithms.join('、')}` : ''}`
                : `基础课 - ${currentLesson.title}`
            }
          />
        </div>
      </div>
    </div>
  );
}

// ─── Inline Checkpoint Quiz Component ─────────────────────────────────────

function CheckpointQuizInline({
  questions,
  lessonId,
  courseId,
  currentScore,
}: {
  questions: { id: string; question: string; options: string[]; correctIndex: number; explanation: string }[];
  lessonId: string;
  courseId: string;
  currentScore?: number;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill if already scored
  useEffect(() => {
    if (currentScore !== undefined) {
      setSubmitted(true);
    }
  }, [currentScore]);

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    lessonProgressService.saveCheckpointScore(courseId, lessonId, score);
    if (score >= 70) {
      lessonProgressService.markLessonComplete(courseId, lessonId);
    }
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const correctCount = questions.filter(
    (q, i) => answers[i] === q.correctIndex,
  ).length;

  return (
    <div className="space-y-4">
      {questions.map((q, qIndex) => {
        const userAnswer = answers[qIndex];
        const isCorrect =
          submitted && userAnswer === q.correctIndex;
        const isWrong =
          submitted && userAnswer !== undefined && userAnswer !== q.correctIndex;
        return (
          <div
            key={q.id}
            className={`rounded-xl border p-4 transition-all ${
              submitted
                ? isCorrect
                  ? 'border-green-200 bg-green-50/40'
                  : isWrong
                    ? 'border-red-200 bg-red-50/40'
                    : 'border-slate-200 bg-white'
                : 'border-slate-200 bg-white'
            }`}
          >
            <p className="text-sm font-semibold text-slate-800 mb-3">
              {qIndex + 1}. {q.question}
            </p>
            {!submitted ? (
              <div className="space-y-1.5">
                {q.options.map((opt, oIndex) => (
                  <button
                    key={oIndex}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      userAnswer === oIndex
                        ? 'bg-primary-100 text-primary-800 border border-primary-300 font-semibold'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    {String.fromCharCode(65 + oIndex)}. {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {isCorrect && (
                  <div className="flex items-center gap-1.5 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-semibold">
                      正确！答案：{String.fromCharCode(65 + q.correctIndex)}
                    </span>
                  </div>
                )}
                {isWrong && (
                  <div className="flex items-center gap-1.5 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-semibold">
                      正确答案：{String.fromCharCode(65 + q.correctIndex)}.
                      {' '}
                      {q.options[q.correctIndex]}
                    </span>
                  </div>
                )}
                <p className="text-xs text-slate-600">
                  💡 {q.explanation}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {!submitted && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            提交测验
          </button>
          <span className="text-xs text-slate-400">
            {allAnswered
              ? '已回答全部'
              : `已答 ${Object.keys(answers).length}/${questions.length}`}
          </span>
        </div>
      )}

      {submitted && (
        <div
          className={`rounded-xl p-4 border ${
            correctCount === questions.length
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
              : correctCount >= questions.length / 2
                ? 'bg-blue-50 border-blue-200'
                : 'bg-red-50 border-red-200'
          }`}
        >
          <p className="text-sm font-extrabold text-slate-800">
            得分: {correctCount}/{questions.length}
            {currentScore !== undefined && ` (${currentScore}分)`}
          </p>
          <button
            onClick={handleReset}
            className="mt-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            重新作答
          </button>
        </div>
      )}
    </div>
  );
}
