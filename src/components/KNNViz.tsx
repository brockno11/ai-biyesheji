import { useState, useMemo, useCallback, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { Algorithm } from '../types';
import AIVisualizationInsight from './AIVisualizationInsight';

interface Point {
  x: number;
  y: number;
  label: number;
}

function generateClusters(): Point[] {
  const points: Point[] = [];
  // Cluster 0
  for (let i = 0; i < 40; i++) {
    points.push({
      x: Math.random() * 2.5 + 1,
      y: Math.random() * 2.5 + 1,
      label: 0,
    });
  }
  // Cluster 1
  for (let i = 0; i < 40; i++) {
    points.push({
      x: Math.random() * 2.5 + 5,
      y: Math.random() * 2.5 + 5,
      label: 1,
    });
  }
  return points;
}

function euclideanDist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export default function KNNViz({ algorithm }: { algorithm?: Algorithm }) {
  const [k, setK] = useState(5);
  const [testPoint, setTestPoint] = useState({ x: 3.5, y: 3.5 });
  const chartRef = useRef<ReactECharts>(null);

  const points = useMemo(() => generateClusters(), []);

  const { neighbors, prediction } = useMemo(() => {
    const distances = points.map((p, i) => ({
      index: i,
      dist: euclideanDist(testPoint, p),
      label: p.label,
    }));
    distances.sort((a, b) => a.dist - b.dist);
    const topK = distances.slice(0, k);

    // Majority vote
    const votes: Record<number, number> = {};
    topK.forEach((n) => {
      votes[n.label] = (votes[n.label] || 0) + 1;
    });
    let maxVotes = 0;
    let pred = 0;
    for (const [label, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        pred = Number(label);
      }
    }

    return {
      neighbors: topK.map((n) => n.index),
      prediction: pred,
      voteCounts: votes,
    };
  }, [points, testPoint, k]);

  const handleChartClick = useCallback(
    (params: { data?: [number, number] }) => {
      if (params.data) {
        setTestPoint({ x: params.data[0], y: params.data[1] });
      }
    },
    []
  );

  const chartOption = useMemo(() => {
    const colors = ['#6366f1', '#f59e0b'];

    // Training points
    const seriesData = points.map((p) => ({
      value: [p.x, p.y],
      label: p.label,
      isNeighbor: false,
    }));

    // Mark neighbors
    neighbors.forEach((idx) => {
      if (idx < seriesData.length) {
        seriesData[idx].isNeighbor = true;
      }
    });

    const scatterSeries = [0, 1].map((label) => ({
      name: `类别 ${label}`,
      type: 'scatter' as const,
      data: seriesData
        .filter((d) => d.label === label)
        .map((d) => ({
          value: d.value,
          symbolSize: d.isNeighbor ? 18 : 10,
          itemStyle: {
            color: d.isNeighbor
              ? colors[label]
              : colors[label] + '66',
            borderColor: d.isNeighbor ? '#fff' : 'transparent',
            borderWidth: d.isNeighbor ? 2 : 0,
            shadowBlur: d.isNeighbor ? 10 : 0,
            shadowColor: colors[label],
          },
        })),
    }));

    // Lines from test point to neighbors
    const neighborLines: { coords: [number[], number[]] }[] = [];
    neighbors.forEach((idx) => {
      const p = points[idx];
      neighborLines.push({
        coords: [
          [testPoint.x, testPoint.y],
          [p.x, p.y],
        ],
      });
    });

    // Test point
    const testSeries = {
      name: '测试点',
      type: 'scatter',
      data: [
        {
          value: [testPoint.x, testPoint.y],
          symbolSize: 20,
          itemStyle: {
            color: prediction === 0 ? colors[0] : colors[1],
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 15,
            shadowColor: prediction === 0 ? colors[0] : colors[1],
          },
        },
      ],
      z: 10,
    };

    return {
      title: {
        text: `KNN 分类 (K=${k})  →  预测类别: ${prediction}`,
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: { seriesName?: string; data?: number[] }) => {
          if (params.seriesName === '测试点') return '🔍 测试点';
          return `(${params.data?.[0]?.toFixed(2)}, ${params.data?.[1]?.toFixed(2)})`;
        },
      },
      xAxis: { min: 0, max: 8.5, name: '特征 X₁', nameLocation: 'center', nameGap: 25 },
      yAxis: { min: 0, max: 8.5, name: '特征 X₂', nameLocation: 'center', nameGap: 35 },
      series: [
        ...scatterSeries,
        ...neighborLines.map((line, i) => ({
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          polyline: false,
          data: [line],
          lineStyle: {
            color: '#d1d5db',
            width: 1.5,
            type: 'dashed' as const,
          },
          z: 1,
        })),
        testSeries,
      ],
      grid: { left: 55, right: 30, top: 50, bottom: 50 },
      legend: {
        data: ['类别 0', '类别 1', '测试点'],
        bottom: 0,
      },
    };
  }, [points, neighbors, testPoint, k, prediction]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 w-full">
            <label className="text-xs text-gray-500 mb-1 block">
              K 值（邻居数量）: <span className="font-bold text-primary-600">{k}</span>
            </label>
            <input
              type="range"
              min={1}
              max={15}
              step={2}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>1 (敏感)</span>
              <span>15 (平滑)</span>
            </div>
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl flex-shrink-0">
            🖱️ 点击图表移动测试点
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <ReactECharts
          ref={chartRef}
          option={chartOption}
          style={{ height: 420 }}
          onEvents={{
            click: (params: { data?: [number, number] }) => {
              if (params.data) {
                setTestPoint({ x: params.data[0], y: params.data[1] });
              }
            },
          }}
        />
      </div>

      {/* Neighbors info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">
          最近 {k} 个邻居详情
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">测试点坐标</div>
            <div className="text-sm font-mono bg-gray-50 rounded-lg px-3 py-1.5">
              ({testPoint.x.toFixed(2)}, {testPoint.y.toFixed(2)})
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">预测结果</div>
            <div
              className={`text-sm font-bold px-3 py-1.5 rounded-lg ${
                prediction === 0
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              类别 {prediction}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          💡 提示：K 值越大，决策边界越平滑；K 值越小，越容易受噪声影响。拖动 K 值 slider 和测试点位置，观察预测结果的变化。
        </div>
      </div>

      <AIVisualizationInsight
        algorithm={algorithm}
        visualState={{
          k,
          testPointX: Number(testPoint.x.toFixed(2)),
          testPointY: Number(testPoint.y.toFixed(2)),
          prediction,
          neighborCount: neighbors.length,
        }}
      />
    </div>
  );
}
