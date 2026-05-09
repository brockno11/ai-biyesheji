import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { SlidersHorizontal } from 'lucide-react';
import type { Algorithm } from '../types';
import AIVisualizationInsight from './AIVisualizationInsight';

type Point = [number, number];

const palette = ['#2563eb', '#16a34a', '#f97316', '#7c3aed', '#dc2626'];

function seededNoise(seed: number) {
  const value = Math.sin(seed * 9283.17) * 10000;
  return value - Math.floor(value);
}

function generateClusterData(spread: number): Point[] {
  const centers: Point[] = [[2, 2], [6.5, 3], [4.5, 7.2], [8, 7], [1.5, 6]];
  const data: Point[] = [];

  centers.forEach(([cx, cy], clusterIndex) => {
    for (let i = 0; i < 32; i += 1) {
      const angle = seededNoise(clusterIndex * 100 + i) * Math.PI * 2;
      const radius = (0.25 + seededNoise(clusterIndex * 200 + i) * spread) * 0.95;
      data.push([
        Number((cx + Math.cos(angle) * radius).toFixed(2)),
        Number((cy + Math.sin(angle) * radius).toFixed(2)),
      ]);
    }
  });

  return data;
}

function distance(a: Point, b: Point) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function runKMeans(points: Point[], k: number, iterations: number) {
  let centers = points.slice(0, k).map((point) => [...point] as Point);
  let labels = new Array(points.length).fill(0);
  const history: Point[][] = [centers.map((point) => [...point] as Point)];

  for (let iter = 0; iter < iterations; iter += 1) {
    labels = points.map((point) => {
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      centers.forEach((center, index) => {
        const currentDistance = distance(point, center);
        if (currentDistance < bestDistance) {
          bestDistance = currentDistance;
          bestIndex = index;
        }
      });
      return bestIndex;
    });

    centers = centers.map((center, index) => {
      const assigned = points.filter((_, pointIndex) => labels[pointIndex] === index);
      if (assigned.length === 0) return center;
      const sum = assigned.reduce<Point>(
        (acc, point) => [acc[0] + point[0], acc[1] + point[1]],
        [0, 0]
      );
      return [Number((sum[0] / assigned.length).toFixed(2)), Number((sum[1] / assigned.length).toFixed(2))];
    });

    history.push(centers.map((point) => [...point] as Point));
  }

  const inertia = points.reduce((sum, point, index) => {
    const center = centers[labels[index]];
    return sum + distance(point, center) ** 2;
  }, 0);

  const clusterSizes = centers.map((_, index) =>
    labels.filter((label) => label === index).length
  );

  return { centers, labels, inertia, clusterSizes, history };
}

export default function KMeansViz({ algorithm }: { algorithm?: Algorithm }) {
  const [k, setK] = useState(3);
  const [iterations, setIterations] = useState(6);
  const [spread, setSpread] = useState(0.8);

  const points = useMemo(() => generateClusterData(spread), [spread]);
  const result = useMemo(() => runKMeans(points, k, iterations), [points, k, iterations]);

  const series = Array.from({ length: k }, (_, clusterIndex) => ({
    name: `簇 ${clusterIndex + 1}`,
    type: 'scatter',
    data: points.filter((_, index) => result.labels[index] === clusterIndex),
    symbolSize: 9,
    itemStyle: {
      color: palette[clusterIndex],
      borderColor: '#fff',
      borderWidth: 1,
      opacity: 0.82,
    },
  }));

  series.push({
    name: '聚类中心',
    type: 'scatter',
    data: result.centers,
    symbolSize: 20,
    itemStyle: {
      color: '#111827',
      borderColor: '#facc15',
      borderWidth: 3,
      opacity: 1,
    },
  } as (typeof series)[number]);

  const option = {
    color: palette,
    tooltip: {
      trigger: 'item',
      formatter: (params: { seriesName: string; data: Point }) =>
        `${params.seriesName}<br/>x=${params.data[0]}, y=${params.data[1]}`,
    },
    legend: { top: 0, textStyle: { color: '#475569' } },
    grid: { left: 44, right: 24, top: 44, bottom: 36 },
    xAxis: { min: 0, max: 10, name: '特征 X', splitLine: { lineStyle: { color: '#e2e8f0' } } },
    yAxis: { min: 0, max: 10, name: '特征 Y', splitLine: { lineStyle: { color: '#e2e8f0' } } },
    series,
  };

  const largestCluster = Math.max(...result.clusterSizes);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
          <SlidersHorizontal className="h-4 w-4 text-primary-600" />
          参数调节
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-xs font-semibold text-slate-500">K 值：{k}</span>
            <input
              type="range"
              min={2}
              max={5}
              step={1}
              value={k}
              onChange={(event) => setK(Number(event.target.value))}
              className="w-full accent-primary-600"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold text-slate-500">迭代次数：{iterations}</span>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={iterations}
              onChange={(event) => setIterations(Number(event.target.value))}
              className="w-full accent-primary-600"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold text-slate-500">簇内分散度：{spread.toFixed(1)}</span>
            <input
              type="range"
              min={0.3}
              max={1.6}
              step={0.1}
              value={spread}
              onChange={(event) => setSpread(Number(event.target.value))}
              className="w-full accent-primary-600"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <ReactECharts notMerge={true} option={option} style={{ height: 420 }} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {[
            { label: '当前 K 值', value: k },
            { label: '簇内平方和', value: result.inertia.toFixed(1) },
            { label: '最大簇样本数', value: largestCluster },
            { label: '中心更新轮数', value: iterations },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-500">{item.label}</div>
              <div className="mt-1 text-2xl font-black text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <AIVisualizationInsight
        algorithm={algorithm}
        visualState={{
          k,
          iterations,
          spread,
          inertia: Number(result.inertia.toFixed(2)),
          largestCluster,
          clusterSizes: result.clusterSizes.join(', '),
        }}
      />
    </div>
  );
}
