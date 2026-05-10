import { useState, useMemo, useCallback, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { Algorithm } from '../types';
import AIVisualizationInsight from './AIVisualizationInsight';

/* ── 配色 ── */
const C0 = '#3b82f6'; // 类别 0 蓝色
const C1 = '#10b981'; // 类别 1 绿色
const CT = '#ef4444'; // 测试点 红色

interface DPoint { x: number; y: number; label: number }

/* ── 生成两个分开的簇 ── */
function generateClusters(): DPoint[] {
  const pts: DPoint[] = [];
  // 类别 0 — 左下角 (x: 1~3, y: 1~3)
  for (let i = 0; i < 35; i++) {
    pts.push({ x: Math.random() * 2.5 + 1, y: Math.random() * 2.5 + 1, label: 0 });
  }
  // 类别 1 — 右上角 (x: 5~7, y: 5~7)
  for (let i = 0; i < 35; i++) {
    pts.push({ x: Math.random() * 2.5 + 5, y: Math.random() * 2.5 + 5, label: 1 });
  }
  return pts;
}

function euclidean(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/* ══════════════════════════════════════════════════════════ */
export default function KNNViz({ algorithm }: { algorithm?: Algorithm }) {
  const [k, setK] = useState(5);
  const [testPoint, setTestPoint] = useState({ x: 4.0, y: 4.0 });
  const chartRef = useRef<ReactECharts>(null);

  const points = useMemo(() => generateClusters(), []);

  /* ── KNN 计算 ── */
  const knn = useMemo(() => {
    const dists = points.map((p, i) => ({ i, dist: euclidean(testPoint, p), label: p.label }));
    dists.sort((a, b) => a.dist - b.dist);
    const topK = dists.slice(0, k);
    const votes: Record<number, number> = {};
    topK.forEach(n => { votes[n.label] = (votes[n.label] || 0) + 1; });
    let pred = 0, maxV = 0;
    for (const [lbl, cnt] of Object.entries(votes)) {
      if (cnt > maxV) { maxV = cnt; pred = Number(lbl); }
    }
    const kthDist = topK[k - 1]?.dist ?? 0;
    return { topK, votes, pred, kthDist };
  }, [points, testPoint, k]);

  const neighborSet = new Set(knn.topK.map(n => n.i));
  const neighborDetails = knn.topK.map(n => ({ ...n, point: points[n.i] }));

  /* ── 图表 option ── */
  const chartOption = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      title: {
        text: `KNN 分类 (K=${k})  →  预测类别: ${knn.pred}`,
        subtext: '点击图表任意位置移动测试点',
        left: 'center', top: 2,
        textStyle: { fontSize: 14, fontWeight: 700, color: '#1e293b' },
        subtextStyle: { fontSize: 11, color: '#94a3b8' },
      },
      legend: {
        data: [
          { name: '类别 0', icon: 'circle', itemStyle: { color: C0 } },
          { name: '类别 1', icon: 'circle', itemStyle: { color: C1 } },
          { name: '测试点', icon: 'diamond', itemStyle: { color: CT } },
          { name: '最近邻连线', icon: 'roundRect' },
        ],
        top: 30, right: 12,
        textStyle: { fontSize: 10, color: '#64748b' },
      },
      tooltip: {
        trigger: 'item' as const,
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: [8, 12],
        textStyle: { fontSize: 12, color: '#334155' },
        formatter: (ps: { seriesName?: string; data?: number[] }) => {
          if (!ps.data) return '';
          const [px, py] = ps.data as number[];
          if (ps.seriesName === '测试点') return `<b>🔍 测试点</b><br/>(${px.toFixed(2)}, ${py.toFixed(2)})<br/>当前预测: <b>类别 ${knn.pred}</b>`;
          const isN = neighborSet.has(points.findIndex(p => p.x === px && p.y === py));
          return `(${px.toFixed(2)}, ${py.toFixed(2)})${isN ? '<br/><b>← 最近邻</b>' : ''}`;
        },
      },
      grid: { left: 50, right: 24, top: 68, bottom: 50 },
      xAxis: {
        name: '特征 X₁', nameLocation: 'center', nameGap: 24,
        nameTextStyle: { fontSize: 11, color: '#94a3b8' },
        min: 0, max: 8, interval: 2,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisTick: { show: false },
        axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
      },
      yAxis: {
        name: '特征 X₂', nameLocation: 'center', nameGap: 34,
        nameTextStyle: { fontSize: 11, color: '#94a3b8' },
        min: 0, max: 8, interval: 2,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
      },
      series: [
        // 类别 0
        ...[0, 1].map(label => ({
          name: `类别 ${label}`,
          type: 'scatter' as const,
          data: points.filter(p => p.label === label).map(p => {
            const idx = points.indexOf(p);
            const isN = neighborSet.has(idx);
            return {
              value: [p.x, p.y],
              symbolSize: isN ? 18 : 9,
              itemStyle: {
                color: isN ? (label === 0 ? C0 : C1) : (label === 0 ? C0 + '88' : C1 + '88'),
                borderColor: isN ? '#fff' : 'transparent',
                borderWidth: isN ? 3 : 0,
                shadowBlur: isN ? 12 : 0,
                shadowColor: label === 0 ? C0 : C1,
              },
            };
          }),
          z: 3,
        })),
        // 到最近邻的连线
        ...neighborDetails.map((n, i) => ({
          name: i === 0 ? '最近邻连线' : '',
          type: 'line' as const,
          color: '#94a3b8',
          data: [[testPoint.x, testPoint.y], [n.point.x, n.point.y]],
          lineStyle: { color: '#94a3b8', width: 1.5, type: 'dashed' as const },
          showSymbol: false,
          symbol: 'none' as const,
          silent: true, z: 1,
        })),
        // 测试点
        {
          name: '测试点',
          type: 'scatter' as const,
          color: CT,
          data: [{
            value: [testPoint.x, testPoint.y],
            symbolSize: 22,
            symbol: 'diamond' as const,
            itemStyle: { color: CT, borderColor: '#fff', borderWidth: 3, shadowBlur: 16, shadowColor: CT },
          }],
          z: 10,
        },
        // 测试点坐标标签
        {
          type: 'scatter' as const,
          data: [[testPoint.x, testPoint.y]],
          symbolSize: 1, symbol: 'circle' as const,
          itemStyle: { opacity: 0 },
          silent: true, z: 11,
          label: {
            show: true,
            formatter: `测试点\n(${testPoint.x.toFixed(1)}, ${testPoint.y.toFixed(1)})`,
            position: 'top' as const, distance: 16,
            fontSize: 10, color: CT, fontWeight: 700,
          },
        },
      ],
    };
  }, [points, testPoint, k, knn, neighborSet, neighborDetails]);

  /* ── 事件处理：用 zrender 监听图表任意位置的点击 ── */
  const updateTestPoint = useCallback((x: number, y: number) => {
    setTestPoint({
      x: Math.max(0.15, Math.min(7.85, x)),
      y: Math.max(0.15, Math.min(7.85, y)),
    });
  }, []);

  // 点击图表任意位置移动测试点
  const handleChartReady = useCallback((instance: unknown) => {
    const chart = instance as { getZr?: () => { on: (event: string, handler: (e: { offsetX: number; offsetY: number; target?: unknown }) => void) => void; }; convertFromPixel?: (finder: object, point: [number, number]) => [number, number]; };
    if (!chart?.getZr || !chart?.convertFromPixel) return;
    chart.getZr().on('click', (e: { offsetX: number; offsetY: number; target?: unknown }) => {
      if (!chart.convertFromPixel) return;
      try {
        const pos = chart.convertFromPixel(
          { xAxisIndex: 0, yAxisIndex: 0 },
          [e.offsetX, e.offsetY]
        ) as [number, number];
        if (pos && isFinite(pos[0]) && isFinite(pos[1])) {
          updateTestPoint(pos[0], pos[1]);
        }
      } catch { /* 点在绘图区外，忽略 */ }
    });
  }, [updateTestPoint]);

  /* ════════════════ Render ════════════════ */
  return (
    <div className="space-y-5">
      {/* ── 控制栏 ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500">K 值（近邻数量）</label>
              <span className="text-sm font-bold text-primary-600">K = {k}</span>
            </div>
            <input type="range" min={1} max={15} step={2} value={k}
              onChange={e => setK(Number(e.target.value))} className="w-full accent-primary-500" />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              {[1,3,5,7,9,11,13,15].map(v => <span key={v}>{v}</span>)}
            </div>
          </div>
          <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg flex-shrink-0">
            🖱️ 点击图表移动测试点
          </div>
        </div>
      </div>

      {/* ── 图表 ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <ReactECharts ref={chartRef} option={chartOption}
          style={{ height: 400 }} notMerge={true}
          onChartReady={handleChartReady}
        />
      </div>

      {/* ── 投票结果卡片 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-blue-200 p-4 text-center shadow-sm">
          <div className="text-xs text-gray-400 mb-1">类别 0 票数</div>
          <div className="text-2xl font-bold text-blue-600">{knn.votes[0] || 0}</div>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 p-4 text-center shadow-sm">
          <div className="text-xs text-gray-400 mb-1">类别 1 票数</div>
          <div className="text-2xl font-bold text-emerald-600">{knn.votes[1] || 0}</div>
        </div>
        <div className={`rounded-2xl border-2 p-4 text-center shadow-sm ${
          knn.pred === 0 ? 'bg-blue-50 border-blue-400' : 'bg-emerald-50 border-emerald-400'
        }`}>
          <div className="text-xs text-gray-500 mb-1">最终预测</div>
          <div className={`text-2xl font-bold ${knn.pred === 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
            类别 {knn.pred}
          </div>
        </div>
      </div>

      {/* ── 最近邻详情 ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <h4 className="text-sm font-bold text-gray-800 mb-3">最近 {k} 个邻居详情</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-400">
                <th className="pb-2 font-medium">排名</th>
                <th className="pb-2 font-medium">坐标</th>
                <th className="pb-2 font-medium">类别</th>
                <th className="pb-2 font-medium">距离</th>
                <th className="pb-2 font-medium">投票</th>
              </tr>
            </thead>
            <tbody>
              {neighborDetails.map((n, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-1.5 font-mono text-gray-500">#{i + 1}</td>
                  <td className="py-1.5 font-mono">({n.point.x.toFixed(2)}, {n.point.y.toFixed(2)})</td>
                  <td className="py-1.5">
                    <span className={`inline-flex items-center gap-1 font-semibold ${n.label === 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                      <span className={`w-2 h-2 rounded-full inline-block ${n.label === 0 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                      类别 {n.label}
                    </span>
                  </td>
                  <td className="py-1.5 font-mono text-gray-600">{n.dist.toFixed(3)}</td>
                  <td className="py-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                      {n.label === knn.pred ? '✓ 胜出' : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-gray-400">
          💡 K = {k}（奇数避免平票），测试点 ({testPoint.x.toFixed(1)}, {testPoint.y.toFixed(1)})，
          K 个最近邻中类别0得{knn.votes[0] || 0}票、类别1得{knn.votes[1] || 0}票 → 预测为<b>类别 {knn.pred}</b>。
          灰色虚线从测试点连接到每个最近邻。
        </p>
      </div>

      <AIVisualizationInsight algorithm={algorithm} visualState={{
        k, testPointX: Number(testPoint.x.toFixed(2)), testPointY: Number(testPoint.y.toFixed(2)),
        prediction: knn.pred, votes0: knn.votes[0] || 0, votes1: knn.votes[1] || 0,
      }} />
    </div>
  );
}
