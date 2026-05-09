import { Wifi, WifiOff } from 'lucide-react';
import type { AIMode } from '../services/aiTypes';

interface Props {
  mode: AIMode;
  fallbackReason?: string;
}

export default function AIModeBadge({ mode, fallbackReason }: Props) {
  const online = mode === 'deepseek';
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        online
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
          : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
      }`}
      title={fallbackReason || (online ? '正在使用 DeepSeek API' : '正在使用本地 Mock 兜底')}
    >
      {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {online ? 'DeepSeek 在线模式' : 'Mock 离线演示模式'}
    </div>
  );
}

