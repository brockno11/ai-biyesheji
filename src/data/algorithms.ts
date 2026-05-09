import type { Algorithm } from '../types';

export const algorithms: Algorithm[] = [
  {
    id: 'ml-intro-workflow',
    type: 'foundation',
    name: '机器学习入门与完整流程',
    category: 'basic',
    difficulty: '入门',
    icon: '🌱',
    intro: '从零开始理解什么是机器学习，它能帮我们解决什么问题，以及一个完整的机器学习项目是如何从数据到模型一步步走下来的。',
    description: '本课程面向零基础初学者，介绍机器学习的核心概念：监督学习与无监督学习的区别、回归分类聚类的含义、以及数据→训练→预测→评估的完整流程。学完本课你将清楚后续每门算法课在整个知识体系中的位置。',
    formula: '',
    steps: [],
    advantages: [],
    disadvantages: [],
    useCases: [],
    codeExample: '',
    videoUrl: '',
    hasPractice: false,
    hasQuiz: true,
    visualizationType: 'ml-workflow',
    learningObjectives: [
      '能用自己的话解释什么是机器学习',
      '能区分 AI、机器学习、深度学习的关系',
      '能说出监督学习和无监督学习的关键区别',
      '能辨别回归、分类、聚类分别解决什么问题',
      '能画出机器学习完整流程图（8步）',
      '能说出平台中4个算法分别属于什么类型',
    ],
    concepts: [
      { title: '什么是机器学习', description: '机器学习是一种让计算机从数据中自动学习规律的方法，不需要人类编写每一条规则。核心思想是：给计算机大量例子，让它自己发现模式。', example: '比如给计算机看成千上万张猫和狗的图片，它能自己学会区分猫和狗，而不需要你写"猫有尖耳朵、狗有长嘴巴"这样的规则。' },
      { title: 'AI > 机器学习 > 深度学习', description: '人工智能（AI）是最大的概念，机器学习是实现 AI 的一种方法，深度学习又是机器学习中的一个分支。三者就像俄罗斯套娃。', example: 'AI就像"会思考的机器"这个大梦想；机器学习是实现这个梦想的主流路径；深度学习则是在数据量极大时特别强大的那一种机器学习方法。' },
      { title: '监督学习 vs 无监督学习', description: '监督学习的数据带有"标准答案"（标签），模型学习输入到答案的映射。无监督学习的数据没有标签，模型自己寻找数据中的结构和模式。', example: '监督学习好比学生做练习题时有参考答案，做完可以对答案；无监督学习好比学生拿到一堆混杂的积木，要自己分类整理。' },
      { title: '回归 vs 分类 vs 聚类', description: '回归预测连续的数值（如房价 350 万），分类判断离散的类别（如垃圾邮件/正常邮件），聚类把相似的数据自动分成几组（如用户分群）。', example: '回归→"明天的温度是多少度？" 分类→"这封邮件是垃圾邮件吗？" 聚类→"把顾客自动分成几类，每类有相似购买习惯"' },
      { title: '机器学习完整流程', description: '一个机器学习项目通常包含8个步骤：收集数据、数据清洗、划分训练/测试集、选择模型、训练模型、预测、评估、调参优化。这是一个循环迭代的过程。', example: '就像学做菜：收集食材→洗菜切菜→准备练习材料→选菜谱→按菜谱做→尝味道→评价口味→调整调料重新做。' },
    ],
    analogies: [
      { title: '机器学习就像教小孩认动物', content: '你不会给小孩写一本"动物识别规则手册"，而是给他看很多图片并告诉他"这是猫""那是狗"。看得多了，小孩自己就能认出猫和狗。机器学习也是这样——给模型看大量带标签的数据，它自己学会规律。' },
      { title: '训练集和测试集就像模拟考和高考', content: '训练集像平时的模拟考试卷（用来学习和查漏补缺），测试集像最终的高考（用来检验真实水平）。绝对不能拿同一张卷子既当模拟考又当高考——那就作弊了！这也是为什么数据必须分开。' },
    ],
    commonMisunderstandings: [
      { wrong: '机器学习和传统编程一样，都需要人类写清楚每一步规则', correct: '传统编程是"人类写规则，计算机执行"；机器学习是"人类给数据，计算机自己学规则"' },
      { wrong: '深度学习一定比传统机器学习好', correct: '深度学习和传统机器学习各有优势。数据量少时，传统方法（如决策树）往往效果更好且更容易解释。' },
      { wrong: '模型训练完就一劳永逸了', correct: '真实世界中数据会变化，模型需要定期更新。而且训练完≠效果好，还需要评估和调参。' },
    ],
  },
  {
    id: 'data-feature-evaluation',
    type: 'foundation',
    name: '数据、特征、标签与模型评估',
    category: 'basic',
    difficulty: '入门',
    icon: '📊',
    intro: '理解数据是如何组织成"特征矩阵X"和"标签向量y"的，以及怎样判断一个模型到底"好不好"。这门课是连接基础概念和具体算法的桥梁。',
    description: '数据和特征决定了机器学习的上限。本课程将带你理解：什么是样本、特征和标签？训练集、验证集、测试集为什么必须分开？回归任务用 MSE 和 R² 评估，分类任务用 accuracy 和混淆矩阵评估。最后你会认识过拟合和欠拟合这两个"机器学习中最常见的坑"。',
    formula: '',
    steps: [],
    advantages: [],
    disadvantages: [],
    useCases: [],
    codeExample: '',
    videoUrl: '',
    hasPractice: false,
    hasQuiz: true,
    visualizationType: 'feature-label',
    learningObjectives: [
      '能解释样本、特征、标签的含义',
      '能区分特征矩阵 X 和标签向量 y',
      '能说明为什么要划分训练集和测试集',
      '知道 MSE 和 R² 分别衡量什么',
      '知道 accuracy 是什么以及它的局限',
      '能用大白话解释过拟合和欠拟合',
      '知道"泛化能力"为什么比"训练集上的表现"更重要',
    ],
    concepts: [
      { title: '样本、特征与标签', description: '样本就是表格中的一行（一个数据点），特征是每一列（描述样本的属性），标签是我们要预测的那一列（目标值）。', example: '房价预测中：每一套房子是一个样本，面积/房间数/地段是特征，房价是标签。' },
      { title: '特征矩阵 X 与标签向量 y', description: '机器学习用 X 表示所有特征组成的矩阵（每行一个样本，每列一个特征），用 y 表示所有标签组成的向量。模型的本质就是学习 X→y 的映射关系。', example: '就像做数学题：X 是题目条件，y 是正确答案。模型就是根据条件推导答案的那个"公式"。' },
      { title: '训练集、验证集、测试集', description: '训练集用来让模型学习（≈70%数据），验证集用来调参和选择模型（≈15%），测试集用来最终评估模型的真实能力（≈15%）。三个集合必须互不重叠。', example: '类比：训练集=平时作业（可以反复看答案），验证集=月考（检验学习方向对不对），测试集=期末考（最终打分，不能提前看题）。' },
      { title: '过拟合与欠拟合', description: '过拟合：模型把训练数据"背"得太死，连噪声都记住了，导致在训练集上表现完美但在新数据上表现糟糕。欠拟合：模型太简单，连训练数据的基本规律都没学到，训练集和测试集都表现不好。', example: '过拟合=学生把所有课后题答案背下来但换道新题就不会做；欠拟合=学生连课后题都做不对，根本没学会。' },
      { title: '泛化能力', description: '泛化能力是模型在新数据上的表现，是衡量模型好坏最重要的指标。一个训练集满分但测试集不及格的模型，不是好模型。', example: '真正的好学生不是"只会做做过的题"，而是"没见过的题型也能根据基本方法推导出来"。模型也一样。' },
    ],
    analogies: [
      { title: 'X 和 y 就像数学题和答案', content: 'X 是题目条件（已知信息），y 是标准答案（要预测的目标）。模型就像一个学生，看了很多道题（X）和答案（y）后，学会了做题的方法（规律），下次遇到新题（新 X）也能给出合理的答案（预测 y）。' },
      { title: 'MSE 就像考试扣分标准', content: 'MSE（均方误差）衡量预测值和真实值之间的平均差距。差距越大，MSE 越大，说明模型越不准。就像考试：每道题预测的答案和标准答案差多少？把所有题目的分差平方加总求平均。' },
    ],
    commonMisunderstandings: [
      { wrong: '在训练集上准确率 99% 就是好模型', correct: '可能是过拟合！真正重要的是在模型从未见过的测试集上的表现。' },
      { wrong: '特征越多模型越好', correct: '无关特征反而会降低模型性能。好的特征比多的特征更重要。而且特征太多可能导致维度灾难。' },
      { wrong: '训练集和测试集可以重叠', correct: '绝不！这被称为数据泄露，是最常见的初学者错误之一。如果测试集和训练集有重合，你评估的就不是模型的"泛化能力"而是"记忆能力"了。' },
    ],
  },
  {
    id: 'linear-regression',
    type: 'algorithm',
    name: '线性回归',
    category: 'regression',
    difficulty: '入门',
    icon: '📈',
    intro: '线性回归是机器学习中最基础、最经典的回归算法。它假设目标值与特征之间存在线性关系，通过最小化预测值与真实值之间的误差平方和来找到最佳拟合直线。',
    description:
      '线性回归（Linear Regression）是一种用于建模数值型连续变量之间关系的监督学习算法。它通过拟合一条直线（或超平面）来描述一个因变量 y 与一个或多个自变量 x 之间的关系。最简单的形式是一元线性回归：y = wx + b，其中 w 为权重（斜率），b 为偏置（截距）。模型的训练目标是最小化均方误差（MSE），即让预测值与真实值之间差的平方和最小。梯度下降是最常用的优化方法，通过迭代更新参数来逼近最优解。',
    formula: `## 一元线性回归模型
y = wx + b

## 均方误差 (MSE)
MSE = (1/n) * Σ(yᵢ - ŷᵢ)²

## 梯度下降更新规则
w := w - α * ∂MSE/∂w
b := b - α * ∂MSE/∂b

其中 α 为学习率（learning rate），控制每次更新的步长。

## 偏导数计算
∂MSE/∂w = (-2/n) * Σ xᵢ(yᵢ - ŷᵢ)
∂MSE/∂b = (-2/n) * Σ (yᵢ - ŷᵢ)`,
    steps: [
      '数据准备：收集特征 x 和目标 y 的数据集',
      '初始化参数：将权重 w 和偏置 b 初始化为 0 或随机小值',
      '前向传播：根据当前参数计算预测值 ŷ = wx + b',
      '计算损失：使用均方误差（MSE）计算预测值与真实值之间的差距',
      '计算梯度：对损失函数求 w 和 b 的偏导数',
      '参数更新：使用梯度下降更新 w 和 b',
      '重复迭代：重复步骤 3-6，直到损失收敛或达到最大迭代次数',
      '模型评估：使用 R²（决定系数）或 MSE 评估模型效果',
    ],
    advantages: [
      '原理简单，易于理解和实现',
      '训练速度快，适合大规模数据',
      '可解释性强，权重直接反映特征重要性',
      '不需要特征缩放也能正常工作（但缩放有助于梯度下降）',
      '正则化扩展（Lasso、Ridge）可以防止过拟合',
    ],
    disadvantages: [
      '只能拟合线性关系，无法处理复杂的非线性数据',
      '对异常值（outliers）非常敏感',
      '假设特征之间相互独立（多重共线性问题）',
      '模型表达能力有限，容易欠拟合',
      '需要自变量和因变量之间存在线性关系的假设',
    ],
    useCases: [
      '房价预测：根据房屋面积、卧室数量、地段等预测房价',
      '销售预测：根据广告投入、季节性因素预测销售额',
      '身高体重关系：根据身高预测体重',
      '学习时间与成绩：根据学习时长预测考试成绩',
      '股票趋势分析：基本的趋势线拟合',
    ],
    codeExample: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# 1. 准备数据
np.random.seed(42)
X = np.random.rand(100, 1) * 10  # 特征
y = 2.5 * X.squeeze() + 3 + np.random.randn(100) * 2  # 目标值

# 2. 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 3. 创建并训练模型
model = LinearRegression()
model.fit(X_train, y_train)

# 4. 查看模型参数
print(f"权重 w: {model.coef_[0]:.3f}")
print(f"偏置 b: {model.intercept_:.3f}")
# 输出: 权重 w ≈ 2.5, 偏置 b ≈ 3.0

# 5. 预测
y_pred = model.predict(X_test)

# 6. 评估
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"MSE: {mse:.3f}, R²: {r2:.3f}")`,
    videoUrl: 'https://player.bilibili.com/player.html?bvid=BV1ZZCkBREVE',
  },
  {
    id: 'knn',
    type: 'algorithm',
    name: 'K近邻算法',
    category: 'classification',
    difficulty: '入门',
    icon: '🎯',
    intro: 'KNN 是一种直观易懂的分类（和回归）算法。它的核心思想是"近朱者赤，近墨者黑"——一个样本的类别由离它最近的 K 个邻居投票决定。',
    description:
      'K近邻算法（K-Nearest Neighbors，KNN）是一种基于实例的非参数监督学习算法。它不需要显式的训练过程（因此被称为"懒惰学习"），在预测时才进行计算。对于分类任务，KNN 找出距离待预测样本最近的 K 个训练样本，然后根据这些邻居的类别进行多数投票，得票最多的类别即为预测结果。距离度量通常使用欧氏距离。K 值的选择至关重要：K 太小容易受噪声影响（过拟合），K 太大则决策边界模糊（欠拟合）。',
    formula: `## 欧氏距离
对于两个 n 维向量 p 和 q：

d(p,q) = √(Σ(pᵢ - qᵢ)²)

## 分类决策
对于 K 个最近邻居的类别集合 {y₁, y₂, ..., yₖ}：

ŷ = argmax Σ I(yᵢ = c)
       c    i=1到K

其中 I 为指示函数，c 为类别标签。
即选择出现次数最多的类别。

## 常用距离度量
- 欧氏距离：d = √(Σ(pᵢ - qᵢ)²)
- 曼哈顿距离：d = Σ|pᵢ - qᵢ|
- 闵可夫斯基距离：d = (Σ|pᵢ - qᵢ|ᵖ)^{(1/p)}
- 余弦相似度：cos(θ) = (p·q) / (||p|| × ||q||)`,
    steps: [
      '选择 K 值：确定邻居数量 K（通常使用交叉验证选择最优 K）',
      '计算距离：对待预测样本，计算它与训练集中所有样本的距离',
      '排序：将所有距离按从小到大排序',
      '选择邻居：选取距离最小的 K 个样本作为最近邻居',
      '投票决策：统计 K 个邻居中每个类别的出现次数',
      '输出预测：选择票数最多的类别作为预测结果',
      '（可选）距离加权：给距离更近的邻居更高的投票权重',
    ],
    advantages: [
      '原理极其简单，无需训练过程（懒惰学习）',
      '天然支持多分类问题',
      '对异常值不敏感（K > 1 时）',
      '无需假设数据分布，非参数方法',
      '新数据加入时不需要重新训练',
    ],
    disadvantages: [
      '预测速度慢：每次预测都需要计算与所有训练样本的距离',
      '维度灾难：高维数据下距离变得不具区分性',
      '需要大量存储空间来保存所有训练数据',
      'K 值选择对结果影响很大',
      '样本不平衡时，多数类会主导预测',
      '所有特征的权重相同（除非手动加权）',
    ],
    useCases: [
      '手写数字识别：与已知数字样本比较，找出最相似的 K 个',
      '推荐系统：找到与目标用户兴趣最相似的 K 个用户',
      '客户分类：根据消费行为对客户进行分群',
      '图像分类：基本的图像识别任务',
      '异常检测：远离所有邻居的样本可能是异常点',
    ],
    codeExample: `import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# 1. 准备数据
np.random.seed(42)
# 两类数据：类别 0 聚集在 (2,2)，类别 1 聚集在 (5,5)
n = 50
X0 = np.random.randn(n, 2) * 1.0 + [2, 2]
X1 = np.random.randn(n, 2) * 1.0 + [5, 5]
X = np.vstack([X0, X1])
y = np.array([0]*n + [1]*n)

# 2. 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 3. 创建并训练模型
model = KNeighborsClassifier(n_neighbors=5)
model.fit(X_train, y_train)

# 4. 预测
y_pred = model.predict(X_test)

# 5. 评估
accuracy = accuracy_score(y_test, y_pred)
print(f"准确率: {accuracy:.2%}")
print(classification_report(y_test, y_pred))`,
    videoUrl: 'https://player.bilibili.com/player.html?bvid=BV1TW4y1w7MW',
  },
  {
    id: 'decision-tree',
    type: 'algorithm',
    name: '决策树',
    category: 'tree',
    difficulty: '中级',
    icon: '🌳',
    intro: '决策树模仿人类做决策的过程，通过一系列"如果…就…"的规则对数据进行分类或回归。它像一棵倒置的树，从根节点开始，每个内部节点是一个特征判断，每个叶子节点是一个预测结果。',
    description:
      '决策树（Decision Tree）是一种树形结构的监督学习算法，可用于分类和回归任务。它通过递归地选择最优特征对数据集进行划分，构建一棵决策树。树的每个内部节点代表对一个特征的判断，每个分支代表判断结果，每个叶子节点代表最终的分类或回归值。核心问题是如何选择最优划分特征——分类树常用基尼不纯度（Gini Impurity）或信息增益（Information Gain），回归树常用均方误差（MSE）减少量。为防止过拟合，通常会限制树的深度或进行剪枝。',
    formula: `## 信息熵
H(D) = -Σ p(c) × log₂(p(c))

其中 p(c) 是类别 c 在数据集 D 中的比例。

## 信息增益
IG(D, A) = H(D) - Σ (|Dv|/|D|) × H(Dv)

其中 A 是特征，Dv 是按特征 A 取值为 v 的子集。

## 基尼不纯度
Gini(D) = 1 - Σ p(c)²

## 基尼增益
ΔGini(D, A) = Gini(D) - Σ (|Dv|/|D|) × Gini(Dv)

## 划分条件
对于数值特征：Xⱼ ≤ threshold
对于分类特征：Xⱼ ∈ {value₁, value₂, ...}`,
    steps: [
      '选择根节点：计算所有特征的信息增益（或基尼增益），选择增益最大的特征作为根节点',
      '数据集划分：根据根节点的取值将数据集分成若干子集',
      '递归构建：对每个子集，重复步骤 1-2，生成子节点',
      '停止条件判断：检查是否满足停止条件（如所有样本同类、达到最大深度、样本数过少）',
      '生成叶子节点：如果不满足停止条件则继续分裂，否则将当前节点标记为叶子节点',
      '预剪枝/后剪枝：防止过拟合——预剪枝在构建时提前停止，后剪枝在构建后删除不重要的分支',
      '模型预测：新样本从根节点开始，根据特征值沿树向下走到叶子节点，输出叶子节点的类别',
    ],
    advantages: [
      '模型直观可解释，可以画出树结构图',
      '无需大量数据预处理（不需要归一化或标准化）',
      '能同时处理数值型和类别型特征',
      '白盒模型：每个决策路径都可以清晰解释',
      '非线性分类能力强',
    ],
    disadvantages: [
      '容易过拟合：不限制深度的树可以完美记住训练数据',
      '对数据变化敏感：微小的数据变化可能生成完全不同的树',
      '贪婪算法不保证全局最优',
      '偏向选择取值多的特征（信息增益的固有偏置）',
      '不适合处理高维稀疏数据',
    ],
    useCases: [
      '信用审批：根据收入、年龄、信用记录判断是否批准贷款',
      '医疗诊断：根据症状、检查指标判断疾病类型',
      '客户流失预测：判断客户是否有流失风险',
      '故障诊断：根据设备参数判断故障原因',
      '游戏 AI：决策树的规则系统（如行为树）',
    ],
    codeExample: `import numpy as np
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import matplotlib.pyplot as plt

# 1. 准备数据（鸢尾花经典数据集）
from sklearn.datasets import load_iris
iris = load_iris()
X, y = iris.data, iris.target

# 2. 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 3. 创建并训练模型
model = DecisionTreeClassifier(
    max_depth=3,
    criterion='gini',  # 或 'entropy'
    random_state=42
)
model.fit(X_train, y_train)

# 4. 预测
y_pred = model.predict(X_test)

# 5. 评估
accuracy = accuracy_score(y_test, y_pred)
print(f"准确率: {accuracy:.2%}")
print(f"特征重要性: {model.feature_importances_}")

# 6. 可视化决策树
plt.figure(figsize=(12, 8))
plot_tree(model, feature_names=iris.feature_names,
          class_names=iris.target_names, filled=True)
plt.show()`,
    videoUrl: 'https://player.bilibili.com/player.html?bvid=BV1gP4y177cf',
  },
  {
    id: 'k-means',
    type: 'algorithm',
    name: 'K-Means 聚类',
    category: 'clustering',
    difficulty: '入门',
    icon: '🧩',
    intro: 'K-Means 是经典的无监督聚类算法，会把没有标签的数据自动分成 K 个相似的小组，适合理解“让数据自己站队”的思想。',
    description:
      'K-Means 聚类是一种无监督学习算法。它不需要提前给样本贴标签，而是通过不断更新聚类中心，把距离相近的样本分到同一个簇中。算法会先随机或按规则初始化 K 个中心点，然后重复执行“分配样本到最近中心”和“用簇内样本均值更新中心”两个步骤，直到中心基本不再移动或达到迭代次数。它非常适合做用户分群、图像颜色压缩、异常观察和探索性数据分析。',
    formula: `## 距离度量
d(x, c) = sqrt(sum((x_i - c_i)^2))

## 优化目标
min Σ ||x - c_k||²

其中 x 表示样本点，c_k 表示第 k 个聚类中心。K-Means 的目标是让每个样本到所属中心的距离平方和尽可能小。`,
    steps: [
      '选择 K 值：先确定希望把数据分成几个簇',
      '初始化中心：生成 K 个初始聚类中心',
      '分配样本：把每个样本分给距离最近的中心',
      '更新中心：计算每个簇内样本的均值作为新中心',
      '重复迭代：持续分配和更新，直到中心移动很小或达到最大迭代次数',
      '评估结果：观察簇内平方和 inertia、簇大小是否均衡以及业务解释是否合理',
    ],
    advantages: [
      '原理直观，适合入门理解无监督学习',
      '计算速度快，适合中小规模数据探索',
      '可视化效果好，聚类中心移动过程容易展示',
      '结果便于和业务分群场景结合解释',
    ],
    disadvantages: [
      '需要提前指定 K 值',
      '对初始中心比较敏感，不同随机种子可能得到不同结果',
      '更适合球状、大小相近的簇，对复杂形状聚类效果有限',
      '对特征尺度敏感，通常需要标准化',
      '容易受到离群点影响',
    ],
    useCases: [
      '客户分群：根据消费频率和消费金额划分用户群体',
      '图像压缩：把相近颜色聚成少量代表色',
      '商品分组：根据销量、价格、评分等指标发现商品类型',
      '学习行为分析：按学习时长、测验得分、练习次数划分学生状态',
      '异常观察：远离所有聚类中心的点可能值得重点检查',
    ],
    codeExample: `import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 1. 准备二维样本
np.random.seed(42)
cluster_a = np.random.normal([2, 2], 0.5, size=(60, 2))
cluster_b = np.random.normal([6, 3], 0.6, size=(60, 2))
cluster_c = np.random.normal([4, 7], 0.7, size=(60, 2))
X = np.vstack([cluster_a, cluster_b, cluster_c])

# 2. 特征缩放
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 3. 训练 K-Means
model = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = model.fit_predict(X_scaled)

# 4. 查看结果
print("聚类中心:", model.cluster_centers_)
print("簇内平方和:", model.inertia_)
print("每个簇的样本数:", np.bincount(labels))`,
    videoUrl: 'https://player.bilibili.com/player.html?bvid=BV1sM4y1U7Ph',
  },
];

export const getAlgorithmById = (id: string): Algorithm | undefined =>
  algorithms.find((a) => a.id === id);
