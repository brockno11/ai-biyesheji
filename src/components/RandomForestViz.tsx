import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { Algorithm } from '../types';
import AIVisualizationInsight from './AIVisualizationInsight';

interface TreeCard {
  id: number;
  icon: string;
  prediction: number;
  confidence: string;
  leafNodes: number;
}

function generateTreePredictions(nEstimators: number, maxDepth: number, seed: number): TreeCard[] {
  const icons = ['\u{1F331}', '\u{1F33F}', '\u{1F332}', '\u{1FAB4}', '\u{1F340}'];
  const trees: TreeCard[] = [];
  const rng = seed * 7 + nEstimators * 13 + maxDepth * 31;

  for (let i = 0; i < nEstimators; i++) {
    const pseudoRandom = ((rng * (i + 1) * 17 + i * 23) % 100) / 100;
    const depthBias = (maxDepth - 1) / 19;
    const pred = pseudoRandom > 0.35 + depthBias * 0.15 ? 1 : 0;
    const confidence = Math.min(95, Math.round(60 + pseudoRandom * 35));

    trees.push({
      id: i + 1,
      icon: icons[i % icons.length],
      prediction: pred,
      confidence: `${confidence}%`,
      leafNodes: Math.max(2, Math.round(maxDepth * 1.5 + pseudoRandom * 4)),
    });
  }
  return trees;
}

const featureImportanceData = [
  { name: '花瓣长度', value: 0.42 },
  { name: '花瓣宽度', value: 0.31 },
  { name: '花萼长度', value: 0.15 },
  { name: '花萼宽度', value: 0.08 },
  { name: '其它特征', value: 0.04 },
];

export default function RandomForestViz({ algorithm }: { algorithm?: Algorithm }) {
  const [nEstimators, setNEstimators] = useState(5);
  const [maxDepth, setMaxDepth] = useState(5);
  const [seed, setSeed] = useState(42);

  const trees = useMemo(
    () => generateTreePredictions(nEstimators, maxDepth, seed),
    [nEstimators, maxDepth, seed]
  );

  const voteCounts = useMemo(() => {
    const class0 = trees.filter((t) => t.prediction === 0).length;
    const class1 = trees.filter((t) => t.prediction === 1).length;
    return { class0, class1, total: trees.length };
  }, [trees]);

  const finalPrediction = voteCounts.class1 >= voteCounts.class0 ? 1 : 0;
  const finalConfidence = Math.round(
    (Math.max(voteCounts.class0, voteCounts.class1) / voteCounts.total) * 100
  );

  const importanceOption = {
    title: {
      text: '特征重要性 (Feature Importance)',
      left: 'center',
      textStyle: { fontSize: 13, fontWeight: 'bold' as const, color: '#374151' },
    },
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
      formatter: (params: { data: number; name: string }[]) =>
        `${params[0]?.name}: ${(params[0]?.data * 100).toFixed(0)}%`,
    },
    xAxis: {
      type: 'value' as const,
      name: '重要性',
      max: 0.5,
      axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
    },
    yAxis: {
      type: 'category' as const,
      data: featureImportanceData.map((d) => d.name),
      inverse: true,
    },
    series: [
      {
        type: 'bar',
        data: featureImportanceData.map((d) => ({
          value: d.value,
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#059669' },
              ],
            },
            borderRadius: [0, 4, 4, 0],
          },
        })),
        barWidth: 24,
        label: {
          show: true,
          position: 'right' as const,
          formatter: (p: { value: number }) => `${(p.value * 100).toFixed(0)}%`,
          fontSize: 11,
          color: '#6b7280',
        },
      },
    ],
    grid: { left: 90, right: 50, top: 45, bottom: 30 },
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">{'参数调节'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {'树的数量'} (n_estimators): <span className="font-bold text-primary-600">{nEstimators}</span>
            </label>
            <input
              type="range"
              min={1}
              max={50}
              value={nEstimators}
              onChange={(e) => setNEstimators(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>1 {'棵'}</span>
              <span>50 {'棵'}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {'最大深度'} (max_depth): <span className="font-bold text-primary-600">{maxDepth}</span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>{'深度 1 (浅)'}</span>
              <span>{'深度 20 (深)'}</span>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setSeed(Math.floor(Math.random() * 1000))}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
            >
              {'\u{1F504} 重新随机生成'}
            </button>
          </div>
        </div>
      </div>

      {/* Tree Cards */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">
          {'\u{1F332}'} {nEstimators} {'棵决策树的投票结果'}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {trees.map((tree) => (
            <div
              key={tree.id}
              className={`bg-white rounded-xl border p-4 text-center shadow-sm transition-all hover:shadow-md ${
                tree.prediction === 0
                  ? 'border-indigo-200 hover:border-indigo-300'
                  : 'border-amber-200 hover:border-amber-300'
              }`}
            >
              <div className="text-3xl mb-2">{tree.icon}</div>
              <div className="text-xs text-gray-400 mb-1">{'树'} {tree.id}</div>
              <div
                className={`text-base font-bold mb-1 ${
                  tree.prediction === 0 ? 'text-indigo-600' : 'text-amber-600'
                }`}
              >
                {'类别'} {tree.prediction}
              </div>
              <div className="text-xs text-gray-400">
                {'置信度'} {tree.confidence} / {tree.leafNodes} {'叶节点'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voting Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">{'\u{1F5F3}️ 投票统计'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vote bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                {'类别 0'}
              </span>
              <span className="font-bold text-indigo-600">
                {voteCounts.class0} {'票'} ({voteCounts.total > 0 ? Math.round((voteCounts.class0 / voteCounts.total) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${voteCounts.total > 0 ? (voteCounts.class0 / voteCounts.total) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm mb-2 mt-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                {'类别 1'}
              </span>
              <span className="font-bold text-amber-600">
                {voteCounts.class1} {'票'} ({voteCounts.total > 0 ? Math.round((voteCounts.class1 / voteCounts.total) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${voteCounts.total > 0 ? (voteCounts.class1 / voteCounts.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Final prediction */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-500 mb-1">{'最终预测结果'}</div>
            <div
              className={`text-4xl font-extrabold mb-2 ${
                finalPrediction === 0 ? 'text-indigo-600' : 'text-amber-600'
              }`}
            >
              {'类别'} {finalPrediction}
            </div>
            <div className="text-sm text-gray-500">
              {'置信度'}: {finalConfidence}% ({voteCounts.total} {'票参与'})
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {finalPrediction === 0
                ? `${voteCounts.class0} ${'棵树投了类别 0'}`
                : `${voteCounts.class1} ${'棵树投了类别 1'}`}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <ReactECharts notMerge={true} option={importanceOption} style={{ height: 280 }} />
        <div className="text-xs text-gray-400 text-center mt-2">
          {'💡 上图展示的是鸢尾花数据集的示例特征重要性。实际应用中可通过 model.feature_importances_ 获取。'}
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-400 text-center">
        {'💡 提示：增加树的数量 (n_estimators) 观察投票分布和最终预测的变化。增加深度观察每棵树的叶节点数量变化。随机森林通过"群体智慧"——多棵树投票——降低单树过拟合的风险。'}
      </div>

      <AIVisualizationInsight
        algorithm={algorithm}
        visualState={{
          nEstimators,
          maxDepth,
          class0Votes: voteCounts.class0,
          class1Votes: voteCounts.class1,
          finalPrediction,
          finalConfidence,
        }}
      />
    </div>
  );
}
