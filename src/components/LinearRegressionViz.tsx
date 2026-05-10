import { useState, useMemo, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import type { Algorithm } from '../types';
import AIVisualizationInsight from './AIVisualizationInsight';

const TRUE_W = 2.5;
const TRUE_B = 3;

/* ── 数据生成 ── */
function generateData(n: number, noise: number) {
  const data: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 10;
    const y = TRUE_W * x + TRUE_B + (Math.random() - 0.5) * noise * 2;
    data.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
  }
  return data;
}

/* ── 数据归一化 ── */
function normalizeX(data: [number, number][]): { normalized: [number, number][]; xMean: number; xStd: number } {
  const xs = data.map(d => d[0]);
  const xMean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const xStd = Math.sqrt(xs.reduce((s, x) => s + (x - xMean) ** 2, 0) / xs.length) || 1;
  return {
    normalized: data.map(([x, y]) => [(x - xMean) / xStd, y] as [number, number]),
    xMean, xStd,
  };
}

/* ── 稳定版梯度下降（x 归一化后训练，再还原 w, b） ── */
function stableGradientDescent(data: [number, number][], lr: number, iterations: number) {
  const { normalized, xMean, xStd } = normalizeX(data);
  let w_norm = 0;
  let b_norm = 0;
  const n = normalized.length;
  const lossHistory: number[] = [];
  let diverged = false;
  let divergedAt = -1;

  for (let iter = 0; iter < iterations; iter++) {
    let totalLoss = 0;
    let dw = 0;
    let db = 0;

    for (const [x, y] of normalized) {
      const pred = w_norm * x + b_norm;
      const error = pred - y;
      totalLoss += error * error;
      dw += 2 * x * error;
      db += 2 * error;
    }

    const mse = totalLoss / n;

    if (!isFinite(mse) || mse > 1e10) {
      diverged = true;
      divergedAt = iter;
      break;
    }

    lossHistory.push(mse);
    w_norm -= (lr * dw) / n;
    b_norm -= (lr * db) / n;
  }

  // 反归一化：x_norm = (x - xMean)/xStd
  // y = w_norm * x_norm + b_norm = w_norm*(x - xMean)/xStd + b_norm
  //   = (w_norm/xStd) * x + (b_norm - w_norm*xMean/xStd)
  const w = w_norm / xStd;
  const b = b_norm - w * xMean;

  return { w, b, lossHistory, diverged, divergedAt };
}

/* ══════════════════════════════════════════════════════════ */
export default function LinearRegressionViz({ algorithm }: { algorithm?: Algorithm }) {
  const [sampleCount, setSampleCount] = useState(60);
  const [learningRate, setLearningRate] = useState(0.01);
  const [iterations, setIterations] = useState(200);
  const [noise, setNoise] = useState(3);
  const [showResiduals, setShowResiduals] = useState(true);

  const data = useMemo(() => generateData(sampleCount, noise), [sampleCount, noise]);

  // 使用稳定版梯度下降（数据归一化），避免 lr 稍大就发散
  const { w, b, lossHistory, diverged, divergedAt } = useMemo(
    () => stableGradientDescent(data, learningRate, iterations),
    [data, learningRate, iterations]
  );

  const mse = lossHistory.length > 0 ? lossHistory[lossHistory.length - 1] : 0;

  // R²
  const r2 = useMemo(() => {
    const yMean = data.reduce((s, [, y]) => s + y, 0) / data.length;
    const ssRes = data.reduce((s, [x, y]) => s + (y - (w * x + b)) ** 2, 0);
    const ssTot = data.reduce((s, [, y]) => s + (y - yMean) ** 2, 0);
    return ssTot > 0 ? 1 - ssRes / ssTot : 0;
  }, [data, w, b]);

  // 拟合直线
  const fittedLine: [number, number][] = [[0, w * 0 + b], [10, w * 10 + b]];

  // 3 条代表性残差
  const residuals = useMemo(() => {
    const step = Math.max(1, Math.floor(data.length / 4));
    return [step, step * 2, step * 3].map(i => {
      const idx = Math.min(i, data.length - 1);
      const [x, y] = data[idx];
      const yPred = w * x + b;
      return { x, dataY: y, fitY: yPred, residual: y - yPred };
    });
  }, [data, w, b]);

  /* ════════════════ 左侧散点图 ════════════════ */
  const scatterOption = useMemo(() => ({
    backgroundColor: 'transparent',
    title: {
      text: `拟合结果  y = ${Number(w||0).toFixed(3)}x + ${Number(b||0).toFixed(3)}`,
      subtext: `R² = ${Number(r2||0).toFixed(3)}  ·  MSE = ${Number(mse||0).toFixed(3)}`,
      left: 'center', top: 2,
      textStyle: { fontSize: 14, fontWeight: 700, color: '#1e293b' },
      subtextStyle: { fontSize: 11, color: '#94a3b8' },
    },
    legend: {
      data: ['真实样本', '拟合直线', '残差'],
      bottom: 4,
      itemWidth: 20, itemHeight: 3,
      textStyle: { fontSize: 11, color: '#64748b' },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e2e8f0',
      borderRadius: 10,
      padding: [10, 14],
      textStyle: { fontSize: 12, color: '#334155' },
      formatter: (params: { seriesName?: string; data?: number[] | number }) => {
        if (!params.data || !Array.isArray(params.data) || params.seriesName === '拟合直线') return '';
        const px = (params.data as number[])[0];
        const py = (params.data as number[])[1];
        const yPred = w * px + b;
        const resid = py - yPred;
        return `<b>数据点</b><br/>x = ${Number(px||0).toFixed(2)}<br/>y = ${Number(py||0).toFixed(2)}<br/>预测值 = ${Number(yPred||0).toFixed(3)}<br/>残差 = ${resid>0?'+':''}${Number(resid||0).toFixed(3)}`;
      },
    },
    grid: { left: 52, right: 28, top: 56, bottom: 46 },
    xAxis: {
      name: '特征 X', nameLocation: 'center', nameGap: 26,
      nameTextStyle: { fontSize: 11, color: '#94a3b8' },
      min: -0.3, max: 10.3,
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
    },
    yAxis: {
      name: '目标 Y', nameLocation: 'center', nameGap: 38,
      nameTextStyle: { fontSize: 11, color: '#94a3b8' },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
    },
    series: [
      // 残差线
      ...(showResiduals ? residuals.map((r, i) => ({
        name: i === 0 ? '残差' : '',
        type: 'line' as const,
        data: [[r.x, r.dataY], [r.x, r.fitY]],
        lineStyle: { color: '#f97316', width: 2, type: 'dashed' as const },
        symbol: 'none' as const,
        silent: true, z: 0,
      })) : []),
      // 残差标签
      ...(showResiduals ? residuals.map((r) => ({
        type: 'scatter' as const,
        data: [[r.x, (r.dataY + r.fitY) / 2]],
        symbolSize: 1, symbol: 'circle' as const,
        itemStyle: { opacity: 0 },
        silent: true, z: 5,
        label: {
          show: true,
          formatter: `残差${r.residual>0?'+':''}${Number(r.residual||0).toFixed(2)}`,
          position: r.residual > 0 ? 'right' as const : 'left' as const,
          distance: 6,
          fontSize: 10, color: '#ea580c', fontWeight: 700,
          backgroundColor: 'rgba(255,255,255,0.85)',
          padding: [1, 4], borderRadius: 4,
        },
      })) : []),
      // 拟合直线
      {
        name: '拟合直线', type: 'line' as const,
        data: fittedLine,
        lineStyle: { color: '#ef4444', width: 2.5 },
        symbol: 'none' as const, z: 2,
      },
      // 数据点
      {
        name: '真实样本', type: 'scatter' as const,
        data: data,
        symbolSize: 7,
        itemStyle: { color: '#3b82f6', borderColor: '#fff', borderWidth: 1.5, opacity: 0.85 },
        z: 4,
      },
    ],
  }), [w, b, data, fittedLine, mse, r2, residuals, showResiduals]);

  /* ════════════════ 右侧 Loss 曲线 ════════════════ */
  const lossOption = useMemo(() => {
    const lossData = lossHistory.map((v, i) => [i + 1, v]);
    const isSlow = !diverged && lossHistory.length >= iterations && mse > 1 && lossHistory.length >= 20 &&
      lossHistory[lossHistory.length - 1] > lossHistory[0] * 0.5;

    return {
      backgroundColor: 'transparent',
      title: {
        text: diverged ? '⚠ Loss 发散' : `Loss 曲线  (MSE = ${Number(mse||0).toFixed(3)})`,
        subtext: diverged
          ? `第 ${divergedAt} 步发散，请降低学习率`
          : isSlow
            ? '收敛较慢，可增大学习率或迭代次数'
            : '',
        left: 'center', top: 2,
        textStyle: { fontSize: 14, fontWeight: 700, color: diverged ? '#dc2626' : '#1e293b' },
        subtextStyle: { fontSize: 11, color: diverged ? '#dc2626' : '#d97706' },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: [8, 12],
        textStyle: { fontSize: 12, color: '#334155' },
        formatter: (params: Array<{ data: number[] }>) => {
          const p = params[0]?.data;
          if (!p) return '';
          return `迭代 <b>${p[0]}</b><br/>MSE = <b>${Number(p[1]||0).toFixed(4)}</b>`;
        },
      },
      grid: { left: 56, right: 28, top: 56, bottom: 46 },
      xAxis: {
        name: '迭代次数', nameLocation: 'center', nameGap: 24,
        nameTextStyle: { fontSize: 11, color: '#94a3b8' },
        min: 0, max: iterations,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisTick: { show: false },
        axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { show: false },
      },
      yAxis: {
        name: 'MSE Loss', nameLocation: 'center', nameGap: 40,
        nameTextStyle: { fontSize: 11, color: '#94a3b8' },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
      },
      series: [
        {
          name: 'Loss',
          type: 'line' as const,
          data: lossData,
          smooth: 0.15,
          lineStyle: { color: diverged ? '#dc2626' : '#ef4444', width: 2 },
          symbol: 'none' as const,
          areaStyle: diverged ? undefined : {
            color: {
              type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(239,68,68,0.18)' },
                { offset: 1, color: 'rgba(239,68,68,0.0)' },
              ],
            },
          },
        },
        // 终点标注
        ...(lossData.length > 0 && !diverged ? [{
          type: 'scatter' as const,
          data: [lossData[lossData.length - 1]],
          symbolSize: 12,
          symbol: 'circle' as const,
          itemStyle: { color: '#ef4444', borderColor: '#fff', borderWidth: 2 },
          label: {
            show: true,
            formatter: `MSE=${Number(mse||0).toFixed(3)}`,
            position: 'top' as const,
            distance: 8,
            fontSize: 11, color: '#dc2626', fontWeight: 700,
          },
          z: 3,
        }] : []),
      ],
    };
  }, [lossHistory, iterations, mse, diverged, divergedAt]);

  /* ── 预设 ── */
  const applyPreset = useCallback((type: string) => {
    switch (type) {
      case 'good': setSampleCount(60); setLearningRate(0.01); setIterations(200); setNoise(3); break;
      case 'slow': setSampleCount(60); setLearningRate(0.002); setIterations(200); setNoise(3); break;
      case 'noisy': setSampleCount(80); setLearningRate(0.01); setIterations(300); setNoise(8); break;
      case 'few': setSampleCount(20); setLearningRate(0.01); setIterations(200); setNoise(2); break;
    }
  }, []);

  /* ════════════════ Render ════════════════ */
  return (
    <div className="space-y-5">
      {/* ── 参数调节 ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-gray-800">参数调节</h4>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400">预设：</span>
            {[{ k:'good', n:'标准' },{ k:'slow', n:'慢速收敛' },{ k:'noisy', n:'高噪声' },{ k:'few', n:'小样本' }].map(p => (
              <button key={p.k} onClick={() => applyPreset(p.k)}
                className="px-2 py-0.5 text-[11px] font-medium rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                {p.n}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '样本数量', value: sampleCount, min: 10, max: 200, step: 10, set: setSampleCount, fmt: (v: unknown) => String(Number(v)) },
            { label: '学习率', value: learningRate, min: 0.0005, max: 0.03, step: 0.0005, set: setLearningRate, fmt: (v: unknown) => Number(v).toFixed(4) },
            { label: '迭代次数', value: iterations, min: 20, max: 500, step: 10, set: setIterations, fmt: (v: unknown) => String(Number(v)) },
            { label: '噪声大小', value: noise, min: 0.5, max: 10, step: 0.5, set: setNoise, fmt: (v: unknown) => Number(v).toFixed(1) },
          ].map(c => (
            <div key={c.label}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">{c.label}</label>
                <span className="text-xs font-mono text-gray-700">{c.fmt(c.value)}</span>
              </div>
              <input type="range" min={c.min} max={c.max} step={c.step} value={c.value}
                onChange={(e) => c.set(Number(e.target.value))} className="w-full accent-primary-500" />
            </div>
          ))}
        </div>
        {/* 发散 / 慢速提示 */}
        {diverged && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700 font-medium flex items-center gap-2">
            ⚠ 学习率过大（{Number(learningRate||0).toFixed(4)}），第 {divergedAt} 步 Loss 发散。请将学习率降至 0.01 以下。
          </div>
        )}
        {!diverged && mse > 3 && learningRate < 0.003 && (
          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-700 font-medium">
            💡 学习率较小（{Number(learningRate||0).toFixed(4)}），模型收敛较慢，可尝试增大学习率或迭代次数。
          </div>
        )}
      </div>

      {/* ── 图表 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* 散点 + 拟合 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[11px] text-gray-400">散点到拟合直线</span>
            <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer select-none">
              <input type="checkbox" checked={showResiduals} onChange={(e) => setShowResiduals(e.target.checked)} className="w-3 h-3 rounded" />
              显示残差
            </label>
          </div>
          <ReactECharts option={scatterOption} notMerge={true} style={{ height: 320 }} />
          <p className="mt-2 text-[11px] text-gray-400 text-center leading-relaxed border-t border-gray-100 pt-2">
            蓝色点为真实样本，红色线为拟合直线，橙色虚线展示 3 条代表性残差
          </p>
        </div>
        {/* Loss 曲线 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="px-1 mb-1">
            <span className="text-[11px] text-gray-400">梯度下降训练过程</span>
          </div>
          <ReactECharts option={lossOption} notMerge={true} style={{ height: 320 }} />
          <p className="mt-2 text-[11px] text-gray-400 text-center leading-relaxed border-t border-gray-100 pt-2">
            梯度下降沿负梯度方向更新 w 和 b，Loss 随迭代逐步下降
            {diverged ? '——当前学习率导致发散，请降低学习率' : ''}
          </p>
        </div>
      </div>

      {/* ── 指标卡 ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '权重 w', value: Number(w||0).toFixed(3), target: '2.500', color: Math.abs(w - 2.5) < 0.3 ? 'text-emerald-600' : 'text-amber-600' },
          { label: '偏置 b', value: Number(b||0).toFixed(3), target: '3.000', color: Math.abs(b - 3) < 0.5 ? 'text-emerald-600' : 'text-amber-600' },
          { label: 'R²', value: Number(r2||0).toFixed(3), color: r2 > 0.8 ? 'text-emerald-600' : r2 > 0.5 ? 'text-amber-600' : 'text-red-500' },
          { label: 'MSE', value: Number(mse||0).toFixed(3), color: mse < 1 ? 'text-emerald-600' : mse < 5 ? 'text-amber-600' : 'text-red-500' },
          { label: '迭代次数', value: String(iterations) + (diverged ? '⚠' : ''), color: 'text-purple-600' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm">
            <div className="text-[11px] text-gray-400 mb-0.5">
              {m.label}{m.target ? `（目标 ${m.target}）` : ''}
            </div>
            <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      <AIVisualizationInsight algorithm={algorithm} visualState={{
        sampleCount, learningRate, iterations, noise,
        w: Number(Number(w||0).toFixed(3)), b: Number(Number(b||0).toFixed(3)),
        r2: Number(Number(r2||0).toFixed(3)), mse: Number(Number(mse||0).toFixed(3)),
        diverged,
      }} />
    </div>
  );
}
