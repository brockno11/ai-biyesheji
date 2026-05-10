import { CheckCircle2 } from 'lucide-react';

export default function MistakeCard({
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
