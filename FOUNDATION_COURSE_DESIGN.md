# 基础课程设计文档

> 面向零基础用户的机器学习入门课程体系设计与实现  
> 版本：v2.6.0 | 日期：2026-05-10

---

## 一、设计背景与目标

### 1.1 为什么需要基础课程

当前平台拥有 4 门算法课程（线性回归、KNN、决策树、K-Means），但缺少对零基础用户的引导。很多初学者直接进入算法课程后会遇到以下问题：

- 不理解"机器学习"到底是什么
- 分不清监督学习和无监督学习
- 不知道特征（X）和标签（y）的含义
- 看不懂评估指标（MSE、R²、accuracy）
- 不明白为什么要划分训练集和测试集

### 1.2 设计目标

1. **零门槛**：不依赖任何编程或数学背景
2. **可视化优先**：用交互式演示替代抽象公式
3. **生活类比**：每个概念配备一个生活例子
4. **渐进式**：基础概念 → 数据理解 → 算法学习 → 代码练习

### 1.3 课程体系结构

```
├─ 🌱 机器学习入门与完整流程  ← foundation
├─ 📊 数据、特征、标签与模型评估 ← foundation
├─ 📈 线性回归                 ← algorithm
├─ 🎯 KNN                     ← algorithm
├─ 🌳 决策树                  ← algorithm
└─ 🧩 K-Means                 ← algorithm
```

---

## 二、技术架构

### 2.1 类型系统扩展

**文件**：`src/types/index.ts`

```typescript
// 课程类型
export type CourseType = 'foundation' | 'algorithm' | 'project';

// 基础课程专用字段
export interface CourseConcept {
  title: string;
  description: string;
  example?: string;
}

export interface CourseAnalogy {
  title: string;
  content: string;
}

export interface CourseMisunderstanding {
  wrong: string;
  correct: string;
}

// Algorithm 接口扩展
export interface Algorithm {
  type?: CourseType;           // 新增：课程类型
  category: '...' | 'basic';  // 扩展：新增 'basic'
  // 以下字段改为可选（兼容基础课程）
  formula?: string;
  steps?: string[];
  advantages?: string[];
  disadvantages?: string[];
  useCases?: string[];
  codeExample?: string;
  // 基础课程专用字段
  learningObjectives?: string[];
  concepts?: CourseConcept[];
  analogies?: CourseAnalogy[];
  commonMisunderstandings?: CourseMisunderstanding[];
  visualizationType?: string;
  hasPractice?: boolean;
  hasQuiz?: boolean;
}
```

### 2.2 路由架构

**文件**：`src/pages/CoursePage.tsx`（42 行）

```
App.tsx (/algorithms/:id)
  └─ CoursePage
       ├─ algorithm.type === 'foundation' → FoundationCourseContent
       └─ 其他 → AlgorithmPage（现有算法页）
```

**核心判断逻辑**：
```typescript
if (algorithm.type === 'foundation') {
  return <FoundationCourseContent algorithm={algorithm} />;
}
return <AlgorithmPage />;
```

### 2.3 页面渲染策略

| 课程类型 | 渲染组件 | 有公式？ | 有代码示例？ | 有练习入口？ | 有交互演示？ |
|----------|----------|----------|-------------|-------------|-------------|
| foundation | FoundationCourseContent | 否 | 否 | 否 | 是 |
| algorithm | AlgorithmPage | 是 | 是 | 是 | 是 |

---

## 三、课程内容详述

### 3.1 课程 1：机器学习入门与完整流程

| 字段 | 值 |
|------|-----|
| ID | `ml-intro-workflow` |
| 类型 | `foundation` |
| 难度 | 入门 |
| 图标 | 🌱 |
| 交互演示 | `MLWorkflowViz`（8 步流程时间线） |
| 代码练习 | 否 |
| 测验题 | 7 道 |

#### 学习目标（6 个）
1. 能用自己的话解释什么是机器学习
2. 能区分 AI、机器学习、深度学习的关系
3. 能说出监督学习和无监督学习的关键区别
4. 能辨别回归、分类、聚类分别解决什么问题
5. 能画出机器学习完整流程图（8 步）
6. 能说出平台中 4 个算法分别属于什么类型

#### 核心概念（5 个）
```
1. 什么是机器学习
   → 让计算机从数据中自动学习规律，不需要人类编写每一条规则
   → 生活例子：给计算机看成千上万张猫狗图片，它自己学会区分

2. AI > 机器学习 > 深度学习
   → 俄罗斯套娃：AI ⊃ ML ⊃ DL
   → AI 是大梦想，ML 是主流路径，DL 是数据量极大时的强大方法

3. 监督学习 vs 无监督学习
   → 监督 = 有答案，无监督 = 没有答案
   → 类比：练习题有答案 vs 自己整理积木

4. 回归 vs 分类 vs 聚类
   → 回归→数值、分类→类别、聚类→自动分组

5. 机器学习完整流程（8 步）
   → 收集→清洗→划分→选模→训练→预测→评估→调参
```

#### 生活类比（2 个）
- **教小孩认动物**：不写规则手册，给大量标注图片
- **模拟考和高考**：训练集=平时练习，测试集=最终考试

#### 常见误区（3 个）
- ❌ ML 和传统编程一样 → ✅ ML 是自己学规则
- ❌ DL 一定比传统 ML 好 → ✅ 各有优势
- ❌ 训练完就一劳永逸 → ✅ 需要持续评估和更新

---

### 3.2 课程 2：数据、特征、标签与模型评估

| 字段 | 值 |
|------|-----|
| ID | `data-feature-evaluation` |
| 类型 | `foundation` |
| 难度 | 入门 |
| 图标 | 📊 |
| 交互演示 | `FeatureLabelDemo` + `OverfittingDemo` |
| 代码练习 | 否 |
| 测验题 | 10 道 |

#### 学习目标（7 个）
1. 能解释样本、特征、标签的含义
2. 能区分特征矩阵 X 和标签向量 y
3. 能说明为什么要划分训练集和测试集
4. 知道 MSE 和 R² 分别衡量什么
5. 知道 accuracy 是什么以及它的局限
6. 能用大白话解释过拟合和欠拟合
7. 知道"泛化能力"为什么比"训练集上的表现"更重要

#### 核心概念（5 个）
```
1. 样本、特征与标签
   → 一行=样本，一列=特征，目标列=标签

2. 特征矩阵 X 与标签向量 y
   → X=题目条件，y=正确答案

3. 训练集、验证集、测试集
   → 70% 训练 + 15% 验证 + 15% 测试

4. 过拟合与欠拟合
   → 过拟合=背答案，欠拟合=没学会

5. 泛化能力
   → 在新数据上的表现，比训练集分数更重要
```

---

## 四、交互式演示组件

### 4.1 MLWorkflowViz（188 行）

**功能**：交互式 8 步 ML 流程时间线

| 步骤 | 图标 | 标题 |
|------|------|------|
| 1 | 📥 | 收集数据 |
| 2 | 🔧 | 数据清洗 |
| 3 | ✂️ | 划分数据集 |
| 4 | 🎯 | 选择模型 |
| 5 | 🏋️ | 训练模型 |
| 6 | 🔮 | 预测 |
| 7 | 📊 | 评估 |
| 8 | 🔄 | 调参 |

**技术实现**：
- React `useState` 管理当前展开步骤
- 8 个 Card 组件，点击展开/折叠
- 展开后显示：步骤描述 + 生活类比 + 平台关联
- 响应式布局：4 列（桌面）→ 2 列（平板）→ 1 列（手机）
- 样式：玻璃卡片 `bg-white/70 backdrop-blur-md`

**交互逻辑**：
```
用户点击步骤卡片
  → setActiveStep(stepIndex)
  → 卡片展开，显示详细内容
  → 再次点击或点击其他卡片切换
```

---

### 4.2 FeatureLabelDemo（190 行）

**功能**：交互式特征/标签选择演示

**数据**：6 行房价预测数据

| 面积(m²) | 房间数 | 地段等级 | 房价(万元) |
|----------|--------|---------|-----------|
| 120 | 3 | A | 350 |
| 85 | 2 | B | 220 |
| 150 | 4 | A | 480 |
| 60 | 1 | C | 150 |
| 200 | 5 | A | 620 |
| 95 | 3 | B | 280 |

**技术实现**：
- `useState` 管理当前标签列
- 列头可点击切换"标签"身份
- 底部实时显示：`X.shape = (6, n)` 和 `y.shape = (6,)`
- 根据选择的标签列动态生成解释文本

**交互逻辑**：
```
用户点击列头
  → 该列变为标签（绿色高亮）
  → 其他列自动变为特征（蓝色标记）
  → 底部 X/y 描述实时更新
```

---

### 4.3 OverfittingDemo（364 行）

**功能**：SVG 多项式回归 + 过拟合/欠拟合演示

**技术实现**：
- 30 个合成数据点（sin 曲线 + 噪声）
- SVG 绘制散点 + 拟合曲线
- 封闭式多项式回归（正规方程 + 高斯消元）
- 复杂度滑块（1-20）

**三种状态**：
| 复杂度 | 状态 | 训练误差 | 测试误差 |
|--------|------|---------|---------|
| 1-3 | 欠拟合 | 高 | 高 |
| 4-8 | 正常拟合 | 低 | 低 |
| 9-20 | 过拟合 | 极低 | 升高 |

**交互逻辑**：
```
用户拖动「模型复杂度」滑块
  → 实时重新计算多项式拟合
  → SVG 曲线更新
  → 训练/测试 RMSE 实时更新
  → 状态标签和解释文本切换
```

**纯前端实现**，不依赖任何图表库——使用 SVG path + 数学计算。

---

## 五、测验题设计

### 5.1 课程 1 测验题（7 道）

| # | 知识点 | 题型 |
|---|--------|------|
| 1 | 机器学习定义 | 概念辨析 |
| 2 | AI / ML / DL 关系 | 关系理解 |
| 3 | 监督学习 vs 无监督学习 | 对比区分 |
| 4 | 回归 / 分类 / 聚类 | 应用辨别 |
| 5 | 训练 vs 预测 | 流程理解 |
| 6 | 机器学习完整流程（8 步） | 顺序排列 |
| 7 | 平台 4 个算法类型归属 | 综合应用 |

### 5.2 课程 2 测验题（10 道）

| # | 知识点 | 题型 |
|---|--------|------|
| 1 | 样本、特征、标签 | 定义理解 |
| 2 | X 和 y | 矩阵概念 |
| 3 | 划分数据集目的 | 原因理解 |
| 4 | 训练集/验证集/测试集 | 比例划分 |
| 5 | MSE 含义 | 指标理解 |
| 6 | accuracy | 指标计算 |
| 7 | accuracy 局限性 | 批判思维 |
| 8 | 过拟合 | 现象识别 |
| 9 | 欠拟合 | 现象识别 |
| 10 | 数据泄露 | 误区识别 |

### 5.3 测验题数据结构

```typescript
{
  id: 'ml-quiz-1',
  algorithmId: 'ml-intro-workflow',  // 关联课程
  question: '以下哪项最能描述机器学习？',
  options: ['A', 'B', 'C', 'D'],    // 恰好 4 个选项
  correctIndex: 0,                   // 正确答案 0-3
  explanation: '详细解析...',
}
```

存储位置：`src/data/exercises.ts` → `quizQuestions` Record

---

## 六、AI 助教适配

### 6.1 课程类型感知

**文件**：`src/services/aiPromptService.ts`

系统提示词已加入课程类型适配规则：

```
【课程类型适配】
- foundation 课程：面向零基础，多用生活例子解释概念，
  引导用户理解"为什么"，不要强调代码。
- algorithm 课程：保持现有算法解释、代码诊断、学习建议。
```

### 6.2 上下文传递

每个 AI 请求携带 `courseType` 信息：
```typescript
`课程类型：${a.type || 'algorithm'}`
```

---

## 七、文件清单

### 新增文件（7 个）

| 文件 | 行数 | 功能 |
|------|------|------|
| `src/pages/CoursePage.tsx` | 42 | 路由级类型判断 |
| `src/components/FoundationCourseContent.tsx` | 280 | 基础课程页面布局 |
| `src/components/MLWorkflowViz.tsx` | 188 | 8 步流程时间线 |
| `src/components/FeatureLabelDemo.tsx` | 190 | 特征/标签选择演示 |
| `src/components/OverfittingDemo.tsx` | 364 | 过拟合/欠拟合 SVG 演示 |

### 修改文件（13 个）

| 文件 | 改动 |
|------|------|
| `src/types/index.ts` | 新增 CourseType、CourseConcept 等 4 种类型；Algorithm 接口扩展 |
| `src/data/algorithms.ts` | 新增 2 门基础课程数据（~90 行） |
| `src/data/exercises.ts` | 新增 17 道测验题 |
| `src/App.tsx` | 路由改为 CoursePage |
| `src/pages/AlgorithmPage.tsx` | category 扩展 + 可选字段防御 |
| `src/pages/AdminPage.tsx` | category 扩展 |
| `src/pages/HomePage.tsx` | basic 分类颜色 |
| `src/components/AdminCoursePanel.tsx` | 可选字段 `|| []` 防御 |
| `src/services/aiPromptService.ts` | 课程类型上下文 + 硬规则 |
| `src/services/aiMockService.ts` | steps 可选防御 |

---

## 八、技术要点

### 8.1 可选字段防御策略

基础课程不需要 `formula`、`steps`、`codeExample` 等字段。全平台统一使用以下模式：

```typescript
// 数组字段
algorithm.steps || []
(algorithm.advantages || []).map(...)

// 字符串字段
algorithm.formula || ''
algorithm.codeExample || ''

// 条件渲染
{(algorithm.steps || []).length > 0 && <StepsSection />}
{algorithm.formula && <FormulaSection />}
```

### 8.2 课程类型路由

```typescript
// CoursePage.tsx 核心逻辑
const algorithm = useCourseById(id) || getAlgorithmById(id);

if (!algorithm) return <NotFound />;
if (algorithm.type === 'foundation') {
  return <FoundationCourseContent algorithm={algorithm} />;
}
return <AlgorithmPage />;
```

### 8.3 交互演示加载

```typescript
// FoundationCourseContent.tsx
const vizMap: Record<string, React.ComponentType<{algorithm?: Algorithm}>> = {
  'ml-workflow': MLWorkflowViz,
  'feature-label': FeatureLabelDemo,
  'overfitting': OverfittingDemo,
};

const VizComponent = algorithm.visualizationType 
  ? vizMap[algorithm.visualizationType] 
  : null;
```

---

## 九、验收标准

| # | 标准 | 状态 |
|---|------|------|
| 1 | `npm run build` 通过 | ✅ |
| 2 | `npm test` 通过（14/14） | ✅ |
| 3 | TypeScript 零错误 | ✅ |
| 4 | 首页显示 6 门课程 | ✅ |
| 5 | 侧边栏显示 6 门课程 | ✅ |
| 6 | 基础课正确渲染（无公式/代码区域） | ✅ |
| 7 | 基础课测验可正常提交 | ✅ |
| 8 | 现有 4 个算法课程不受影响 | ✅ |
| 9 | AI 助教根据课程类型调整回答 | ✅ |
| 10 | 3 个交互演示组件正常工作 | ✅ |

---

> 文档类型：课程设计文档  
> 关联版本：v2.6.0  
> 最后更新：2026-05-10
