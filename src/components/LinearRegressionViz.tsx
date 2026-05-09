import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { Algorithm } from '../types';
import AIVisualizationInsight from './AIVisualizationInsight';

function generateData(n: number, noise: number) {
  const data: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 10;
    const y = 2.5 * x + 3 + (Math.random() - 0.5) * noise * 2;
    data.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
  }
  return data;
}

function gradientDescent(
  data: [number, number][],
  lr: number,
  iterations: number
) {
  let w = 0;
  let b = 0;
  const n = data.length;
  const lossHistory: number[] = [];

  for (let iter = 0; iter < iterations; iter++) {
    let totalLoss = 0;
    let dw = 0;
    let db = 0;

    for (const [x, y] of data) {
      const pred = w * x + b;
      const error = y - pred;
      totalLoss += error * error;
      dw += -2 * x * error;
      db += -2 * error;
    }

    w -= (lr * dw) / n;
    b -= (lr * db) / n;
    lossHistory.push(totalLoss / n);
  }

  return { w, b, lossHistory };
}

export default function LinearRegressionViz({ algorithm }: { algorithm?: Algorithm }) {
  const [sampleCount, setSampleCount] = useState(60);
  const [learningRate, setLearningRate] = useState(0.01);
  const [iterations, setIterations] = useState(100);
  const [noise, setNoise] = useState(3);

  const data = useMemo(() => generateData(sampleCount, noise), [sampleCount, noise]);

  const { w, b, lossHistory } = useMemo(
    () => gradientDescent(data, learningRate, iterations),
    [data, learningRate, iterations]
  );

  const mse = lossHistory[lossHistory.length - 1];

  // Predicted line
  const xMin = 0;
  const xMax = 10;
  const lineData: [number, number][] = [
    [xMin, w * xMin + b],
    [xMax, w * xMax + b],
  ];

  const scatterOption = {
    title: {
      text: `线性回归拟合结果 (y = ${w.toFixed(2)}x + ${b.toFixed(2)})`,
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: { data: number[] }) =>
        `(${params.data[0]}, ${params.data[1]?.toFixed(2)})`,
    },
    xAxis: { name: '特征 X', nameLocation: 'center', nameGap: 30, min: -0.5, max: 10.5 },
    yAxis: { name: '目标 Y', nameLocation: 'center', nameGap: 40 },
    series: [
      {
        name: '数据点',
        type: 'scatter',
        data: data,
        symbolSize: 8,
        itemStyle: {
          color: '#6366f1',
          borderColor: '#fff',
          borderWidth: 1,
          opacity: 0.7,
        },
      },
      {
        name: '拟合直线',
        type: 'line',
        data: lineData,
        lineStyle: { color: '#f59e0b', width: 3 },
        symbol: 'none',
        z: 1,
      },
    ],
    grid: { left: 60, right: 30, top: 50, bottom: 50 },
  };

  const lossOption = {
    title: {
      text: `Loss 曲线 (MSE = ${mse.toFixed(3)})`,
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
    },
    tooltip: { trigger: 'axis' },
    xAxis: { name: '迭代次数', nameLocation: 'center', nameGap: 25 },
    yAxis: { name: 'MSE Loss', nameLocation: 'center', nameGap: 40 },
    series: [
      {
        name: 'Loss',
        type: 'line',
        data: lossHistory,
        lineStyle: { color: '#ef4444', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0.02)' },
            ],
          },
        },
        showSymbol: false,
      },
    ],
    grid: { left: 60, right: 30, top: 50, bottom: 50 },
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">参数调节</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              样本数量: {sampleCount}
            </label>
            <input
              type="range"
              min={20}
              max={150}
              value={sampleCount}
              onChange={(e) => setSampleCount(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              学习率: {learningRate.toFixed(3)}
            </label>
            <input
              type="range"
              min={0.001}
              max={0.05}
              step={0.001}
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              迭代次数: {iterations}
            </label>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              噪声大小: {noise.toFixed(1)}
            </label>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={noise}
              onChange={(e) => setNoise(Number(e.target.value))}
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
          <ReactECharts notMerge={true} option={lossOption} style={{ height: 380 }} />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '权重 w', value: w.toFixed(3), color: 'text-blue-600' },
          { label: '偏置 b', value: b.toFixed(3), color: 'text-green-600' },
          { label: 'MSE', value: mse.toFixed(3), color: 'text-red-600' },
          { label: '迭代次数', value: String(iterations), color: 'text-purple-600' },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm"
          >
            <div className="text-xs text-gray-500 mb-1">{m.label}</div>
            <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      <AIVisualizationInsight
        algorithm={algorithm}
        visualState={{
          sampleCount,
          learningRate,
          iterations,
          noise,
          mse: Number(mse.toFixed(3)),
          w: Number(w.toFixed(3)),
          b: Number(b.toFixed(3)),
        }}
      />
    </div>
  );
}
