import { AlertTriangle, CheckCircle2, Lightbulb, Sparkles, ArrowRight } from 'lucide-react';
import type { AICodeReviewResult, AIMode } from '../services/aiTypes';
import AIModeBadge from './AIModeBadge';

interface Props {
  review: AICodeReviewResult;
  mode: AIMode;
  fallbackReason?: string;
  diagnosisBasis?: string[];
}

export default function AICodeReviewCard({ review, mode, fallbackReason, diagnosisBasis }: Props) {
  return (
    <div className="app-card overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-600" />
            <h3 className="text-base font-extrabold text-slate-950">AI 代码诊断报告</h3>
          </div>
          <AIModeBadge mode={mode} fallbackReason={fallbackReason} />
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{review.summary}</p>
      </div>

      <div className="space-y-4 p-5">
        {/* Diagnosis basis */}
        {diagnosisBasis && diagnosisBasis.length > 0 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-500">诊断依据</div>
            <ul className="space-y-1">
              {diagnosisBasis.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">得分原因</div>
          <p className="text-sm leading-6 text-slate-700">{review.scoreReason}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              主要问题
            </div>
            <ul className="space-y-2">
              {review.problems.map((item, index) => (
                <li key={index} className="text-sm leading-6 text-orange-800">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-800">
              <Lightbulb className="h-4 w-4" />
              修改建议
            </div>
            <ul className="space-y-2">
              {review.suggestions.map((item, index) => (
                <li key={index} className="text-sm leading-6 text-blue-800">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950 p-4 text-white">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold">
            <ArrowRight className="h-4 w-4 text-accent-300" />
            下一步
          </div>
          <p className="text-sm leading-6 text-slate-200">{review.nextStep}</p>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
          <p className="text-sm leading-6 text-emerald-800">{review.encouragement}</p>
        </div>
      </div>
    </div>
  );
}

