import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Trophy, Sparkles, ChevronRight, ArrowRight, AlertTriangle } from 'lucide-react';

/* ── Shared types ────────────────────────────────────────────────── */

interface InteractionProps {
  onComplete?: (passed: boolean) => void;
  onAskAI?: () => void;
}

/* ── 1. DataTableGuide ───────────────────────────────────────────── */

export function DataTableGuide({ onComplete, onAskAI }: InteractionProps) {
  const headers = ['学号', '学习时间(h)', '睡眠时间(h)', '作业完成', '是否及格'];
  const rows = [
    ['001', '25', '7', '是', '是'],
    ['002', '8', '5', '否', '否'],
    ['003', '30', '8', '是', '是'],
    ['004', '12', '6', '是', '否'],
    ['005', '20', '7', '否', '是'],
  ];
  const [step, setStep] = useState(0); // 0=pick-row, 1=pick-features, 2=pick-label
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCols, setSelectedCols] = useState<Set<number>>(new Set());
  const [selectedLabel, setSelectedLabel] = useState<number | null>(null);
  const labelCol = 4; // "是否及格" is the label

  const handleComplete = useCallback(() => {
    if (step >= 2 && selectedLabel === labelCol) {
      onComplete?.(true);
    }
  }, [step, selectedLabel, onComplete]);

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
        <p className="text-xs font-semibold text-blue-800">
          {step === 0 && '任务1：点击一行，找出一条"样本"'}
          {step === 1 && '任务2：点击所有可以作为"特征"的列（不要点标签列）'}
          {step === 2 && '任务3：点击最适合作为"预测目标（标签）"的列'}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  onClick={() => {
                    if (step === 1 && i !== labelCol) {
                      setSelectedCols((prev) => {
                        const next = new Set(prev);
                        next.has(i) ? next.delete(i) : next.add(i);
                        return next;
                      });
                    }
                    if (step === 2) { setSelectedLabel(i); handleComplete(); }
                  }}
                  className={`px-2 py-1.5 border border-slate-200 cursor-pointer transition-colors ${
                    step === 1 && selectedCols.has(i) ? 'bg-blue-100 font-bold text-blue-700' :
                    step === 2 && selectedLabel === i ? (i === labelCol ? 'bg-green-100 font-bold text-green-700' : 'bg-red-100 text-red-700') :
                    'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                onClick={() => {
                  if (step === 0) { setSelectedRow(ri); setStep(1); }
                }}
                className={`cursor-pointer transition-colors ${
                  selectedRow === ri ? 'bg-blue-50 ring-1 ring-blue-300' : 'hover:bg-slate-50'
                }`}
              >
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-1 border border-slate-100 text-center">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {step >= 1 && (
        <div className="text-xs text-slate-500 space-y-1">
          {selectedRow !== null && <p>✅ 已选样本：第 {selectedRow + 1} 行（一行 = 一个样本）</p>}
          {selectedCols.size > 0 && <p>✅ 已选特征列：{selectedCols.size} 列（作为模型输入）</p>}
          {selectedLabel !== null && (
            <p className={selectedLabel === labelCol ? 'text-green-600 font-semibold' : 'text-red-600'}>
              {selectedLabel === labelCol ? '✅ 正确！"是否及格"是标签' : '❌ 这列不是预测目标'}
            </p>
          )}
        </div>
      )}
      {step === 1 && selectedCols.size >= 3 && (
        <button onClick={() => setStep(2)} className="w-full py-2 bg-primary-500 text-white rounded-lg text-xs font-semibold">继续 → 选标签</button>
      )}
      {onAskAI && (
        <button onClick={onAskAI} className="inline-flex items-center gap-1 text-[10px] text-amber-600 hover:text-amber-800">
          <Sparkles className="w-3 h-3" /> 问 AI
        </button>
      )}
    </div>
  );
}

/* ── 2. FeatureLabelSelector ─────────────────────────────────────── */

const FLS_SCENARIOS = [
  {
    name: '房价预测', sample: '一套房子',
    fields: ['面积(m²)', '房间数', '地段等级', '房价(万元)', '建造年份'],
    features: [0, 1, 2, 4], label: 3,
  },
  {
    name: '垃圾邮件识别', sample: '一封邮件',
    fields: ['发件人地址', '邮件正文长度', '是否含链接', '是否垃圾邮件', '发送时间'],
    features: [0, 1, 2, 4], label: 3,
  },
  {
    name: '鸢尾花分类', sample: '一朵鸢尾花',
    fields: ['花瓣长度', '花瓣宽度', '花萼长度', '花萼宽度', '品种'],
    features: [0, 1, 2, 3], label: 4,
  },
];

export function FeatureLabelSelector({ onComplete }: InteractionProps) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const s = FLS_SCENARIOS[scenarioIdx];
  const allDone = s.fields.every((_, i) => !!selections[scenarioIdx * 10 + i]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">场景 {scenarioIdx + 1}/3：{s.name}</span>
        <span className="text-[10px] text-slate-400">样本：{s.sample}</span>
      </div>
      <div className="space-y-2">
        {s.fields.map((f, i) => {
          const sel = selections[scenarioIdx * 10 + i];
          const isCorrect = sel === (i === s.label ? '标签' : '特征');
          return (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
              <span className="text-xs flex-1 font-medium text-slate-700">{f}</span>
              <div className="flex gap-1">
                {['特征', '标签'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelections((p) => ({ ...p, [scenarioIdx * 10 + i]: cat }))}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                      sel === cat
                        ? isCorrect ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {sel && (isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />)}
            </div>
          );
        })}
      </div>
      {allDone && (
        <button
          onClick={() => {
            if (scenarioIdx < 2) { setScenarioIdx((p) => p + 1); }
            else { onComplete?.(true); }
          }}
          className="w-full py-2 bg-primary-500 text-white rounded-lg text-xs font-semibold"
        >
          {scenarioIdx < 2 ? '下一场景' : '完成'}
        </button>
      )}
      <p className="text-[10px] text-slate-400">口诀：样本是例子，特征是线索，标签是答案。</p>
    </div>
  );
}

/* ── 3. XYSplitter ───────────────────────────────────────────────── */

const XY_FIELDS = ['学习时间(h)', '睡眠时间(h)', '作业完成', '历史成绩', '是否及格'];

export function XYSplitter({ onComplete }: InteractionProps) {
  const [xFields, setXFields] = useState<Set<number>>(new Set());
  const [yField, setYField] = useState<number | null>(null);
  const labelIdx = 4;
  const done = xFields.size > 0 && yField !== null;

  const toggleX = (i: number) => {
    if (i === labelIdx) return;
    setXFields((p) => { const n = new Set(p); p.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3 min-h-[100px]">
          <h4 className="text-xs font-bold text-blue-700 mb-2">X 特征区</h4>
          <div className="text-[10px] font-mono text-blue-600 mb-1">
            X = data[[{Array.from(xFields).map((i) => `"${XY_FIELDS[i]}"`).join(', ')}]]
          </div>
          {xFields.size === 0 && <p className="text-[10px] text-blue-400">点击下方字段加入 X</p>}
        </div>
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 min-h-[100px]">
          <h4 className="text-xs font-bold text-amber-700 mb-2">y 标签区</h4>
          {yField !== null && (
            <div className="text-[10px] font-mono text-amber-600">
              y = data["{XY_FIELDS[yField]}"]
            </div>
          )}
          {yField === null && <p className="text-[10px] text-amber-400">点击下方字段加入 y</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {XY_FIELDS.map((f, i) => (
          <button
            key={i}
            onClick={() => {
              if (i === labelIdx) setYField(yField === i ? null : i);
              else toggleX(i);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              i === labelIdx
                ? yField === i ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300' : 'bg-slate-50 text-slate-500 hover:bg-amber-50'
                : xFields.has(i) ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : 'bg-slate-50 text-slate-500 hover:bg-blue-50'
            }`}
          >
            {f} {i === labelIdx ? '(标签)' : ''}
          </button>
        ))}
      </div>
      {done && (
        <button onClick={() => onComplete?.(true)} className="w-full py-2 bg-primary-500 text-white rounded-lg text-xs font-semibold">完成</button>
      )}
    </div>
  );
}

/* ── 4. TrainValidTestSplitSimulator ─────────────────────────────── */

export function TrainValidTestSplitSimulator({ onComplete }: InteractionProps) {
  const [testSize, setTestSize] = useState(0.2);
  const trainPct = Math.round((1 - testSize) * 100);
  const testPct = Math.round(testSize * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-600">测试集比例：</span>
        <input type="range" min="0.1" max="0.4" step="0.05" value={testSize}
          onChange={(e) => { setTestSize(parseFloat(e.target.value)); onComplete?.(true); }}
          className="flex-1 accent-primary-500" />
        <span className="text-xs font-bold text-slate-700">{testPct}%</span>
      </div>
      <div className="h-8 flex rounded-lg overflow-hidden">
        <div className="h-full bg-blue-400 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${trainPct}%` }}>
          训练集 {trainPct}%
        </div>
        <div className="h-full bg-amber-400 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${testPct}%` }}>
          测试集 {testPct}%
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
          <span className="font-bold text-blue-700">训练集</span>：模型学习规律（练习题）
        </div>
        <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
          <span className="font-bold text-amber-700">测试集</span>：检查泛化能力（考试题）
        </div>
      </div>
      {testSize < 0.15 && (
        <div className="bg-red-50 rounded-lg p-2 border border-red-100 text-[10px] text-red-600">
          ⚠️ 测试集太小，评估结果可能不稳定
        </div>
      )}
    </div>
  );
}

/* ── 5. RegressionMetricLab ──────────────────────────────────────── */

const TRUE_VALUES = [350, 620, 280, 450, 510];

function calcMAE(pred: number[]) { return pred.reduce((s, v, i) => s + Math.abs(v - TRUE_VALUES[i]), 0) / 5; }
function calcMSE(pred: number[]) { return pred.reduce((s, v, i) => s + (v - TRUE_VALUES[i]) ** 2, 0) / 5; }
function calcR2(pred: number[]) {
  const meanY = TRUE_VALUES.reduce((a, b) => a + b, 0) / 5;
  const ssRes = pred.reduce((s, v, i) => s + (TRUE_VALUES[i] - v) ** 2, 0);
  const ssTot = TRUE_VALUES.reduce((s, v) => s + (v - meanY) ** 2, 0);
  return 1 - ssRes / ssTot;
}

export function RegressionMetricLab({ onComplete }: InteractionProps) {
  const [pred, setPred] = useState([340, 600, 300, 460, 500]);
  const mae = calcMAE(pred); const mse = calcMSE(pred); const rmse = Math.sqrt(mse); const r2 = calcR2(pred);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'MAE', value: mae.toFixed(0), unit: '万元', hint: '平均差多少' },
          { label: 'MSE', value: mse.toFixed(0), unit: '万元²', hint: '大错误放大' },
          { label: 'RMSE', value: rmse.toFixed(0), unit: '万元', hint: '常用指标' },
          { label: 'R²', value: r2.toFixed(3), unit: '', hint: r2 > 0.8 ? '解释力强' : r2 > 0.5 ? '还可以' : '偏差大' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-lg border border-slate-200 p-2 text-center">
            <div className="text-[10px] text-slate-400">{m.label}</div>
            <div className="text-sm font-extrabold text-slate-800">{m.value}<span className="text-[10px] font-normal">{m.unit}</span></div>
            <div className="text-[9px] text-slate-400">{m.hint}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {TRUE_VALUES.map((tv, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-20 flex-shrink-0">真实：{tv}万</span>
            <input type="range" min={tv - 150} max={tv + 150} value={pred[i]}
              onChange={(e) => { const n = [...pred]; n[i] = parseInt(e.target.value); setPred(n); onComplete?.(true); }}
              className="flex-1 accent-primary-500" />
            <span className="text-[10px] font-bold text-slate-700 w-12 flex-shrink-0">预测：{pred[i]}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => { const n = [...pred]; n[2] = TRUE_VALUES[2] + 200; setPred(n); }}
        className="w-full py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[10px] font-semibold hover:bg-red-100">
        注入离谱预测（观察 MSE 猛增）
      </button>
    </div>
  );
}

/* ── 6. ClassificationMetricLab ──────────────────────────────────── */

export function ClassificationMetricLab({ onComplete }: InteractionProps) {
  const [tp, setTp] = useState(8);
  const [fp, setFp] = useState(2);
  const [fn, setFn] = useState(3);
  const [tn, setTn] = useState(87);
  const total = tp + fp + fn + tn;
  const acc = ((tp + tn) / total * 100).toFixed(1);
  const prec = tp + fp > 0 ? (tp / (tp + fp) * 100).toFixed(1) : '0';
  const rec = tp + fn > 0 ? (tp / (tp + fn) * 100).toFixed(1) : '0';
  const f1 = tp + fp + fn > 0 ? ((2 * tp) / (2 * tp + fp + fn) * 100).toFixed(1) : '0';

  const Cell = ({ label, value, set }: { label: string; value: number; set: (v: number) => void }) => (
    <div className="text-center p-2">
      <div className="text-[10px] text-slate-400 mb-0.5">{label}</div>
      <div className="text-lg font-extrabold text-slate-800">{value}</div>
      <div className="flex justify-center gap-1 mt-1">
        <button onClick={() => { set(Math.max(0, value - 1)); onComplete?.(true); }} className="w-5 h-5 rounded bg-slate-100 text-xs">−</button>
        <button onClick={() => { set(value + 1); onComplete?.(true); }} className="w-5 h-5 rounded bg-slate-100 text-xs">+</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden border border-slate-200">
        <Cell label="TP (真正例)" value={tp} set={setTp} />
        <Cell label="FP (假正例/误报)" value={fp} set={setFp} />
        <Cell label="FN (假负例/漏报)" value={fn} set={setFn} />
        <Cell label="TN (真负例)" value={tn} set={setTn} />
      </div>
      <div className="grid grid-cols-4 gap-1 text-center">
        {[
          { label: 'Accuracy', value: acc + '%', color: 'text-slate-700' },
          { label: 'Precision', value: prec + '%', color: 'text-blue-600' },
          { label: 'Recall', value: rec + '%', color: 'text-green-600' },
          { label: 'F1', value: f1 + '%', color: 'text-purple-600' },
        ].map((m) => (
          <div key={m.label} className="bg-slate-50 rounded-lg p-1.5">
            <div className="text-[9px] text-slate-400">{m.label}</div>
            <div className={`text-xs font-extrabold ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setFn(8); setFp(1); setTp(2); setTn(89); }}
          className="flex-1 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded text-[10px] font-semibold">
          医疗筛查（漏报代价大）
        </button>
        <button onClick={() => { setFp(5); setFn(1); setTp(9); setTn(85); }}
          className="flex-1 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[10px] font-semibold">
          垃圾邮件（误报代价大）
        </button>
      </div>
    </div>
  );
}

/* ── 7. OverfittingPlayground ────────────────────────────────────── */

export function OverfittingPlayground({ onComplete }: InteractionProps) {
  const [degree, setDegree] = useState(1);
  const trainErr = Math.max(0.05, 0.5 - degree * 0.06 + degree * degree * 0.008);
  const testErr = degree <= 4 ? trainErr + 0.05 : trainErr + (degree - 4) * 0.08;
  const gap = testErr - trainErr;
  const status = degree <= 2 ? '欠拟合' : degree <= 5 ? '泛化良好' : '过拟合';
  const statusColor = degree <= 2 ? 'text-red-600' : degree <= 5 ? 'text-green-600' : 'text-red-600';
  const statusBg = degree <= 2 ? 'bg-red-50 border-red-200' : degree <= 5 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-600">模型复杂度：</span>
        <input type="range" min="1" max="10" value={degree}
          onChange={(e) => { setDegree(parseInt(e.target.value)); onComplete?.(true); }}
          className="flex-1 accent-primary-500" />
        <span className="text-xs font-bold text-slate-700">{degree}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
          <div className="text-[9px] text-blue-500">训练误差</div>
          <div className="text-lg font-extrabold text-blue-700">{(trainErr * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
          <div className="text-[9px] text-amber-500">测试误差</div>
          <div className="text-lg font-extrabold text-amber-700">{(testErr * 100).toFixed(0)}%</div>
        </div>
      </div>
      {/* Simplified visual: error gap bar */}
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
        <div className="h-full bg-blue-400 transition-all" style={{ width: `${trainErr * 100}%` }} />
        <div className="h-full bg-amber-400 transition-all" style={{ width: `${gap * 100}%` }} />
      </div>
      <div className={`rounded-lg p-3 border text-center ${statusBg}`}>
        <span className={`text-sm font-extrabold ${statusColor}`}>{status}</span>
        <p className="text-[10px] text-slate-500 mt-0.5">
          {degree <= 2 ? '训练和测试误差都高——模型太简单' :
           degree <= 5 ? '训练和测试误差接近且较低——刚刚好' :
           '训练误差低、测试误差高——模型记住了噪声'}
        </p>
      </div>
      {gap > 0.1 && (
        <div className="bg-red-50 rounded-lg p-2 border border-red-100 text-[10px] text-red-600 flex items-start gap-1">
          <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
          训练/测试差距 {((gap) * 100).toFixed(0)}%，存在过拟合迹象
        </div>
      )}
    </div>
  );
}

/* ── 8. HyperparameterLab ────────────────────────────────────────── */

const HP_CARDS = [
  { algo: 'KNN', param: 'K 值 (n_neighbors)', min: 1, max: 15, lowHint: 'K太小→容易过拟合', highHint: 'K太大→边界模糊欠拟合' },
  { algo: '决策树', param: '最大深度 (max_depth)', min: 1, max: 10, lowHint: '太浅→规则太粗糙', highHint: '太深→记住噪声' },
  { algo: 'K-Means', param: '聚类数 (n_clusters)', min: 2, max: 8, lowHint: 'K太小→不同簇被合并', highHint: 'K太大→簇被拆碎' },
  { algo: '随机森林', param: '树数量 (n_estimators)', min: 10, max: 200, lowHint: '太少→结果不稳定', highHint: '越多越稳定但计算慢' },
];

export function HyperparameterLab({ onComplete }: InteractionProps) {
  const [values, setValues] = useState([5, 3, 3, 100]);
  const interacted = values.some((v, i) => v !== [5, 3, 3, 100][i]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">每个算法有关键的"旋钮"（超参数）。调节下面滑块，观察提示变化：</p>
      {HP_CARDS.map((card, i) => (
        <div key={card.algo} className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-700">{card.algo}</span>
            <span className="text-[10px] text-slate-400">{card.param}</span>
          </div>
          <input type="range" min={card.min} max={card.max} value={values[i]}
            onChange={(e) => { const n = [...values]; n[i] = parseInt(e.target.value); setValues(n); onComplete?.(true); }}
            className="w-full accent-primary-500" />
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px] text-red-400">{card.lowHint}</span>
            <span className="text-[9px] font-bold text-slate-600">{values[i]}</span>
            <span className="text-[9px] text-amber-500">{card.highHint}</span>
          </div>
        </div>
      ))}
      {interacted && <p className="text-[10px] text-green-600 text-center">✅ 你已体验了超参数调优。不同算法有不同的关键旋钮！</p>}
    </div>
  );
}

/* ── 9. CrossValidationSimulator ─────────────────────────────────── */

const CV_SCORES = [0.78, 0.82, 0.80, 0.76, 0.84];

export function CrossValidationSimulator({ onComplete }: InteractionProps) {
  const [round, setRound] = useState(0);
  const avgScore = round > 0 ? CV_SCORES.slice(0, round).reduce((a, b) => a + b, 0) / round : 0;

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {CV_SCORES.map((_, i) => (
          <div key={i}
            className={`flex-1 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
              i < round
                ? i === round - 1 ? 'bg-amber-100 border-2 border-amber-400 text-amber-700' : 'bg-blue-50 border border-blue-200 text-blue-600'
                : 'bg-slate-50 border border-slate-200 text-slate-400'
            }`}>
            {i < round ? (i === round - 1 ? `验证 ${CV_SCORES[i]}` : `训练 ✓`) : `第${i + 1}折`}
          </div>
        ))}
      </div>
      <div className="text-center">
        <span className="text-xs text-slate-500">当前平均分：</span>
        <span className="text-sm font-extrabold text-primary-600">{round > 0 ? avgScore.toFixed(2) : '—'}</span>
      </div>
      {round < 5 ? (
        <button onClick={() => { setRound((p) => p + 1); if (round === 4) onComplete?.(true); }}
          className="w-full py-2 bg-primary-500 text-white rounded-lg text-xs font-semibold">
          第 {round + 1} 轮 → 用第 {round + 1} 折做验证
        </button>
      ) : (
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
          <Trophy className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <p className="text-xs font-bold text-green-700">5折交叉验证完成！平均分：{avgScore.toFixed(2)}</p>
          <p className="text-[10px] text-green-600 mt-0.5">这个平均分比任何单次划分的结果都更稳定可靠。</p>
        </div>
      )}
    </div>
  );
}

/* ── 10. LeakageDetective ─────────────────────────────────────────── */

const LEAK_SCENARIOS = [
  {
    title: '预测学生是否及格',
    features: ['学习时间', '是否补考', '作业完成率', '期末成绩', '上课出勤', '学号'],
    leaks: [1, 3], // 是否补考(知道结果才有), 期末成绩(就是预测目标本身)
  },
  {
    title: '预测用户是否购买会员',
    features: ['浏览时长', '点击次数', '是否已支付', '收藏商品数', '付款时间', '访问设备'],
    leaks: [2, 4], // 是否已支付, 付款时间
  },
  {
    title: '预测贷款是否违约',
    features: ['月收入', '负债率', '是否已逾期', '贷款金额', '催收记录', '工作年限'],
    leaks: [2, 4], // 是否已逾期, 催收记录
  },
  {
    title: '预测房价',
    features: ['面积', '房间数', '成交价', '地段评分', '挂牌价', '建造年份'],
    leaks: [2, 4], // 成交价(标签), 挂牌价(高度相关)
  },
];

export function LeakageDetective({ onComplete }: InteractionProps) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const s = LEAK_SCENARIOS[scenarioIdx];
  const allDone = Object.keys(selections).filter((k) => k.startsWith(`${scenarioIdx}-`)).length >= s.features.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">场景 {scenarioIdx + 1}/4：{s.title}</span>
      </div>
      <div className="space-y-1.5">
        {s.features.map((f, i) => {
          const key = `${scenarioIdx}-${i}`;
          const sel = selections[key];
          const isLeak = s.leaks.includes(i);
          const isCorrect = sel === (isLeak ? '疑似泄露' : '可用');
          return (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
              <span className="text-xs flex-1 font-medium text-slate-700">{f}</span>
              <div className="flex gap-1">
                {['可用', '疑似泄露'].map((cat) => (
                  <button key={cat} onClick={() => setSelections((p) => ({ ...p, [key]: cat }))}
                    className={`px-2 py-0.5 rounded text-[9px] font-semibold transition-all ${
                      sel === cat
                        ? isCorrect ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
              {sel && (isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />)}
            </div>
          );
        })}
      </div>
      {allDone && (
        <button onClick={() => {
          if (scenarioIdx < 3) { setScenarioIdx((p) => p + 1); }
          else { onComplete?.(true); }
        }} className="w-full py-2 bg-primary-500 text-white rounded-lg text-xs font-semibold">
          {scenarioIdx < 3 ? '下一场景' : '完成'}
        </button>
      )}
      <p className="text-[10px] text-slate-400">提示：未来信息、答案字段、强相关结果字段可能泄露答案。</p>
    </div>
  );
}
