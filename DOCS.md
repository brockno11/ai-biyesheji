# 基于 AI 赋能的机器学习算法教学平台 — 完整文档

## 一、项目概述

### 1.1 项目定位

面向 **机器学习初学者** 的 Web 教学平台，融合 AI 助教、算法可视化、在线代码练习三大核心能力，构建"学 → 看 → 练 → 测"的完整学习闭环。

### 1.2 适用场景

- 本科机器学习课程辅助教学
- 个人自学机器学习入门
- 毕业设计/课程设计答辩演示
- 教学培训场景的互动课件

### 1.3 设计理念

| 原则 | 说明 |
|------|------|
| 零数据库依赖 | 课程数据 TypeScript 静态定义 + localStorage，AI 通过轻量 Node/Express 代理转发 |
| 可演示优先 | 不配置任何 API Key 也能完整演示所有功能 |
| 交互第一 | 可视化组件支持 slider、点击、拖拽等交互操作 |
| AI 赋能 | AI 助教贯穿学习全流程，Mock 数据确保离线可用 |
| 学习闭环 | 课程学习 → 代码练习 → 测验验证 → 进度追踪 |

---

## 二、技术架构

### 2.1 技术栈

```
前端框架：   React 18 + TypeScript
构建工具：   Vite 6
样式方案：   Tailwind CSS 3
路由管理：   React Router v6
代码编辑器： Monaco Editor (@monaco-editor/react)
Python运行： Pyodide (浏览器端执行线性回归练习)
图表可视化： ECharts 5 + echarts-for-react
图标库：     Lucide React
数据存储：   localStorage (浏览器本地)
AI 接口：    DeepSeek OpenAI-compatible API (后端代理，可选，默认 Mock)
```

### 2.1.1 当前功能规模（2026-05-09）

| 类型 | 当前数量/状态 | 说明 |
|------|---------------|------|
| 内置算法 | 4 个 | 线性回归、KNN、决策树、K-Means 聚类 |
| 代码练习 | 8 道 | 每个算法 2 道，练习数据支持后台自定义覆盖 |
| 测验题目 | 32 道 | 每个算法 8 道，测验数据支持后台自定义覆盖 |
| 可视化组件 | 4 个 | 线性回归、KNN、决策树、K-Means 均有交互式 ECharts/可视化组件 |
| AI 场景 | 6 类以上 | AI 助教、代码诊断、错题讲解、学习路径、课程草稿、可视化解释 |
| 后台管理 | 课程 + 题库 | 课程 CRUD、AI 课程草稿、练习题 CRUD、测验题 CRUD |

### 2.2 项目目录结构

```
src/
├── types/index.ts              # 全局 TypeScript 类型
├── data/
│   ├── algorithms.ts           # 4 门内置算法静态数据
│   └── exercises.ts            # 内置练习题 + 测验题，支持后台自定义覆盖
├── hooks/
│   └── useCourses.ts           # 合并静态 + 自定义课程的 Hook
├── services/
│   ├── storageService.ts       # localStorage 封装 + 课程 CRUD
│   ├── codeCheckService.ts     # 本地规则检查引擎
│   ├── pythonRuntimeService.ts # Pyodide 浏览器端 Python 真运行
│   ├── aiService.ts            # 统一 AI 服务入口 (7 个方法)
│   ├── aiTypes.ts              # AI 类型定义 (消息/上下文/结果)
│   ├── aiPromptService.ts      # 系统提示词 + 场景 Prompt
│   └── aiMockService.ts        # Mock 回复 + 结构化兜底数据
├── components/
│   ├── Layout.tsx              # 内页布局 (Header + Sidebar + 内容区)
│   ├── Header.tsx              # 顶部导航栏
│   ├── Sidebar.tsx             # 课程侧边导航
│   ├── AlgorithmCard.tsx       # 算法课程卡片
│   ├── AITutorPanel.tsx        # AI 助教对话面板
│   ├── AIModeBadge.tsx         # AI 模式徽标 (DeepSeek/Mock)
│   ├── AICodeReviewCard.tsx    # AI 代码诊断报告卡片
│   ├── PythonRunResultCard.tsx # Python 运行结果卡片
│   ├── AIQuizReviewCard.tsx    # AI 错题讲解卡片
│   ├── AIStudyPlanCard.tsx     # AI 学习计划卡片
│   ├── AIVisualizationInsight.tsx # AI 可视化洞察组件
│   ├── CodeEditor.tsx          # Monaco Editor 封装
│   ├── VideoEmbed.tsx          # B 站视频播放器
│   ├── ProgressBar.tsx         # 进度条组件
│   ├── ScoreCard.tsx           # 代码检查得分卡片
│   ├── LinearRegressionViz.tsx # 线性回归可视化 (散点图+拟合线+Loss曲线)
│   ├── KNNViz.tsx              # KNN 可视化 (分类散点+K近邻+测试点拖动)
│   ├── DecisionTreeViz.tsx     # 决策树可视化 (树结构+分类路径)
│   ├── KMeansViz.tsx           # K-Means 聚类可视化 (散点簇+中心移动+K值调节)
│   ├── AdminCoursePanel.tsx    # 课程管理面板 (CRUD)
│   └── AdminQuestionPanel.tsx  # 练习题/测验题管理面板 (CRUD + 本地覆盖)
├── pages/
│   ├── HomePage.tsx            # 首页 (全宽，无侧栏)
│   ├── AlgorithmPage.tsx       # 算法学习页 (详情+可视化+AI助手)
│   ├── PracticePage.tsx        # 代码练习页 (Monaco+规则检查+Pyodide运行+AI反馈)
│   ├── QuizPage.tsx            # 测验页 (选择题+自动评分)
│   ├── ProgressPage.tsx        # 学习中心 (进度追踪+下一步推荐)
│   ├── ProfilePage.tsx         # 个人中心 (学习仪表盘+管理入口)
│   └── AdminPage.tsx           # 管理后台 (系统概览+课程管理+题库管理)
├── App.tsx                     # 路由配置
├── main.tsx                    # 入口
└── index.css                   # Tailwind + 全局样式
public/
└── pyodide/                    # Pyodide 核心运行文件，由 npm run sync:pyodide 同步
scripts/
└── sync-pyodide-assets.mjs     # 同步 Pyodide wasm/stdlib/lockfile 到 public
```

### 2.3 路由设计

| 路径 | 页面 | 布局 | 说明 |
|------|------|------|------|
| `/` | HomePage | 独立全宽 | 首页，无侧边栏 |
| `/algorithms/:id` | AlgorithmPage | Layout (Header+Sidebar) | 算法学习详情 |
| `/practice/:algorithmId` | PracticePage | Layout (Header+Sidebar) | 代码练习 |
| `/quiz/:algorithmId` | QuizPage | Layout (Header+Sidebar) | 知识测验 |
| `/progress` | ProgressPage | Layout (Header+Sidebar) | 学习中心 |
| `/profile` | ProfilePage | 独立布局 | 个人中心 |
| `/admin` | AdminPage | 独立布局 | 管理后台 |

### 2.4 数据流架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                           │
│                                                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────────┐ │
│  │ Static    │   │ localStorage │   │ DeepSeek Proxy     │ │
│  │ TS Data   │   │ (进度+自定义  │   │ /api/ai/chat       │ │
│  │ (算法+题目) │   │  课程)       │   │                    │ │
│  └────┬─────┘   └─────┬─────┘   └──────────┬───────────┘ │
│       │               │                     │             │
│       └───────┬───────┴──────────┬──────────┘             │
│               │                  │                        │
│          useCourses Hook    aiService.ts                  │
│               │                  │                        │
│       ┌───────┴──────────────────┴───────┐                │
│       │         UI Components             │                │
│       └──────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

## 三、功能模块详解

### 3.1 首页 (HomePage)

**功能定位**：平台门面，展示核心价值和引导用户进入学习。

**组成部分**：

| 区域 | 内容 |
|------|------|
| 顶部导航 | Logo + 首页 + 学习中心 + 个人中心 |
| Hero 区域 | 平台 Slogan + 副标题 + 4 个统计指标卡片 (算法数/练习题/测验题/AI助教) |
| 特色卡片 | 3 张卡片展示 AI 助教 / 算法可视化 / 代码练习，每张含功能点标签 |
| 课程展示 | 4 门算法卡片 (线性回归 / KNN / 决策树 / K-Means，图标 + 难度标签 + 简介 + 微型进度条) |
| 学习路径 | Step 01→04 四步流程图 (课程学习 → 可视化探索 → 代码练习 → 测验巩固) |
| CTA 区域 | 学习进度统计 + 继续学习 / 详细进度入口 |
| Footer | 项目信息 |

**操作逻辑**：
1. 用户打开 → 看到 Hero 和课程卡片
2. 点击算法卡片 → 进入算法学习页
3. 点击"开始学习" → 进入第一门课
4. 点击"查看学习进度" → 进入学习中心
5. 点击"个人中心" → 查看学习仪表盘和管理入口

### 3.2 算法学习页 (AlgorithmPage)

**功能定位**：一站式展示单个算法的全部学习内容。

**页面布局**：左侧内容区 + 右侧 AI 助教面板 (sticky 定位)

**内容区包含** (从上到下)：

| 模块 | 内容 |
|------|------|
| 算法信息卡 | 图标 + 难度 + 分类 + 详细描述 |
| 算法步骤 | 编号列表，hover 变色动画 |
| 优点/缺点 | 双列对比卡片 |
| 核心公式 | 深色代码块展示 Markdown 公式 |
| Python 代码示例 | 深色代码块展示完整示例代码 |
| B 站视频 | iframe 嵌入 B 站播放器 |
| 交互式可视化 | 根据算法类型渲染对应可视化组件 |
| 操作按钮 | "去做代码练习" + "测验挑战" |

**右侧 AI 助教面板**：

| 功能 | 触发方式 | 说明 |
|------|----------|------|
| 解释概念 | 点击快捷按钮或输入文字 | 用生活比喻解释算法核心思想 |
| 诊断代码 | 点击快捷按钮 | 分析常见代码错误 |
| 学习建议 | 点击快捷按钮 | 根据算法类型推荐学习路径 |
| 来道题 | 点击快捷按钮 | 生成一道思考题 |
| 自由提问 | 输入框输入 + Enter | 根据问题类型自动匹配回复 |

**操作逻辑**：
1. 用户从首页点击算法 → 进入此页
2. 自上而下阅读算法内容
3. 观看 B 站视频
4. 拖动可视化组件 slider 观察模型变化
5. 在右侧 AI 面板提问或使用快捷功能
6. 点击底部按钮进入练习或测验

### 3.3 代码练习页 (PracticePage)

**功能定位**：在线编写 Python 代码并获得即时反馈。

**页面布局**：左侧主内容区 + 右侧面板

**左侧**：

| 模块 | 内容 |
|------|------|
| 练习信息卡 | 难度标签 + 题目切换 (上/下一题) + 标题 + 描述 + 操作指引列表 |
| Monaco 编辑器 | VS Code Dark 主题，Python 语法高亮，400px 高度 |
| "检查并运行"按钮 | 点击触发规则检查、Pyodide Python 真运行和 AI 诊断 |
| ScoreCard 结果卡 | 综合评分 + 四个评分维度 + 问题列表 + 建议 + 下一步 |
| PythonRunResultCard | 展示 Pyodide 运行输出、自动测试结果和错误信息 |

**右侧面板**：

| 模块 | 内容 |
|------|------|
| API 清单 | 实时显示 expectedKeywords 的完成状态 (✓/○) |
| AI 反馈区 | 规则检查和 Python 运行后自动请求 AI 诊断反馈 |

**代码练习验证流程**：
1. 遍历 exercise.checkRules
2. 对每个 keyword 规则：用正则匹配代码中是否包含该关键词
3. 统计 TODO 残留数量
4. 加权计算总分 (每个规则有独立 points)
5. 得分 ≥ 60 为"通过"
6. 对线性回归练习调用 Pyodide，在浏览器端执行用户 Python 代码和固定测试代码
7. 捕获 Python 输出；如果执行失败，展示错误信息
8. 按核心 API、TODO 完成度、Python 可执行性、固定测试表现计算综合评分
9. 将综合评分、运行结果和报错一起发送给 AI，生成结构化诊断
10. 结果保存到 localStorage

**操作逻辑**：
1. 用户从算法页点击"去做代码练习" → 进入此页
2. 阅读左侧题目说明和操作指引
3. 在编辑器中将 TODO 替换为正确代码
4. 点击"检查并运行"→ 先看规则得分，再看 Pyodide 运行输出
5. 如果 Python 运行失败，查看错误信息
6. 页面显示 AI 诊断报告，AI 会结合规则检查和运行报错给出修改方向
7. 修改代码 → 再次检查
8. 通过后可切换到下一题

### 3.4 测验页 (QuizPage)

**功能定位**：选择题测验，验证学习效果。

**组成部分**：

| 模块 | 内容 |
|------|------|
| 进度点 | 顶部一排圆点，标记完成状态 (灰/蓝/绿/红) |
| 统计栏 | 提交后显示正确数 + 错误数 + 总分 |
| 题目卡片 | 题号 + 题目 + 4 个选项按钮 |
| 解析区 | 提交后显示答案解析 (蓝色背景卡片) |
| 操作按钮 | 上一题 / 下一题 / 提交测验 / 重新挑战 |

**操作逻辑**：
1. 用户从算法页点击"测验挑战"→ 进入此页
2. 逐题选择答案 (选项高亮)
3. 完成全部题目后点击"提交测验"
4. 查看每题的正确答案和自己的选择
5. 查看解析
6. 成绩自动保存到 localStorage
7. 可点击"重新挑战"重做

### 3.5 学习中心 (ProgressPage)

**功能定位**：让用户一进入内页就能先看到学习进度、课程状态和下一步推荐。

**组成部分**：

| 模块 | 内容 |
|------|------|
| 4 个统计卡片 | 算法完成数 + 练习次数 + 最高得分 + 测验次数 |
| 总体进度条 | 完成算法 / 总算法 |
| 各算法详情卡 | 每门算法：状态 + 练习次数 + 最佳得分 + 测验成绩 + 迷你进度条 |
| 最近活动 | 最近一次练习的时间 + 得分 + 反馈 |
| 推荐下一步 | 推荐下一门未完成的算法 (带简介和跳转按钮) |
| 重置按钮 | 清除所有 localStorage 数据 |

**操作逻辑**：
1. 用户从顶部导航或侧边栏顶部点击"学习中心"→ 进入此页
2. 查看各算法完成情况
3. 点击"进入课程"跳转到对应算法
4. 点击"开始学习"跳转到推荐的下一门课

### 3.6 个人中心 (ProfilePage)

**功能定位**：学习者的个人学习仪表盘 + 管理入口。

**页面布局**：顶部 Header + 学习仪表盘总览 + 课程掌握情况 + 最近活动 + 账户与管理。

**组成部分**：

| 模块 | 内容 |
|------|------|
| 顶部仪表盘 | 完成度圆环 + 完成课程数 + 练习次数 + 最高得分 + 活跃天数 |
| 推荐下一步 | 根据未完成课程推荐下一门算法 |
| 学习情况卡片 | 平均练习分 + 平均测验分 + 最近活跃时间 |
| 课程掌握情况 | 每门算法的状态、练习次数、最佳得分、测验成绩和估算进度 |
| 最近活动 | 最近练习和测验记录 |
| 账户与管理 | 课程管理入口 + 重置学习进度 |

**管理入口**：只出现在个人中心的"账户与管理"区域，点击"课程管理入口"进入 `/admin`。顶部导航栏不展示管理入口，避免干扰学习主路径。

**操作逻辑**：
1. 用户从顶部导航或侧边栏"个人中心"→ 进入此页
2. 查看学习数据
3. 点击"课程管理入口"→ 进入管理后台
4. 或点击课程掌握情况中的算法卡片 → 跳转到课程页

### 3.7 管理后台 (AdminPage)

**功能定位**：平台数据监控 + 课程 CRUD 管理 + 题库/练习管理。

**页面布局**：左侧管理导航 + 右侧内容区

**三个 Tab**：

#### Tab 1：系统概览

| 模块 | 内容 |
|------|------|
| 统计卡片 | 课程总数 / 练习记录 / 测验记录 / 完成率 |
| 课程清单表 | 所有课程 (内置+自定义) 的图标/名称/分类/难度/类型/练习次数/最佳得分 |
| 系统信息 | 存储方式 / 用户模式 / 技术栈 |

#### Tab 2：课程管理

| 功能 | 操作 |
|------|------|
| 课程列表 | 表格展示，搜索过滤 |
| 添加课程 | 弹出表单：名称*、简介*、分类、难度、图标、详细描述、公式、代码示例、视频 URL、步骤/优点/缺点/场景（支持动态增减） |
| 编辑课程 | 点击铅笔图标 → 表单预填 → 修改 → 保存 |
| 删除课程 | 仅自定义课程可删，带确认弹窗 → Toast 通知 |
| 预览课程 | 点击眼睛图标 → 新标签打开课程详情 |
| 类型标记 | 内置课程蓝色标签 / 自定义课程黄色标签 |

**操作逻辑**：
1. 用户从个人中心的"账户与管理"点击"课程管理入口"→ 进入此页
2. 默认显示系统概览
3. 切换到"课程管理"→ 看到课程表格
4. 点击"添加课程"→ 填写表单 → 保存 → Toast 通知
5. 搜索框输入关键字 → 表格实时过滤
6. 点击编辑 → 修改 → 保存
7. 点击删除 → 确认弹窗 → 删除
8. 新增的课程自动出现在前端所有页面中

### 3.8 算法可视化组件

#### 线性回归 (LinearRegressionViz)

| 参数 | 范围 | 说明 |
|------|------|------|
| 样本数量 | 20-150 | 控制散点数量 |
| 学习率 | 0.001-0.05 | 控制梯度下降步长 |
| 迭代次数 | 10-500 | 控制训练轮数 |
| 噪声大小 | 0.5-10 | 控制数据离散程度 |

| 显示内容 | 说明 |
|----------|------|
| 散点图 + 拟合直线 | 实时显示 y = wx + b |
| Loss 曲线 | MSE 随迭代次数的变化 |
| 4 个指标卡 | w / b / MSE / 迭代次数 |

**交互**：拖动任意 slider → 散点图、拟合线、Loss 曲线全部实时重算

#### KNN (KNNViz)

| 参数 | 范围 | 说明 |
|------|------|------|
| K 值 | 1,3,5,7,9,11,13,15 | 邻居数量 |

| 显示内容 | 说明 |
|----------|------|
| 二维分类散点图 | 2 类数据，不同颜色 |
| 最近 K 个邻居高亮 | 放大 + 阴影 + 白色边框 |
| 测试点 (可移动) | 点击图表任意位置移动测试点 |
| 连线 | 测试点到 K 个邻居的虚线 |
| 预测结果 | 显示预测类别 + 测试点坐标 |

**交互**：拖动 K 值 → 邻居重算；点击图表 → 测试点移动 → 邻居和预测实时更新

#### 决策树 (DecisionTreeViz)

| 参数 | 范围 | 说明 |
|------|------|------|
| 最大深度 | 1-3 | 控制树的复杂度 |

| 显示内容 | 说明 |
|----------|------|
| 树结构图 (ECharts Tree) | 从左到右展开，蓝色内部节点 + 彩色叶子节点 |
| 节点信息 (hover) | 样本数 + 各类别分布 |
| 样本分类路径 | 3 个预设路径，选择后显示决策步骤 |
| 分类预测 | 最终预测类别 |

**交互**：调节深度 → 树结构重组；切换样本 → 追踪不同的分类路径

### 3.9 AI 功能 UI 组件

以下组件封装了 AI 助教的 UI 交互，贯穿各页面：

#### AIModeBadge

显示当前 AI 模式是 **DeepSeek 在线** 还是 **Mock 离线**。以徽标形式呈现在 AI 面板、代码诊断卡片等处，让用户清楚当前 AI 能力的来源。

#### AICodeReviewCard

在代码练习页中，用户点击"检查并运行"后展示。包含：
- AI 对得分的解读
- 代码问题列表和修复建议
- 下一步学习方向
- 鼓励语

支持 DeepSeek 在线模式生成动态反馈，Mock 模式返回预设诊断。

#### AIQuizReviewCard

在测验提交后渲染。包含：
- 薄弱知识点分析
- 逐题错因讲解
- 复习建议
- AI 生成的一道相似练习（含答案和解析）

#### AIStudyPlanCard

在学习中心展示。根据 localStorage 中的学习记录生成：
- 学习进度摘要
- 推荐下一门课程及原因
- 待复习内容列表
- 今日学习计划

#### AIVisualizationInsight

嵌入算法可视化组件中。用户点击"AI 解释当前现象"按钮后，AI 根据当前可视化参数（如学习率、K 值、树深度等），解释参数变化如何影响模型表现。帮助初学者理解超参数调优的意义。

---

## 四、AI 助教系统

### 4.1 系统角色

```
你是机器学习课程的 AI 助教，面向本科初学者。你的名字是"小智"。

原则：
1. 用通俗易懂的语言解释复杂概念，多使用生活中的比喻
2. 鼓励学生，肯定他们的进步，用正向的方式指出不足
3. 分步骤解释问题，不要一次性给出所有答案
4. 优先给提示和思路，引导学生自己思考
5. 当指出代码问题时，先说明"为什么这是错的"，再说明"怎么改"
6. 回答控制在 200 字以内
7. 使用友好的语气
```

### 4.2 两种模式

| 模式 | 条件 | 实现 |
|------|------|------|
| Mock 离线演示模式 | 未设置 `DEEPSEEK_API_KEY`、网络异常或 API 报错 | 预设中文回复和结构化兜底数据 |
| DeepSeek 在线模式 | 设置了 `DEEPSEEK_API_KEY` | 前端请求 `/api/ai/chat`，Node/Express 代理调用 DeepSeek Chat Completions |

### 4.3 Mock 回复覆盖范围

Mock 覆盖以下能力：
- **解释概念**：用比喻讲解算法核心思想
- **诊断代码**：列出常见错误和修复建议
- **学习建议**：推荐下一步学习路径
- **题目生成**：出一道思考题并给出解析
- **错题讲解**：分析薄弱点、错因和正确思路
- **学习路径推荐**：根据 localStorage 学习记录生成今日计划

### 4.4 统一 AI 服务入口

AI 逻辑集中在 `src/services/aiService.ts`，组件通过 `askTutor`、`diagnoseCode`、`reviewQuiz`、`generateStudyPlan` 等方法调用，不再把 Prompt 分散在页面组件里。

### 4.5 环境变量配置

```bash
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
AI_ENABLE_MOCK_FALLBACK=true
```

---

## 五、数据存储方案

### 5.1 localStorage 结构

**Key 1**: `ml-platform-progress`

```json
{
  "practiceRecords": [
    {
      "exerciseId": "lr-ex-1",
      "algorithmId": "linear-regression",
      "code": "...",
      "score": 80,
      "passed": true,
      "timestamp": 1715251200000,
      "feedback": "不错！得分 80 分..."
    }
  ],
  "quizRecords": [
    {
      "algorithmId": "linear-regression",
      "score": 80,
      "total": 5,
      "timestamp": 1715251400000,
      "answers": { "0": 0, "1": 0, "2": 1, "3": 3, "4": 1 }
    }
  ],
  "completedAlgorithms": ["linear-regression"],
  "lastActive": 1715251400000
}
```

**Key 2**: `ml-platform-custom-courses`

```json
[
  {
    "id": "custom-1715251500000",
    "name": "支持向量机 SVM",
    "category": "classification",
    "difficulty": "进阶",
    "icon": "🧠",
    "intro": "...",
    ...
  }
]
```

### 5.2 数据生命周期

```
添加/修改 → storageService.saveCustomCourse() → localStorage
读取     → storageService.getCustomCourses()  → useCourses Hook → 组件
删除     → storageService.deleteCustomCourse() → localStorage
重置     → storageService.reset()              → 清除所有 key
```

---

## 六、代码练习验证引擎

### 6.1 规则类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `keyword` | 检查代码中是否包含指定关键词 | `LinearRegression`, `fit`, `predict` |
| `structure` | 检查代码结构 | 检查特定模式 |

### 6.2 Pyodide 真运行

当前轻量版本先覆盖线性回归练习：

| 覆盖范围 | 说明 |
|----------|------|
| 执行方式 | 浏览器端加载 Pyodide，执行学生 Python 代码 |
| 依赖包 | `numpy`、`scikit-learn` |
| 运行文件 | `npm run sync:pyodide` 将 Pyodide wasm、stdlib 和 lockfile 同步到 `public/pyodide` |
| 自动测试 | 检查关键变量、模型是否 fit、预测长度、MSE/R2 等指标 |
| 输出捕获 | 捕获 `print` 输出并展示在 Python 运行结果卡片 |
| 错误处理 | 捕获语法错误、变量未定义、断言失败和超时，并交给 AI 解释 |
| 兜底策略 | 非线性回归练习暂显示“暂未覆盖”，继续使用规则检查 + AI 诊断 |

### 6.3 综合评分维度

| 维度 | 分值 | 说明 |
|------|------|------|
| 核心 API 使用 | 40 | 只检查真正会执行的代码，注释里的关键词不计分 |
| TODO 完成度 | 20 | TODO 越少得分越高，未完成占位会扣分 |
| Python 可执行性 | 25 | Pyodide 能真实运行才得分 |
| 固定测试表现 | 15 | 通过变量、预测长度、MSE/R2 等自动测试才得分 |

### 6.4 检查流程

```
用户点击"检查并运行"
  ↓
遍历 exercise.checkRules
  ↓
对每个 keyword 规则:
  先移除 Python 注释，再正则匹配 keyword ?
  ├─ Yes → 得分 += rule.points
  └─ No  → 添加到 problems[] + suggestions[]
  ↓
统计 TODO 残留数
  ↓
生成规则检查结果
  ↓
线性回归练习调用 Pyodide 执行 Python
  ├─ 成功 → 展示 print 输出和自动测试通过
  ├─ 失败 → 展示 Python 错误或测试断言失败
  └─ 未覆盖 → 展示暂未支持提示
  ↓
计算四维综合评分并保存到 localStorage
  ↓
触发 AI 诊断，传入规则结果 + Python 运行结果
```

### 6.5 评分等级

| 分数 | 等级 | 反馈策略 |
|------|------|----------|
| 90-100 | 优秀 | 鼓励 + 建议更高难度挑战 |
| 60-89 | 通过 | 肯定 + 指出改进方向 |
| 30-59 | 待改进 | 鼓励 + 提示逐步完成 TODO |
| 0-29 | 起步 | 鼓励 + 建议先回顾课程内容 |

---

## 七、用户操作流程

### 7.1 核心学习流程

```
首页 → 选择算法 → 算法学习页
                     ├─ 阅读简介、公式、步骤
                     ├─ 看 B 站视频
                     ├─ 操作可视化组件
                     ├─ 与 AI 助教对话
                     ├─ 点击"代码练习"
                     │   ├─ 写代码
                     │   ├─ 规则检查 → 看得分和建议
                     │   ├─ Pyodide 真运行 → 看输出或错误
                     │   ├─ AI 诊断 → 根据规则和报错给修改方向
                     │   └─ 切换题目
                     └─ 点击"测验挑战"
                         ├─ 逐题作答
                         ├─ 提交 → 看结果
                         └─ 重新挑战
```

### 7.2 管理流程

```
首页 / 顶部导航 → 个人中心 → 账户与管理 → 课程管理入口 → 管理后台
                                                       ├─ 系统概览 (数据一览)
                                                       ├─ 课程管理
                                                       │   ├─ 添加课程 (表单)
                                                       │   ├─ 编辑课程 (表单预填)
                                                       │   ├─ 删除课程 (确认弹窗)
                                                       │   └─ 搜索过滤
                                                       └─ 题库管理
                                                           ├─ 新增/编辑/删除练习题
                                                           ├─ 新增/编辑/删除测验题
                                                           └─ 覆盖编辑内置题目
```

---

## 八、系统优缺点分析

### 8.1 优点

| 优点 | 说明 |
|------|------|
| **零数据库依赖** | `npm install && npm run dev` 即可启动；课程和学习数据本地存储，AI 使用轻量 Node/Express 代理，无 API Key 时自动走 Mock |
| **完整的演示闭环** | 首页→课程→可视化→练习→测验→学习中心，所有页面可完整走通 |
| **AI 离线可用** | Mock 模式覆盖所有 AI 功能，不依赖外部服务 |
| **交互式可视化** | 三个算法均支持参数调节和实时反馈，适合教学演示 |
| **代码验证更可信** | 规则检查 + 线性回归 Pyodide 真运行 + AI 诊断，既看 API 是否完整，也看代码能否跑通 |
| **数据持久化** | localStorage 存储学习记录和管理员添加的课程，刷新不丢失 |
| **UI 设计规范** | 清爽的蓝绿学习工具风格，顶部导航和侧边栏路径清晰 |
| **响应式布局** | 首页、课程页、学习中心和个人中心做了响应式适配 |
| **TypeScript 全覆盖** | 所有数据结构和函数都有类型定义 |
| **可扩展** | 自定义课程可动态添加，路由和组件结构清晰 |

### 8.2 缺点

| 缺点 | 说明 | 改进方向 |
|------|------|----------|
| **真实代码执行覆盖有限** | 当前 Pyodide 真运行优先覆盖线性回归练习，KNN/决策树仍以规则检查为主 | 扩展 Pyodide 固定测试到 KNN、决策树和更多练习 |
| **无用户系统** | 单用户本地模式，不支持多用户和数据同步 | 添加后端 (Node.js/Go) + 数据库 (SQLite/PostgreSQL) |
| **静态题目数量有限** | 已支持管理员在后台新增/编辑/删除自定义练习题和测验题，并可对内置题目做本地覆盖 | 后续可增加综合测验和批量导入 |
| **可视化组件有限** | 仅覆盖三个算法 | 扩展 SVM、Random Forest、神经网络等 |
| **AI Mock 回复固定** | Mock 回复是预设文本，不能真正理解上下文 | 接入大模型 API，实现真正的智能对话 |
| **无代码分割** | 单个 JS Bundle 1.3MB+ (Monaco Editor + ECharts) | 使用 dynamic import() 实现代码分割 |
| **移动端仍可继续打磨** | 已完成基础适配，但复杂图表和代码编辑器在小屏仍有优化空间 | 针对可视化和编辑器做移动端专项优化 |
| **视频依赖外部平台** | B 站视频可能因各种原因不可用 | 支持多种视频源或自建视频服务 |
| **无国际化** | 仅支持中文 | 添加 i18n 支持 |
| **无测试** | 缺少单元测试和集成测试 | 添加 Vitest + React Testing Library |

### 8.3 适用性和局限

**最适合的场景**：
- 毕业设计 / 课程设计答辩演示
- 课堂教学辅助工具 (教师演示用)
- 个人学习辅助 (配合正式课程使用)

**不适合的场景**：
- 生产环境部署 (缺少后端、安全措施)
- 大规模在线教学 (无多用户、无数据同步)
- 作为唯一学习资源 (内容覆盖有限)

---

## 九、后续可扩展方向

### 9.1 短期 (1-2 周可完成)

- [ ] 扩展 Pyodide 真运行覆盖范围到 KNN、决策树和更多练习题
- [x] 管理员可添加/编辑/删除练习题和测验题
- [ ] 增加更多预设 AI Mock 回复变体
- [ ] 代码分割优化首屏加载
- [ ] 添加暗色模式

### 9.2 中期 (1 个月)

- [ ] 后端服务 (Node.js / Python FastAPI)
- [ ] 用户注册登录 (JWT)
- [ ] 数据库持久化 (PostgreSQL / SQLite)
- [ ] 学习数据可视化分析面板
- [ ] 新增更多算法 (SVM、随机森林、神经网络、PCA、朴素贝叶斯等)
- [ ] 对接大模型微调 (Fine-tuning) 提升 AI 助教质量

### 9.3 长期

- [ ] 学习社区 (讨论区、笔记分享)
- [ ] 教师端 (班级管理、作业布置)
- [ ] 移动端 App (React Native)
- [ ] 国际化 (中 / 英 / 日)
- [ ] 视频录制和直播功能
- [ ] 学习路径推荐算法 (基于协同过滤)

---

## 十、本地运行指南

### 10.1 环境要求

- Node.js ≥ 18
- npm ≥ 8

### 10.2 安装和启动

```bash
# 安装依赖
npm install

# 启动前端开发服务器和 AI 后端代理
npm run dev

# 生产构建
npm run build
npm run preview
```

默认前端地址是 `http://localhost:3000`，AI 后端代理地址是 `http://localhost:8787`。Vite 会把 `/api` 请求代理到后端。

### 10.3 可选：开启真实 DeepSeek API

**推荐方式：创建 `.env` 文件**（项目已提供 `.env.example` 模板）

```env
# 在项目根目录创建 .env 文件
DEEPSEEK_API_KEY=sk-your-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
AI_ENABLE_MOCK_FALLBACK=true
```

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API Key（为空则走 Mock） | 空 |
| `DEEPSEEK_BASE_URL` | API 地址 | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 模型名 | `deepseek-v4-flash` |
| `AI_ENABLE_MOCK_FALLBACK` | API 失败时自动降级 Mock | `true` |

安全注意：
- `.env` 已加入 `.gitignore`，不会被提交到 GitHub
- API Key 只存在于本地，前端代码无法访问
- 后端通过 `server/services/deepseekService.ts` 读取环境变量，前端通过 `/api/ai/chat` 代理调用

验证连通性：
```bash
curl -X POST http://localhost:8787/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"maxTokens":100}'
```
返回 `"ok":true,"mode":"deepseek"` 即表示连通。

---

## 十一、B 站视频来源

| 算法 | BV 号 | 标题 |
|------|-------|------|
| 线性回归 | BV1ZZCkBREVE | 机器学习算法 · 构建线性回归 |
| KNN | BV1TW4y1w7MW | K近邻算法 · 通俗易懂课程 |
| 决策树 | BV1gP4y177cf | 机器学习入门系列 · 决策树 |

---

## 十二、DeepSeek AI 模块升级说明

### 12.1 模块目标

本项目的 AI 能力已从简单 Mock 聊天升级为 **DeepSeek 在线模式 + Mock 离线兜底 + 多场景教学能力**。核心目标是：答辩现场有网络和 API Key 时可以展示真实大模型能力；没有网络、没有 Key 或 DeepSeek 返回错误时，仍可稳定使用本地 Mock 演示。

### 12.2 服务结构

前端 AI 服务拆分为：

```text
src/services/aiTypes.ts          # AI 消息、上下文、结构化结果类型
src/services/aiPromptService.ts  # 统一维护系统提示词和场景 Prompt
src/services/aiMockService.ts    # Mock 回复和结构化兜底数据
src/services/aiService.ts        # 统一对组件暴露 AI 方法并处理 fallback
```

后端代理新增：

```text
server/services/deepseekService.ts  # 调用 DeepSeek Chat Completions API
server/routes/ai.ts                 # POST /api/ai/chat
server/index.ts                     # Express 启动、CORS、JSON、错误处理
```

前端只请求 `/api/ai/chat`，由 Node/Express 代理转发到 DeepSeek。这样 API Key 只存在服务端环境变量中，不会出现在浏览器公开代码里。

### 12.3 环境变量

```env
DEEPSEEK_API_KEY=your-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
AI_ENABLE_MOCK_FALLBACK=true
```

说明：

- `DEEPSEEK_API_KEY`：DeepSeek API Key，不配置时自动走 Mock。
- `DEEPSEEK_BASE_URL`：默认 `https://api.deepseek.com`。
- `DEEPSEEK_MODEL`：默认 `deepseek-v4-flash`。
- `AI_ENABLE_MOCK_FALLBACK`：默认开启。设置为 `false` 时，服务端会告诉前端不要自动兜底，通常不建议答辩时关闭。

安全注意：

- 不要把真实 API Key 写入 `src` 前端代码。
- 不要把 `.env` 提交到 GitHub。
- 当前仓库 `.gitignore` 已忽略 `.env` 和 `.env.*`。
- 如果临时改为前端直连大模型 API，只适合本地演示，生产环境不安全。

### 12.4 AI 方法

`aiService.ts` 对组件暴露：

```ts
askTutor(context)
explainConcept(context)
diagnoseCode(context)
generatePracticeHint(context)
reviewQuiz(context)
generateStudyPlan(context)
generateCourseDraft(context)
```

每个方法都会优先尝试调用 DeepSeek。如果遇到 API Key 未配置、网络错误、401、429、500、请求超时、JSON 解析失败等情况，会输出控制台错误并自动返回 Mock 结果，避免页面崩溃。

### 12.5 场景覆盖

| 场景 | 功能 |
|------|------|
| 课程页 / AI 助教 | 带算法上下文问答，支持解释概念、诊断代码、学习建议、来道题、总结本节、举生活例子 |
| 代码练习页 | 先做本地规则检查，再执行 Pyodide 真运行，展示阶段进度和输出，最后生成结构化 AI 代码诊断报告 |
| 测验页 | 提交后可触发 AI 错题讲解，输出薄弱点、错题分析、复习建议和相似题 |
| 学习中心 | 根据 localStorage 学习记录生成 AI 学习路径推荐和今日计划 |
| 可视化组件 | 可点击“AI 解释当前现象”，解释参数变化对模型表现的影响；K-Means 会解释 K 值、迭代、inertia 和簇分布 |
| 管理后台 | 可生成课程草稿；也可管理课程、练习题和测验题，新增内容会进入前台学习流程 |

### 12.6 答辩演示步骤

1. 运行 `npm run dev`，同时启动 Vite 前端和 Express AI 代理。
2. 打开 `http://localhost:3000`。
3. 进入任意课程页，展示 AI 助教模式徽标和快捷提问。
4. 可访问 `http://localhost:8787/api/ai/status` 检查 AI 代理状态，不会泄露 API Key。
5. 进入代码练习页，点击“检查并运行”，展示本地规则评分、Python 运行阶段、运行结果和 AI 代码诊断报告。
6. 进入测验页，答题并提交，点击“AI 讲解我的错题”。
7. 进入学习中心，展示 AI 学习路径推荐。
8. 进入个人中心 → 管理后台，展示 AI 生成课程草稿，并演示题库管理新增/覆盖编辑题目。

---

## 十三、Agent 交接备忘

### 当前内容扩展说明（2026-05-09）

本轮已补齐“算法数量偏少”和“题库/练习管理偏弱”的问题：

- 内置算法从 3 门扩展为 4 门，新增 **K-Means 聚类**，与线性回归、KNN、决策树形成“回归 / 分类 / 树模型 / 无监督聚类”的入门组合。
- 新增 `KMeansViz.tsx`，使用 ECharts 展示聚类散点、聚类中心、K 值调节、迭代次数、簇内分散度、inertia 和最大簇样本数，并接入“AI 解释当前现象”。
- 练习题扩展为 8 道，每个算法 2 道；K-Means 新增基础聚类实现和肘部法练习。
- 测验题扩展为 32 道，每个算法 8 道；K-Means 覆盖无监督学习、K 值、分配/更新步骤、inertia、特征缩放、肘部法、适用数据形状和 sklearn API。
- 管理后台新增 **题库管理** Tab，可新增、编辑、删除自定义练习题和测验题；内置题目支持“本地覆盖编辑”，删除覆盖后恢复默认题目。
- `storageService.ts` 已扩展自定义练习题和测验题的 localStorage CRUD；`getExercisesByAlgorithm`、`getQuizByAlgorithm` 会自动合并内置题目与后台自定义题目。

答辩演示时可补充展示：

1. 首页统计指标会动态显示当前算法、练习题和测验题数量。
2. 进入 K-Means 课程页，拖动 K 值、迭代次数和簇内分散度，观察聚类中心变化。
3. 点击 K-Means 可视化下方“生成解释”，展示 AI 对当前聚类现象的讲解。
4. 进入管理后台 → 题库管理，新增一道测验题或覆盖编辑内置题目，再回到对应测验页验证题目已生效。

### 13.1 环境准备（新 Agent 首次接手）

```bash
# 1. 安装依赖
npm install

# 2. 确认 .env 存在（不存在则从 .env.example 复制）
cp .env.example .env
# 编辑 .env 填入真实 API Key

# 3. 启动项目
npm run dev

# 4. 验证构建
npx tsc --noEmit && npx vite build
```

### 13.2 项目文件速查

| 想了解 | 看这里 |
|--------|--------|
| 项目是什么、怎么跑 | `README.md` |
| 完整技术文档 | `DOCS.md` |
| AI Agent Skills 清单 | `SKILLS.md` |
| 前端路由 | `src/App.tsx` |
| 全局类型定义 | `src/types/index.ts` |
| 静态课程数据 | `src/data/algorithms.ts` |
| AI 服务入口 | `src/services/aiService.ts` |
| AI 类型定义 | `src/services/aiTypes.ts` |
| AI Prompt 模板 | `src/services/aiPromptService.ts` |
| AI Mock 数据 | `src/services/aiMockService.ts` |
| 后端入口 | `server/index.ts` |
| DeepSeek API 调用 | `server/services/deepseekService.ts` |
| 后端路由 | `server/routes/ai.ts` |
| 环境变量模板 | `.env.example` |
| Python 运行时 | `src/services/pythonRuntimeService.ts` |
| 综合评分服务 | `src/services/practiceScoringService.ts` |
| Pyodide 资源同步 | `scripts/sync-pyodide-assets.mjs` |

### 13.3 已知注意事项

- **模型 `deepseek-v4-flash` 是推理模型**，后端默认 `thinking: disabled`。仅在 JSON 模式（代码诊断/错题讲解等）启用 thinking。不要去掉这个默认值，否则简单问答会返回空响应。
- **`.env` 已 gitignore**，新 Agent 需自行创建。
- **前端 Vite 代理**：`/api` 请求由 Vite 转发到 `http://localhost:8787`（Express 后端），无需手动配置 CORS。
- **Mock 覆盖范围**：所有 11 种 AI 操作类型都有 Mock 兜底，无 API Key 时仍可完整演示。
- **10 个 Skills** 已内置于 `.claude/skills/`，Claude Code 自动加载。
- **代码练习验证** 已加入 Pyodide 真运行（`pythonRuntimeService.ts` → `pyodideWorker.ts` Web Worker），覆盖全部 4 个算法（线性回归/KNN/决策树/K-Means）。非 Web Worker 环境自动降级。
- **Pyodide 资源** 不在 Git 中（`public/pyodide/` 已 gitignore），`npm install` 后自动执行 `sync:pyodide` 脚本同步。
- **K-Means** 视频链接暂缺，等待补充。
- **`npm run dev` 同时启动前端+后端**（concurrently），无需分别启动。

### 13.4 最近更新（2026-05-09）

| 提交 | 内容 |
|------|------|
| 当前工作区 | 内页视觉统一：算法页分段学习路径、练习页步骤流水线+分层提示+错误分类、学习中心仪表盘、后台玻璃风格 |
| `97500e0` | AI 可信度：诊断依据卡片、硬规则防幻觉、Zod 校验所有 AI JSON 输出；文档 v2.5.0 |
| `777eb74` | 首页视觉统一：移除突兀深蓝块，粒子颜色柔化，全页面流畅过渡 |
| `15d67ba` | 粒子动态背景 + 鼠标交互；超大 Hero 按钮；全局毛玻璃统一风格 |
| `890bfd4` | 首页动效重制：滚动渐入、数字滚动、渐变文字、浮动光球；3 个新 Skills |
| `d7057c8` | Pyodide Worker 多算法支持；Zod 数据校验；React.lazy 代码拆分（主包 86KB）；bundle 分析脚本 |
| `7f38c47` | 14 个 Vitest 测试；`npm test` 脚本 |
| `487bed5` | AI 工作流横幅；后端频率限制/Key 脱敏/统一错误码/JSON 修复 |
| `2608c8f` | K-Means 课程与可视化；Pyodide 真运行；练习 8 道，测验 32 道；题库管理后台；代码注释过滤 |
| `e19f841` | 文档 Agent 交接更新 |
| `cf2e421` | 修复 DeepSeek thinking 参数、代码质量优化 |
| `0239f87` | AI 模块升级、10 个 Skills、文档对齐 |
| `4bcfcd3` | 文档更新和导航优化 |

### 13.5 安全设计

| 保护措施 | 实现位置 | 说明 |
|----------|----------|------|
| 频率限制 | `server/index.ts` | 每 IP 30 次/分钟，429 自动降级 Mock |
| 请求体限制 | `server/index.ts` | JSON body 最大 1MB |
| API Key 脱敏 | `server/services/deepseekService.ts` | 日志中只输出 `sk-***last4` |
| 统一错误码 | `server/services/deepseekService.ts` | 12 种错误码，不暴露堆栈到前端 |
| JSON 修复 | `server/services/deepseekService.ts` | `tryParseJson()` 自动从 Markdown 提取 JSON |
| 请求超时 | `server/services/deepseekService.ts` | 服务端 20s，客户端 22s（先于客户端超时） |
| AbortController | `src/services/aiService.ts` | 支持页面切换时取消请求，finally 清理计时器 |

### 13.6 测试

```bash
npm test          # 运行全部测试（CI 模式）
npm run test:watch # 监听模式
```

| # | 测试文件 | 覆盖范围 |
|---|---------|----------|
| 1 | `homepage.test.tsx` | 首页渲染、AI 工作流横幅 |
| 2 | `algorithmPage.test.tsx` | 算法详情页按 id 渲染 |
| 3 | `codeCheck.test.ts` | 关键词检查满分、TODO 扣分、缺失关键词检测 |
| 4 | `aiMockService.test.ts` | Mock AI 代码诊断结构完整性、概念解释 |
| 5 | `aiService.fallback.test.ts` | DeepSeek 不可用时自动降级到 Mock |
| 6 | `quiz.test.ts` | 每算法 8 题、全对/全错评分 |
| 7 | `storageService.test.ts` | 练习记录保存/读取、自定义课程持久化 |

> **共 14 个测试用例**，分布在 7 个测试文件中。运行 `npm test` 一键验证。

测试框架：Vitest + @testing-library/react + jsdom。配置文件 `vitest.config.ts`。

---

## 十四、版本演进

| 版本 | 里程碑 |
|------|--------|
| **v1.0.0** | MVP：3 个算法、静态数据、localStorage、Mock AI 兜底 |
| **v2.0.0** | AI 模块升级：DeepSeek 在线模式 + Express 代理 + 7 种 AI 方法 + 多场景覆盖 |
| **v2.1.0** | K-Means 算法 + Pyodide 真运行 + 练习 8 题 / 测验 32 题 + 题库管理后台 |
| **v2.2.0** | AI 工作流横幅 + 后端安全加固（频率限制/Key 脱敏/统一错误码/JSON 修复） |
| **v2.3.0** | 14 个 Vitest 测试 + Zod 数据校验 + 管理面板增强（预览/导入导出/恢复默认） |
| **v2.4.0** | Pyodide Web Worker 全算法真运行 + React.lazy 代码拆分（主包 86KB） + Bundle 分析 |
| **v2.5.0** | 首页沉浸式重制：粒子动态背景 + 鼠标交互 + 滚动渐入 + 数字滚动 + 毛玻璃统一风格 + 13 个 Agent Skills |

---

> 文档生成日期：2026-05-10
> 项目版本：2.5.0
