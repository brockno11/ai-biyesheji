import { useState, useMemo } from 'react';
import type { Algorithm } from '../types';
import AIVisualizationInsight from './AIVisualizationInsight';

const CG = '#10b981'; // Setosa 绿
const CB = '#6366f1'; // Versicolor 靛蓝
const CP = '#a855f7'; // Virginica 紫
const PATH = '#f97316'; // 当前路径 橙
const DIM = '#d1d5db';
const classNames = ['Setosa', 'Versicolor', 'Virginica'];
const classColors = [CG, CB, CP];
const classBg = ['#d1fae5', '#e0e7ff', '#f3e8ff'];

interface TNode { id: string; label: string; feature?: string; threshold?: number;
  isLeaf: boolean; classIdx?: number; samples: number; value: number[]; left?: TNode; right?: TNode }

/* ── 构建完整树（depth ≤ 3），再 prune ── */
function buildFullTree(): TNode {
  return {
    id: 'n0', label: '花瓣长度 ≤ 2.45 cm', feature: '花瓣长度', threshold: 2.45, isLeaf: false,
    samples: 150, value: [50, 50, 50],
    left: { id: 'n0L', label: 'Setosa', isLeaf: true, classIdx: 0, samples: 50, value: [50, 0, 0] },
    right: {
      id: 'n0R', label: '花瓣宽度 ≤ 1.75 cm', feature: '花瓣宽度', threshold: 1.75, isLeaf: false,
      samples: 100, value: [0, 50, 50],
      left: {
        id: 'n1L', label: '花瓣长度 ≤ 4.95 cm', feature: '花瓣长度', threshold: 4.95, isLeaf: false,
        samples: 54, value: [0, 49, 5],
        left: { id: 'n2LL', label: 'Versicolor', isLeaf: true, classIdx: 1, samples: 47, value: [0, 47, 0] },
        right: { id: 'n2LR', label: 'Virginica', isLeaf: true, classIdx: 2, samples: 7, value: [0, 2, 5] },
      },
      right: {
        id: 'n1R', label: '花瓣宽度 ≤ 1.55 cm', feature: '花瓣宽度', threshold: 1.55, isLeaf: false,
        samples: 46, value: [0, 1, 45],
        left: { id: 'n2RL', label: 'Versicolor', isLeaf: true, classIdx: 1, samples: 3, value: [0, 2, 1] },
        right: { id: 'n2RR', label: 'Virginica', isLeaf: true, classIdx: 2, samples: 43, value: [0, 0, 43] },
      },
    },
  };
}

/* ── 剪枝：maxDepth=1 时，root 的直接 children 必须是叶子 ── */
function pruneTree(node: TNode, currentDepth: number, maxDepth: number): TNode {
  if (currentDepth >= maxDepth || node.isLeaf) {
    const majorityClass = node.value.indexOf(Math.max(...node.value));
    return { ...node, isLeaf: true, classIdx: majorityClass, label: classNames[majorityClass], left: undefined, right: undefined };
  }
  const cloned = { ...node };
  if (cloned.left) cloned.left = pruneTree(cloned.left, currentDepth + 1, maxDepth);
  if (cloned.right) cloned.right = pruneTree(cloned.right, currentDepth + 1, maxDepth);
  return cloned;
}

/* ── 路径追踪 ── */
function tracePath(node: TNode, pl: number, pw: number): { nodes: string[]; edges: string[]; steps: string[]; pred: number } {
  const ns: string[] = [], es: string[] = [], ss: string[] = [];
  let cur = node;
  while (cur) {
    ns.push(cur.id);
    if (cur.isLeaf) { ss.push(`到达叶子节点 → 预测: ${classNames[cur.classIdx!]}`); return { nodes: ns, edges: es, steps: ss, pred: cur.classIdx! }; }
    const v = cur.feature === '花瓣长度' ? pl : pw;
    if (v <= cur.threshold!) {
      ss.push(`${cur.feature} = ${v} ≤ ${cur.threshold} → 走左侧（是）`);
      es.push(`${cur.id}->${cur.left!.id}`);
      cur = cur.left!;
    } else {
      ss.push(`${cur.feature} = ${v} > ${cur.threshold} → 走右侧（否）`);
      es.push(`${cur.id}->${cur.right!.id}`);
      cur = cur.right!;
    }
  }
  return { nodes: ns, edges: es, steps: ss, pred: 0 };
}

function countLeaves(n: TNode): number { return n.isLeaf ? 1 : (n.left?countLeaves(n.left):0)+(n.right?countLeaves(n.right):0); }

/* ── 动态布局算法 ── */
interface Layout { x: number; y: number; node: TNode }
function computeLayout(tree: TNode): { layouts: Map<string, Layout>; svgW: number; svgH: number; maxD: number } {
  const leaves: TNode[] = [];
  function collect(n: TNode) { if (n.isLeaf) leaves.push(n); else { if (n.left) collect(n.left); if (n.right) collect(n.right); } }
  collect(tree);

  const leafGap = 56; const nodeW = 188; const levelH = 120;
  const totalLeafW = leaves.length * (nodeW) + (leaves.length - 1) * leafGap;
  const svgW = Math.max(520, totalLeafW + 80);

  // 叶子从左到右等距排列
  const leafPos = new Map<string, number>();
  leaves.forEach((l, i) => { leafPos.set(l.id, 60 + i * (nodeW + leafGap) + nodeW / 2); });

  // 自底向上：父节点 x = (左子 + 右子) / 2
  const layouts = new Map<string, Layout>();
  let maxD = 0;
  function assign(n: TNode, depth: number) {
    if (depth > maxD) maxD = depth;
    if (n.isLeaf) {
      const x = leafPos.get(n.id)!;
      layouts.set(n.id, { x, y: 36 + depth * levelH, node: n });
    } else {
      if (n.left) assign(n.left, depth + 1);
      if (n.right) assign(n.right, depth + 1);
      const lx = n.left ? layouts.get(n.left.id)!.x : 0;
      const rx = n.right ? layouts.get(n.right.id)!.x : 0;
      const x = (lx + rx) / 2;
      layouts.set(n.id, { x, y: 36 + depth * levelH, node: n });
    }
  }
  assign(tree, 0);
  const svgH = Math.max(300, 80 + (maxD + 1) * levelH + 40);
  return { layouts, svgW, svgH, maxD };
}

/* ══════════════════════════════════════════════════════════ */
export default function DecisionTreeViz({ algorithm }: { algorithm?: Algorithm }) {
  const [maxDepth, setMaxDepth] = useState(2);
  const [pl, setPl] = useState(4.5);
  const [pw, setPw] = useState(1.4);

  const fullTree = useMemo(() => buildFullTree(), []);
  const tree = useMemo(() => pruneTree(fullTree, 0, maxDepth), [fullTree, maxDepth]);
  const { nodes: pathNodeIds, edges: pathEdgeIds, steps, pred } = useMemo(() => tracePath(tree, pl, pw), [tree, pl, pw]);
  const pathNodeSet = new Set(pathNodeIds);
  const pathEdgeSet = new Set(pathEdgeIds);
  const leafCount = useMemo(() => countLeaves(tree), [tree]);
  const { layouts, svgW, svgH } = useMemo(() => computeLayout(tree), [tree]);

  const NODE_W = 184, NODE_H = 50;

  const depthInfo: Record<number, string> = { 1: '深度 1：模型非常简单，可能欠拟合', 2: '深度 2：能捕捉主要分类规则', 3: '深度 3：可以学习更细的边界' };
  const SAMPLES = [
    { label: '样本 1', pl: 1.2, pw: 0.3 },
    { label: '样本 2', pl: 4.5, pw: 1.4 },
    { label: '样本 3', pl: 5.8, pw: 2.2 },
  ];

  /* ── 渲染递归 ── */
  function renderNode(n: TNode): React.ReactNode {
    const lo = layouts.get(n.id)!;
    const inPath = pathNodeSet.has(n.id);
    const isPredLeaf = inPath && n.isLeaf;
    const bg = n.isLeaf ? classBg[n.classIdx!] : inPath ? '#fff7ed' : '#f8fafc';
    const border = isPredLeaf ? PATH : n.isLeaf ? classColors[n.classIdx!] : inPath ? PATH : '#e2e8f0';
    const borderW = isPredLeaf ? 3 : inPath && !n.isLeaf ? 2 : 1;
    const opacity = inPath || n.isLeaf ? 1 : 0.5;

    return (
      <g key={n.id}>
        {/* 子节点连线 */}
        {!n.isLeaf && n.left && (
          <g>
            <line x1={lo.x} y1={lo.y + NODE_H/2} x2={layouts.get(n.left.id)!.x} y2={layouts.get(n.left.id)!.y - NODE_H/2}
              stroke={pathEdgeSet.has(`${n.id}->${n.left.id}`) ? PATH : DIM}
              strokeWidth={pathEdgeSet.has(`${n.id}->${n.left.id}`) ? 2.5 : 1.2} opacity={pathEdgeSet.has(`${n.id}->${n.left.id}`) ? 1 : 0.4}/>
            <rect x={(lo.x + layouts.get(n.left.id)!.x)/2 - 15} y={(lo.y+NODE_H/2 + layouts.get(n.left.id)!.y-NODE_H/2)/2 - 10}
              width={30} height={20} rx={4} fill="white" opacity={0.92}/>
            <text x={(lo.x + layouts.get(n.left.id)!.x)/2} y={(lo.y+NODE_H/2 + layouts.get(n.left.id)!.y-NODE_H/2)/2 + 5}
              textAnchor="middle" fill="#059669" fontSize={11} fontWeight={700}>是</text>
          </g>
        )}
        {!n.isLeaf && n.right && (
          <g>
            <line x1={lo.x} y1={lo.y + NODE_H/2} x2={layouts.get(n.right.id)!.x} y2={layouts.get(n.right.id)!.y - NODE_H/2}
              stroke={pathEdgeSet.has(`${n.id}->${n.right.id}`) ? PATH : DIM}
              strokeWidth={pathEdgeSet.has(`${n.id}->${n.right.id}`) ? 2.5 : 1.2} opacity={pathEdgeSet.has(`${n.id}->${n.right.id}`) ? 1 : 0.4}/>
            <rect x={(lo.x + layouts.get(n.right.id)!.x)/2 - 15} y={(lo.y+NODE_H/2 + layouts.get(n.right.id)!.y-NODE_H/2)/2 - 10}
              width={30} height={20} rx={4} fill="white" opacity={0.92}/>
            <text x={(lo.x + layouts.get(n.right.id)!.x)/2} y={(lo.y+NODE_H/2 + layouts.get(n.right.id)!.y-NODE_H/2)/2 + 5}
              textAnchor="middle" fill="#dc2626" fontSize={11} fontWeight={700}>否</text>
          </g>
        )}

        {/* 节点卡片 */}
        <rect x={lo.x - NODE_W/2} y={lo.y - NODE_H/2} width={NODE_W} height={NODE_H} rx={10}
          fill={bg} stroke={border} strokeWidth={borderW} opacity={opacity}
          filter={isPredLeaf ? 'url(#glow)' : undefined} />
        {n.isLeaf ? (
          <>
            <text x={lo.x} y={lo.y - 3} textAnchor="middle" fill={classColors[n.classIdx!]} fontSize={14} fontWeight={800}>{n.label}</text>
            <text x={lo.x} y={lo.y + 16} textAnchor="middle" fill={inPath ? '#64748b' : '#94a3b8'} fontSize={10}>
              叶子节点 · 样本数 {n.samples}
            </text>
          </>
        ) : (
          <>
            <text x={lo.x} y={lo.y - 7} textAnchor="middle" fill={inPath ? '#9a3412' : '#334155'} fontSize={12} fontWeight={700}>{n.label}</text>
            <text x={lo.x} y={lo.y + 11} textAnchor="middle" fill={inPath ? '#c2410c' : '#64748b'} fontSize={10}>
              {n.id === 'n0' ? '根节点' : '内部节点'} · 样本数 {n.samples}
            </text>
            <text x={lo.x} y={lo.y + 24} textAnchor="middle" fill={inPath ? '#c2410c' : '#94a3b8'} fontSize={9}>
              [{classNames[n.value.indexOf(Math.max(...n.value))]} 居多]
            </text>
          </>
        )}
      </g>
    );
  }

  function renderAll(n: TNode): React.ReactNode[] {
    const el = [renderNode(n)];
    if (!n.isLeaf) { if (n.left) el.push(...renderAll(n.left)); if (n.right) el.push(...renderAll(n.right)); }
    return el;
  }

  return (
    <div className="space-y-5">
      {/* 控制区 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between mb-1"><label className="text-xs text-gray-500">最大深度</label><span className="text-sm font-bold text-primary-600">{maxDepth}</span></div>
            <input type="range" min={1} max={3} value={maxDepth} onChange={e => setMaxDepth(Number(e.target.value))} className="w-full accent-primary-500"/>
            <p className="text-[10px] text-gray-400 mt-1">{depthInfo[maxDepth]}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">样本选择</label>
            <div className="grid grid-cols-3 gap-1.5">
              {SAMPLES.map((s, i) => (
                <button key={i} onClick={() => { setPl(s.pl); setPw(s.pw); }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all text-center ${
                    pl === s.pl && pw === s.pw ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>样本 {i+1}<br/>{s.pl}/{s.pw} cm</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div><div className="flex justify-between"><label className="text-[11px] text-gray-500">花瓣长度 (cm)</label><span className="text-xs font-mono">{pl.toFixed(1)}</span></div>
              <input type="range" min={0.5} max={7} step={0.1} value={pl} onChange={e => setPl(Number(e.target.value))} className="w-full accent-blue-500"/></div>
            <div><div className="flex justify-between"><label className="text-[11px] text-gray-500">花瓣宽度 (cm)</label><span className="text-xs font-mono">{pw.toFixed(1)}</span></div>
              <input type="range" min={0.1} max={3} step={0.1} value={pw} onChange={e => setPw(Number(e.target.value))} className="w-full accent-blue-500"/></div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-gray-400">
          <span>最大深度: <b className="text-gray-600">{maxDepth}</b></span>
          <span>叶子数: <b className="text-gray-600">{leafCount}</b></span>
          <span>预测: <b style={{color: classColors[pred]}}>{classNames[pred]}</b></span>
        </div>
      </div>

      {/* 树图 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-4 mb-3 text-[10px] px-2 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:CG}}/> Setosa</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:CB}}/> Versicolor</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:CP}}/> Virginica</span>
          <span className="w-3 border-t-2 border-dashed border-gray-300"/>
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 rounded" style={{background:PATH,height:3}}/> 当前路径</span>
          <span className="text-gray-400">花瓣长{pl.toFixed(1)}cm 宽{pw.toFixed(1)}cm → <b style={{color:classColors[pred]}}>{classNames[pred]}</b></span>
        </div>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{minWidth: svgW, maxWidth: 720}}>
          <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          {renderAll(tree)}
        </svg>
      </div>

      {/* 路径追踪 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h4 className="text-sm font-bold text-gray-800 mb-3">样本分类路径追踪</h4>
        <div className="flex items-start gap-4">
          <div className="bg-orange-50 rounded-xl px-4 py-2.5 flex-shrink-0 border border-orange-200">
            <div className="text-xs text-gray-500">测试样本</div>
            <div className="text-sm font-mono font-medium text-gray-800">花瓣长 {pl.toFixed(1)} cm, 宽 {pw.toFixed(1)} cm</div>
          </div>
          <div className="flex-1 relative pl-6 border-l-2 border-orange-200 space-y-2.5">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-orange-400 border-2 border-white"/>
                <p className="text-sm text-gray-700">{s}</p>
              </div>
            ))}
            <div className="mt-3 px-4 py-2.5 rounded-xl" style={{background: classBg[pred], border: `2px solid ${classColors[pred]}`}}>
              <span className="text-sm font-bold" style={{color: classColors[pred]}}>最终预测：{classNames[pred]}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-gray-400 text-center">
        最大深度越大，决策树越复杂，能够拟合更多训练样本，但也更容易过拟合。
      </div>

      <AIVisualizationInsight algorithm={algorithm} visualState={{ maxDepth, leafCount, pl: Number(pl.toFixed(1)), pw: Number(pw.toFixed(1)), prediction: classNames[pred] }}/>
    </div>
  );
}
