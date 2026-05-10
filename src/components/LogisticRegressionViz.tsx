import { useState, useMemo, useCallback, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { Algorithm } from '../types';
import AIVisualizationInsight from './AIVisualizationInsight';

const C0 = '#6366f1'; // 类别 0 蓝紫
const C1 = '#f59e0b'; // 类别 1 橙色
const CB = '#ef4444'; // 边界 红色

interface DPoint { x: number; y: number; label: number }

/* ── 生成可线性分离的二分类数据 ── */
function generateData(n: number): DPoint[] {
  const pts: DPoint[] = [];
  // 类别 0 — 左下
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 3.5 + 1;
    const y = Math.random() * 3.5 + 1;
    pts.push({ x, y, label: 0 });
  }
  // 类别 1 — 右上
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 3.5 + 5.5;
    const y = Math.random() * 3.5 + 5.5;
    pts.push({ x, y, label: 1 });
  }
  return pts;
}

function sigmoid(z: number) { return 1 / (1 + Math.exp(-z)); }

/* ── 逻辑回归梯度下降 ── */
function logisticGD(data: DPoint[], lr: number, iterations: number) {
  let w1 = 0, w2 = 0, b = 0;
  const n = data.length;
  const lossHist: number[] = [];
  for (let iter = 0; iter < iterations; iter++) {
    let dw1 = 0, dw2 = 0, db = 0, totalLoss = 0;
    for (const p of data) {
      const z = w1 * p.x + w2 * p.y + b;
      const pred = sigmoid(z);
      const error = pred - p.label;
      totalLoss += -(p.label * Math.log(pred + 1e-9) + (1-p.label) * Math.log(1-pred + 1e-9));
      dw1 += error * p.x;
      dw2 += error * p.y;
      db += error;
    }
    w1 -= (lr * dw1) / n;
    w2 -= (lr * dw2) / n;
    b -= (lr * db) / n;
    lossHist.push(totalLoss / n);
  }
  return { w1, w2, b, lossHist };
}

/* ══════════════════════════════════════════════════════════ */
export default function LogisticRegressionViz({ algorithm }: { algorithm?: Algorithm }) {
  const [sampleCount, setSampleCount] = useState(35);
  const [threshold, setThreshold] = useState(0.5);
  const [learningRate, setLearningRate] = useState(0.05);
  const [iterations, setIterations] = useState(300);
  const [testPoint, setTestPoint] = useState({ x: 4.5, y: 4.5 });
  const chartRef = useRef<ReactECharts>(null);

  const data = useMemo(() => generateData(sampleCount), [sampleCount]);
  const { w1, w2, b, lossHist } = useMemo(() => logisticGD(data, learningRate, iterations), [data, learningRate, iterations]);
  const finalLoss = lossHist[lossHist.length - 1];

  /* ── 关键计算 ── */
  const zt = Math.log(threshold / (1 - threshold)); // 阈值对应的 log-odds
  const testZ = w1 * testPoint.x + w2 * testPoint.y + b;
  const testP = sigmoid(testZ);
  const testPred = testP >= threshold ? 1 : 0;
  const testLabel = testP >= threshold ? '类别 1' : '类别 0';

  // 决策边界: w1*x + w2*y + b = zt → y = (zt - w1*x - b) / w2
  const boundaryLine = useMemo((): [number, number][] => {
    if (Math.abs(w2) < 1e-6) return [[0, 0], [10, 0]];
    const xMin = -0.5, xMax = 10.5;
    return [[xMin, (zt - w1 * xMin - b) / w2], [xMax, (zt - w1 * xMax - b) / w2]];
  }, [w1, w2, b, zt]);

  /* ════════════════ 左侧散点图 ════════════════ */
  const scatterOption = useMemo(() => ({
    backgroundColor: 'transparent',
    title: { text: `二维决策边界  (阈值 t=${threshold.toFixed(2)}, zₜ=${zt.toFixed(3)})`, subtext: '点击图表移动测试点', left: 'center', top: 2,
      textStyle: { fontSize: 13, fontWeight: 700, color: '#1e293b' }, subtextStyle: { fontSize: 10, color: '#94a3b8' } },
    legend: { data: ['类别 0', '类别 1', '决策边界', '测试点'], top: 30, right: 12, textStyle: { fontSize: 10, color: '#64748b' } },
    tooltip: { trigger: 'item' as const, backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#e2e8f0', borderRadius: 10, padding: [8,12],
      textStyle: { fontSize: 11, color: '#334155' },
      formatter: (ps: { seriesName?: string; data?: number[] }) => {
        if (!ps?.data || !Array.isArray(ps.data)) return '';
        const [px, py] = ps.data as number[];
        if (ps.seriesName === '测试点') return `<b>测试点</b><br/>x₁=${px.toFixed(2)}, x₂=${py.toFixed(2)}<br/>z=${testZ.toFixed(3)}<br/>p=${testP.toFixed(4)}<br/>预测: <b>${testLabel}</b>`;
        return `(${px.toFixed(2)}, ${py.toFixed(2)}) — ${ps.seriesName || ''}`;
      },
    },
    grid: { left: 50, right: 24, top: 68, bottom: 50 },
    xAxis: { name: '特征 X₁', nameLocation: 'center', nameGap: 24, min: 0, max: 10, interval: 2, nameTextStyle: { fontSize: 11, color: '#94a3b8' },
      axisLine: { lineStyle: { color: '#cbd5e1' } }, axisTick: { show: false }, axisLabel: { fontSize: 10, color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } } },
    yAxis: { name: '特征 X₂', nameLocation: 'center', nameGap: 34, min: 0, max: 10, interval: 2, nameTextStyle: { fontSize: 11, color: '#94a3b8' },
      axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 10, color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } } },
    series: [
      // 分类区域半透明背景
      { type: 'scatter' as const, data: [[0,0]], symbolSize: 0, silent: true, z: 0,
        markArea: { silent: true, data: [[
          { xAxis: 0, yAxis: 0, itemStyle: { color: 'rgba(99,102,241,0.04)' } },
          { xAxis: 10, yAxis: 0, itemStyle: { color: 'rgba(99,102,241,0.04)' } },
        ],[
          { xAxis: 0, yAxis: 0, itemStyle: { color: 'rgba(245,158,11,0.04)' } },
          { xAxis: 10, yAxis: 10, itemStyle: { color: 'rgba(245,158,11,0.04)' } },
        ]] },
      },
      { name: '类别 0', type: 'scatter' as const, color: C0, z: 2,
        data: data.filter(p=>p.label===0).map(p=>({value:[p.x,p.y],symbolSize:8,itemStyle:{color:C0,borderColor:'#fff',borderWidth:1,opacity:0.8}})) },
      { name: '类别 1', type: 'scatter' as const, color: C1, z: 2,
        data: data.filter(p=>p.label===1).map(p=>({value:[p.x,p.y],symbolSize:8,itemStyle:{color:C1,borderColor:'#fff',borderWidth:1,opacity:0.8}})) },
      { name: '决策边界', type: 'line' as const, color: CB, data: boundaryLine, lineStyle: { color: CB, width: 2.5, type: 'dashed' as const }, showSymbol: false, symbol: 'none' as const, z: 10 },
      { name: '测试点', type: 'scatter' as const, data: [{ value: [testPoint.x, testPoint.y], symbolSize: 18, symbol: 'diamond' as const,
          itemStyle: { color: testPred===0?C0:C1, borderColor: '#1e293b', borderWidth: 2.5, shadowBlur: 12, shadowColor: '#00000040' } }], z: 20 },
    ],
  }), [data, w1, w2, b, zt, threshold, boundaryLine, testPoint, testZ, testP, testPred, testLabel]);

  /* ════════════════ 右侧 Sigmoid 图 ════════════════ */
  const sigmoidOption = useMemo(() => {
    const curve: [number, number][] = [];
    for (let z = -6; z <= 6; z += 0.05) curve.push([Math.round(z*100)/100, sigmoid(z)]);
    return {
      backgroundColor: 'transparent',
      title: { text: 'Sigmoid 概率映射', subtext: `测试点 z=${testZ.toFixed(3)}, p=${testP.toFixed(4)}`, left: 'center', top: 2,
        textStyle: { fontSize: 13, fontWeight: 700, color: '#1e293b' }, subtextStyle: { fontSize: 10, color: testPred===0?C0:C1 } },
      legend: { data: ['Sigmoid', `阈值 t=${threshold.toFixed(2)}`, '测试点'], top: 30, right: 12, textStyle: { fontSize: 10, color: '#64748b' } },
      tooltip: { trigger: 'axis' as const, backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#e2e8f0', borderRadius: 10, padding: [8,12], textStyle: { fontSize: 11, color: '#334155' },
        formatter: (ps: Array<{ data: number[] }>) => { const d=ps[0]?.data; return d ? `z=<b>${(d[0]as number).toFixed(3)}</b><br/>σ(z)=<b>${(d[1]as number).toFixed(4)}</b>` : ''; } },
      grid: { left: 50, right: 24, top: 68, bottom: 50 },
      xAxis: { name: 'z（线性得分）', nameLocation: 'center', nameGap: 24, min: -6, max: 6, nameTextStyle: { fontSize: 11, color: '#94a3b8' },
        axisLine: { lineStyle: { color: '#cbd5e1' } }, axisTick: { show: false }, axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } } },
      yAxis: { name: 'σ(z)', nameLocation: 'center', nameGap: 34, min: 0, max: 1, interval: 0.25, nameTextStyle: { fontSize: 11, color: '#94a3b8' },
        axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } } },
      series: [
        { name: 'Sigmoid', type: 'line' as const, color: '#8b5cf6', data: curve, lineStyle: { color: '#8b5cf6', width: 2.5 }, showSymbol: false, symbol: 'none' as const, z: 1,
          areaStyle: { color: { type: 'linear' as const, x:0,y:0,x2:0,y2:1, colorStops: [{offset:0,color:'rgba(139,92,246,0.12)'},{offset:1,color:'rgba(139,92,246,0.01)'}] } } },
        // 阈值线
        { name: `阈值 t=${threshold.toFixed(2)}`, type: 'line' as const, data: [[-6,threshold],[6,threshold]],
          lineStyle: { color: '#ef4444', width: 2, type: 'dashed' as const }, showSymbol: false, symbol: 'none' as const, z: 5,
          markLine: { silent: true, symbol: 'none' as const,
            data: [{ xAxis: zt, label: { formatter: `zₜ=${zt.toFixed(3)}`, fontSize: 10, color: '#dc2626', fontWeight: 700 } }],
            lineStyle: { color: '#f87171', width: 1.5, type: 'dashed' as const } } },
        // 测试点
        { name: '测试点', type: 'scatter' as const, data: [{ value: [testZ, testP], symbolSize: 14, symbol: 'diamond' as const,
            itemStyle: { color: testPred===0?C0:C1, borderColor: '#1e293b', borderWidth: 2.5, shadowBlur: 8, shadowColor: '#00000040' } }], z: 20 },
        // z_t 竖线交点
        { type: 'scatter' as const, data: [[zt, threshold]], symbolSize: 8, symbol: 'circle' as const,
          itemStyle: { color: '#ef4444', borderColor: '#fff', borderWidth: 2 }, z: 15, silent: true,
          label: { show: true, formatter: '阈值点', position: 'top', distance: 6, fontSize: 10, color: '#dc2626', fontWeight: 700 } },
      ],
    };
  }, [threshold, zt, testZ, testP, testPred]);

  /* ── 测试点拖拽（zrender click） ── */
  const handleChartReady = useCallback((instance: unknown) => {
    const chart = instance as { getZr?: () => { on: (e: string, h: (ev: { offsetX: number; offsetY: number }) => void) => void }; convertFromPixel?: (f: object, p: [number, number]) => [number, number] };
    if (!chart?.getZr || !chart?.convertFromPixel) return;
    chart.getZr().on('click', (e: { offsetX: number; offsetY: number }) => {
      try {
        const pos = chart.convertFromPixel!({ xAxisIndex: 0, yAxisIndex: 0 }, [e.offsetX, e.offsetY]) as [number, number];
        if (pos && isFinite(pos[0]) && isFinite(pos[1])) {
          setTestPoint({ x: Math.max(0.1, Math.min(9.9, pos[0])), y: Math.max(0.1, Math.min(9.9, pos[1])) });
        }
      } catch { /* ignore */ }
    });
  }, []);

  /* ── 控件 ── */
  const resetTestPoint = () => setTestPoint({ x: 5, y: 5 });
  const resetData = () => { setSampleCount(35); setThreshold(0.5); setLearningRate(0.05); setIterations(300); resetTestPoint(); };

  return (
    <div className="space-y-5">
      {/* 参数调节 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-gray-800">参数调节</h4>
          <div className="flex gap-2">
            <button onClick={resetTestPoint} className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">重置测试点</button>
            <button onClick={resetData} className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">重置全部</button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="flex justify-between mb-1"><label className="text-xs text-gray-500">样本数</label><span className="text-xs font-mono">{sampleCount * 2}</span></div>
            <input type="range" min={10} max={50} value={sampleCount} onChange={e => setSampleCount(Number(e.target.value))} className="w-full accent-primary-500" />
          </div>
          <div>
            <div className="flex justify-between mb-1"><label className="text-xs text-gray-500">分类阈值 t</label><span className="text-xs font-mono font-bold text-primary-600">{threshold.toFixed(2)}</span></div>
            <input type="range" min={0.10} max={0.90} step={0.05} value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-full accent-red-500" />
          </div>
          <div>
            <div className="flex justify-between mb-1"><label className="text-xs text-gray-500">学习率</label><span className="text-xs font-mono">{learningRate.toFixed(2)}</span></div>
            <input type="range" min={0.01} max={0.3} step={0.01} value={learningRate} onChange={e => setLearningRate(Number(e.target.value))} className="w-full accent-primary-500" />
          </div>
          <div>
            <div className="flex justify-between mb-1"><label className="text-xs text-gray-500">迭代次数</label><span className="text-xs font-mono">{iterations}</span></div>
            <input type="range" min={50} max={500} step={25} value={iterations} onChange={e => setIterations(Number(e.target.value))} className="w-full accent-primary-500" />
          </div>
        </div>
        <div className="mt-3 text-[11px] text-gray-400">
          训练 Loss: {finalLoss.toFixed(4)} &nbsp;|&nbsp; zₜ = log(t/(1-t)) = {zt.toFixed(3)} &nbsp;|&nbsp; 决策边界: {w1.toFixed(3)}x₁ + {w2.toFixed(3)}x₂ + {b.toFixed(3)} = {zt.toFixed(3)}
        </div>
      </div>

      {/* 双图 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <ReactECharts ref={chartRef} option={scatterOption} notMerge={true} style={{ height: 380 }} onChartReady={handleChartReady} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <ReactECharts option={sigmoidOption} notMerge={true} style={{ height: 380 }} />
        </div>
      </div>

      {/* 结果卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '当前阈值 t', value: threshold.toFixed(2), sub: `zₜ = ${zt.toFixed(3)}`, color: 'text-gray-700' },
          { label: '测试点坐标', value: `(${testPoint.x.toFixed(2)}, ${testPoint.y.toFixed(2)})`, sub: '', color: 'text-gray-700' },
          { label: '线性得分 z', value: testZ.toFixed(3), sub: `p = σ(z) = ${testP.toFixed(4)}`, color: 'text-violet-600' },
          { label: '预测类别', value: testLabel, sub: testP >= threshold ? 'p ≥ t → 正类' : 'p < t → 负类', color: testPred === 0 ? 'text-indigo-600' : 'text-amber-600' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm">
            <div className="text-[11px] text-gray-400 mb-0.5">{m.label}</div>
            <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
            {m.sub && <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{m.sub}</div>}
          </div>
        ))}
      </div>

      {/* AI 解读 */}
      <div className="bg-violet-50 rounded-2xl border border-violet-200 p-4">
        <p className="text-xs text-violet-700 leading-relaxed">
          当前测试点的线性得分为 <strong>z = {testZ.toFixed(3)}</strong>，经过 Sigmoid 后得到概率 <strong>p = {testP.toFixed(4)}</strong>。
          由于当前阈值 <strong>t = {threshold.toFixed(2)}</strong>（对应 zₜ = {zt.toFixed(3)}），
          {testP >= threshold
            ? <>p = {testP.toFixed(4)} ≥ t = {threshold.toFixed(2)}，所以预测为 <strong>类别 1（正类）</strong>。</>
            : <>p = {testP.toFixed(4)} &lt; t = {threshold.toFixed(2)}，所以预测为 <strong>类别 0（负类）</strong>。</>
          }
          调整阈值 t 或移动测试点，观察 z、p 和预测类别的变化。
        </p>
      </div>

      <AIVisualizationInsight algorithm={algorithm} visualState={{
        threshold: Number(threshold.toFixed(2)), zt: Number(zt.toFixed(3)),
        testX: Number(testPoint.x.toFixed(2)), testY: Number(testPoint.y.toFixed(2)),
        testZ: Number(testZ.toFixed(3)), testP: Number(testP.toFixed(4)), testPred,
        w1: Number(w1.toFixed(4)), w2: Number(w2.toFixed(4)), b: Number(b.toFixed(4)),
        finalLoss: Number(finalLoss.toFixed(4)),
      }} />
    </div>
  );
}
