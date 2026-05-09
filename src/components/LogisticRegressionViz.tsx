import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { Algorithm } from '../types';
import AIVisualizationInsight from './AIVisualizationInsight';

interface DataPoint {
  x: number;
  y: number;
  label: number;
}

function generateData(n: number): DataPoint[] {
  const points: DataPoint[] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 10;
    const baseY0 = 0.6 * x + 1.5;
    const y0 = baseY0 + (Math.random() - 0.5) * 4 - 1.5;
    points.push({ x: Math.round(x * 100) / 100, y: Math.round(y0 * 100) / 100, label: 0 });
  }
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 10;
    const baseY1 = 0.6 * x + 1.5;
    const y1 = baseY1 + (Math.random() - 0.5) * 4 + 1.5;
    points.push({ x: Math.round(x * 100) / 100, y: Math.round(y1 * 100) / 100, label: 1 });
  }
  return points;
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function logisticGD(data: DataPoint[], lr: number, iterations: number) {
  let w1 = 0.5;
  let w2 = 0.5;
  let b = 0;
  const n = data.length;

  for (let iter = 0; iter < iterations; iter++) {
    let dw1 = 0;
    let dw2 = 0;
    let db = 0;

    for (const p of data) {
      const z = w1 * p.x + w2 * p.y + b;
      const pred = sigmoid(z);
      const error = pred - p.label;
      dw1 += error * p.x;
      dw2 += error * p.y;
      db += error;
    }

    w1 -= (lr * dw1) / n;
    w2 -= (lr * dw2) / n;
    b -= (lr * db) / n;
  }

  return { w1, w2, b };
}

export default function LogisticRegressionViz({ algorithm }: { algorithm?: Algorithm }) {
  const [sampleCount, setSampleCount] = useState(40);
  const [threshold, setThreshold] = useState(0.5);
  const [learningRate, setLearningRate] = useState(0.1);
  const [iterations, setIterations] = useState(200);

  const data = useMemo(() => generateData(sampleCount), [sampleCount]);

  const { w1, w2, b } = useMemo(
    () => logisticGD(data, learningRate, iterations),
    [data, learningRate, iterations]
  );

  const thresholdLogOdds = Math.log(threshold / (1 - threshold));

  const xMin = -0.5;
  const xMax = 10.5;
  const boundaryLine: [number, number][] = useMemo(() => {
    if (Math.abs(w2) < 1e-6) return [[0, 0], [10, 0]];
    const y1 = (thresholdLogOdds - w1 * xMin - b) / w2;
    const y2 = (thresholdLogOdds - w1 * xMax - b) / w2;
    return [[xMin, y1], [xMax, y2]];
  }, [w1, w2, b, thresholdLogOdds]);

  const sigmoidData: [number, number][] = useMemo(() => {
    const points: [number, number][] = [];
    for (let z = -6; z <= 6; z += 0.1) {
      points.push([Math.round(z * 100) / 100, Math.round(sigmoid(z) * 1000) / 1000]);
    }
    return points;
  }, []);

  const samplePoint: DataPoint = useMemo(() => {
    const x = 5;
    const baseY = 0.6 * x + 1.5;
    return { x, y: Number((baseY + 0.5).toFixed(2)), label: 1 };
  }, []);

  const sampleProb = useMemo(() => {
    const z = w1 * samplePoint.x + w2 * samplePoint.y + b;
    return sigmoid(z);
  }, [w1, w2, b, samplePoint]);
  const samplePrediction = sampleProb >= threshold ? 1 : 0;

  const scatterOption = {
    title: {
      text: `逻辑回归二分类 (阈值 = ${threshold.toFixed(2)})`,
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'bold' as const, color: '#374151' },
    },
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: { data: number[]; seriesName: string }) =>
        `(${params.data[0]}, ${params.data[1]?.toFixed(2)}) ${params.seriesName}`,
    },
    xAxis: { name: '特征 X₁', nameLocation: 'center' as const, nameGap: 30, min: -0.5, max: 10.5 },
    yAxis: { name: '特征 X₂', nameLocation: 'center' as const, nameGap: 40, min: -1, max: 9 },
    series: [
      {
        name: '类别 0',
        type: 'scatter',
        data: data.filter((p) => p.label === 0).map((p) => [p.x, p.y]),
        symbolSize: 8,
        itemStyle: { color: '#6366f1', borderColor: '#fff', borderWidth: 1, opacity: 0.7 },
      },
      {
        name: '类别 1',
        type: 'scatter',
        data: data.filter((p) => p.label === 1).map((p) => [p.x, p.y]),
        symbolSize: 8,
        itemStyle: { color: '#f59e0b', borderColor: '#fff', borderWidth: 1, opacity: 0.7 },
      },
      {
        name: '决策边界',
        type: 'line',
        data: boundaryLine,
        lineStyle: { color: '#ef4444', width: 2.5, type: 'dashed' as const },
        symbol: 'none',
        z: 10,
      },
      {
        name: '测试点',
        type: 'scatter',
        data: [[samplePoint.x, samplePoint.y]],
        symbolSize: 16,
        itemStyle: {
          color: samplePrediction === 1 ? '#f59e0b' : '#6366f1',
          borderColor: '#fff',
          borderWidth: 3,
        },
        z: 20,
      },
    ],
    grid: { left: 60, right: 30, top: 50, bottom: 50 },
    legend: { data: ['类别 0', '类别 1', '决策边界', '测试点'], bottom: 0 },
  };

  const sigmoidOption = {
    title: {
      text: 'Sigmoid 函数曲线',
      left: 'center',
      textStyle: { fontSize: 13, fontWeight: 'bold' as const, color: '#374151' },
    },
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: { data: number[] }[]) =>
        `z = ${params[0]?.data[0]?.toFixed(2)}<br/>σ(z) = ${params[0]?.data[1]?.toFixed(4)}`,
    },
    xAxis: { name: 'z (线性得分)', nameLocation: 'center' as const, nameGap: 25, min: -6, max: 6 },
    yAxis: { name: 'σ(z)', nameLocation: 'center' as const, nameGap: 35, min: -0.05, max: 1.05 },
    series: [
      {
        name: 'Sigmoid',
        type: 'line',
        data: sigmoidData,
        lineStyle: { color: '#8b5cf6', width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(139, 92, 246, 0.15)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.02)' },
            ],
          },
        },
        showSymbol: false,
      },
      {
        name: `阈值 = ${threshold.toFixed(2)}`,
        type: 'line',
        markLine: {
          silent: true,
          data: [{ yAxis: threshold, label: { formatter: `阈值 ${threshold.toFixed(2)}` } }],
          lineStyle: { color: '#ef4444', type: 'dashed' as const, width: 2 },
        },
      },
    ],
    grid: { left: 55, right: 30, top: 45, bottom: 45 },
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">{'参数调节'}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {'样本数'}: {sampleCount}
            </label>
            <input
              type="range"
              min={20}
              max={80}
              value={sampleCount}
              onChange={(e) => setSampleCount(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {'分类阈值'}: <span className="font-bold text-primary-600">{threshold.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.05}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {'学习率'}: {learningRate}
            </label>
            <input
              type="range"
              min={0.01}
              max={0.5}
              step={0.01}
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {'迭代次数'}: {iterations}
            </label>
            <input
              type="range"
              min={50}
              max={500}
              step={25}
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <ReactECharts notMerge={true} option={scatterOption} style={{ height: 380 }} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <ReactECharts notMerge={true} option={sigmoidOption} style={{ height: 380 }} />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm">
          <div className="text-xs text-gray-500 mb-1">{'当前阈值'}</div>
          <div className="text-lg font-bold text-primary-600">{threshold.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm">
          <div className="text-xs text-gray-500 mb-1">{'测试点概率'}</div>
          <div className="text-lg font-bold text-violet-600">{sampleProb.toFixed(4)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm">
          <div className="text-xs text-gray-500 mb-1">{'预测类别'}</div>
          <div className={`text-lg font-bold ${samplePrediction === 1 ? 'text-amber-600' : 'text-indigo-600'}`}>
            {'类别'} {samplePrediction}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm">
          <div className="text-xs text-gray-500 mb-1">{'决策边界'}</div>
          <div className="text-sm font-mono font-medium text-gray-700">
            {'w₁x + w₂y + b'} = {thresholdLogOdds.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-400 text-center">
        {'💡 提示：调整分类阈值观察决策边界移动。阈值提高 → 更严格判定正类；阈值降低 → 更宽松。调节学习率和迭代次数观察边界拟合变化。'}
      </div>

      <AIVisualizationInsight
        algorithm={algorithm}
        visualState={{
          sampleCount,
          threshold: Number(threshold.toFixed(2)),
          learningRate,
          iterations,
          testProb: Number(sampleProb.toFixed(4)),
          prediction: samplePrediction,
          w1: Number(w1.toFixed(4)),
          w2: Number(w2.toFixed(4)),
          b: Number(b.toFixed(4)),
        }}
      />
    </div>
  );
}
