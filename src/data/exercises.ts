import type { Exercise, QuizQuestion } from '../types';

export const exercises: Exercise[] = [
  {
    id: 'lr-ex-1',
    algorithmId: 'linear-regression',
    title: '实现线性回归训练流程',
    difficulty: '入门',
    description: '补全代码，使用 sklearn 完成线性回归模型的训练、预测和评估。这是线性回归最基础的练习，你需要导入正确的库、创建模型、训练并评估。',
    instructions: [
      '导入 LinearRegression 模型类',
      '使用 train_test_split 划分数据集',
      '使用 fit 方法训练模型',
      '使用 predict 方法进行预测',
      '使用 mean_squared_error 评估模型性能',
    ],
    starterCode: `# 线性回归练习：房价预测
import numpy as np
from sklearn.linear_model import ???  # TODO: 导入正确的类
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# 生成模拟的房价数据
np.random.seed(42)
n_samples = 200
# 特征：房屋面积（平方米）
X = np.random.rand(n_samples, 1) * 200 + 30
# 目标：房价（万元），真实关系：price = 2.5 * area + 50 + noise
y = 2.5 * X.squeeze() + 50 + np.random.randn(n_samples) * 15

# TODO: 使用 train_test_split 划分训练集和测试集
# X_train, X_test, y_train, y_test = ???

# TODO: 创建 LinearRegression 模型实例
# model = ???

# TODO: 使用 fit 方法训练模型
# model.???

# TODO: 使用 predict 方法进行预测
# y_pred = ???

# 打印结果
print(f"模型权重: {model.coef_[0]:.2f}")
print(f"模型截距: {model.intercept_:.2f}")
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"MSE: {mse:.2f}")
print(f"R²: {r2:.3f}")`,
    expectedKeywords: [
      'LinearRegression',
      'train_test_split',
      'fit',
      'predict',
      'mean_squared_error',
    ],
    checkRules: [
      {
        type: 'keyword',
        keyword: 'LinearRegression',
        description: '导入 LinearRegression 类',
        points: 20,
      },
      {
        type: 'keyword',
        keyword: 'train_test_split',
        description: '使用 train_test_split 划分数据集',
        points: 20,
      },
      {
        type: 'keyword',
        keyword: 'fit',
        description: '使用 fit 方法训练模型',
        points: 20,
      },
      {
        type: 'keyword',
        keyword: 'predict',
        description: '使用 predict 方法进行预测',
        points: 20,
      },
      {
        type: 'keyword',
        keyword: 'mean_squared_error',
        description: '使用 mean_squared_error 评估模型',
        points: 20,
      },
    ],
  },
  {
    id: 'lr-ex-2',
    algorithmId: 'linear-regression',
    title: '多元线性回归与特征工程',
    difficulty: '中级',
    description: '实现多元线性回归，理解多个特征对预测结果的影响，并尝试简单的特征工程。',
    instructions: [
      '创建包含多个特征的数据集',
      '理解每个特征的系数含义',
      '使用 r2_score 评估模型',
      '尝试分析特征重要性',
    ],
    starterCode: `# 多元线性回归练习：房价多因素预测
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# 生成多元数据
np.random.seed(42)
n = 200
area = np.random.rand(n) * 150 + 50        # 面积
rooms = np.random.randint(1, 6, n)          # 卧室数
age = np.random.rand(n) * 30                 # 房龄
floor = np.random.randint(1, 30, n)         # 楼层

# 合并特征
X = np.column_stack([area, rooms, age, floor])
# 真实房价公式
y = 2.0 * area + 8.0 * rooms - 1.5 * age + 0.5 * floor + 30 + np.random.randn(n) * 10

# TODO: 划分训练集和测试集
# X_train, X_test, y_train, y_test = ???

# TODO: 创建并训练模型
# model = ???
# model.???(X_train, y_train)

# TODO: 预测并评估
# y_pred = ???
# r2 = ???

# TODO: 打印特征系数，分析哪个特征最重要
# print("特征系数:", ???)
# print("R²:", r2)`,
    expectedKeywords: [
      'LinearRegression',
      'fit',
      'predict',
      'r2_score',
      'coef_',
    ],
    checkRules: [
      {
        type: 'keyword',
        keyword: 'LinearRegression',
        description: '导入并使用 LinearRegression',
        points: 15,
      },
      {
        type: 'keyword',
        keyword: 'train_test_split',
        description: '使用 train_test_split 划分数据',
        points: 15,
      },
      {
        type: 'keyword',
        keyword: 'fit',
        description: '使用 fit 方法训练模型',
        points: 20,
      },
      {
        type: 'keyword',
        keyword: 'predict',
        description: '使用 predict 方法预测',
        points: 15,
      },
      {
        type: 'keyword',
        keyword: 'r2_score',
        description: '使用 r2_score 评估',
        points: 15,
      },
      {
        type: 'keyword',
        keyword: 'coef_',
        description: '查看特征系数',
        points: 20,
      },
    ],
  },
  {
    id: 'knn-ex-1',
    algorithmId: 'knn',
    title: 'KNN 分类器基础实现',
    difficulty: '入门',
    description: '使用 sklearn 的 KNeighborsClassifier 完成一个简单的二分类任务，理解 KNN 的工作原理和 K 值的影响。',
    instructions: [
      '导入 KNeighborsClassifier 类',
      '创建分类数据集',
      '使用 train_test_split 划分数据',
      '训练 KNN 分类器并设置 n_neighbors 参数',
      '使用 accuracy_score 评估准确率',
    ],
    starterCode: `# KNN 分类器练习：客户分类
import numpy as np
from sklearn.neighbors import ???  # TODO: 导入 KNN 分类器
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# 生成模拟客户数据
np.random.seed(42)
n = 100
# 类别 0：低消费客户（年龄较大，消费较低）
age0 = np.random.normal(45, 8, n)
spend0 = np.random.normal(200, 40, n)
# 类别 1：高消费客户（年龄较轻，消费较高）
age1 = np.random.normal(28, 6, n)
spend1 = np.random.normal(500, 80, n)

X = np.column_stack([
    np.concatenate([age0, age1]),
    np.concatenate([spend0, spend1])
])
y = np.array([0]*n + [1]*n)

# TODO: 划分训练集和测试集
# X_train, X_test, y_train, y_test = ???

# TODO: 创建 KNN 分类器，设置 n_neighbors=5
# model = ???

# TODO: 训练模型（注意：KNN 的 fit 只是存储数据）
# model.???(X_train, y_train)

# TODO: 预测
# y_pred = ???

# TODO: 评估准确率
# accuracy = ???
# print(f"准确率: {accuracy:.2%}")

# 尝试不同 K 值
for k in [1, 3, 5, 7, 9, 11, 15]:
    model_k = KNeighborsClassifier(n_neighbors=k)
    model_k.fit(X_train, y_train)
    acc = accuracy_score(y_test, model_k.predict(X_test))
    print(f"K={k:2d}: 准确率 = {acc:.2%}")`,
    expectedKeywords: [
      'KNeighborsClassifier',
      'train_test_split',
      'fit',
      'predict',
      'accuracy_score',
      'n_neighbors',
    ],
    checkRules: [
      {
        type: 'keyword',
        keyword: 'KNeighborsClassifier',
        description: '导入 KNeighborsClassifier',
        points: 20,
      },
      {
        type: 'keyword',
        keyword: 'train_test_split',
        description: '划分训练集和测试集',
        points: 15,
      },
      {
        type: 'keyword',
        keyword: 'fit',
        description: '使用 fit 方法训练模型',
        points: 15,
      },
      {
        type: 'keyword',
        keyword: 'predict',
        description: '使用 predict 方法预测',
        points: 15,
      },
      {
        type: 'keyword',
        keyword: 'accuracy_score',
        description: '使用 accuracy_score 评估',
        points: 15,
      },
      {
        type: 'keyword',
        keyword: 'n_neighbors',
        description: '设置 K 值参数',
        points: 20,
      },
    ],
  },
  {
    id: 'dt-ex-1',
    algorithmId: 'decision-tree',
    title: '决策树分类器实现',
    difficulty: '入门',
    description: '使用 DecisionTreeClassifier 实现鸢尾花分类，理解决策树中 max_depth 和 criterion 参数的作用。',
    instructions: [
      '导入 DecisionTreeClassifier 类',
      '加载鸢尾花数据集（模拟数据或 sklearn 内置数据）',
      '设置 max_depth 控制树的深度',
      '选择 criterion 参数（gini 或 entropy）',
      '对比不同深度的决策树表现',
    ],
    starterCode: `# 决策树练习：鸢尾花分类
import numpy as np
from sklearn.tree import ???  # TODO: 导入决策树分类器
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# 生成模拟鸢尾花数据（简化版：2 个特征，方便可视化）
np.random.seed(42)
n = 50
# 类别 0：花瓣短且窄
X0 = np.column_stack([
    np.random.normal(1.5, 0.3, n),
    np.random.normal(0.3, 0.1, n)
])
# 类别 1：花瓣中等
X1 = np.column_stack([
    np.random.normal(4.0, 0.5, n),
    np.random.normal(1.3, 0.2, n)
])
# 类别 2：花瓣长且宽
X2 = np.column_stack([
    np.random.normal(5.5, 0.5, n),
    np.random.normal(2.0, 0.3, n)
])

X = np.vstack([X0, X1, X2])
y = np.array([0]*n + [1]*n + [2]*n)

# TODO: 划分训练集和测试集
# X_train, X_test, y_train, y_test = ???

# TODO: 创建决策树（设置 max_depth=3, criterion='gini'）
# model = ???

# TODO: 训练模型
# model.???(X_train, y_train)

# TODO: 预测并评估
# y_pred = ???
# accuracy = ???
# print(f"准确率: {accuracy:.2%}")

# TODO: 尝试不同深度
for depth in [1, 2, 3, 5, 10, None]:
    model_d = DecisionTreeClassifier(
        max_depth=depth,
        criterion='gini',
        random_state=42
    )
    model_d.fit(X_train, y_train)
    acc = accuracy_score(y_test, model_d.predict(X_test))
    print(f"max_depth={depth}: 准确率 = {acc:.2%}")

print("\\n提示：观察 max_depth 对模型性能的影响！")`,
    expectedKeywords: [
      'DecisionTreeClassifier',
      'fit',
      'predict',
      'max_depth',
      'accuracy_score',
    ],
    checkRules: [
      {
        type: 'keyword',
        keyword: 'DecisionTreeClassifier',
        description: '导入 DecisionTreeClassifier',
        points: 20,
      },
      {
        type: 'keyword',
        keyword: 'train_test_split',
        description: '划分训练集和测试集',
        points: 15,
      },
      {
        type: 'keyword',
        keyword: 'fit',
        description: '使用 fit 方法训练',
        points: 15,
      },
      {
        type: 'keyword',
        keyword: 'predict',
        description: '使用 predict 方法预测',
        points: 15,
      },
      {
        type: 'keyword',
        keyword: 'max_depth',
        description: '设置最大深度参数',
        points: 20,
      },
      {
        type: 'keyword',
        keyword: 'accuracy_score',
        description: '使用 accuracy_score 评估',
        points: 15,
      },
    ],
  },
];

export const quizQuestions: Record<string, QuizQuestion[]> = {
  'linear-regression': [
    {
      id: 'lr-quiz-1',
      algorithmId: 'linear-regression',
      question: '线性回归中，均方误差（MSE）损失函数对参数求导后，权重 w 的梯度公式是什么？',
      options: [
        '(-2/n) * Σ xᵢ(yᵢ - ŷᵢ)',
        '(2/n) * Σ (yᵢ + ŷᵢ)',
        '(-1/n) * Σ (xᵢ - ŷᵢ)',
        '(1/n) * Σ xᵢ²',
      ],
      correctIndex: 0,
      explanation: 'MSE = (1/n) * Σ(yᵢ - ŷᵢ)²。对 w 求偏导：∂MSE/∂w = (-2/n) * Σ xᵢ(yᵢ - ŷᵢ)。这是梯度下降中用来更新权重 w 的关键公式。',
    },
    {
      id: 'lr-quiz-2',
      algorithmId: 'linear-regression',
      question: '学习率（learning rate）设置过大时，梯度下降会出现什么问题？',
      options: [
        '损失函数值可能发散或震荡，无法收敛',
        '训练速度会变慢',
        '模型会自动停止训练',
        '不会有什么问题',
      ],
      correctIndex: 0,
      explanation: '学习率过大会导致参数更新步长太大，可能"跳过"最优解，使损失函数值越来越大（发散）或在最优解附近来回震荡，无法稳定收敛。',
    },
    {
      id: 'lr-quiz-3',
      algorithmId: 'linear-regression',
      question: '在 sklearn 中，LinearRegression 使用什么方法来训练模型？',
      options: ['.train()', '.fit()', '.learn()', '.solve()'],
      correctIndex: 1,
      explanation: '在 sklearn 中，所有模型的训练方法统一使用 .fit(X, y)。这是 sklearn 的设计规范之一。',
    },
    {
      id: 'lr-quiz-4',
      algorithmId: 'linear-regression',
      question: 'R²（决定系数）的取值范围和含义是什么？',
      options: [
        '取值范围 [-∞, 0]，越接近 0 越好',
        '取值范围 [0, 1]，越接近 1 表示模型拟合越好',
        '取值范围 [0, ∞)，越大越好',
        '取值范围 (-∞, 1]，越接近 1 表示模型解释力越强',
      ],
      correctIndex: 3,
      explanation: 'R² 的取值范围是 (-∞, 1]，越接近 1 表示模型解释的方差比例越大，拟合效果越好。当 R² < 0 时，说明模型效果还不如直接取均值。',
    },
    {
      id: 'lr-quiz-5',
      algorithmId: 'linear-regression',
      question: '在线性回归中使用 train_test_split 的目的是什么？',
      options: [
        '加速模型训练',
        '将数据分为训练集和测试集，评估模型的泛化能力',
        '对数据进行归一化处理',
        '增加数据量',
      ],
      correctIndex: 1,
      explanation: 'train_test_split 将数据集划分为训练集和测试集。训练集用于学习模型参数，测试集用于评估模型在未见过的数据上的表现（泛化能力），防止过拟合。',
    },
  ],
  'knn': [
    {
      id: 'knn-quiz-1',
      algorithmId: 'knn',
      question: 'KNN 算法中，K 值设置过小（如 K=1）会导致什么问题？',
      options: [
        '计算速度变快',
        '模型对噪声数据非常敏感，容易过拟合',
        '决策边界变得过于平滑',
        '模型会自动忽略异常值',
      ],
      correctIndex: 1,
      explanation: '当 K=1 时，每个测试点的预测完全由最近的一个邻居决定。如果那个邻居是噪声或异常值，就会直接导致错误预测。K 太小 → 模型复杂度过高 → 过拟合。',
    },
    {
      id: 'knn-quiz-2',
      algorithmId: 'knn',
      question: 'KNN 被称为"懒惰学习"（Lazy Learning），原因是什么？',
      options: [
        '模型代码写起来很懒',
        '它在训练阶段几乎不做任何计算，只是存储数据',
        '它需要人工选择 K 值',
        '它只能处理少量数据',
      ],
      correctIndex: 1,
      explanation: 'KNN 在训练阶段（fit）几乎不做任何实质计算，只是记住所有训练数据。真正的计算发生在预测阶段——需要找出每个测试点的 K 个最近邻居。因此被称为懒惰学习。',
    },
    {
      id: 'knn-quiz-3',
      algorithmId: 'knn',
      question: '二维空间中，计算点 (1, 2) 和点 (4, 6) 之间的欧氏距离是多少？',
      options: ['5', '7', '25', '3.5'],
      correctIndex: 0,
      explanation: '欧氏距离 = √((4-1)² + (6-2)²) = √(9 + 16) = √25 = 5。',
    },
    {
      id: 'knn-quiz-4',
      algorithmId: 'knn',
      question: 'KNN 算法对什么预处理特别敏感？',
      options: [
        '数据编码',
        '特征缩放（归一化/标准化）',
        '缺失值填充',
        '数据增强',
      ],
      correctIndex: 1,
      explanation: 'KNN 基于距离度量，如果某个特征的数值范围远大于其他特征（如年龄 0-100 vs 收入 0-1000000），这个特征将主导距离计算。因此在使用 KNN 之前，通常需要对特征进行归一化或标准化。',
    },
    {
      id: 'knn-quiz-5',
      algorithmId: 'knn',
      question: '在 sklearn 中，KNeighborsClassifier 的哪个参数用于设置邻居数量？',
      options: ['k', 'n_neighbors', 'n_estimators', 'neighbors'],
      correctIndex: 1,
      explanation: 'sklearn 中 KNN 分类器使用 n_neighbors 参数设置 K 值。例如：KNeighborsClassifier(n_neighbors=5)。',
    },
  ],
  'decision-tree': [
    {
      id: 'dt-quiz-1',
      algorithmId: 'decision-tree',
      question: '决策树中"信息增益"（Information Gain）的含义是什么？',
      options: [
        '数据量增加了多少',
        '按照某个特征划分后，信息熵减少了多少',
        '模型的准确率提高了多少',
        '树的深度增加了多少',
      ],
      correctIndex: 1,
      explanation: '信息增益 = 划分前信息熵 - 划分后加权信息熵。它衡量使用某个特征进行划分后，数据不确定性减少的程度。增益越大，说明该特征的分类能力越强。',
    },
    {
      id: 'dt-quiz-2',
      algorithmId: 'decision-tree',
      question: '限制决策树的最大深度（max_depth）的目的是什么？',
      options: [
        '加快数据收集速度',
        '防止模型过拟合',
        '增加特征数量',
        '提高训练集准确率',
      ],
      correctIndex: 1,
      explanation: '如果不限制深度，决策树可以一直分裂直到每个叶子节点只有一个样本，完美"记住"训练数据，但泛化能力极差。限制 max_depth 是最常用的防止过拟合方法之一。',
    },
    {
      id: 'dt-quiz-3',
      algorithmId: 'decision-tree',
      question: '一个包含 100 个样本的二分类数据集（正例 70 个，负例 30 个），它的基尼不纯度是多少？',
      options: ['0.58', '0.42', '0.70', '0.21'],
      correctIndex: 1,
      explanation: 'Gini = 1 - (0.7² + 0.3²) = 1 - (0.49 + 0.09) = 1 - 0.58 = 0.42。基尼不纯度越低，表示数据越"纯"。',
    },
    {
      id: 'dt-quiz-4',
      algorithmId: 'decision-tree',
      question: '决策树的根节点应该选择什么特征？',
      options: [
        '随机选择任意特征',
        '选择取值最多的特征',
        '选择信息增益最大的特征',
        '选择第一个特征',
      ],
      correctIndex: 2,
      explanation: '构建决策树时，每个节点都选择当前能使信息增益（或基尼增益）最大的特征进行划分。根节点对整个数据集进行第一次划分，选择区分能力最强的特征。',
    },
    {
      id: 'dt-quiz-5',
      algorithmId: 'decision-tree',
      question: 'sklearn 的 DecisionTreeClassifier 中，criterion 参数可以设置什么？',
      options: ['"mse" 或 "mae"', '"gini" 或 "entropy"', '"l1" 或 "l2"', '"sgd" 或 "adam"'],
      correctIndex: 1,
      explanation: 'DecisionTreeClassifier 的 criterion 参数支持 "gini"（基尼不纯度）和 "entropy"（信息熵）。两者效果相似，基尼计算稍快，信息熵对不纯度的惩罚更大。',
    },
  ],
};

export const getExercisesByAlgorithm = (algorithmId: string): Exercise[] =>
  exercises.filter((e) => e.algorithmId === algorithmId);

export const getExerciseById = (id: string): Exercise | undefined =>
  exercises.find((e) => e.id === id);

export const getQuizByAlgorithm = (algorithmId: string): QuizQuestion[] =>
  quizQuestions[algorithmId] || [];
