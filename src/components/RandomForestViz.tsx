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
  { name: '收入水平', value: 0.36 },
  { name: '浏览频次', value: 0.27 },
  { name: '年龄区间', value: 0.18 },
  { name: '历史购买', value: 0.13 },
  { name: '职业类别', value: 0.06 },
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
  const averageLeafNodes = Math.round(
    trees.reduce((sum, tree) => sum + tree.leafNodes, 0) / Math.max(trees.length, 1)
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
      formatter: (params: { data: number | { value: number }; name: string }[]) => {
        const item = params[0];
        const value = typeof item?.data === 'number' ? item.data : item?.data?.value ?? 0;
        return `${item?.name ?? '特征'}: ${(value * 100).toFixed(0)}%`;
      },
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
      <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-5">
        <h4 className="text-sm font-bold text-sky-900">这个可视化在演示什么？</h4>
        <p className="mt-2 text-xs leading-relaxed text-sky-800">
          随机森林不是只训练一棵决策树，而是训练很多棵“看过不同数据、用过不同特征”的树。
          每张小卡片就是一棵树对同一个样本的判断：<strong>类别 0</strong> 和 <strong>类别 1</strong>
          代表两个可能结果，例如“不购买课程 / 购买课程”。最后按多数票决定模型预测。
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/70 bg-white/80 p-3">
            <div className="text-xs font-bold text-sky-900">为什么要投票？</div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
              单棵树容易被训练数据里的偶然细节带偏。多棵树独立判断后投票，可以抵消单棵树的偏差，让结果更稳。
            </p>
          </div>
          <div className="rounded-xl border border-white/70 bg-white/80 p-3">
            <div className="text-xs font-bold text-sky-900">树的数量影响什么？</div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
              树越多，投票越稳定，但计算更慢。拖动 n_estimators 可以观察多数票是否更不容易被少数树改变。
            </p>
          </div>
          <div className="rounded-xl border border-white/70 bg-white/80 p-3">
            <div className="text-xs font-bold text-sky-900">最大深度影响什么？</div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
              深度越大，单棵树能问更多层问题，叶节点更多，模型更复杂；太深时可能记住噪声，泛化反而变差。
            </p>
          </div>
        </div>
      </div>

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
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-800">
              {'\u{1F332}'} {nEstimators} {'棵决策树的投票结果'}
            </h4>
            <p className="text-xs text-gray-500">
              每棵树先独立给出类别，再交给森林做多数投票。
            </p>
          </div>
          <div className="text-xs text-gray-400">
            平均叶节点：{averageLeafNodes} 个 / 树
          </div>
        </div>
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
                {'置信度'} {tree.confidence}
              </div>
              <div className="mt-1 text-[11px] text-gray-400">
                {tree.leafNodes} {'个叶节点'}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
          <strong>怎么看小卡片：</strong>
          “类别”是这棵树的预测；“置信度”是这棵树对自己判断的把握程度；“叶节点”可以理解为这棵树最终可落到的答案格子数量，通常越多表示树越复杂。
        </div>
      </div>

      {/* Voting Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-800">{'\u{1F5F3}️ 投票统计'}</h4>
          <p className="mt-1 text-xs text-gray-500">
            统计所有树投给类别 0 和类别 1 的票数，多数票就是随机森林的最终预测。
          </p>
        </div>
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
            <div className="mt-3 max-w-sm text-center text-[11px] leading-relaxed text-gray-400">
              这里的置信度是多数票占比：支持最终类别的树越多，森林整体判断越一致。
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
          <div className="text-sm font-semibold text-emerald-800">从“投票结果”继续看“投票依据”</div>
          <p className="mt-1 text-xs leading-relaxed text-emerald-700">
            上面展示的是多棵树如何投票；下面的特征重要性则回答另一个问题：这些树在做判断时，整体更依赖哪些特征。它不是新的算法，而是随机森林训练后常见的解释视角。
          </p>
        </div>
        <ReactECharts notMerge={true} option={importanceOption} style={{ height: 280 }} />
        <div className="text-xs text-gray-400 text-center mt-2">
          {'💡 示例场景：预测用户是否购买课程。实际应用中可通过 model.feature_importances_ 获取特征重要性。'}
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
