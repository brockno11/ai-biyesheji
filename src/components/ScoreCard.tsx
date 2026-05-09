import { CheckCircle, XCircle, AlertTriangle, Lightbulb, ArrowRight, Gauge } from 'lucide-react';
import type { AIReviewResult } from '../types';

interface Props {
  result: AIReviewResult;
  onContinue?: () => void;
}

export default function ScoreCard({ result, onContinue }: Props) {
  const { score, passed, summary, problems, suggestions, nextStep, dimensions } = result;

  const dimensionTone = {
    good: 'border-emerald-100 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-100 bg-amber-50 text-amber-800',
    bad: 'border-red-100 bg-red-50 text-red-800',
    neutral: 'border-slate-100 bg-slate-50 text-slate-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div
        className={`px-6 py-5 ${
          passed
            ? 'bg-gradient-to-r from-green-50 to-emerald-50'
            : 'bg-gradient-to-r from-orange-50 to-amber-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {passed ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <XCircle className="w-8 h-8 text-orange-500" />
            )}
            <div>
              <div className="text-lg font-bold text-gray-900">
                {passed ? '综合评分通过' : '需要改进'}
              </div>
              <div className="text-sm text-gray-600">{summary}</div>
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${
                score >= 60 ? 'text-green-600' : 'text-orange-500'
              }`}
            >
              {score}
            </div>
            <div className="text-xs text-gray-500">分</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {dimensions && dimensions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-semibold text-gray-800">评分维度</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {dimensions.map((dimension) => (
                <div
                  key={dimension.label}
                  className={`rounded-xl border p-4 ${dimensionTone[dimension.status]}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold">{dimension.label}</span>
                    <span className="text-base font-extrabold">
                      {dimension.score}/{dimension.maxScore}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/70">
                    <div
                      className="h-full rounded-full bg-current"
                      style={{ width: `${Math.round((dimension.score / dimension.maxScore) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 opacity-90">{dimension.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {problems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-gray-800">发现的问题</span>
            </div>
            <ul className="space-y-1.5">
              {problems.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-orange-400 mt-0.5">•</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {suggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-800">改进建议</span>
            </div>
            <ul className="space-y-1.5">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-primary-50 rounded-xl px-4 py-3 flex items-start gap-2">
          <ArrowRight className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold text-primary-700">下一步：</span>
            <span className="text-sm text-primary-600">{nextStep}</span>
          </div>
        </div>

        {onContinue && passed && (
          <button
            onClick={onContinue}
            className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium text-sm hover:shadow-md transition-shadow"
          >
            继续下一题
          </button>
        )}
      </div>
    </div>
  );
}
