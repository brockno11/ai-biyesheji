import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface TreeNode {
  id: string;
  name: string;
  condition?: string;
  samples: number;
  value: number[];
  children?: TreeNode[];
  depth: number;
}

function buildTree(depth: number): TreeNode {
  let idCounter = 0;
  const root: TreeNode = {
    id: `node-${idCounter++}`,
    name: '根节点',
    condition: '花瓣长度 ≤ 2.45',
    samples: 150,
    value: [50, 50, 50],
    depth: 0,
  };

  root.children = [
    {
      id: `node-${idCounter++}`,
      name: '左子节点',
      condition: '花瓣宽度 ≤ 1.75',
      samples: 50,
      value: [50, 0, 0],
      depth: 1,
    },
    {
      id: `node-${idCounter++}`,
      name: '右子节点',
      condition: '花瓣长度 ≤ 4.75',
      samples: 100,
      value: [0, 50, 50],
      depth: 1,
    },
  ];

  // Add deeper levels based on depth param
  if (depth >= 2) {
    root.children[0].children = [
      {
        id: `node-${idCounter++}`,
        name: '叶子节点',
        samples: 50,
        value: [50, 0, 0],
        depth: 2,
      },
    ];
    root.children[0].condition = undefined;

    root.children[1].children = [
      {
        id: `node-${idCounter++}`,
        name: '左子节点',
        condition: '花瓣宽度 ≤ 1.65',
        samples: 54,
        value: [0, 49, 5],
        depth: 2,
      },
      {
        id: `node-${idCounter++}`,
        name: '右子节点',
        condition: '花瓣宽度 ≤ 1.55',
        samples: 46,
        value: [0, 1, 45],
        depth: 2,
      },
    ];
  }

  if (depth >= 3) {
    const right = root.children![1].children!;
    right[0].children = [
      {
        id: `node-${idCounter++}`,
        name: '叶子节点',
        samples: 48,
        value: [0, 47, 1],
        depth: 3,
      },
      {
        id: `node-${idCounter++}`,
        name: '叶子节点',
        samples: 6,
        value: [0, 2, 4],
        depth: 3,
      },
    ];
    right[0].condition = undefined;

    right[1].children = [
      {
        id: `node-${idCounter++}`,
        name: '叶子节点',
        samples: 4,
        value: [0, 1, 3],
        depth: 3,
      },
      {
        id: `node-${idCounter++}`,
        name: '叶子节点',
        samples: 42,
        value: [0, 0, 42],
        depth: 3,
      },
    ];
    right[1].condition = undefined;

    // Move conditions down
    root.children![1].condition = '花瓣长度 ≤ 4.75';
    right[0].condition = '花瓣宽度 ≤ 1.65';
    right[1].condition = '花瓣宽度 ≤ 1.55';
  }

  return root;
}

export default function DecisionTreeViz() {
  const [maxDepth, setMaxDepth] = useState(3);
  const [highlightPath, setHighlightPath] = useState<number>(1);

  const treeData = useMemo(() => buildTree(maxDepth), [maxDepth]);

  // Build ECharts tree data
  const chartOption = useMemo(() => {
    const classColors = ['#6366f1', '#f59e0b', '#10b981'];
    const classNames = ['Setosa', 'Versicolor', 'Virginica'];

    function convertToECharts(node: TreeNode, path: number[] = []): object {
      const dominantClass = node.value.indexOf(Math.max(...node.value));
      const isLeaf = !node.children || node.children.length === 0;

      const nodeStyle = isLeaf
        ? {
            color: classColors[dominantClass],
            borderColor: classColors[dominantClass],
          }
        : {
            color: '#fff',
            borderColor: '#6366f1',
          };

      return {
        name: node.condition || `叶子节点：${classNames[dominantClass]}`,
        value: node.samples,
        itemStyle: nodeStyle,
        label: {
          color: isLeaf ? '#fff' : '#374151',
          fontSize: 11,
          fontWeight: isLeaf ? 'bold' : 'normal',
        },
        tooltip: {
          trigger: 'item',
          formatter: () => {
            const parts = [
              `<b>${node.condition || '叶子节点'}</b>`,
              `样本数: ${node.samples}`,
            ];
            node.value.forEach((v, i) => {
              parts.push(`${classNames[i]}: ${v}`);
            });
            return parts.join('<br/>');
          },
        },
        children: node.children?.map((child) => convertToECharts(child, [...path, 0])) || [],
      };
    }

    return {
      tooltip: {
        trigger: 'item' as const,
      },
      series: [
        {
          type: 'tree',
          data: [convertToECharts(treeData)],
          top: '5%',
          left: '8%',
          bottom: '5%',
          right: '12%',
          symbolSize: 20,
          orient: 'LR',
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left',
            fontSize: 11,
          },
          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left',
              fontSize: 11,
            },
          },
          expandAndCollapse: false,
          animationDuration: 550,
          animationDurationUpdate: 600,
        },
      ],
    };
  }, [treeData]);

  // Sample classification path traversal
  const samplePaths: { x: number; y: number; path: string[]; pred: number }[] = [
    {
      x: 1.2,
      y: 0.3,
      pred: 0,
      path: [
        '花瓣长度 = 1.2 ≤ 2.45 → 走左边',
        '到达叶子节点 → 预测: Setosa',
      ],
    },
    {
      x: 4.5,
      y: 1.4,
      pred: 1,
      path: [
        '花瓣长度 = 4.5 > 2.45 → 走右边',
        '花瓣长度 = 4.5 ≤ 4.75 → 走左边',
        '花瓣宽度 = 1.4 ≤ 1.65 → 走左边',
        '到达叶子节点 → 预测: Versicolor',
      ],
    },
    {
      x: 5.8,
      y: 2.2,
      pred: 2,
      path: [
        '花瓣长度 = 5.8 > 2.45 → 走右边',
        '花瓣长度 = 5.8 > 4.75 → 走右边',
        '花瓣宽度 = 2.2 > 1.55 → 走右边',
        '到达叶子节点 → 预测: Virginica',
      ],
    },
  ];

  const sample = samplePaths[highlightPath];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              最大深度: <span className="font-bold text-primary-600">{maxDepth}</span>
            </label>
            <input
              type="range"
              min={1}
              max={3}
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>深度 1 (简单)</span>
              <span>深度 3 (复杂)</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              样本分类路径演示
            </label>
            <div className="flex gap-2">
              {samplePaths.map((sp, i) => (
                <button
                  key={i}
                  onClick={() => setHighlightPath(i)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                    highlightPath === i
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  样本 {i + 1}: ({sp.x}, {sp.y})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tree Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <ReactECharts option={chartOption} style={{ height: 450 }} />
      </div>

      {/* Sample Path */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">
          样本分类路径追踪
        </h4>
        <div className="flex items-start gap-4">
          <div className="bg-primary-50 rounded-xl px-4 py-2 flex-shrink-0">
            <div className="text-xs text-gray-500">测试样本特征</div>
            <div className="text-sm font-mono font-medium text-gray-800">
              花瓣长 = {sample.x}, 花瓣宽 = {sample.y}
            </div>
          </div>
          <div className="flex-1">
            <div className="relative pl-6 border-l-2 border-primary-200 space-y-3">
              {sample.path.map((step, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-primary-400 border-2 border-white" />
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 px-3 py-2 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
              <span className="text-sm font-bold text-primary-700">
                最终预测：{['Setosa 🌸', 'Versicolor 🌼', 'Virginica 🌺'][sample.pred]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-400 text-center">
        💡 提示：调整最大深度观察树结构的变化。深度越大，树越复杂，越容易过拟合。
      </div>
    </div>
  );
}
