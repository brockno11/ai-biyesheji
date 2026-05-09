import { BookOpenCheck, HelpCircle, Lightbulb, Target } from 'lucide-react';
import type { AIMode, AIQuizReviewResult } from '../services/aiTypes';
import AIModeBadge from './AIModeBadge';

interface Props {
  review: AIQuizReviewResult;
  mode: AIMode;
  fallbackReason?: string;
}

export default function AIQuizReviewCard({ review, mode, fallbackReason }: Props) {
  return (
    <div className="app-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-5 w-5 text-primary-600" />
          <h3 className="text-base font-extrabold text-slate-950">AI 错题讲解</h3>
        </div>
        <AIModeBadge mode={mode} fallbackReason={fallbackReason} />
      </div>

      <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800">
          <Target className="h-4 w-4" />
          薄弱知识点
        </div>
        <div className="flex flex-wrap gap-2">
          {review.weakPoints.map((point) => (
            <span key={point} className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
              {point}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {review.wrongQuestionAnalysis.map((item, index) => (
          <div key={`${item.question}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 text-sm font-bold text-slate-900">{item.question}</div>
            <p className="text-sm leading-6 text-rose-700">为什么错：{item.whyWrong}</p>
            <p className="mt-1 text-sm leading-6 text-emerald-700">正确思路：{item.correctThinking}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="mb-1 flex items-center gap-2 text-sm font-bold text-blue-800">
          <Lightbulb className="h-4 w-4" />
          复习建议
        </div>
        <p className="text-sm leading-6 text-blue-800">{review.reviewAdvice}</p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
          <HelpCircle className="h-4 w-4 text-primary-600" />
          相似练习题
        </div>
        <p className="text-sm font-semibold text-slate-800">{review.extraQuestion.question}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {review.extraQuestion.options.map((option, index) => (
            <div
              key={option}
              className={`rounded-lg px-3 py-2 text-sm ${
                index === review.extraQuestion.answer
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                  : 'bg-slate-50 text-slate-600'
              }`}
            >
              {String.fromCharCode(65 + index)}. {option}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{review.extraQuestion.explanation}</p>
      </div>
    </div>
  );
}

