import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { aiService } from '../services/aiService';
import type { Algorithm } from '../types';
import type { AIMode } from '../services/aiTypes';
import AIModeBadge from './AIModeBadge';
import AITextRenderer from './AITextRenderer';

interface Props {
  algorithm?: Algorithm;
  visualState: Record<string, string | number | boolean>;
}

export default function AIVisualizationInsight({ algorithm, visualState }: Props) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<AIMode>('mock');
  const [fallbackReason, setFallbackReason] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    try {
      const result = await aiService.explainVisualization({
        algorithm,
        visualState,
        userQuestion: '请用通俗语言解释当前可视化现象',
        pagePosition: '算法可视化区域',
      });
      setText(result.data);
      setMode(result.mode);
      setFallbackReason(result.fallbackReason);
    } catch (e) {
      console.error('[AIVisualizationInsight] Failed to get AI explanation:', e);
      setText('AI 解释暂时无法生成，请稍后重试');
      setMode('mock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Sparkles className="h-4 w-4 text-primary-600" />
          AI 解释当前现象
        </div>
        <div className="flex items-center gap-2">
          {text && <AIModeBadge mode={mode} fallbackReason={fallbackReason} />}
          <button
            onClick={handleExplain}
            disabled={loading}
            className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? '解释中...' : '生成解释'}
          </button>
        </div>
      </div>
      </div>
      {text && (
        <div className="border-t border-slate-100 p-4">
          <AITextRenderer text={text} />
        </div>
      )}
    </div>
  );
}
