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
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Algorithm } from '../types';
import AITutorPanel from './AITutorPanel';
import InteractiveTask from './InteractiveTask';
import { lessonProgressService } from '../services/lessonProgressService';

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

export default function FoundationCourseContent({
  algorithm,
}: FoundationCourseContentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessons = algorithm.lessons || [];
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  const progressData = lessonProgressService.getProgress();
  const courseProgress = progressData[algorithm.id];
  const completedLessons = courseProgress?.completedLessons || [];

  // Determine current lesson from URL param or default to first incomplete
  const lessonParam = searchParams.get('lesson');
  const currentLesson = lessonParam
    ? sortedLessons.find((l) => l.id === lessonParam) || sortedLessons[0]
    : sortedLessons.find((l) => !completedLessons.includes(l.id)) ||
      sortedLessons[0];

  const currentLessonIndex = sortedLessons.findIndex(
    (l) => l.id === currentLesson?.id,
  );

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
        </div>

        {/* RIGHT: AI Assistant */}
        <div className="w-80 shrink-0 hidden xl:block sticky top-20 self-start">
          <AITutorPanel
            algorithm={algorithm}
            context={`基础课 - ${currentLesson.title}`}
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
