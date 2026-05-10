# 课程内容与教学方法全览

> 生成日期：2026-05-10 | 项目版本：v2.8.2 | 共 9 门课程

---

## 一、平台技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端框架 | React 18 + TypeScript | UI 组件、类型安全 |
| 构建 | Vite 6 | 开发服务器、生产构建、代码分割 (manual chunks) |
| 样式 | Tailwind CSS 3 + Lucide React | 毛玻璃风格、响应式布局、图标 |
| 路由 | React Router v6 | 7 条路由，懒加载 (React.lazy + Suspense) |
| 代码编辑 | Monaco Editor | Python 语法高亮、VS Code Dark 主题 |
| Python 运行 | Pyodide 0.29 + Web Worker | 浏览器端 Python 真运行 (numpy + scikit-learn) |
| 可视化 | ECharts 5 + echarts-for-react | 交互式算法可视化 (散点图、树图等) |
| AI | DeepSeek API → Express 代理 (端口 8787) | 11 种 AI 场景，Mock 离线兜底 |
| 校验 | Zod v4 | AI 输出校验、管理表单校验 |
| 存储 | localStorage | 学习进度、自定义课程/题库 |
| 测试 | Vitest + @testing-library/react + jsdom | 25 个用例，9 个测试文件 |

---

## 二、课程体系总览 (9 门)

```
基础入门 (3 门)
  ├─ 1. 机器学习入门与完整流程        入门
  ├─ 2. 数据、特征、标签与模型评估     入门
  └─ 3. 机器学习 Python 代码入门      入门

核心算法 (6 门)
  ├─ 4. 线性回归                     入门
  ├─ 5. KNN                         入门
  ├─ 6. 逻辑回归                     入门
  ├─ 7. 决策树                       中级
  ├─ 8. K-Means 聚类                 中级
  └─ 9. 随机森林                     中级
```

学习路径按 sortOrder 1→9 编排，通过 useCourses() Hook 排序后，在 Sidebar、首页、学习中心自动同步。

---

## 三、课程实现方式

### 3.1 课程数据结构 (types/index.ts → Algorithm)

```typescript
Algorithm {
  id, name, type (foundation|algorithm|project)
  category (basic|regression|classification|tree|clustering|ensemble)
  difficulty (入门|中级|进阶)
  sortOrder (1-9 控制排序)
  intro, description                          // 简介和详细描述
  formula?, steps?, advantages?, disadvantages?, useCases?  // 算法课专用
  codeExample?, videoUrl?                     // Python 示例和 B 站视频
  hasPractice?, hasQuiz?                      // 控制练习/测验入口显隐
  visualizationType?                          // 指定交互式可视化组件
  learningObjectives?, concepts?, analogies?, commonMisunderstandings?  // 基础课专用
  lessons?: FoundationLesson[]                // 基础课微课列表
  guidedQuestions?: GuidedQuestion[]          // 算法课引导思考题
  nextCourseId?, prerequisites?, estimatedMinutes?
}
```

### 3.2 课程类型路由 (CoursePage.tsx)

```
/algorithms/:id → CoursePage
  ├─ algorithm.type === 'foundation' → FoundationCourseContent
  └─ 其他                              → AlgorithmPage
```

### 3.3 基础课渲染流程 (FoundationCourseContent.tsx)

每个 lesson 按以下顺序渲染 10 个 Section：

| 顺序 | Section | 条件 |
|------|---------|------|
| 1 | 思考一下再学习 (OpeningQuestionBlock) | 有 openingQuestion 且未回答 |
| 2 | 本节目标 | 始终显示 |
| 3 | 场景故事 (SmartParagraph 渲染) | 始终显示 |
| 4 | 通俗解释 (SmartParagraph 渲染) + 示例 | 始终显示 |
| 5 | 图解 (DIAGRAM_MAP) | lesson.id 在 LESSON_DIAGRAM 映射中 |
| 6 | 动手试试 (InteractiveTask) | 互动类型已实现 或 有兜底问题 |
| 7 | 常见误区 (MistakeCard) | 有 commonMistakes 数据 |
| 8 | 本节小测 (CheckpointQuizInline) | 有 checkpointQuestions |
| 9 | 核心要点 | 始终显示 |
| 10 | 上一节 / 下一节 导航 | 始终显示 |

### 3.4 算法课渲染流程 (AlgorithmPage.tsx)

| 顺序 | Section | 条件 |
|------|---------|------|
| 1 | 本节学习目标 | 始终显示 |
| 2 | 核心思想 + 优缺点 | 始终显示 |
| 3 | 通俗理解 (analogies 列表) | 有 analogies 数据 |
| 4 | 图解 (算法直觉图) | algorithm.id 在 ALGORITHM_DIAGRAM 映射中 |
| 5 | 引导思考 (GuidedQuestionsInline) | 有 guidedQuestions 数据 |
| 6 | 公式与步骤 | 有 formula 或 steps |
| 7 | B站教学视频 | videoUrl 非空 |
| 8 | 交互式可视化 (VizComponent) | vizComponents 中有该算法 ID |
| 9 | Python 代码示例 | codeExample 非空 |
| 10 | 常见误区 (MistakeCard) | 有 commonMisunderstandings |
| 11 | 底部栏：代码练习入口 + 测验挑战 + AI 助教 | 始终显示 |

### 3.5 互动类型与实现状态

**已实现 (4 种)：**

| 互动类型 | 组件 | 使用课程 |
|----------|------|----------|
| `programming-vs-ml` | ProgrammingVsML (6 个判断题) | ml-intro-1, py-5 |
| `ai-ml-dl-map` | AIMLDlMap (8 个案例归类) | ml-intro-2 |
| `task-type-classifier` | TaskTypeClassifier (8 个任务判断) | ml-intro-4, py-2 |
| `workflow-simulator` | WorkflowSimulator (9 步流程排序) | ml-intro-5, py-1 |

**未实现 (通过 GuidedQuestionBlock 兜底)：**

| 互动类型 | 使用课程 | 兜底方式 |
|----------|----------|----------|
| `learning-type-sorter` | ml-intro-3 | 无数据 → 隐藏 |
| `algorithm-recommender` | ml-intro-6, py-6 | 无数据 → 隐藏 |
| `data-table-guide` | data-1 | 无数据 → 隐藏 |
| `feature-label-selector` | data-2, py-3 | 无数据 → 隐藏 |
| `xy-splitter` | data-3 | 无数据 → 隐藏 |
| `train-test-split` | data-4, py-4 | 无数据 → 隐藏 |
| `regression-metric-lab` | data-5 | 无数据 → 隐藏 |
| `classification-metric-lab` | data-6 | 无数据 → 隐藏 |
| `overfitting-playground` | data-7 | 无数据 → 隐藏 |
| `leakage-detective` | data-8 | 无数据 → 隐藏 |

### 3.6 图解组件覆盖 (15 个，DIAGRAM_MAP)

**基础课图解 (10 个 lesson 映射)：**

| 图解 | 接入课程 | lesson |
|------|----------|--------|
| AIMLDLNestingDiagram (AI⊃ML⊃DL 嵌套) | ml-intro-workflow | ml-intro-2 |
| TaskTypeComparisonDiagram (回归/分类/聚类对比) | ml-intro-workflow | ml-intro-4 |
| MLWorkflowStepper (9步流程图) | ml-intro-workflow | ml-intro-5 |
| AlgorithmMapDiagram (任务→算法) | ml-intro-workflow | ml-intro-6 |
| DataToXYDiagram (数据表→X/y拆分) | data-feature-evaluation | data-3 |
| TrainTestSplitDiagram (80/20切分) | data-feature-evaluation | data-4 |
| OverfittingDiagram (三卡片对比) | data-feature-evaluation | data-7 |
| FitPredictEvaluateDiagram (fit/predict/score) | ml-python-code-intro | py-1, py-5 |
| SklearnAPIPatternDiagram (统一API) | ml-python-code-intro | py-2, py-6 |

**算法课图解 (6 个，通过 ALGORITHM_DIAGRAM 映射)：**

| 图解 | 算法 |
|------|------|
| LinearRegressionIntuition (散点到拟合直线) | 线性回归 |
| KNNIntuition (邻居投票) | KNN |
| LogisticRegressionIntuition (Sigmoid 曲线) | 逻辑回归 |
| DecisionTreeIntuition (问题决策路径) | 决策树 |
| KMeansIntuition (聚类中心移动) | K-Means |
| RandomForestIntuition (多棵树投票) | 随机森林 |

---

## 四、每门课程详细内容

### 课程 1：机器学习入门与完整流程

| 属性 | 值 |
|------|-----|
| ID | `ml-intro-workflow` |
| 类型 | foundation |
| 难度 | 入门 |
| 时长 | 45 分钟 |
| 测验 | 7 道 |
| 图解 | `ml-workflow` (已有 MLWorkflowViz) |

**6 个小节：**

| # | 标题 | 互动 | 有引导问题 | 有图解 |
|---|------|------|:--------:|:-----:|
| 1 | 机器学习到底在学什么？ | programming-vs-ml (✅) | ✅ | — |
| 2 | AI/ML/DL 是什么关系？ | ai-ml-dl-map (✅) | — | ✅ |
| 3 | 有答案学习 vs 没答案学习 | learning-type-sorter (❌) | ✅ | — |
| 4 | 回归、分类、聚类怎么分？ | task-type-classifier (✅) | ✅ | ✅ |
| 5 | 一个 ML 项目怎么完成？ | workflow-simulator (✅) | — | ✅ |
| 6 | 本平台算法地图 | algorithm-recommender (❌) | — | ✅ |

**不足：** lesson 3 互动未实现，但 openingQuestion 提供了替代交互。

---

### 课程 2：数据、特征、标签与模型评估

| 属性 | 值 |
|------|-----|
| ID | `data-feature-evaluation` |
| 类型 | foundation |
| 难度 | 入门 |
| 时长 | 60 分钟 |
| 测验 | 10 道 |

**8 个小节：**

| # | 标题 | 互动 | 有引导问题 | 有图解 |
|---|------|------|:--------:|:-----:|
| 1 | 数据表怎么看？ | data-table-guide (❌) | — | — |
| 2 | 什么是样本、特征、标签？ | feature-label-selector (❌) | ✅ | — |
| 3 | X 和 y 到底是什么？ | xy-splitter (❌) | — | ✅ |
| 4 | 为什么要划分训练集和测试集？ | train-test-split (❌) | ✅ | ✅ |
| 5 | 回归任务怎么评价？ | regression-metric-lab (❌) | — | — |
| 6 | 分类任务怎么评价？ | classification-metric-lab (❌) | — | — |
| 7 | 过拟合、欠拟合和泛化能力 | overfitting-playground (❌) | ✅ | ✅ |
| 8 | 数据泄露侦探 | leakage-detective (❌) | — | — |

**不足：** 仅 lesson 2/4/7 有 openingQuestion (共 3 个)，5 个 lesson 无任何互动内容。8 个互动类型均未实现专用组件。

---

### 课程 3：机器学习 Python 代码入门

| 属性 | 值 |
|------|-----|
| ID | `ml-python-code-intro` |
| 类型 | foundation |
| 难度 | 入门 |
| 时长 | 50 分钟 |
| 测验 | 7 道 |

**6 个小节：**

| # | 标题 | 互动 | 有引导问题 | 有图解 |
|---|------|------|:--------:|:-----:|
| 1 | ML 代码通常长什么样？ | workflow-simulator (✅) | ✅ | ✅ |
| 2 | 常用库都负责什么？ | task-type-classifier (✅) | — | ✅ |
| 3 | X 和 y 在代码里怎么表示？ | feature-label-selector (❌) | ✅ | — |
| 4 | train_test_split 为什么总出现？ | train-test-split (❌) | — | — |
| 5 | fit/predict/score 什么意思？ | programming-vs-ml (✅) | — | ✅ |
| 6 | 不同算法代码为什么这么像？ | algorithm-recommender (❌) | ✅ | ✅ |

**不足：** lesson 3/4 无图解，lesson 3/4/6 互动未实现。

---

### 课程 4-9：核心算法课 (6 门)

所有 6 门算法课共享同一结构：

| 通用模块 | 覆盖情况 |
|----------|----------|
| 学习目标 (intro) | ✅ 全部 6 门 |
| 核心思想 (description) | ✅ 全部 6 门 |
| 优点/缺点 | ✅ 全部 6 门 |
| 通俗理解 (analogies) | ✅ 全部 6 门 (每门 2 条) |
| 算法图解 (intuition diagram) | ✅ 全部 6 门 |
| 引导思考 (guidedQuestions) | ✅ 全部 6 门 (每门 2 题) |
| 公式 | ✅ 5 门 (随机森林无单独公式) |
| 步骤 | ✅ 全部 6 门 |
| B站视频 | ✅ 4 门 (逻辑回归/随机森林无) |
| 交互式可视化 | ✅ 6 门 (均有 VizComponent) |
| Python 代码示例 | ✅ 全部 6 门 |
| 常见误区 (commonMisunderstandings) | ✅ 全部 6 门 (每门 3 条) |
| 代码练习 | ✅ 全部 6 门 (每门 2 道) |
| Pyodide 真运行 | ✅ 7 道 (lr-ex-2/knn-ex-2/dt-ex-2/km-ex-2 无) |
| 测验 | ✅ 全部 6 门 (每门 8 道) |

**各算法特有内容：**

| 算法 | 可视化组件 | B站视频 BV | 定位 |
|------|-----------|-----------|------|
| 线性回归 | LinearRegressionViz (散点+拟合线+Loss) | BV1ZZCkBREVE ✅ | 第一个算法，承接基础课 |
| KNN | KNNViz (分类散点+K近邻+测试点拖动) | BV1TW4y1w7MW ✅ | 最直观的分类算法 |
| 逻辑回归 | LogisticRegressionViz (Sigmoid+决策边界) | — ⚠️ | 概率视角的二分类 |
| 决策树 | DecisionTreeViz (树结构+分类路径) | BV1gP4y177cf ✅ | 规则式可解释模型 |
| K-Means | KMeansViz (散点簇+中心移动+K值调节) | BV1V44y1u7mJ ✅ | 第一个无监督算法 |
| 随机森林 | RandomForestViz (多树卡片+投票+特征重要性) | — ⚠️ | 集成学习代表 |

---

## 五、代码练习体系

### 5.1 练习分布

| 算法 | 练习 1 (入门) | 练习 2 (中级) | Pyodide |
|------|:-----------:|:-----------:|:------:|
| 线性回归 | lr-ex-1 | lr-ex-2 | lr-ex-1 ✅ lr-ex-2 ❌ |
| KNN | knn-ex-1 | knn-ex-2 | knn-ex-1 ✅ knn-ex-2 ❌ |
| 逻辑回归 | logr-ex-1 | logr-ex-2 | ✅✅ |
| 决策树 | dt-ex-1 | dt-ex-2 | dt-ex-1 ✅ dt-ex-2 ❌ |
| K-Means | km-ex-1 | km-ex-2 | km-ex-1 ✅ km-ex-2 ❌ |
| 随机森林 | rf-ex-1 | rf-ex-2 | ✅✅ |

**总计：12 道，7 道含 Pyodide runtimeSpec**

### 5.2 练习验证流程

```
用户写代码 → 点击"检查并运行"
  ├─ Step 1: 规则检查 (codeCheckService.ts)
  │   └─ 遍历 checkRules，正则匹配 keyword (过滤注释)
  ├─ Step 2: Pyodide 真运行 (pythonRuntimeService.ts → Web Worker)
  │   ├─ 有 runtimeSpec → 在 Worker 中执行 Python
  │   │   ├─ setupCode: 准备数据和导入
  │   │   ├─ userCode: 用户写的代码
  │   │   └─ testCode: 固定测试 (变量存在性、模型训练状态、输出长度、准确率阈值)
  │   └─ 无 runtimeSpec → 跳过，显示"暂未开启真运行"
  ├─ Step 3: 四维综合评分 (practiceScoringService.ts)
  │   ├─ 核心 API 使用 (40 分)
  │   ├─ TODO 完成度 (20 分)
  │   ├─ Python 可执行性 (25 分)
  │   └─ 固定测试表现 (15 分)
  └─ Step 4: AI 诊断 (aiService.ts)
      └─ 传入评分 + 运行结果，生成结构化诊断报告
```

### 5.3 检测规则

所有检查规则均为 `type: 'keyword'`：
- 根据 expectedKeywords 列表逐项匹配
- 匹配前先移除 Python 注释 (getExecutablePythonCode)
- 每项有独立 points (10-30 分)
- TODO 计数：(code.match(/\bTODO\b/gi) || []).length

---

## 六、测验体系

| 课程 | 题数 | 题型 |
|------|:---:|------|
| 机器学习入门与完整流程 | 7 | 概念辨析、包含关系、任务类型判断、流程排序 |
| 数据、特征、标签与模型评估 | 10 | 数据结构、指标理解、过拟合识别、数据泄露 |
| Python 代码入门 | 7 | 库分工、代码流程、fit/predict/sklearn API |
| 线性回归 | 8 | 回归概念、MSE/R²、梯度下降、过拟合 |
| KNN | 8 | 距离度量、K值影响、特征缩放、懒惰学习 |
| 逻辑回归 | 8 | Sigmoid、阈值、二分类、predict vs predict_proba |
| 决策树 | 8 | 信息增益/基尼、深度限制、可解释性 |
| K-Means | 8 | 无监督学习、K值选择、肘部法则、inertia |
| 随机森林 | 8 | 集成学习、Bagging、特征重要性、投票机制 |

**总计：72 道，均为 4 选 1 选择题。**

---

## 七、AI 助教系统

### 7.1 11 种 AI 场景

| 方法 | 场景 | Zod 校验 | thinking |
|------|------|:------:|:------:|
| askTutor | 自由问答 | — | disabled |
| explainConcept | 概念解释 | — | disabled |
| diagnoseCode | 代码诊断 | ✅ | enabled |
| generatePracticeHint | 练习提示 | — | disabled |
| reviewQuiz | 错题讲解 | ✅ | enabled |
| generateStudyPlan | 学习计划 | ✅ | enabled |
| generateCourseDraft | 课程草稿 | ✅ | enabled |
| generateQuiz | 出题 | — | disabled |
| summarizeLesson | 总结本节 | — | disabled |
| lifeExample | 生活例子 | — | disabled |
| explainVisualization | 可视化解释 | — | disabled |

### 7.2 双模式架构

```
aiService.ts (11 方法)
  ├─ try: callAIProxy() → /api/ai/chat → Express → DeepSeek API
  │   ├─ 成功 → mode: 'deepseek'
  │   └─ 失败 → withFallback() → aiMockService
  │       └─ 返回 mode: 'mock' + fallbackReason
  └─ 安全：API Key 仅在后端环境变量，22s 客户端超时 > 20s 服务端超时
```

---

## 八、关键技术决策

| 决策 | 理由 |
|------|------|
| 课程数据全部硬编码在 TypeScript | 零数据库依赖，npm install 即可运行 |
| 基础课使用微课结构 (FoundationLesson) | 零基础用户需要渐进式引导 |
| SmartParagraph 自动分段 | 避免大段文字堆积，按句号自动拆段落 |
| 所有文本渲染不依赖外部图片 | 纯 Tailwind + SVG + Lucide，离线可用 |
| Mock AI 覆盖全部 11 种场景 | 无 API Key 时完整演示 |
| 管理后台仅从个人中心进入 | 避免导航栏干扰学习主路径 |
| hasPractice/hasQuiz 字段控制按钮显隐 | 灵活控制练习/测验入口 |

---

## 九、已知不足

| # | 问题 | 影响 | 优先级 |
|---|------|------|:----:|
| 1 | 10 个 interactionType 仅 4 个有专用组件 | 10 个 lesson 无互动内容 | P1 |
| 2 | 4 道中级练习无 Pyodide runtimeSpec | 无法真运行验证 | P1 |
| 3 | 逻辑回归和随机森林无 B 站视频 | 教学资源不完整 | P2 |
| 4 | data-feature-evaluation 仅 3/8 lesson 有 openingQuestion | 5 个 lesson 无引导问题 | P2 |
| 5 | 随机森林无独立公式字段 | 与其他算法不一致 | P3 |
| 6 | 6 个算法直觉图解与 DIAGRAM_MAP 分离 | 架构不统一 | P3 |

---

> 文档生成日期：2026-05-10 | 项目版本：v2.8.2
