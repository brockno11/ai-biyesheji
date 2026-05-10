import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Layers,
  Target, Hash, Tag, Users,
  ChevronRight, Database, Code2, Cpu, BarChart3, Brain,
} from 'lucide-react';

/* ── Mini SVG helpers ─────────────────────────────────────────────── */

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

/* ── 1. AI/ML/DL Nesting Diagram ──────────────────────────────────── */

export function AIMLDLNestingDiagram() {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Outer ring: AI */}
      <div className="w-full max-w-xs rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200/60 border-2 border-rose-300 p-5 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold mb-2">AI 人工智能</span>
        <p className="text-xs text-rose-800 leading-relaxed">让机器表现出智能的宏大目标</p>
        <p className="text-[11px] text-rose-600 mt-1 italic">例：Siri听懂指令、AlphaGo下棋</p>
        {/* Inner ring: ML */}
        <div className="mt-3 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200/60 border-2 border-amber-300 p-4">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold mb-1">ML 机器学习</span>
          <p className="text-xs text-amber-800 leading-relaxed">从数据中自动学习规律的方法</p>
          <p className="text-[11px] text-amber-600 mt-0.5 italic">例：房价预测、垃圾邮件识别</p>
          {/* Innermost: DL */}
          <div className="mt-3 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200/60 border-2 border-violet-300 p-3">
            <span className="inline-block px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-bold mb-1">DL 深度学习</span>
            <p className="text-xs text-violet-800 leading-relaxed">使用深层神经网络的ML分支</p>
            <p className="text-[11px] text-violet-600 mt-0.5 italic">例：人脸识别、ChatGPT、语音识别</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400">AI ⊃ ML ⊃ DL — 就像俄罗斯套娃，一层套一层</p>
    </div>
  );
}

/* ── 2. Task Type Comparison Diagram ───────────────────────────────── */

export function TaskTypeComparisonDiagram() {
  const tasks = [
    {
      icon: Hash, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', border: 'border-cyan-200',
      title: '回归 Regression',
      output: '连续数值',
      question: '"多少？"',
      examples: ['房价 350万', '温度 28.5°C', '销量 1234件'],
      algo: '线性回归',
    },
    {
      icon: Tag, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', border: 'border-emerald-200',
      title: '分类 Classification',
      output: '离散类别',
      question: '"是不是？"',
      examples: ['垃圾邮件？是/否', '疾病类型 A/B/C', '数字识别 0-9'],
      algo: 'KNN / 逻辑回归 / 决策树',
    },
    {
      icon: Users, color: 'from-purple-500 to-fuchsia-500', bg: 'bg-purple-50', border: 'border-purple-200',
      title: '聚类 Clustering',
      output: '自动分组',
      question: '"怎么分？"',
      examples: ['顾客分群', '新闻话题聚合', '基因模式发现'],
      algo: 'K-Means',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4">
      {tasks.map((t) => (
        <div key={t.title} className={`rounded-xl border ${t.border} ${t.bg} p-4 text-center`}>
          <span className={`inline-flex w-9 h-9 rounded-xl bg-gradient-to-br ${t.color} items-center justify-center text-white mb-2`}>
            <t.icon className="w-4 h-4" />
          </span>
          <h4 className="text-sm font-extrabold text-slate-800 mb-1">{t.title}</h4>
          <span className="inline-block px-2 py-0.5 rounded-full bg-white/70 text-[11px] font-semibold text-slate-600 mb-2">
            输出：{t.output}
          </span>
          <p className="text-xs text-slate-500 mb-2">问的是{t.question}</p>
          <div className="space-y-0.5 mb-2">
            {t.examples.map((e) => (
              <p key={e} className="text-[11px] text-slate-600">• {e}</p>
            ))}
          </div>
          <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
            {t.algo}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── 3. ML Workflow Stepper ────────────────────────────────────────── */

export function MLWorkflowStepper() {
  const steps = [
    { label: '确定目标', icon: Target, desc: '回归/分类/聚类？' },
    { label: '收集数据', icon: Database, desc: 'CSV/API/数据库' },
    { label: '数据清洗', icon: Code2, desc: '处理缺失值/异常值' },
    { label: '特征工程', icon: BarChart3, desc: '选择/构造特征' },
    { label: '划分数据', icon: Layers, desc: '训练集+测试集' },
    { label: '选择模型', icon: Brain, desc: '回归→线性回归 等' },
    { label: '训练模型', icon: Cpu, desc: 'model.fit()' },
    { label: '预测评估', icon: Target, desc: 'predict+score' },
    { label: '调参优化', icon: ChevronRight, desc: '改进→回到第6步' },
  ];

  return (
    <div className="py-4">
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 border border-primary-200 flex items-center justify-center mb-1">
              <s.icon className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">{s.label}</span>
            <span className="text-[9px] text-slate-400 leading-tight">{s.desc}</span>
            {i < steps.length - 1 && (
              <div className="hidden md:block text-slate-300 text-xs mt-[-4px]">↓</div>
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 text-center mt-3">数据质量决定了模型质量的上限 — 70%时间花在数据准备上</p>
    </div>
  );
}

/* ── 4. Data → X/y Diagram ────────────────────────────────────────── */

export function DataToXYDiagram() {
  return (
    <div className="py-4 space-y-4">
      {/* Source table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">原始数据 (DataFrame)</div>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-3 py-1.5 text-left text-slate-500 font-medium">面积(m²)</th>
              <th className="px-3 py-1.5 text-left text-slate-500 font-medium">房间数</th>
              <th className="px-3 py-1.5 text-left text-slate-500 font-medium">地段</th>
              <th className="px-3 py-1.5 text-left text-slate-500 font-medium bg-amber-50">房价(万)</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            <tr className="border-b border-slate-50"><td className="px-3 py-1">120</td><td className="px-3 py-1">3</td><td className="px-3 py-1">A</td><td className="px-3 py-1 bg-amber-50 font-semibold">350</td></tr>
            <tr className="border-b border-slate-50"><td className="px-3 py-1">85</td><td className="px-3 py-1">2</td><td className="px-3 py-1">B</td><td className="px-3 py-1 bg-amber-50 font-semibold">220</td></tr>
            <tr><td className="px-3 py-1">150</td><td className="px-3 py-1">4</td><td className="px-3 py-1">A</td><td className="px-3 py-1 bg-amber-50 font-semibold">480</td></tr>
          </tbody>
        </table>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <ArrowRightIcon className="w-6 h-6 text-primary-400 rotate-90" />
      </div>

      {/* Split result */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3 text-center">
          <span className="text-xs font-bold text-blue-700">X (特征矩阵)</span>
          <p className="text-[10px] text-blue-600 mt-0.5">shape = (n, 3)</p>
          <p className="text-[10px] text-blue-500 leading-relaxed mt-1">
            X = df[[&quot;面积&quot;, &quot;房间数&quot;, &quot;地段&quot;]]<br />
            双层方括号 → 二维
          </p>
        </div>
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 text-center">
          <span className="text-xs font-bold text-amber-700">y (标签向量)</span>
          <p className="text-[10px] text-amber-600 mt-0.5">shape = (n,)</p>
          <p className="text-[10px] text-amber-500 leading-relaxed mt-1">
            y = df[&quot;房价&quot;]<br />
            单层方括号 → 一维
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── 5. Train/Test Split Diagram ──────────────────────────────────── */

export function TrainTestSplitDiagram() {
  return (
    <div className="py-4">
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        {/* Full data bar */}
        <div className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border-b border-slate-100">
          100 条原始数据
        </div>
        <div className="h-8 flex">
          <div className="h-full bg-blue-400 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: '80%' }}>
            训练集 80 条 (80%)
          </div>
          <div className="h-full bg-amber-400 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: '20%' }}>
            测试集 20 条 (20%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
          <h4 className="text-xs font-bold text-blue-700 mb-1">训练集 → model.fit()</h4>
          <p className="text-[11px] text-blue-600 leading-relaxed">
            像平时练习题（带答案）<br />
            用来让模型学习规律
          </p>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
          <h4 className="text-xs font-bold text-amber-700 mb-1">测试集 → model.score()</h4>
          <p className="text-[11px] text-amber-600 leading-relaxed">
            像期末考试（新题）<br />
            用来检验模型真实水平
          </p>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-red-50 border border-red-100 p-2 text-center">
        <p className="text-[10px] text-red-600 font-semibold">训练集和测试集绝不能有重叠 — 那等于用同一张卷子又当练习又当考试！</p>
      </div>
    </div>
  );
}

/* ── 6. Fit / Predict / Evaluate Diagram ───────────────────────────── */

export function FitPredictEvaluateDiagram() {
  return (
    <div className="py-4">
      <div className="grid grid-cols-3 gap-2">
        {/* Step 1: Fit */}
        <div className="rounded-xl bg-gradient-to-b from-blue-50 to-blue-100/50 border border-blue-200 p-3 text-center">
          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold mb-2">1. fit()</span>
          <div className="text-[10px] text-blue-700 leading-relaxed">
            <p className="font-semibold mb-0.5">训练数据 → 模型</p>
            <p className="text-blue-500">model.fit(</p>
            <p className="text-blue-500">  X_train,</p>
            <p className="text-blue-500">  y_train</p>
            <p className="text-blue-500">)</p>
          </div>
          <p className="text-[9px] text-blue-500 mt-1.5">学生做练习题学方法</p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <ArrowRightIcon className="w-5 h-5 text-slate-300" />
        </div>

        {/* Step 2: Predict */}
        <div className="rounded-xl bg-gradient-to-b from-green-50 to-green-100/50 border border-green-200 p-3 text-center">
          <span className="inline-block px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold mb-2">2. predict()</span>
          <div className="text-[10px] text-green-700 leading-relaxed">
            <p className="font-semibold mb-0.5">新数据 → 预测结果</p>
            <p className="text-green-500">y_pred = model.</p>
            <p className="text-green-500">  predict(</p>
            <p className="text-green-500">  X_test</p>
            <p className="text-green-500">)</p>
          </div>
          <p className="text-[9px] text-green-500 mt-1.5">学生用方法做新题</p>
        </div>

        {/* Separator row for step 3 */}
        <div className="col-span-3 flex items-center justify-center">
          <ArrowRightIcon className="w-5 h-5 text-slate-300 rotate-90" />
        </div>

        {/* Step 3: Score */}
        <div className="col-span-3 rounded-xl bg-gradient-to-b from-amber-50 to-amber-100/50 border border-amber-200 p-3 text-center">
          <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold mb-2">3. score() / metrics</span>
          <div className="text-[10px] text-amber-700 leading-relaxed">
            <p>预测结果 y_pred + 正确答案 y_test</p>
            <p className="font-semibold mt-0.5">→ accuracy_score(y_test, y_pred)</p>
            <p>→ mean_squared_error(y_test, y_pred)</p>
          </div>
          <p className="text-[9px] text-amber-500 mt-1.5">老师批改打分，看学生学会了没</p>
        </div>
      </div>
    </div>
  );
}

/* ── 7. sklearn Unified API Diagram ────────────────────────────────── */

export function SklearnAPIPatternDiagram() {
  const models = [
    { name: 'LinearRegression', icon: '📈', color: 'bg-blue-50 border-blue-200' },
    { name: 'KNeighborsClassifier', icon: '🎯', color: 'bg-green-50 border-green-200' },
    { name: 'DecisionTreeClassifier', icon: '🌳', color: 'bg-emerald-50 border-emerald-200' },
    { name: 'LogisticRegression', icon: '📊', color: 'bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="py-4 space-y-3">
      <p className="text-xs text-slate-500 text-center">四个不同模型，相同用法：</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {models.map((m) => (
          <div key={m.name} className={`rounded-xl border ${m.color} p-2 text-center`}>
            <span className="text-lg">{m.icon}</span>
            <p className="text-[10px] font-semibold text-slate-700 mt-0.5">{m.name}</p>
          </div>
        ))}
      </div>

      {/* Common API bar */}
      <div className="rounded-xl bg-gradient-to-r from-primary-50 to-violet-50 border border-primary-200 p-3">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['创建对象', '.fit() 训练', '.predict() 预测', '.score() 评估'].map((step, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="px-2 py-1 rounded-lg bg-white border border-primary-200 text-[11px] font-semibold text-primary-700">{step}</span>
              {i < 3 && <span className="text-primary-300">→</span>}
            </span>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-slate-400 text-center">
        只换模型名，fit/predict/score 完全一样 — 学会一个 = 学会所有
      </p>
    </div>
  );
}

/* ── 8. Algorithm Map Diagram ──────────────────────────────────────── */

export function AlgorithmMapDiagram() {
  const map = [
    { task: '预测数值', icon: '📈', question: '房价？温度？销量？', algo: '线性回归', id: 'linear-regression' },
    { task: '判断类别', icon: '🏷️', question: '垃圾邮件？疾病？', algo: 'KNN / 逻辑回归 / 决策树', id: 'knn' },
    { task: '自动分组', icon: '🧩', question: '顾客分群？话题聚合？', algo: 'K-Means 聚类', id: 'k-means' },
    { task: '复杂决策', icon: '🌲', question: '多棵树投票？抗过拟合？', algo: '随机森林', id: 'random-forest' },
  ];

  return (
    <div className="py-4 space-y-2">
      {map.map((m) => (
        <div key={m.task} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-primary-200 transition-colors">
          <span className="text-2xl flex-shrink-0">{m.icon}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-extrabold text-slate-800">{m.task}</h4>
            <p className="text-[11px] text-slate-500">{m.question}</p>
          </div>
          <ArrowRightIcon className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <span className="px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100 flex-shrink-0">
            {m.algo}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── 9. Overfitting / Underfitting 3-Card Diagram ──────────────────── */

export function OverfittingDiagram() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4">
      <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 text-center">
        <span className="inline-block px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold mb-2">欠拟合</span>
        <p className="text-xs font-bold text-red-700 mb-1">Underfitting</p>
        <p className="text-[11px] text-red-600 leading-relaxed">模型太简单<br />训练集表现差<br />测试集表现也差</p>
        <p className="text-[10px] text-red-500 mt-2 italic">"连课后题都做不对"</p>
      </div>
      <div className="rounded-xl bg-green-50 border-2 border-green-300 p-4 text-center ring-2 ring-green-200 ring-offset-1">
        <span className="inline-block px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold mb-2">刚刚好</span>
        <p className="text-xs font-bold text-green-700 mb-1">Good Fit</p>
        <p className="text-[11px] text-green-600 leading-relaxed">复杂度适中<br />训练集表现好<br />测试集表现也好</p>
        <p className="text-[10px] text-green-500 mt-2 italic">"会做题也会应变"</p>
      </div>
      <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 text-center">
        <span className="inline-block px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold mb-2">过拟合</span>
        <p className="text-xs font-bold text-red-700 mb-1">Overfitting</p>
        <p className="text-[11px] text-red-600 leading-relaxed">模型太复杂<br />训练集接近满分<br />测试集表现差</p>
        <p className="text-[10px] text-red-500 mt-2 italic">"背答案但不会做新题"</p>
      </div>
    </div>
  );
}

/* ── 10. Algorithm Intuition Diagrams ──────────────────────────────── */

export function LinearRegressionIntuition() {
  /* ── 确定性模拟数据 ── */
  const points = useMemo(() => {
    const offsets = [0.8,-1.2,2.1,-0.5,1.5,-2.0,0.3,-1.7,2.5,-0.1,1.1,-1.9,0.6,-2.3,1.8,-0.9,2.3,-1.4,0.2,-2.1,1.6,-0.7,2.0,-1.1,0.9,-1.5,1.3,-2.5,0.5,-1.8];
    const result: { x: number; y: number }[] = [];
    for (let i = 0; i < 30; i++) {
      result.push({ x: 0.3 + (i / 29) * 9.4, y: 2.5 * (0.3 + (i / 29) * 9.4) + 3 + offsets[i] });
    }
    return result;
  }, []);

  /* ── 最小二乘法 ── */
  const { w, b, fittedLine, residuals, chartOption } = useMemo(() => {
    const n = points.length;
    let sx = 0, sy = 0, sxy = 0, sx2 = 0;
    for (const p of points) { sx += p.x; sy += p.y; sxy += p.x * p.y; sx2 += p.x * p.x; }
    const wLS = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
    const bLS = (sy - wLS * sx) / n;

    // 拟合直线两端点
    const fl: [number, number][] = [[0, wLS * 0 + bLS], [10, wLS * 10 + bLS]];

    // 3 个代表性残差（左中右）
    const idxs = [7, 15, 24];
    const res = idxs.map(i => {
      const p = points[i];
      const yPred = wLS * p.x + bLS;
      return { x: p.x, dataY: p.y, fitY: yPred, residual: p.y - yPred };
    });

    // ECharts option
    const option = {
      backgroundColor: 'transparent',
      title: {
        text: `y = ${wLS.toFixed(3)}x + ${bLS.toFixed(3)}`,
        subtext: `最小二乘法拟合  ·  R² = ${(() => { const ym = sy/n; const ssr = points.reduce((s,p)=>s+(p.y-(wLS*p.x+bLS))**2,0); const sst = points.reduce((s,p)=>s+(p.y-ym)**2,0); return sst>0 ? (1-ssr/sst).toFixed(3) : '0'; })()}`,
        left: 'center',
        top: 2,
        textStyle: { fontSize: 14, fontWeight: 700, color: '#1e293b' },
        subtextStyle: { fontSize: 11, color: '#94a3b8' },
      },
      legend: {
        data: ['真实数据点', '拟合直线', '残差'],
        bottom: 8,
        itemWidth: 18,
        itemHeight: 10,
        textStyle: { fontSize: 11, color: '#64748b' },
      },
      grid: { left: 52, right: 28, top: 56, bottom: 46 },
      xAxis: {
        name: '特征 X',
        nameLocation: 'center',
        nameGap: 26,
        nameTextStyle: { fontSize: 11, color: '#94a3b8' },
        min: -0.2, max: 10.2,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisTick: { show: false },
        axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
      },
      yAxis: {
        name: '目标 Y',
        nameLocation: 'center',
        nameGap: 36,
        nameTextStyle: { fontSize: 11, color: '#94a3b8' },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 10, color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
      },
      series: [
        // 残差线（3 条橙色虚线）
        ...res.map((r, i) => ({
          name: i === 0 ? '残差' : '',
          type: 'line' as const,
          data: [[r.x, r.dataY], [r.x, r.fitY]],
          lineStyle: { color: '#f97316', width: 2.5, type: 'dashed' as const },
          symbol: 'none' as const,
          silent: true,
          z: 1,
        })),
        // 残差标签（不可见散点 + 标签）
        ...res.map((r) => ({
          type: 'scatter' as const,
          data: [[r.x, (r.dataY + r.fitY) / 2]],
          symbolSize: 1,
          symbol: 'circle' as const,
          itemStyle: { opacity: 0 },
          silent: true,
          z: 6,
          label: {
            show: true,
            formatter: `残差 ${r.residual>0?'+':''}${r.residual.toFixed(2)}`,
            position: r.residual > 0 ? 'right' as const : 'left' as const,
            distance: 8,
            fontSize: 10,
            color: '#ea580c',
            fontWeight: 700,
            backgroundColor: 'rgba(255,255,255,0.88)',
            padding: [2, 5],
            borderRadius: 4,
          },
        })),
        // 拟合直线
        {
          name: '拟合直线',
          type: 'line' as const,
          data: fl,
          lineStyle: { color: '#ef4444', width: 2.5 },
          symbol: 'none' as const,
          z: 2,
        },
        // 数据点
        {
          name: '真实数据点',
          type: 'scatter' as const,
          data: points.map(p => [p.x, p.y]),
          symbolSize: 8,
          itemStyle: { color: '#3b82f6', borderColor: '#fff', borderWidth: 1.5, opacity: 0.85 },
          z: 4,
        },
        // 被标注残差的点高亮
        {
          type: 'scatter' as const,
          data: idxs.map(i => [points[i].x, points[i].y]),
          symbolSize: 11,
          symbol: 'circle' as const,
          itemStyle: { color: 'transparent', borderColor: '#f97316', borderWidth: 2.5, borderType: 'solid' as const },
          silent: true,
          z: 5,
        },
      ],
    };

    return { w: wLS, b: bLS, fittedLine: fl, residuals: res, chartOption: option };
  }, [points]);

  return (
    <div className="py-2">
      <ReactECharts
        option={chartOption}
        style={{ height: 320 }}
        opts={{ renderer: 'svg' }}
        notMerge={true}
      />
      <p className="mt-3 text-xs text-slate-500 text-center leading-relaxed">
        线性回归通过最小化所有样本点到直线的<strong className="text-slate-700">残差平方和</strong>，
        找到最优的 w 和 b。
        w = <strong className="text-red-500">{w.toFixed(3)}</strong>（斜率/权重），
        b = <strong className="text-red-500">{b.toFixed(3)}</strong>（截距/偏置）。
        橙色虚线展示 3 个代表性<strong className="text-amber-600">残差</strong>（点到直线的垂直距离）。
      </p>
    </div>
  );
}

export function KNNIntuition() {
  /* ── 预定义数据点（保证每次渲染一致）── */
  const class0 = [ {x:1.2,y:1.5},{x:2.0,y:1.2},{x:1.5,y:2.3},{x:2.3,y:1.9},{x:1.8,y:2.8},{x:1.0,y:1.9},{x:2.6,y:1.5},{x:1.3,y:1.0} ];
  const class1 = [ {x:6.0,y:6.2},{x:6.8,y:5.8},{x:5.5,y:6.5},{x:6.3,y:7.0},{x:5.8,y:5.5},{x:7.0,y:6.6},{x:6.5,y:5.9},{x:5.3,y:6.0} ];
  const testP = { x: 3.8, y: 3.5 };
  const K = 3;

  // 计算距离 + 排序
  const allDist = [...class0.map(p=>({...p,label:0})), ...class1.map(p=>({...p,label:1}))]
    .map(p => ({ ...p, dist: Math.sqrt((p.x-testP.x)**2+(p.y-testP.y)**2) }));
  allDist.sort((a,b) => a.dist-b.dist);
  const topK = allDist.slice(0, K);
  const votes: Record<number,number> = {};
  topK.forEach(n=>{ votes[n.label]=(votes[n.label]||0)+1; });
  const pred = (votes[0]||0) >= (votes[1]||0) ? 0 : 1;
  const kthDist = topK[K-1]?.dist ?? 1;

  // 坐标映射
  const pad={l:50,t:36,r:24,b:50}; const W=480,H=280; const cw=W-pad.l-pad.r,ch=H-pad.t-pad.b;
  const toX=(v:number)=>pad.l+v/8*cw;
  const toY=(v:number)=>pad.t+(8-v)/8*ch;
  const tpx=toX(testP.x),tpy=toY(testP.y);
  // 半径在 x 方向的像素映射
  const rxPx = kthDist/8*cw;

  return (
    <div className="py-2">
      {/* 图例 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 text-[11px]">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/> 类别 0</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/> 类别 1</span>
        <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded-sm bg-red-500 border-2 border-white inline-block" style={{transform:'rotate(45deg)'}}/> 测试点</span>
        <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-slate-300 inline-block" style={{borderTop:'2px dashed #cbd5e1',height:0}}/> 连线</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{maxWidth:520}}>
        {/* 背景 */}
        <rect x={pad.l} y={pad.t} width={cw} height={ch} fill="#f8fafc" rx={6}/>
        <rect x={pad.l} y={pad.t} width={cw} height={ch} fill="none" stroke="#e2e8f0" strokeWidth={1} rx={6}/>
        {/* 网格 */}
        {[0,2,4,6,8].map(v=><line key={`gx${v}`} x1={toX(v)} y1={pad.t} x2={toX(v)} y2={pad.t+ch} stroke="#e2e8f0" strokeWidth={0.7} strokeDasharray="4,4"/>)}
        {[0,2,4,6,8].map(v=><line key={`gy${v}`} x1={pad.l} y1={toY(v)} x2={pad.l+cw} y2={toY(v)} stroke="#e2e8f0" strokeWidth={0.7} strokeDasharray="4,4"/>)}
        {/* 坐标轴 */}
        <line x1={pad.l} y1={pad.t+ch} x2={pad.l+cw} y2={pad.t+ch} stroke="#94a3b8" strokeWidth={1.5}/>
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t+ch} stroke="#94a3b8" strokeWidth={1.5}/>
        {[0,2,4,6,8].map(v=><text key={`xl${v}`} x={toX(v)} y={pad.t+ch+16} textAnchor="middle" fill="#94a3b8" fontSize={10}>{v}</text>)}
        {[0,2,4,6,8].map(v=><text key={`yl${v}`} x={pad.l-8} y={toY(v)+4} textAnchor="end" fill="#94a3b8" fontSize={10}>{v}</text>)}
        <text x={pad.l+cw/2} y={pad.t+ch+34} textAnchor="middle" fill="#64748b" fontSize={12} fontWeight={600}>特征 X₁</text>
        <text x={14} y={pad.t+ch/2} textAnchor="middle" fill="#64748b" fontSize={12} fontWeight={600} transform={`rotate(-90,14,${pad.t+ch/2})`}>特征 X₂</text>

        {/* 邻域范围由连线到各邻居的灰色虚线直观展示 */}
        <circle cx={tpx} cy={tpy} r={rxPx} fill="rgba(148,163,184,0.05)" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="6,3"/>

        {/* 类别 0 */}
        {class0.map((p,i)=><circle key={`c0${i}`} cx={toX(p.x)} cy={toY(p.y)} r={5} fill="#3b82f6" stroke="#fff" strokeWidth={1.5}/>)}
        {/* 类别 1 */}
        {class1.map((p,i)=><circle key={`c1${i}`} cx={toX(p.x)} cy={toY(p.y)} r={5} fill="#10b981" stroke="#fff" strokeWidth={1.5}/>)}

        {/* 到最近邻的连线 */}
        {topK.map((n,i)=><line key={`ln${i}`} x1={tpx} y1={tpy} x2={toX(n.x)} y2={toY(n.y)} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4,3"/>)}
        {/* 最近邻高亮 + 编号 */}
        {topK.map((n,i)=>{
          const nx=toX(n.x),ny=toY(n.y);
          return <g key={`hl${i}`}>
            <circle cx={nx} cy={ny} r={9} fill="none" stroke="#fff" strokeWidth={3}/>
            <circle cx={nx} cy={ny} r={9} fill="none" stroke={n.label===0?'#3b82f6':'#10b981'} strokeWidth={2} opacity={0.7}/>
            <text x={nx} y={ny+3.5} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={800}>{i+1}</text>
          </g>;
        })}

        {/* 测试点 */}
        <rect x={tpx-8} y={tpy-8} width={16} height={16} rx={3} fill="#ef4444" stroke="#fff" strokeWidth={2.5} transform={`rotate(45,${tpx},${tpy})`}/>
        <text x={tpx} y={tpy-14} textAnchor="middle" fill="#dc2626" fontSize={11} fontWeight={800}>测试点</text>
      </svg>

      {/* 投票说明 */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 text-center">
          <div className="text-[10px] text-blue-600 font-medium">类别 0</div>
          <div className="text-lg font-bold text-blue-700">{votes[0]||0} 票</div>
        </div>
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-2 text-center">
          <div className="text-[10px] text-emerald-600 font-medium">类别 1</div>
          <div className="text-lg font-bold text-emerald-700">{votes[1]||0} 票</div>
        </div>
        <div className={`rounded-lg border-2 p-2 text-center ${pred===0?'bg-blue-100 border-blue-400':'bg-emerald-100 border-emerald-400'}`}>
          <div className="text-[10px] text-gray-500 font-medium">预测结果</div>
          <div className={`text-lg font-bold ${pred===0?'text-blue-700':'text-emerald-700'}`}>类别 {pred}</div>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-slate-500 text-center leading-relaxed">
        KNN 找出离测试点最近的 <strong>K={K}</strong> 个邻居，按多数投票决定类别。
        蓝色（类别0）得 {votes[0]||0} 票{' > '}绿色（类别1）得 {votes[1]||0} 票 → 预测为<strong>类别 {pred}</strong>。
      </p>
    </div>
  );
}

export function LogisticRegressionIntuition() {
  // Sigmoid: σ(z)=1/(1+e^(-z))
  const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
  // SVG 坐标映射
  const W = 500, H = 280;
  const pad = { l: 54, t: 28, r: 30, b: 48 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const zMin = -6, zMax = 6;
  const toX = (z: number) => pad.l + ((z - zMin) / (zMax - zMin)) * cw;
  const toY = (v: number) => pad.t + ((1 - v) / 1) * ch; // v in [0,1]

  // 生成曲线点
  const curvePts: string[] = [];
  for (let z = zMin; z <= zMax; z += 0.05) {
    curvePts.push(`${toX(z).toFixed(1)},${toY(sigmoid(z)).toFixed(1)}`);
  }

  // 示例点
  const exNeg = { z: -2, p: sigmoid(-2) }; // ≈0.119
  const exPos = { z: 2, p: sigmoid(2) };   // ≈0.881

  return (
    <div className="py-2">
      {/* 图例 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 text-[11px]">
        <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 rounded bg-purple-500 inline-block" style={{height:2.5}}/> Sigmoid 曲线</span>
        <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 rounded bg-red-400 inline-block" style={{borderTop:'2px dashed #f87171',height:0}}/> 阈值线 y=0.5</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"/> 负类(z=-2)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/> 正类(z=+2)</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{maxWidth:540}}>
        {/* 背景 */}
        <rect x={pad.l} y={pad.t} width={cw} height={ch} fill="#faf5ff" rx={6}/>
        <rect x={pad.l} y={pad.t} width={cw} height={ch} fill="none" stroke="#e9d5ff" strokeWidth={1} rx={6}/>
        {/* 网格 */}
        {[-6,-4,-2,0,2,4,6].map(v=><line key={`gz${v}`} x1={toX(v)} y1={pad.t} x2={toX(v)} y2={pad.t+ch} stroke="#e9d5ff" strokeWidth={0.7} strokeDasharray="4,4"/>)}
        {[0,0.25,0.5,0.75,1].map(v=><line key={`gy${v}`} x1={pad.l} y1={toY(v)} x2={pad.l+cw} y2={toY(v)} stroke="#e9d5ff" strokeWidth={0.7} strokeDasharray="4,4"/>)}
        {/* 坐标轴 */}
        <line x1={pad.l} y1={pad.t+ch} x2={pad.l+cw} y2={pad.t+ch} stroke="#a78bfa" strokeWidth={1.5}/>
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t+ch} stroke="#a78bfa" strokeWidth={1.5}/>
        {/* X 刻度 */}
        {[-6,-4,-2,0,2,4,6].map(v=><text key={`xl${v}`} x={toX(v)} y={pad.t+ch+16} textAnchor="middle" fill="#7c3aed" fontSize={10}>{v}</text>)}
        <text x={pad.l+cw/2} y={pad.t+ch+34} textAnchor="middle" fill="#6b21a8" fontSize={12} fontWeight={600}>z（线性得分）</text>
        {/* Y 刻度 */}
        {[0,0.5,1].map(v=><text key={`yl${v}`} x={pad.l-8} y={toY(v)+4} textAnchor="end" fill="#7c3aed" fontSize={10}>{v}</text>)}
        <text x={14} y={pad.t+ch/2} textAnchor="middle" fill="#6b21a8" fontSize={12} fontWeight={600} transform={`rotate(-90,14,${pad.t+ch/2})`}>σ(z)</text>

        {/* Sigmoid 曲线 */}
        <polyline points={curvePts.join(' ')} fill="none" stroke="#8b5cf6" strokeWidth={2.8}/>

        {/* 阈值线 y=0.5 */}
        <line x1={pad.l} y1={toY(0.5)} x2={pad.l+cw} y2={toY(0.5)} stroke="#f87171" strokeWidth={1.8} strokeDasharray="7,3"/>
        {/* z=0 竖虚线 */}
        <line x1={toX(0)} y1={pad.t} x2={toX(0)} y2={pad.t+ch} stroke="#f87171" strokeWidth={1.2} strokeDasharray="4,4"/>
        {/* 标注：z=0 交点 */}
        <circle cx={toX(0)} cy={toY(0.5)} r={5.5} fill="#ef4444" stroke="#fff" strokeWidth={2}/>
        <text x={toX(0)+8} y={toY(0.5)-8} fill="#dc2626" fontSize={10} fontWeight={700}>z=0, σ=0.5</text>

        {/* 示例点 z=-2 */}
        <circle cx={toX(-2)} cy={toY(exNeg.p)} r={5.5} fill="#6366f1" stroke="#fff" strokeWidth={2}/>
        <line x1={toX(-2)} y1={toY(exNeg.p)} x2={toX(-2)} y2={pad.t+ch} stroke="#6366f1" strokeWidth={0.8} strokeDasharray="3,3" opacity={0.6}/>
        <line x1={pad.l} y1={toY(exNeg.p)} x2={toX(-2)} y2={toY(exNeg.p)} stroke="#6366f1" strokeWidth={0.8} strokeDasharray="3,3" opacity={0.6}/>
        <text x={toX(-2)} y={toY(exNeg.p)-10} textAnchor="middle" fill="#4f46e5" fontSize={10} fontWeight={700}>z=-2</text>
        <text x={toX(-2)+6} y={toY(exNeg.p)+16} fill="#6366f1" fontSize={9}>σ≈0.12</text>
        <text x={toX(-2)+6} y={toY(exNeg.p)+28} fill="#818cf8" fontSize={9}>→ 负类</text>

        {/* 示例点 z=+2 */}
        <circle cx={toX(2)} cy={toY(exPos.p)} r={5.5} fill="#f59e0b" stroke="#fff" strokeWidth={2}/>
        <line x1={toX(2)} y1={toY(exPos.p)} x2={toX(2)} y2={pad.t+ch} stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="3,3" opacity={0.6}/>
        <line x1={pad.l} y1={toY(exPos.p)} x2={toX(2)} y2={toY(exPos.p)} stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="3,3" opacity={0.6}/>
        <text x={toX(2)} y={toY(exPos.p)-10} textAnchor="middle" fill="#d97706" fontSize={10} fontWeight={700}>z=+2</text>
        <text x={toX(2)-6} y={toY(exPos.p)-16} textAnchor="end" fill="#d97706" fontSize={9}>σ≈0.88</text>
        <text x={toX(2)-6} y={toY(exPos.p)-28} textAnchor="end" fill="#f59e0b" fontSize={9}>正类 →</text>
      </svg>

      <p className="mt-3 text-xs text-slate-500 text-center leading-relaxed">
        线性得分 <strong>z</strong> 经过 <strong>Sigmoid 函数 σ(z)=1/(1+e⁻ᶻ)</strong> 被压缩为 0~1 之间的概率。
        z=0 时 σ=0.5，z→+∞ 时 σ→1，z→-∞ 时 σ→0。
      </p>
    </div>
  );
}

export function DecisionTreeIntuition() {
  const CG = '#10b981'; const CI = '#6366f1'; const CP = '#a855f7'; const PATH = '#f97316'; const DIM = '#d1d5db';
  const sample = { pl: 4.5, pw: 1.4 };
  const goRight = sample.pl > 2.45;   // true
  const goLeft2 = sample.pw <= 1.75;  // true
  // predicted: Versicolor

  const rootX = 260, rootY = 52, nodeW = 180, nodeH = 44;

  return (
    <div className="py-2">
      {/* 图例 + 样本信息 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-[11px]">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:CG}}/> Setosa</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:CI}}/> Versicolor</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:CP}}/> Virginica</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 rounded" style={{background:PATH,height:3}}/> 当前路径</span>
        <span className="ml-auto text-xs bg-orange-50 border border-orange-200 rounded-lg px-3 py-1 text-orange-700 font-medium">
          样本：花瓣长 {sample.pl} cm, 宽 {sample.pw} cm
        </span>
      </div>

      <svg viewBox="0 0 520 380" className="w-full" style={{maxWidth:560}}>
        {/* 连线 */}
        <line x1={rootX-55} y1={rootY+nodeH} x2={120} y2={180} stroke={goRight ? DIM : PATH} strokeWidth={goRight ? 1.5 : 3}/>
        <line x1={rootX+55} y1={rootY+nodeH} x2={340} y2={180} stroke={goRight ? PATH : DIM} strokeWidth={goRight ? 3 : 1.5}/>
        <line x1={300} y1={224} x2={195} y2={300} stroke={(goRight&&goLeft2) ? PATH : DIM} strokeWidth={(goRight&&goLeft2) ? 3 : 1.5}/>
        <line x1={380} y1={224} x2={350} y2={300} stroke={(goRight&&!goLeft2) ? PATH : DIM} strokeWidth={(goRight&&!goLeft2) ? 3 : 1.5}/>

        {/* 边标签 */}
        <rect x={147} y={122} width={28} height={18} rx={4} fill="white" opacity={0.9}/>
        <text x={161} y={135} textAnchor="middle" fill="#059669" fontSize={11} fontWeight={700}>是</text>
        <rect x={301} y={122} width={28} height={18} rx={4} fill="white" opacity={0.9}/>
        <text x={315} y={135} textAnchor="middle" fill="#dc2626" fontSize={11} fontWeight={700}>否</text>
        <rect x={227} y={258} width={28} height={18} rx={4} fill="white" opacity={0.9}/>
        <text x={241} y={271} textAnchor="middle" fill="#059669" fontSize={11} fontWeight={700}>是</text>
        <rect x={355} y={258} width={28} height={18} rx={4} fill="white" opacity={0.9}/>
        <text x={369} y={271} textAnchor="middle" fill="#dc2626" fontSize={11} fontWeight={700}>否</text>

        {/* 根节点 */}
        <rect x={rootX-nodeW/2} y={rootY} width={nodeW} height={nodeH} rx={10}
          fill={goRight?'#fff7ed':'#f8fafc'} stroke={goRight?PATH:'#e2e8f0'} strokeWidth={goRight?2.5:1}/>
        <text x={rootX} y={rootY+19} textAnchor="middle" fill={goRight?'#9a3412':'#334155'} fontSize={12} fontWeight={700}>花瓣长度 ≤ 2.45 cm？</text>
        <text x={rootX} y={rootY+33} textAnchor="middle" fill={goRight?'#c2410c':'#94a3b8'} fontSize={9}>根节点 · 样本数 150</text>

        {/* Setosa 叶子 */}
        <rect x={30} y={180} width={180} height={nodeH} rx={10}
          fill={goRight?'#d1fae5':'#dcfce7'} stroke={goRight?'#86efac':CG} strokeWidth={goRight?1:2} opacity={goRight?0.5:1}/>
        <text x={120} y={204} textAnchor="middle" fill="#047857" fontSize={13} fontWeight={800} opacity={goRight?0.5:1}>Setosa</text>
        <text x={120} y={218} textAnchor="middle" fill="#059669" fontSize={9} opacity={goRight?0.5:1}>叶子节点 · 样本数 50</text>

        {/* 内部节点 */}
        <rect x={240} y={180} width={200} height={nodeH} rx={10}
          fill={goRight?'#fff7ed':'#f1f5f9'} stroke={goRight?PATH:'#cbd5e1'} strokeWidth={goRight?2.5:1} opacity={goRight?1:0.45}/>
        <text x={340} y={203} textAnchor="middle" fill={goRight?'#9a3412':'#475569'} fontSize={11} fontWeight={700}>花瓣宽度 ≤ 1.75 cm？</text>
        <text x={340} y={217} textAnchor="middle" fill={goRight?'#c2410c':'#94a3b8'} fontSize={9}>内部节点 · 样本数 100</text>

        {/* Versicolor 叶子 */}
        <rect x={100} y={300} width={190} height={nodeH} rx={10}
          fill={(goRight&&goLeft2)?'#e0e7ff':'#f1f5f9'} stroke={(goRight&&goLeft2)?PATH:'#cbd5e1'} strokeWidth={(goRight&&goLeft2)?3:1} opacity={(goRight&&goLeft2)?1:0.4}/>
        <text x={195} y={322} textAnchor="middle" fill={CI} fontSize={13} fontWeight={800}>Versicolor</text>
        <text x={195} y={337} textAnchor="middle" fill={goRight&&goLeft2?'#64748b':'#94a3b8'} fontSize={9}>叶子节点 · 样本数 54</text>
        {(goRight&&goLeft2) && <text x={195} y={352} textAnchor="middle" fill={PATH} fontSize={10} fontWeight={700}>★ 当前预测</text>}

        {/* Virginica 叶子 */}
        <rect x={300} y={300} width={190} height={nodeH} rx={10}
          fill={(goRight&&!goLeft2)?'#f3e8ff':'#f1f5f9'} stroke={(goRight&&!goLeft2)?PATH:'#cbd5e1'} strokeWidth={(goRight&&!goLeft2)?3:1} opacity={(goRight&&!goLeft2)?1:0.4}/>
        <text x={395} y={322} textAnchor="middle" fill={CP} fontSize={13} fontWeight={800}>Virginica</text>
        <text x={395} y={337} textAnchor="middle" fill={goRight&&!goLeft2?'#64748b':'#94a3b8'} fontSize={9}>叶子节点 · 样本数 46</text>
        {(goRight&&!goLeft2) && <text x={395} y={352} textAnchor="middle" fill={PATH} fontSize={10} fontWeight={700}>★ 当前预测</text>}
      </svg>

      <div className="mt-3 rounded-lg bg-orange-50 border border-orange-200 p-2.5 text-center">
        <p className="text-xs text-orange-700">
          示例路径：{sample.pl} &gt; 2.45（否）→ {sample.pw} ≤ 1.75（是）→ 预测 <strong>Versicolor</strong>
        </p>
      </div>
      <p className="mt-2 text-[11px] text-slate-500 text-center leading-relaxed">
        决策树通过一系列是/否问题逐步缩小范围，最终到达叶子节点并输出预测类别。
      </p>
    </div>
  );
}

export function KMeansIntuition() {
  return (
    <div className="py-4">
      <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50/30 p-4">
        <div className="grid grid-cols-3 gap-2">
          {/* Step 1 */}
          <div className="text-center">
            <div className="relative h-20 rounded-lg bg-white border border-slate-200 mb-1">
              {[[15,60],[35,70],[25,30],[55,80],[75,40],[85,60]].map(([x,y],i) => (
                <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-slate-400" style={{left:`${x}%`,bottom:`${y}%`}} />
              ))}
              <div className="absolute w-2.5 h-2.5 rounded-full bg-red-400 border border-red-500" style={{left:'20%',bottom:'75%'}} />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-400 border border-blue-500" style={{left:'50%',bottom:'45%'}} />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-green-400 border border-green-500" style={{left:'80%',bottom:'65%'}} />
            </div>
            <span className="text-[9px] font-bold text-slate-600">① 随机选中心</span>
          </div>
          {/* Step 2 */}
          <div className="text-center">
            <div className="relative h-20 rounded-lg bg-white border border-slate-200 mb-1">
              {[[15,60],[35,70],[55,80]].map(([x,y],i) => (
                <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-red-300" style={{left:`${x}%`,bottom:`${y}%`}} />
              ))}
              {[[25,30],[75,40]].map(([x,y],i) => (
                <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-blue-300" style={{left:`${x}%`,bottom:`${y}%`}} />
              ))}
              {[[85,60]].map(([x,y],i) => (
                <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-green-300" style={{left:`${x}%`,bottom:`${y}%`}} />
              ))}
            </div>
            <span className="text-[9px] font-bold text-slate-600">② 分配到最近中心</span>
          </div>
          {/* Step 3 */}
          <div className="text-center">
            <div className="relative h-20 rounded-lg bg-white border border-green-300 mb-1">
              <div className="absolute w-2.5 h-2.5 rounded-full bg-red-500" style={{left:'22%',bottom:'60%'}} />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-500" style={{left:'48%',bottom:'38%'}} />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-green-500" style={{left:'82%',bottom:'62%'}} />
              <span className="absolute bottom-0 right-1 text-[8px] text-green-600">✓稳定</span>
            </div>
            <span className="text-[9px] font-bold text-slate-600">③ 更新中心位置</span>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">重复 ②③ 直到中心不再移动</p>
      </div>
    </div>
  );
}

export function RandomForestIntuition() {
  return (
    <div className="py-4">
      <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-4">
        <div className="space-y-2">
          {['🌳 树1', '🌲 树2', '🌴 树3'].map((label, i) => (
            <div key={i} className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
              <span className="text-xs font-bold text-slate-600 w-10 flex-shrink-0">{label}</span>
              <div className="flex gap-1 flex-1 justify-center">
                {i === 0 && <><span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-semibold text-blue-600">A ✅</span><span className="px-1.5 py-0.5 rounded bg-amber-50 text-[10px] text-amber-500">B</span><span className="px-1.5 py-0.5 rounded bg-green-50 text-[10px] text-green-500">C</span></>}
                {i === 1 && <><span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] text-blue-500">A</span><span className="px-1.5 py-0.5 rounded bg-amber-50 text-[10px] font-semibold text-amber-600">B ✅</span><span className="px-1.5 py-0.5 rounded bg-green-50 text-[10px] text-green-500">C</span></>}
                {i === 2 && <><span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-semibold text-blue-600">A ✅</span><span className="px-1.5 py-0.5 rounded bg-amber-50 text-[10px] text-amber-500">B</span><span className="px-1.5 py-0.5 rounded bg-green-50 text-[10px] text-green-500">C</span></>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-300 p-2 text-center">
          <span className="text-[10px] text-slate-500">投票汇总：</span>
          <span className="text-[11px] font-extrabold text-blue-700 ml-1">A 得 2 票</span>
          <span className="text-[10px] text-slate-400 mx-1">vs</span>
          <span className="text-[11px] text-amber-600">B 得 1 票</span>
          <span className="text-[10px] text-slate-400 mx-1">→</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">最终预测: A</span>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">树越多 → 投票越稳定 → 抗过拟合能力越强</p>
      </div>
    </div>
  );
}

/* ── Diagram type → component map ──────────────────────────────────── */

export const DIAGRAM_MAP: Record<string, React.ComponentType> = {
  'ai-ml-dl-nesting': AIMLDLNestingDiagram,
  'task-type-comparison': TaskTypeComparisonDiagram,
  'ml-workflow': MLWorkflowStepper,
  'data-to-xy': DataToXYDiagram,
  'train-test-split': TrainTestSplitDiagram,
  'fit-predict-evaluate': FitPredictEvaluateDiagram,
  'sklearn-api-pattern': SklearnAPIPatternDiagram,
  'algorithm-map': AlgorithmMapDiagram,
  'overfitting': OverfittingDiagram,
  'linear-regression-intuition': LinearRegressionIntuition,
  'knn-intuition': KNNIntuition,
  'logistic-regression-intuition': LogisticRegressionIntuition,
  'decision-tree-intuition': DecisionTreeIntuition,
  'kmeans-intuition': KMeansIntuition,
  'random-forest-intuition': RandomForestIntuition,
};

export const DIAGRAM_LABELS: Record<string, string> = {
  'ai-ml-dl-nesting': 'AI / ML / DL 关系图',
  'task-type-comparison': '任务类型对比',
  'ml-workflow': '机器学习完整流程',
  'data-to-xy': '数据 → X 和 y',
  'train-test-split': '训练集与测试集划分',
  'fit-predict-evaluate': 'fit / predict / evaluate 流程',
  'sklearn-api-pattern': 'sklearn 统一 API',
  'algorithm-map': '算法地图',
  'overfitting': '过拟合 vs 欠拟合',
  'linear-regression-intuition': '散点到拟合直线',
  'knn-intuition': '邻居投票图解',
  'logistic-regression-intuition': 'Sigmoid 概率曲线',
  'decision-tree-intuition': '问题决策路径',
  'kmeans-intuition': '聚类中心移动',
  'random-forest-intuition': '多棵树投票',
};
