import { AlertCircle, CheckCircle2, Clock3, Loader2, Terminal, XCircle } from 'lucide-react';
import type { PythonRunResult, PythonRuntimeEvent, PythonRuntimePhase } from '../services/aiTypes';

interface Props {
  result?: PythonRunResult | null;
  loading?: boolean;
  events?: PythonRuntimeEvent[];
}

const phaseLabels: Record<PythonRuntimePhase, string> = {
  booting: '启动运行时',
  'loading-packages': '加载依赖',
  executing: '执行代码',
  testing: '固定测试',
  complete: '完成',
  failed: '失败',
  unsupported: '暂未覆盖',
};

function eventTone(level: PythonRuntimeEvent['level']) {
  if (level === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (level === 'warning') return 'border-amber-200 bg-amber-50 text-amber-800';
  if (level === 'error') return 'border-red-200 bg-red-50 text-red-800';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

/* ─── Error type classification ─── */
const errorTypeMap: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /SyntaxError/i, label: '语法错误' },
  { pattern: /NameError/i, label: '变量未定义' },
  { pattern: /ImportError|ModuleNotFoundError/i, label: '依赖缺失' },
  { pattern: /ValueError/i, label: '数据维度错误' },
  { pattern: /NotFittedError/i, label: '模型未训练' },
  { pattern: /TimeoutError/i, label: '执行超时' },
  { pattern: /TypeError/i, label: '类型错误' },
  { pattern: /IndexError/i, label: '索引错误' },
  { pattern: /KeyError/i, label: '键错误' },
  { pattern: /AttributeError/i, label: '属性错误' },
  { pattern: /ZeroDivisionError/i, label: '除零错误' },
  { pattern: /FileNotFoundError/i, label: '文件未找到' },
];

function classifyError(error: string): string | null {
  for (const entry of errorTypeMap) {
    if (entry.pattern.test(error)) return entry.label;
  }
  return null;
}

function RuntimeTimeline({ events }: { events: PythonRuntimeEvent[] }) {
  if (events.length === 0) return null;

  const latestByPhase = events.reduce<Partial<Record<PythonRuntimePhase, PythonRuntimeEvent>>>(
    (acc, event) => ({ ...acc, [event.phase]: event }),
    {}
  );

  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">运行阶段</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(latestByPhase).map(([phase, event]) => (
          <div
            key={phase}
            className={`min-h-[72px] rounded-xl border px-3 py-2 text-xs leading-5 ${eventTone(event.level)}`}
          >
            <div className="mb-1 font-bold">{phaseLabels[phase as PythonRuntimePhase]}</div>
            <div className="max-h-10 overflow-hidden">{event.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PythonRunResultCard({ result, loading = false, events = [] }: Props) {
  if (loading) {
    return (
      <div className="app-card overflow-hidden border-blue-100">
        <div className="flex items-center gap-3 border-b border-blue-100 bg-blue-50 px-5 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <div>
            <h3 className="text-base font-extrabold text-slate-950">Python 真运行中</h3>
            <p className="text-sm text-blue-700">首次加载 Pyodide 和 sklearn 依赖可能需要几十秒。</p>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <RuntimeTimeline events={events} />
          <div className="grid gap-3 sm:grid-cols-3">
            {['规则检查完成', 'Python 执行中', 'AI 诊断待生成'].map((label, index) => (
              <div key={label} className="rounded-xl border border-blue-100 bg-white px-4 py-3">
                <div className="mb-1 text-xs font-bold text-blue-500">STEP {index + 1}</div>
                <div className="text-sm font-semibold text-slate-800">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isSuccess = result.status === 'success';
  const isUnsupported = result.status === 'unsupported';

  return (
    <div className="app-card overflow-hidden">
      <div
        className={`border-b px-5 py-4 ${
          isSuccess
            ? 'border-emerald-100 bg-emerald-50'
            : isUnsupported
              ? 'border-slate-100 bg-slate-50'
              : 'border-red-100 bg-red-50'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-slate-700" />
            <h3 className="text-base font-extrabold text-slate-950">Python 真运行结果</h3>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              isSuccess
                ? 'bg-emerald-100 text-emerald-700'
                : isUnsupported
                  ? 'bg-slate-200 text-slate-600'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {isSuccess ? <CheckCircle2 className="h-3.5 w-3.5" /> : isUnsupported ? <AlertCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {isSuccess ? '测试通过' : isUnsupported ? '暂未覆盖' : '运行失败'}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          {result.durationMs > 0 ? `${result.durationMs} ms` : '未执行'}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <RuntimeTimeline events={result.events || []} />

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">运行状态</div>
            <div className="mt-1 text-lg font-extrabold text-slate-900">
              {isSuccess ? '通过' : isUnsupported ? '未覆盖' : '失败'}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">测试项</div>
            <div className="mt-1 text-lg font-extrabold text-slate-900">{result.tests.length}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">耗时</div>
            <div className="mt-1 text-lg font-extrabold text-slate-900">
              {result.durationMs > 0 ? `${result.durationMs} ms` : '未执行'}
            </div>
          </div>
        </div>

        {result.tests.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">自动测试项</div>
            <div className="flex flex-wrap gap-2">
              {result.tests.map((test) => (
                <span key={test} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                  {test}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.output && (
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">运行输出</div>
            <pre className="max-h-64 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {result.output}
            </pre>
          </div>
        )}

        {result.error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm font-bold text-red-800">
                <XCircle className="h-4 w-4" />
                错误信息
              </span>
              {classifyError(result.error) && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-200 text-red-800 border border-red-300">
                  {classifyError(result.error)}
                </span>
              )}
            </div>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-6 text-red-800">
              {result.error}
            </pre>
          </div>
        )}

        {result.details?.map((detail) => (
          <p key={detail} className="text-sm leading-6 text-slate-600">
            {detail}
          </p>
        ))}
      </div>
    </div>
  );
}
