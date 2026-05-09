import { CalendarCheck, Compass, ListChecks, Sparkles } from 'lucide-react';
import type { AIMode, AIStudyPlanResult } from '../services/aiTypes';
import AIModeBadge from './AIModeBadge';

interface Props {
  plan: AIStudyPlanResult;
  mode: AIMode;
  fallbackReason?: string;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function AIStudyPlanCard({ plan, mode, fallbackReason, loading, onRefresh }: Props) {
  return (
    <div className="app-card overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-r from-primary-50 to-accent-50 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-600" />
            <h2 className="text-base font-extrabold text-slate-950">AI 学习路径推荐</h2>
          </div>
          <div className="flex items-center gap-2">
            <AIModeBadge mode={mode} fallbackReason={fallbackReason} />
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {loading ? '生成中...' : '重新生成'}
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{plan.summary}</p>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl bg-slate-950 p-4 text-white">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold">
            <Compass className="h-4 w-4 text-accent-300" />
            推荐下一门
          </div>
          <div className="text-xl font-extrabold">{plan.nextAlgorithm}</div>
          <p className="mt-2 text-sm leading-6 text-slate-200">{plan.reason}</p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-800">
              <ListChecks className="h-4 w-4" />
              建议复习点
            </div>
            <ul className="space-y-1.5">
              {plan.reviewList.map((item) => (
                <li key={item} className="text-sm leading-6 text-blue-800">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-800">
              <CalendarCheck className="h-4 w-4" />
              今日学习计划
            </div>
            <ol className="space-y-1.5">
              {plan.dailyPlan.map((item, index) => (
                <li key={item} className="text-sm leading-6 text-emerald-800">
                  {index + 1}. {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

