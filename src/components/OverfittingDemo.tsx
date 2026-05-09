import { useState, useMemo } from 'react';
import type { Algorithm } from '../types';

interface OverfittingDemoProps {
  algorithm?: Algorithm;
}

// Generate synthetic data points with polynomial + noise
function generateData(): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  // Simple seed-based pseudo-random
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 30; i++) {
    const x = (i / 29) * 10;
    // True underlying function: sin(x) + 0.5*cos(2x) scaled
    const trueY = Math.sin(x * 0.8) * 3 + Math.cos(x * 0.5) * 1.5 + 5;
    const noise = (rand() - 0.5) * 2.5;
    points.push({ x, y: trueY + noise });
  }
  return points;
}

// Polynomial regression using normal equation (closed form)
function fitPolynomial(points: { x: number; y: number }[], degree: number): (x: number) => number {
  const n = points.length;
  // Build Vandermonde matrix
  const X: number[][] = points.map((p) => {
    const row: number[] = [];
    for (let d = 0; d <= degree; d++) {
      row.push(Math.pow(p.x, d));
    }
    return row;
  });
  const y: number[] = points.map((p) => p.y);

  // Solve X^T X beta = X^T y
  // For small matrices, we can do this directly
  const XT = transpose(X);
  const XTX = multiply(XT, X);
  const XTy = multiplyVec(XT, y);

  // Gaussian elimination (simple, for degree <= 20 this is fine)
  const augmented = XTX.map((row, i) => [...row, XTy[i]]);
  const coeffs = gaussianElimination(augmented);

  return (x: number) => {
    let result = 0;
    for (let d = 0; d <= degree; d++) {
      result += coeffs[d] * Math.pow(x, d);
    }
    return result;
  };
}

function transpose(m: number[][]): number[][] {
  const rows = m.length;
  const cols = m[0].length;
  const result: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = m[i][j];
    }
  }
  return result;
}

function multiply(a: number[][], b: number[][]): number[][] {
  const rows = a.length;
  const cols = b[0].length;
  const inner = a[0].length;
  const result: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (let k = 0; k < inner; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

function multiplyVec(a: number[][], v: number[]): number[] {
  return a.map((row) => row.reduce((sum, val, i) => sum + val * v[i], 0));
}

function gaussianElimination(augmented: number[][]): number[] {
  const n = augmented.length;
  const m = augmented[0].length;
  const a = augmented.map((row) => [...row]);

  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[maxRow][col])) {
        maxRow = row;
      }
    }
    // Swap
    [a[col], a[maxRow]] = [a[maxRow], a[col]];

    // Make pivot 1
    const pivot = a[col][col];
    if (Math.abs(pivot) < 1e-10) continue;
    for (let j = col; j < m; j++) {
      a[col][j] /= pivot;
    }

    // Eliminate other rows
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = col; j < m; j++) {
        a[row][j] -= factor * a[col][j];
      }
    }
  }

  return a.map((row) => row[m - 1]);
}

export default function OverfittingDemo({ algorithm: _algorithm }: OverfittingDemoProps) {
  const [complexity, setComplexity] = useState(1);

  const data = useMemo(() => generateData(), []);
  const predictFn = useMemo(() => fitPolynomial(data, complexity), [data, complexity]);

  // Split data into train (70%) and test (30%)
  const trainData = useMemo(() => data.filter((_, i) => i % 3 !== 0), [data]);
  const testData = useMemo(() => data.filter((_, i) => i % 3 === 0), [data]);

  // Compute errors
  const trainError = useMemo(() => {
    const mse =
      trainData.reduce((sum, p) => {
        const pred = predictFn(p.x);
        return sum + (pred - p.y) ** 2;
      }, 0) / trainData.length;
    return Math.sqrt(mse);
  }, [trainData, predictFn]);

  const testError = useMemo(() => {
    const mse =
      testData.reduce((sum, p) => {
        const pred = predictFn(p.x);
        return sum + (pred - p.y) ** 2;
      }, 0) / testData.length;
    return Math.sqrt(mse);
  }, [testData, predictFn]);

  // Determine fit quality
  const fitLabel = complexity <= 3 ? '欠拟合' : complexity <= 8 ? '正常拟合' : '过拟合';
  const fitColor =
    complexity <= 3
      ? 'text-red-500'
      : complexity <= 8
        ? 'text-green-500'
        : 'text-red-500';
  const fitBg =
    complexity <= 3
      ? 'bg-red-100'
      : complexity <= 8
        ? 'bg-green-100'
        : 'bg-red-100';

  const explanationText =
    complexity <= 3
      ? '模型太简单，无法捕捉数据中的规律。它严重"欠拟合"——连训练数据的模式都没学到，训练误差和测试误差都很高。'
      : complexity <= 8
        ? '模型复杂度适中，很好地捕捉了数据的整体趋势，同时又不会过度关注噪声。训练误差和测试误差都较低，泛化能力最佳。'
        : '模型过于复杂，试图完美"记住"每一个数据点（包括噪声）。虽然训练误差很低，但测试误差反而升高——这就是"过拟合"。';

  // SVG dimensions
  const svgW = 500;
  const svgH = 300;
  const padding = { top: 20, right: 20, bottom: 35, left: 45 };
  const plotW = svgW - padding.left - padding.right;
  const plotH = svgH - padding.top - padding.bottom;

  // Scale functions
  const xMin = 0;
  const xMax = 10;
  const yVals = data.map((d) => d.y);
  const yMin = Math.min(...yVals) - 1;
  const yMax = Math.max(...yVals) + 1;

  const toX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const toY = (y: number) => padding.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  // Generate curve path
  const curvePath = useMemo(() => {
    const steps = 200;
    let path = '';
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = predictFn(x);
      const sx = toX(x);
      const sy = toY(Math.max(yMin, Math.min(yMax, y)));
      path += i === 0 ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`;
    }
    return path;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complexity, data, predictFn]);

  // Axis ticks
  const xTicks = [0, 2, 4, 6, 8, 10];
  const yTicks = [Math.floor(yMin), Math.ceil(yMax / 2), Math.ceil(yMax)];

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-1">
          🔬 欠拟合 vs 正常拟合 vs 过拟合
        </h3>
        <p className="text-sm text-gray-500">拖动滑块，观察模型复杂度如何影响拟合效果</p>
      </div>

      {/* Chart */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[500px] mx-auto" style={{ minHeight: svgH }}>
          {/* Grid lines */}
          {yTicks.map((yt) => (
            <line
              key={`grid-${yt}`}
              x1={padding.left}
              x2={svgW - padding.right}
              y1={toY(yt)}
              y2={toY(yt)}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
            />
          ))}

          {/* Y axis labels */}
          {yTicks.map((yt) => (
            <text
              key={`ylabel-${yt}`}
              x={padding.left - 8}
              y={toY(yt) + 4}
              textAnchor="end"
              className="text-[10px] fill-gray-400"
            >
              {yt}
            </text>
          ))}

          {/* X axis labels */}
          {xTicks.map((xt) => (
            <text
              key={`xlabel-${xt}`}
              x={toX(xt)}
              y={svgH - padding.bottom + 16}
              textAnchor="middle"
              className="text-[10px] fill-gray-400"
            >
              {xt}
            </text>
          ))}

          {/* Axis lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + plotH}
            stroke="#d1d5db"
            strokeWidth={1}
          />
          <line
            x1={padding.left}
            y1={padding.top + plotH}
            x2={padding.left + plotW}
            y2={padding.top + plotH}
            stroke="#d1d5db"
            strokeWidth={1}
          />

          {/* Data points */}
          {data.map((p, i) => (
            <circle
              key={i}
              cx={toX(p.x)}
              cy={toY(p.y)}
              r={3}
              className="fill-gray-400"
            />
          ))}

          {/* Fitted curve */}
          <path
            d={curvePath}
            fill="none"
            stroke={complexity <= 8 ? '#2563eb' : '#dc2626'}
            strokeWidth={2}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
      </div>

      {/* Complexity Slider */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-700">模型复杂度</span>
          <span className={`text-sm font-extrabold ${fitColor}`}>{complexity} 阶多项式</span>
        </div>
        <input
          type="range"
          min={1}
          max={20}
          value={complexity}
          onChange={(e) => setComplexity(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400">1（简单）</span>
          <span className="text-xs text-gray-400">20（复杂）</span>
        </div>
      </div>

      {/* Fit Status Badge */}
      <div className="flex justify-center">
        <span
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-extrabold ${fitBg} ${fitColor}`}
        >
          {complexity <= 3 && '⚠️ '}
          {complexity > 3 && complexity <= 8 && '✅ '}
          {complexity > 8 && '⚠️ '}
          {fitLabel}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-50/70 rounded-2xl border border-blue-100 p-4">
          <h4 className="text-xs font-bold text-blue-700 tracking-tight mb-2">📉 训练误差 (RMSE)</h4>
          <p className="text-2xl font-extrabold text-blue-800 font-mono">
            {trainError.toFixed(3)}
          </p>
          <p className="text-xs text-blue-500 mt-1">越低表示对训练数据拟合越好</p>
        </div>
        <div className="bg-violet-50/70 rounded-2xl border border-violet-100 p-4">
          <h4 className="text-xs font-bold text-violet-700 tracking-tight mb-2">📈 测试误差 (RMSE)</h4>
          <p className="text-2xl font-extrabold text-violet-800 font-mono">
            {testError.toFixed(3)}
          </p>
          <p className="text-xs text-violet-500 mt-1">越低表示对新数据的泛化越好</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-100 p-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          💡 {explanationText}
        </p>
      </div>
    </div>
  );
}
