import type { Algorithm, AIReviewResult } from '../types';

const API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_API_KEY) ||
  '';

const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_BASE_URL) ||
  'https://api.openai.com/v1';

const MODEL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_MODEL) ||
  'gpt-3.5-turbo';

function isRealApiAvailable(): boolean {
  return API_KEY.length > 0;
}

const SYSTEM_PROMPT = `你是机器学习课程的 AI 助教，面向本科初学者。你的名字是"小智"。

你需要遵循以下原则：
1. 用通俗易懂的语言解释复杂概念，多使用生活中的比喻
2. 鼓励学生，肯定他们的进步，用正向的方式指出不足
3. 分步骤解释问题，不要一次性给出所有答案
4. 优先给提示和思路，引导学生自己思考，而不是直接给完整答案
5. 当指出代码问题时，先说明"为什么这是错的"，再说明"怎么改"
6. 回答不要太长，控制在 200 字以内
7. 使用友好的语气，可以适当使用表情符号
8. 如果学生完全没思路，可以先给一个小的提示，让他们尝试后再给更多帮助`;

async function callRealAPI(
  userMessage: string
): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 600,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function mockAIResponse(
  type: 'explain' | 'diagnose' | 'suggest' | 'quiz',
  algorithm: Algorithm,
  context?: string
): string {
  const explainResponses: Record<string, string> = {
    'linear-regression': `好的，让我用简单的方式解释线性回归！🎯

想象你在坐标系里画了一堆散点，线性回归就是找一条"最好的直线"穿过这些点。这条直线可以用方程 y = wx + b 来表示。

**关键理解：**
• w 是斜率——x 每变化 1 单位，y 变化 w 单位
• b 是截距——x=0 时 y 的值
• "最好"的标准是让所有点到这条直线的垂直距离的平方和最小（这就是 MSE）

💡 **生活比喻**：就像你要在一个散乱的鞋盒堆里找一条最短的路径走，线性回归就是帮你找到最"平均"的那条路线。`,
    'knn': `KNN 的核心思想超级简单！🌟

**"近朱者赤，近墨者黑"**——这就是 KNN 的全部哲学。

想象你刚转学到新班级，不知道和谁玩比较好。KNN 的做法是：看看离你最近的 K 个同学，他们中大多数和谁玩，你就和谁玩。

**关键参数 K：**
• K=1：只看最近的一个人 → 很容易被"带偏"（噪声敏感）
• K=大量：看很多人的意见 → 决策更稳定，但可能"随大流"（欠拟合）
• 实践中的 K 通常选奇数（避免平票），通过交叉验证确定

⚠️ KNN 是"懒惰学习"——训练时啥都不干，预测时才临时算距离。`,
    'decision-tree': `决策树就像玩一个"20个问题"的猜谜游戏！🌳

每次问一个问题（判断一个特征），根据答案走到下一个问题，最终猜出答案。

**三个核心概念：**
1. **信息熵**：数据的"混乱程度"。如果一袋糖果全是草莓味的，熵=0（非常确定）；如果混合了10种口味，熵就很高（非常不确定）
2. **信息增益**：问完一个问题后，"混乱程度"减少了多少。增益越大的问题越应该先问
3. **基尼不纯度**：和信息熵类似，但计算更简单——随机抽两个样本，它们类别不同的概率

🎮 **比喻**：决策树就是一个"决策流程图"，每一步都在问"是不是满足XX条件？"`,
  };

  const diagnoseResponses: Record<string, string> = {
    'linear-regression': `让我看看你的线性回归代码... 🔍

**常见问题诊断：**

1. ❌ 忘记导入 train_test_split
   → 记得 from sklearn.model_selection import train_test_split

2. ❌ fit 之前没有创建模型实例
   → 需要先 model = LinearRegression()，再 model.fit(X_train, y_train)

3. ❌ 预测用了训练数据
   → 应该用 X_test 做预测：y_pred = model.predict(X_test)（不是 X_train！）

4. ❌ 忘记评估模型
   → MSE 和 R² 是两个最重要的指标，别忘了导入

需要我具体解释哪个问题？😊`,

    'knn': `检查你的 KNN 代码... 🔍

**容易出错的地方：**

1. ❌ 忘记设置 n_neighbors
   → KNeighborsClassifier(n_neighbors=5)，K 值很重要！

2. ❌ 没有标准化特征
   → KNN 对特征尺度敏感！试试 from sklearn.preprocessing import StandardScaler

3. ❌ K 值设为偶数
   → 二分类时可能出现平票，建议用奇数 K

4. ❌ 混淆了分类和回归
   → 分类用 KNeighborsClassifier，回归用 KNeighborsRegressor

你的代码哪里卡住了？告诉我具体问题~`,

    'decision-tree': `分析你的决策树代码... 🔍

**常见陷阱：**

1. ❌ max_depth 设置太大（或不限制）
   → 决策树会疯狂生长到每个叶子只有 1 个样本 → 严重过拟合！

2. ❌ 忘记设置 random_state
   → 决策树对数据顺序敏感，设 random_state=42 保证结果可复现

3. ❌ criterion 选错了
   → 分类用 'gini' 或 'entropy'，回归用 'squared_error'

4. ❌ 没有可视化树结构
   → 用 plot_tree 画出树结构，理解模型是如何做决策的

对哪个问题感兴趣？我展开讲讲~ 🌟`,
  };

  const suggestResponses: Record<string, string> = {
    'linear-regression': `基于你的学习进度，我建议：📚

**下一步学习路径：**

1. ✨ **巩固基础**：如果正则化还不熟，先去了解 L1（Lasso）和 L2（Ridge）正则化，这是防止过拟合的重要工具

2. 🚀 **实战练习**：尝试用真实数据集（如 Boston Housing 或 California Housing）做一次完整的线性回归分析

3. 📈 **进阶挑战**：学习多项式回归——当你发现数据不是线性关系时的解决方案

4. 💡 **理论深化**：理解最小二乘法的矩阵形式推导：w = (XᵀX)⁻¹Xᵀy

5. 🔄 **关联学习**：线性回归是神经网络的基础！一个神经元本质上就是一个线性回归 + 激活函数

选一个方向，我给你更详细的学习建议~`,

    'knn': `根据你的 KNN 学习情况：📚

**推荐学习路径：**

1. ✨ **深入理解**：尝试用 Python（不用 sklearn）手动实现一个简化版 KNN，从零写距离计算和投票逻辑

2. 🚀 **调参实验**：用不同的 K 值跑同一个数据集，画出 K vs Accuracy 曲线，直观理解 K 的影响

3. 📈 **特征工程**：学习 StandardScaler 和 MinMaxScaler 的用法，对比缩放前后 KNN 的表现差异

4. 💡 **距离度量**：除了欧氏距离，试试曼哈顿距离和余弦相似度在不同场景下的效果

5. 🔄 **关联学习**：KNN 的"邻居投票"思想在推荐系统（协同过滤）中也有广泛应用哦

对哪个方向感兴趣？😊`,

    'decision-tree': `你已学了决策树基础，下一步建议：📚

**进阶路线：**

1. ✨ **手动实现**：尝试用 Python 从零实现 ID3 决策树（基于信息增益），这能让你真正理解树的构建过程

2. 🚀 **集成学习**：理解决策树的"升级版"——Random Forest（随机森林）和 GBDT（梯度提升树）

3. 📈 **调参实验**：对比不同 max_depth、min_samples_split、min_samples_leaf 的效果，画学习曲线

4. 💡 **可视化**：用 plot_tree 和 dtreeviz 画出漂亮的决策树图，理解每个节点的划分逻辑

5. 🔄 **实践项目**：用决策树做一个客户流失预测，这是工业界最常见的应用场景之一

选一个方向继续深入！🌳`,
  };

  const quizResponses: Record<string, string> = {
    'linear-regression': `来试试这道题！📝

**题目**：小明用线性回归预测房价，发现训练集上 MSE=100，测试集上 MSE=500。这说明什么？该如何改进？

（思考 30 秒再往下看...）

**解题思路**：
训练集误差远小于测试集误差 → 这是**过拟合**的典型表现！

可能的改进方案：
1. 减少特征数量（只用最重要的特征）
2. 使用 Ridge（L2 正则化）或 Lasso（L1 正则化）
3. 收集更多训练数据
4. 检查是否存在多重共线性

你觉得哪个方案最合适？为什么？`,

    'knn': `来试试这道 KNN 题目！📝

**题目**：你有一个 2D 分类数据集，训练集中 90% 是类别 A，10% 是类别 B。你用 KNN 分类器（K=5）做预测，发现几乎所有新样本都被预测为 A。这是为什么？怎么解决？

（先自己想想...）

**分析**：
这不是模型的问题，而是**数据不平衡**！K=5 时，在大多数区域，5 个邻居里可能只有 0-1 个 B 类样本，投票结果自然偏向 A。

**解决方案**：
1. 对少数类进行过采样（SMOTE）
2. 使用距离加权投票（weight='distance'）
3. 调整决策阈值
4. 收集更多少数类样本

你遇到过类似情况吗？`,

    'decision-tree': `来看看这道决策树题！📝

**题目**：你用 DecisionTreeClassifier 在鸢尾花数据集上训练，max_depth=None 时训练集准确率 100%，但测试集只有 90%。这正常吗？该怎么做？

（先分析一下...）

**诊断**：
训练集 100% → 测试集 90% → 典型的**过拟合**！不限制深度的决策树会"记住"所有训练样本，包括噪声。

**解决方案**：
1. 设置 max_depth=3 或 4（最直接的方法）
2. 调整 min_samples_split（节点最少样本数）
3. 使用后剪枝（ccp_alpha 参数）
4. 改用 Random Forest（集成学习）

试试设置 max_depth=3，看测试集准确率是否反而提高了？🌳`,
  };

  if (type === 'explain') {
    return explainResponses[algorithm.id] || `让我来解释一下 ${algorithm.name}...\n\n${algorithm.intro}\n\n需要我详细解释哪个部分？`;
  }

  if (type === 'diagnose') {
    if (context) {
      return `分析你的代码...\n\n${context}\n\n${diagnoseResponses[algorithm.id]}\n\n先解决这些问题，然后再检查一次！💪`;
    }
    return diagnoseResponses[algorithm.id] || '把你的代码发给我，我帮你看看问题在哪~';
  }

  if (type === 'suggest') {
    return suggestResponses[algorithm.id] || `关于 ${algorithm.name} 的学习建议：\n\n建议先完成基础练习，理解核心概念，再挑战更高难度的题目。需要具体建议吗？`;
  }

  if (type === 'quiz') {
    return quizResponses[algorithm.id] || `关于 ${algorithm.name} 的一道思考题：\n\n请解释${algorithm.name}的核心原理，并举例说明它的一个应用场景。`;
  }

  return '有什么我可以帮你的吗？';
}

export async function askAI(
  type: 'explain' | 'diagnose' | 'suggest' | 'quiz',
  algorithm: Algorithm,
  context?: string
): Promise<string> {
  if (isRealApiAvailable()) {
    try {
      const messages: Record<string, string> = {
        explain: `请用通俗易懂的方式解释"${algorithm.name}"算法的核心原理，适合机器学习初学者理解。`,
        diagnose: `请帮我诊断以下 ${algorithm.name} 相关代码中可能存在的问题：\n\n${context || '（用户未提供具体代码）'}\n\n请给出具体的问题列表和改进建议。`,
        suggest: `请基于学生在"${algorithm.name}"算法上的学习情况，给出下一步学习建议。包括推荐的学习内容、练习方向和进阶知识。`,
        quiz: `请针对"${algorithm.name}"算法，出一道适合初学者的选择题或思考题，并给出详细的解答。题目应该考察对核心概念的理解，而不是死记硬背。`,
      };
      return await callRealAPI(messages[type]);
    } catch {
      // Fallback to mock on error
    }
  }
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
  return mockAIResponse(type, algorithm, context);
}

export async function askAIChat(
  message: string,
  algorithm: Algorithm
): Promise<string> {
  if (isRealApiAvailable()) {
    try {
      return await callRealAPI(
        `关于"${algorithm.name}"算法，学生问：${message}`
      );
    } catch {
      // Fallback to mock
    }
  }
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

  const lower = message.toLowerCase();
  if (lower.includes('代码') || lower.includes('error') || lower.includes('报错')) {
    return mockAIResponse('diagnose', algorithm, message);
  }
  if (lower.includes('学') || lower.includes('建议') || lower.includes('进阶') || lower.includes('下一步')) {
    return mockAIResponse('suggest', algorithm);
  }
  if (lower.includes('题') || lower.includes('测试') || lower.includes('考')) {
    return mockAIResponse('quiz', algorithm);
  }
  return mockAIResponse('explain', algorithm);
}
