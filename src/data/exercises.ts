import type { Exercise, QuizQuestion } from '../types';
import { storageService } from '../services/storageService';

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
    runtimeSpec: {
      packages: ['numpy', 'scikit-learn'],
      testCode: `
required = ['model', 'X_train', 'X_test', 'y_train', 'y_test', 'y_pred']
missing = [v for v in required if v not in globals()]
if missing:
    raise AssertionError("缺少变量: " + ", ".join(missing))
if not hasattr(model, 'coef_'):
    raise AssertionError("model 还没有完成 fit 训练")
if len(y_pred) != len(y_test):
    raise AssertionError("y_pred 长度应与 y_test 一致")
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
assert float(r2) >= 0.7, f"R² 偏低 ({float(r2):.3f})，请检查代码"
print(f"测试通过：MSE={float(mse):.2f}, R²={float(r2):.3f}")
      `,
      expectedVariables: ['model', 'X_train', 'X_test', 'y_train', 'y_test', 'y_pred'],
      timeoutMs: 15000,
    },
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
    runtimeSpec: {
      packages: ['numpy', 'scikit-learn'],
      testCode: `
required = ['model', 'X_train', 'X_test', 'y_train', 'y_test', 'y_pred']
missing = [v for v in required if v not in globals()]
if missing:
    raise AssertionError("缺少变量: " + ", ".join(missing))
if not hasattr(model, 'classes_'):
    raise AssertionError("model 还没有完成 fit 训练")
if len(y_pred) != len(y_test):
    raise AssertionError("y_pred 长度应与 y_test 一致")
from sklearn.metrics import accuracy_score as _acc
acc = _acc(y_test, y_pred)
assert acc >= 0.5, f"准确率偏低 ({acc:.2%})，请检查代码"
print(f"测试通过：准确率={acc:.2%}")
      `,
      expectedVariables: ['model', 'X_train', 'X_test', 'y_train', 'y_test', 'y_pred'],
      timeoutMs: 15000,
    },
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
    runtimeSpec: {
      packages: ['numpy', 'scikit-learn'],
      testCode: `
required = ['model', 'X_train', 'X_test', 'y_train', 'y_test', 'y_pred']
missing = [v for v in required if v not in globals()]
if missing:
    raise AssertionError("缺少变量: " + ", ".join(missing))
if not hasattr(model, 'tree_'):
    raise AssertionError("model 还没有完成 fit 训练")
if len(y_pred) != len(y_test):
    raise AssertionError("y_pred 长度应与 y_test 一致")
from sklearn.metrics import accuracy_score as _acc
acc = _acc(y_test, y_pred)
assert acc >= 0.5, f"准确率偏低 ({acc:.2%})，请检查代码"
print(f"测试通过：准确率={acc:.2%}，树深度={model.get_depth()}")
      `,
      expectedVariables: ['model', 'X_train', 'X_test', 'y_train', 'y_test', 'y_pred'],
      timeoutMs: 15000,
    },
  },
  {
    id: 'knn-ex-2',
    algorithmId: 'knn',
    title: 'KNN 特征缩放对比实验',
    difficulty: '中级',
    description: '对同一组客户数据分别使用原始特征和 StandardScaler 标准化特征，比较 KNN 分类准确率变化。',
    instructions: [
      '导入 StandardScaler',
      '先训练未缩放的 KNN 模型',
      '再对训练集和测试集做标准化',
      '训练缩放后的 KNN 模型',
      '比较两个 accuracy_score',
    ],
    starterCode: `# KNN 练习：特征缩放对距离的影响
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import ???  # TODO: 导入标准化工具

np.random.seed(42)
n = 120
age = np.concatenate([np.random.normal(45, 8, n), np.random.normal(28, 6, n)])
income = np.concatenate([np.random.normal(4500, 700, n), np.random.normal(9000, 1200, n)])
X = np.column_stack([age, income])
y = np.array([0] * n + [1] * n)

# TODO: 划分训练集和测试集
# X_train, X_test, y_train, y_test = ???

# TODO: 训练未缩放模型
# raw_model = KNeighborsClassifier(n_neighbors=5)
# raw_model.???(X_train, y_train)
# raw_acc = accuracy_score(y_test, raw_model.???(X_test))

# TODO: 标准化特征
# scaler = ???()
# X_train_scaled = scaler.???(X_train)
# X_test_scaled = scaler.???(X_test)

# TODO: 训练缩放后的模型
# scaled_model = KNeighborsClassifier(n_neighbors=5)
# scaled_model.fit(X_train_scaled, y_train)
# scaled_acc = accuracy_score(y_test, scaled_model.predict(X_test_scaled))

print(f"未缩放准确率: {raw_acc:.2%}")
print(f"标准化后准确率: {scaled_acc:.2%}")`,
    expectedKeywords: ['StandardScaler', 'fit_transform', 'transform', 'KNeighborsClassifier', 'accuracy_score'],
    checkRules: [
      { type: 'keyword', keyword: 'StandardScaler', description: '导入并使用 StandardScaler', points: 20 },
      { type: 'keyword', keyword: 'fit_transform', description: '对训练集拟合并转换', points: 20 },
      { type: 'keyword', keyword: 'transform', description: '对测试集使用同一个 scaler 转换', points: 20 },
      { type: 'keyword', keyword: 'KNeighborsClassifier', description: '训练 KNN 模型', points: 20 },
      { type: 'keyword', keyword: 'accuracy_score', description: '比较准确率', points: 20 },
    ],
  },
  {
    id: 'dt-ex-2',
    algorithmId: 'decision-tree',
    title: '决策树剪枝参数实验',
    difficulty: '中级',
    description: '通过调整 max_depth 和 min_samples_leaf，观察决策树复杂度与泛化能力的关系。',
    instructions: [
      '导入 DecisionTreeClassifier',
      '划分训练集和测试集',
      '设置 max_depth 和 min_samples_leaf',
      '训练并预测',
      '输出不同参数下的准确率',
    ],
    starterCode: `# 决策树练习：预剪枝参数
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

np.random.seed(7)
n = 180
x1 = np.random.normal(0, 1, n)
x2 = np.random.normal(0, 1, n)
X = np.column_stack([x1, x2])
y = ((x1 ** 2 + x2 > 0.8) | (x1 - x2 > 1.2)).astype(int)

# TODO: 划分训练集和测试集
# X_train, X_test, y_train, y_test = ???

for depth in [2, 3, 5, None]:
    # TODO: 设置 min_samples_leaf=5，观察预剪枝效果
    # model = DecisionTreeClassifier(max_depth=depth, min_samples_leaf=???, random_state=42)
    # model.???(X_train, y_train)
    # y_pred = model.???(X_test)
    # acc = ???(y_test, y_pred)
    print(f"max_depth={depth}: accuracy={acc:.2%}")`,
    expectedKeywords: ['DecisionTreeClassifier', 'max_depth', 'min_samples_leaf', 'fit', 'predict', 'accuracy_score'],
    checkRules: [
      { type: 'keyword', keyword: 'DecisionTreeClassifier', description: '使用决策树分类器', points: 15 },
      { type: 'keyword', keyword: 'max_depth', description: '设置最大深度', points: 15 },
      { type: 'keyword', keyword: 'min_samples_leaf', description: '设置叶子最小样本数', points: 20 },
      { type: 'keyword', keyword: 'fit', description: '训练模型', points: 15 },
      { type: 'keyword', keyword: 'predict', description: '预测结果', points: 15 },
      { type: 'keyword', keyword: 'accuracy_score', description: '评估准确率', points: 20 },
    ],
  },
  {
    id: 'km-ex-1',
    algorithmId: 'k-means',
    title: 'K-Means 聚类基础实现',
    difficulty: '入门',
    description: '使用 sklearn 的 KMeans 完成二维客户数据聚类，理解无监督学习不依赖标签的特点。',
    instructions: [
      '导入 KMeans',
      '创建二维无标签数据',
      '设置 n_clusters',
      '使用 fit_predict 得到聚类标签',
      '查看 cluster_centers_ 聚类中心',
    ],
    starterCode: `# K-Means 练习：客户分群
import numpy as np
from sklearn.cluster import ???  # TODO: 导入 KMeans

np.random.seed(42)
cluster_a = np.random.normal([2, 2], 0.5, size=(60, 2))
cluster_b = np.random.normal([6, 3], 0.6, size=(60, 2))
cluster_c = np.random.normal([4, 7], 0.7, size=(60, 2))
X = np.vstack([cluster_a, cluster_b, cluster_c])

# TODO: 创建 KMeans 模型，设置 n_clusters=3, random_state=42
# model = ???

# TODO: 使用 fit_predict 得到每个样本的簇编号
# labels = model.???(X)

# TODO: 获取聚类中心
# centers = model.???

print("聚类中心:")
print(centers)
print("每个簇的样本数量:", np.bincount(labels))`,
    expectedKeywords: ['KMeans', 'n_clusters', 'fit_predict', 'cluster_centers_', 'bincount'],
    checkRules: [
      { type: 'keyword', keyword: 'KMeans', description: '导入并使用 KMeans', points: 25 },
      { type: 'keyword', keyword: 'n_clusters', description: '设置聚类数量', points: 20 },
      { type: 'keyword', keyword: 'fit_predict', description: '训练并输出聚类标签', points: 25 },
      { type: 'keyword', keyword: 'cluster_centers_', description: '查看聚类中心', points: 20 },
      { type: 'keyword', keyword: 'bincount', description: '统计簇内样本数', points: 10 },
    ],
    runtimeSpec: {
      packages: ['numpy', 'scikit-learn'],
      testCode: `
required = ['model', 'labels', 'centers']
missing = [v for v in required if v not in globals()]
if missing:
    raise AssertionError("缺少变量: " + ", ".join(missing))
if not hasattr(model, 'cluster_centers_'):
    raise AssertionError("model 还没有完成聚类训练")
assert len(set(labels)) >= 2, "聚类数量应至少为 2"
assert len(centers) >= 2, "聚类中心数量不正确"
print(f"测试通过：{len(centers)} 个聚类中心，inertia={model.inertia_:.2f}")
      `,
      expectedVariables: ['model', 'labels', 'centers'],
      timeoutMs: 15000,
    },
  },
  {
    id: 'km-ex-2',
    algorithmId: 'k-means',
    title: '肘部法选择 K 值',
    difficulty: '中级',
    description: '计算不同 K 值下的 inertia，观察误差下降拐点，理解如何选择较合适的聚类数量。',
    instructions: ['遍历 K=1 到 6', '训练 KMeans', '记录 inertia_', '观察下降幅度', '解释肘部位置'],
    starterCode: `# K-Means 练习：肘部法
import numpy as np
from sklearn.cluster import KMeans

np.random.seed(8)
X = np.vstack([
    np.random.normal([1, 1], 0.35, size=(50, 2)),
    np.random.normal([5, 2], 0.45, size=(50, 2)),
    np.random.normal([3, 6], 0.5, size=(50, 2)),
])

inertias = []
for k in range(1, 7):
    # TODO: 创建 KMeans，设置 n_clusters=k
    # model = ???
    # model.???(X)
    # inertias.append(model.???)

print("不同 K 值的 inertia:")
for k, value in enumerate(inertias, start=1):
    print(f"K={k}: {value:.2f}")`,
    expectedKeywords: ['KMeans', 'n_clusters', 'fit', 'inertia_', 'inertias'],
    checkRules: [
      { type: 'keyword', keyword: 'KMeans', description: '使用 KMeans', points: 20 },
      { type: 'keyword', keyword: 'n_clusters', description: '动态设置 K 值', points: 20 },
      { type: 'keyword', keyword: 'fit', description: '训练模型', points: 20 },
      { type: 'keyword', keyword: 'inertia_', description: '读取簇内平方和', points: 25 },
      { type: 'keyword', keyword: 'inertias', description: '保存不同 K 的结果', points: 15 },
    ],
  },
];

export const quizQuestions: Record<string, QuizQuestion[]> = {
  'ml-intro-workflow': [
    {
      id: 'ml-quiz-1',
      algorithmId: 'ml-intro-workflow',
      question: '下面哪个选项最准确地描述了机器学习？',
      options: [
        '人类编写每一条规则让计算机执行',
        '计算机从数据中自动学习规律，无需人类编写每条规则',
        '计算机通过搜索互联网获取知识',
        '人类把知识硬编码到程序中',
      ],
      correctIndex: 1,
      explanation: '机器学习的核心思想是：给计算机大量例子（数据），让它自己发现模式和规律，而不是人类逐条编写规则。',
    },
    {
      id: 'ml-quiz-2',
      algorithmId: 'ml-intro-workflow',
      question: 'AI、机器学习、深度学习之间的关系是什么？',
      options: [
        '三者是同一个概念的不同名称',
        'AI > 机器学习 > 深度学习，三者是包含关系',
        '深度学习 > 机器学习 > AI',
        '机器学习和深度学习是完全独立的两个领域',
      ],
      correctIndex: 1,
      explanation: '人工智能（AI）是最大的概念；机器学习是实现AI的一种方法；深度学习是机器学习中的一个分支。就像俄罗斯套娃：AI在最外层，机器学习在中间，深度学习在最内层。',
    },
    {
      id: 'ml-quiz-3',
      algorithmId: 'ml-intro-workflow',
      question: '以下哪个属于监督学习任务？',
      options: [
        '把用户自动分成不同群体（数据无标签）',
        '根据历史房价数据（有价格标签）预测新房子的价格',
        '发现数据中自然形成的聚类结构',
        '压缩图像的颜色数量',
      ],
      correctIndex: 1,
      explanation: '监督学习的数据带有"标准答案"（标签）。房价预测任务中，训练数据包含每套房子的实际成交价（标签），模型学习从特征到价格的映射。',
    },
    {
      id: 'ml-quiz-4',
      algorithmId: 'ml-intro-workflow',
      question: '以下哪个任务属于分类问题？',
      options: [
        '预测明天的气温是多少度',
        '判断一封邮件是垃圾邮件还是正常邮件',
        '预测一套房子的价格',
        '把顾客自动分成几组',
      ],
      correctIndex: 1,
      explanation: '分类的输出是离散的类别（如"垃圾邮件"或"正常邮件"），而不是连续的数值。回归输出连续数值，聚类输出自动分组。',
    },
    {
      id: 'ml-quiz-5',
      algorithmId: 'ml-intro-workflow',
      question: '机器学习项目的完整流程中，通常第一步是什么？',
      options: [
        '训练模型',
        '评估模型',
        '收集数据',
        '调参优化',
      ],
      correctIndex: 2,
      explanation: '机器学习项目的第一步是收集数据。没有数据，模型就无从学习。完整流程大致是：收集数据→数据清洗→划分数据集→选择模型→训练→预测→评估→调参优化。',
    },
    {
      id: 'ml-quiz-6',
      algorithmId: 'ml-intro-workflow',
      question: '训练集和测试集为什么要分开？',
      options: [
        '为了减少数据量，让训练更快',
        '为了用测试集评估模型在"没见过的数据"上的真实表现',
        '因为算法要求数据只能分成两份',
        '为了让数据更加平衡',
      ],
      correctIndex: 1,
      explanation: '测试集模拟模型上线后遇到的"新数据"。如果拿训练过的数据来测试，就像让考生提前看了期末试卷再考试——成绩反映的是记忆能力而非真正的学习能力。',
    },
    {
      id: 'ml-quiz-7',
      algorithmId: 'ml-intro-workflow',
      question: '在平台的4个算法中，K-Means 属于什么类型？',
      options: [
        '监督学习 - 回归',
        '监督学习 - 分类',
        '无监督学习 - 聚类',
        '强化学习',
      ],
      correctIndex: 2,
      explanation: 'K-Means 不需要样本标签，它将数据自动分成K个簇，属于无监督学习中的聚类算法。其他三个（线性回归、KNN、决策树）都是监督学习。',
    },
  ],
  'data-feature-evaluation': [
    {
      id: 'df-quiz-1',
      algorithmId: 'data-feature-evaluation',
      question: '在机器学习中，"样本"指的是什么？',
      options: [
        '数据集中的一列（一个属性）',
        '数据表中的一行（一个数据点）',
        '整个数据集',
        '模型的参数',
      ],
      correctIndex: 1,
      explanation: '样本就是数据表中一个完整的数据点（一行）。比如房价预测中，每一套房子的全部信息就是一个样本。',
    },
    {
      id: 'df-quiz-2',
      algorithmId: 'data-feature-evaluation',
      question: '特征矩阵 X 和标签向量 y 的关系是什么？',
      options: [
        'X 和 y 是同一个东西的两个名称',
        'X 是输入（已知信息），y 是要预测的目标值（标准答案）',
        'X 是模型输出，y 是模型参数',
        'X 是测试集，y 是训练集',
      ],
      correctIndex: 1,
      explanation: 'X 是特征矩阵（如房屋的面积、房间数、楼层等），y 是标签向量（如房价）。模型学习 X→y 的映射关系。',
    },
    {
      id: 'df-quiz-3',
      algorithmId: 'data-feature-evaluation',
      question: '训练集、验证集、测试集中，哪个用来最终评估模型的真实能力？',
      options: [
        '训练集',
        '验证集',
        '测试集',
        '全部都可以，没有区别',
      ],
      correctIndex: 2,
      explanation: '测试集是模型从未见过的数据，用来客观评估模型在真实场景中的表现（泛化能力）。训练集用于学习，验证集用于调参。',
    },
    {
      id: 'df-quiz-4',
      algorithmId: 'data-feature-evaluation',
      question: 'MSE（均方误差）衡量的是什么？',
      options: [
        '分类准确率',
        '预测值与真实值之间的平均平方差距',
        '模型的训练速度',
        '数据集的大小',
      ],
      correctIndex: 1,
      explanation: 'MSE = (1/n) * Σ(yᵢ - ŷᵢ)²，它计算每个预测值与真实值之间差距的平方的平均值。MSE 越小说明模型预测越准确，主要用在回归任务中。',
    },
    {
      id: 'df-quiz-5',
      algorithmId: 'data-feature-evaluation',
      question: '以下哪个指标通常用于评估分类模型的性能？',
      options: [
        'MSE',
        'R²',
        'accuracy（准确率）',
        'inertia（簇内平方和）',
      ],
      correctIndex: 2,
      explanation: 'accuracy（准确率）= 预测正确的样本数 / 总样本数，是最常用的分类评估指标。MSE 和 R² 用于回归，inertia 用于 K-Means 聚类。',
    },
    {
      id: 'df-quiz-6',
      algorithmId: 'data-feature-evaluation',
      question: '什么是过拟合（overfitting）？',
      options: [
        '模型在训练集和测试集上都表现很差',
        '模型在训练集上表现完美，但在测试集（新数据）上表现很差',
        '模型正确识别了所有数据',
        '训练数据太少导致模型无法学习',
      ],
      correctIndex: 1,
      explanation: '过拟合是模型把训练数据"背"得太牢，连噪声都被记住了，导致泛化能力差。训练集表现好但测试集表现差是过拟合的典型标志。',
    },
    {
      id: 'df-quiz-7',
      algorithmId: 'data-feature-evaluation',
      question: '以下哪种情况最可能是欠拟合（underfitting）？',
      options: [
        '训练集准确率 99%，测试集准确率 70%',
        '训练集准确率 60%，测试集准确率 58%——两者都低',
        '训练集准确率 95%，测试集准确率 93%',
        '模型训练时间特别长',
      ],
      correctIndex: 1,
      explanation: '欠拟合指模型太简单，连训练数据的基本规律都没学到，导致训练集和测试集表现都很差。而"训练集高测试集低"是过拟合的典型表现。',
    },
    {
      id: 'df-quiz-8',
      algorithmId: 'data-feature-evaluation',
      question: '为什么"泛化能力"比"训练集上的表现"更重要？',
      options: [
        '因为训练集上的表现没有意义',
        '因为模型的真正价值在于对未知数据做出准确预测，而不是"背诵"见过的数据',
        '因为训练集通常太小',
        '泛化能力和训练集表现其实是一回事',
      ],
      correctIndex: 1,
      explanation: '泛化能力衡量模型在"没见过的数据"上的表现。如果一个模型只能做好训练过的题但换新题就不会做，它在实际应用中毫无价值。',
    },
    {
      id: 'df-quiz-9',
      algorithmId: 'data-feature-evaluation',
      question: 'accuracy 指标有什么局限性？',
      options: [
        '它只能用于回归任务',
        '在类别严重不平衡时（如正例 95% 负例 5%），即使全部预测为正例也能得到 95% 准确率，但这毫无意义',
        '它计算太慢',
        '它只能用于二分类',
      ],
      correctIndex: 1,
      explanation: '在样本严重不平衡时（如罕见病检测中 99.9% 为阴性），accuracy 会产生误导。此时需要关注精确率、召回率、F1 分数等指标。',
    },
    {
      id: 'df-quiz-10',
      algorithmId: 'data-feature-evaluation',
      question: '下列哪种做法会导致"数据泄露"？',
      options: [
        '用训练集训练模型',
        '在划分训练集/测试集之前对整个数据集做了标准化（用全量数据计算均值和标准差）',
        '使用 sklearn 的 train_test_split 划分数据',
        '用测试集评估模型',
      ],
      correctIndex: 1,
      explanation: '数据泄露指测试集的信息"泄露"到了训练过程中。如果在划分前对整个数据集做标准化，测试集的统计信息（均值、标准差）就混入了训练数据中。应该先划分，再用训练集的统计量去转换测试集。',
    },
  ],
  'ml-python-code-intro': [
    {
      id: 'py-quiz-1',
      algorithmId: 'ml-python-code-intro',
      question: '机器学习代码的标准流程中，第一步通常是什么？',
      options: ['导入需要的库（import）', '训练模型（fit）', '划分数据集', '评估模型'],
      correctIndex: 0,
      explanation: 'ML代码通常从导入库开始：import numpy, import pandas, from sklearn... 等。只有先导入库，才能使用后续的函数和类。',
    },
    {
      id: 'py-quiz-2',
      algorithmId: 'ml-python-code-intro',
      question: 'pandas 库在机器学习中主要负责什么？',
      options: ['表格数据的读写和处理', '训练机器学习模型', '绘制图表', '矩阵运算'],
      correctIndex: 0,
      explanation: 'pandas 擅长表格数据的读写和处理，如 pd.read_csv() 加载CSV文件、df[["列名"]]提取特征等。',
    },
    {
      id: 'py-quiz-3',
      algorithmId: 'ml-python-code-intro',
      question: 'X = df[["面积", "房间数"]] 中为什么用双层方括号？',
      options: ['保持二维结构，满足模型的输入要求', '是Python的语法要求', '没有特别原因，单层也可以', '为了性能优化'],
      correctIndex: 0,
      explanation: '双层方括号确保X是二维DataFrame（矩阵）。ML模型要求X必须是二维（样本数×特征数），单层方括号取的是Series（一维）。',
    },
    {
      id: 'py-quiz-4',
      algorithmId: 'ml-python-code-intro',
      question: 'train_test_split(X, y, test_size=0.2) 中 test_size=0.2 的含义是？',
      options: ['20%的数据作为测试集，80%作为训练集', '20%的数据作为训练集', '测试集有20条数据', '训练20次'],
      correctIndex: 0,
      explanation: 'test_size=0.2 表示留出20%的数据作为测试集（考试用），剩下80%作为训练集（学习用）。',
    },
    {
      id: 'py-quiz-5',
      algorithmId: 'ml-python-code-intro',
      question: 'model.fit(X_train, y_train) 中 fit 的作用是？',
      options: ['让模型从训练数据中学习规律', '对新数据进行预测', '评估模型准确率', '划分数据集'],
      correctIndex: 0,
      explanation: 'fit() 是训练方法——让模型分析训练数据的特征X_train和标签y_train，从中学习映射规律。',
    },
    {
      id: 'py-quiz-6',
      algorithmId: 'ml-python-code-intro',
      question: '以下关于 sklearn 模型的说明，哪个是正确的？',
      options: ['LinearRegression、KNeighborsClassifier、DecisionTreeClassifier 都用.fit()训练和.predict()预测', '每个模型的训练方法名称都不同', 'KNN没有fit方法', '决策树不能用predict方法'],
      correctIndex: 0,
      explanation: 'sklearn 所有监督学习模型共享统一的API：都用.fit()训练、.predict()预测。这是sklearn最重要的设计原则。',
    },
    {
      id: 'py-quiz-7',
      algorithmId: 'ml-python-code-intro',
      question: 'model.predict(X_test) 返回的是什么？',
      options: ['模型对测试数据的预测结果', '模型的准确率', '训练好的模型参数', '测试数据的正确答案'],
      correctIndex: 0,
      explanation: 'predict() 使用训练好的模型对新数据X_test做预测，返回预测标签。需要和真实标签y_test对比才能评估准确率。',
    },
  ],
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
    {
      id: 'lr-quiz-6',
      algorithmId: 'linear-regression',
      question: '线性回归中的截距 b 通常表示什么？',
      options: ['特征为 0 时模型的预测基准值', '模型训练轮数', '样本数量', '误差最大值'],
      correctIndex: 0,
      explanation: '在 y = wx + b 中，b 是截距。当 x 为 0 时，模型预测值等于 b，它可以理解为预测的基础水平。',
    },
    {
      id: 'lr-quiz-7',
      algorithmId: 'linear-regression',
      question: '如果线性回归在训练集表现很好，但测试集表现很差，最可能说明什么？',
      options: ['欠拟合', '过拟合', '学习率太小', '没有使用 print'],
      correctIndex: 1,
      explanation: '训练集好、测试集差通常说明模型过度贴合训练数据中的细节或噪声，泛化能力不足，也就是过拟合。',
    },
    {
      id: 'lr-quiz-8',
      algorithmId: 'linear-regression',
      question: '多元线性回归相比一元线性回归，主要区别是什么？',
      options: ['只能做分类', '可以同时使用多个特征预测目标值', '不能计算 MSE', '不需要训练数据'],
      correctIndex: 1,
      explanation: '多元线性回归可以使用多个输入特征，例如面积、房间数、楼层等，共同预测一个连续目标值。',
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
    {
      id: 'knn-quiz-6',
      algorithmId: 'knn',
      question: 'KNN 预测阶段的主要计算成本来自哪里？',
      options: ['训练神经网络权重', '计算待预测样本与训练样本的距离', '生成决策树节点', '求解线性方程'],
      correctIndex: 1,
      explanation: 'KNN 的训练阶段几乎只是存储数据，预测时需要计算待预测点与大量训练样本的距离，因此预测成本较高。',
    },
    {
      id: 'knn-quiz-7',
      algorithmId: 'knn',
      question: '当 K 值设置得过大时，KNN 的决策边界通常会怎样？',
      options: ['变得更平滑，可能欠拟合', '完全随机', '只受最近一个点影响', '一定达到 100% 准确率'],
      correctIndex: 0,
      explanation: 'K 值过大时，预测会受到大量邻居的平均影响，边界变平滑，但也可能忽略局部结构导致欠拟合。',
    },
    {
      id: 'knn-quiz-8',
      algorithmId: 'knn',
      question: 'KNN 更适合下面哪类数据场景？',
      options: ['样本特征尺度差异极大且未处理', '低维、样本量中等、类别边界相对清晰的数据', '必须解释树规则的数据', '只需要无监督聚类的数据'],
      correctIndex: 1,
      explanation: 'KNN 在低维、样本量中等、边界较清晰的数据上更容易取得直观效果；高维或尺度差异很大的数据需要谨慎预处理。',
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
    {
      id: 'dt-quiz-6',
      algorithmId: 'decision-tree',
      question: '决策树为什么容易过拟合？',
      options: ['因为它不能处理分类任务', '因为树太深时会记住训练集细节和噪声', '因为它必须使用梯度下降', '因为它不能使用数值特征'],
      correctIndex: 1,
      explanation: '如果不限制深度或叶子节点样本数，决策树会持续划分直到非常细，容易把训练集噪声也学进去。',
    },
    {
      id: 'dt-quiz-7',
      algorithmId: 'decision-tree',
      question: '下面哪个参数常用于限制决策树复杂度？',
      options: ['n_neighbors', 'learning_rate', 'max_depth', 'n_clusters'],
      correctIndex: 2,
      explanation: 'max_depth 用于限制树的最大深度，是控制决策树复杂度、缓解过拟合的常见参数。',
    },
    {
      id: 'dt-quiz-8',
      algorithmId: 'decision-tree',
      question: '决策树相比 KNN 的一个明显优势是什么？',
      options: ['完全不需要数据', '预测规则更容易解释成 if-else 路径', '只能做无监督学习', '对所有数据都不会过拟合'],
      correctIndex: 1,
      explanation: '决策树的每条预测路径都可以解释成一组 if-else 判断，因此比 KNN 更容易向学生和业务方说明原因。',
    },
  ],
  'logistic-regression': [
    {
      id: 'logr-quiz-1',
      algorithmId: 'logistic-regression',
      question: '逻辑回归虽然名字里有"回归"，但它主要解决的是什么类型的问题？',
      options: ['回归问题', '二分类问题', '聚类问题', '降维问题'],
      correctIndex: 1,
      explanation: '逻辑回归是经典的二分类算法。虽然名字带"回归"，但它通过 Sigmoid 将连续值映射为概率，最终输出类别判断。',
    },
    {
      id: 'logr-quiz-2',
      algorithmId: 'logistic-regression',
      question: 'Sigmoid 函数 σ(z) = 1 / (1 + e^(-z)) 的输出范围是多少？',
      options: ['-1 到 1', '0 到 1', '-∞ 到 +∞', '0 到 +∞'],
      correctIndex: 1,
      explanation: 'Sigmoid 函数将任意实数 z 映射到 (0, 1) 区间，完美适合表示概率值。当 z=0 时 σ(0)=0.5，z 越大越接近 1，z 越小越接近 0。',
    },
    {
      id: 'logr-quiz-3',
      algorithmId: 'logistic-regression',
      question: '在逻辑回归中，predict_proba(X)[:, 1] 返回的是什么？',
      options: ['预测的类别标签', '样本属于正类的概率', '模型的权重系数', '交叉熵损失值'],
      correctIndex: 1,
      explanation: 'predict_proba 返回每个样本属于各类的概率，[:, 1] 取第二列即正类的概率（0到1之间）。predict() 才是直接返回 0/1 类别。',
    },
    {
      id: 'logr-quiz-4',
      algorithmId: 'logistic-regression',
      question: '默认情况下，逻辑回归用哪个阈值来将概率转换为类别？',
      options: ['0', '0.3', '0.5', '1.0'],
      correctIndex: 2,
      explanation: '默认阈值是 0.5。概率 ≥ 0.5 判定为正类，< 0.5 判定为负类。在某些场景下可以调整阈值（如疾病筛查可能降低阈值以提高召回率）。',
    },
    {
      id: 'logr-quiz-5',
      algorithmId: 'logistic-regression',
      question: '逻辑回归的决策边界（decision boundary）是什么样的？',
      options: ['一条曲线', '一条直线（或超平面）', '一组同心圆', '一条随机折线'],
      correctIndex: 1,
      explanation: '逻辑回归是线性分类器，其决策边界是直线（二维）或超平面（高维），即 wx+b=0 这条线。',
    },
    {
      id: 'logr-quiz-6',
      algorithmId: 'logistic-regression',
      question: '对于极度不平衡的数据（如正例99%负例1%），accuracy 作为评估指标有什么问题？',
      options: ['完全没问题', '模型只要全部预测为正例就能获得99%准确率，但这毫无意义', 'accuracy 会自动考虑不平衡', 'accuracy 不适合逻辑回归但适合其他模型'],
      correctIndex: 1,
      explanation: '在不平衡数据中，即使模型全部预测为正例也能拿到高准确率，但真正有意义的负例一个都没识别出来。此时应关注精确率、召回率、F1 等指标。',
    },
    {
      id: 'logr-quiz-7',
      algorithmId: 'logistic-regression',
      question: '逻辑回归与线性回归的最核心区别是什么？',
      options: ['逻辑回归不能做预测', '逻辑回归在 wx+b 后套了 Sigmoid 函数，将输出映射为概率', '逻辑回归不需要训练', '两者没有区别'],
      correctIndex: 1,
      explanation: '逻辑回归 = 线性得分 + Sigmoid。线性回归输出任意实数值，逻辑回归输出 0-1 之间的概率。这是两者最大的区别。',
    },
    {
      id: 'logr-quiz-8',
      algorithmId: 'logistic-regression',
      question: '逻辑回归中的正则化（L1/L2）主要用来解决什么问题？',
      options: ['加快训练速度', '防止过拟合', '提高准确率到100%', '自动选择阈值'],
      correctIndex: 1,
      explanation: '正则化通过惩罚过大的权重来防止模型过度拟合训练数据。L1 正则化还能产生稀疏权重（某些系数为0），起到特征选择的作用。',
    },
  ],
  'random-forest': [
    {
      id: 'rf-quiz-1',
      algorithmId: 'random-forest',
      question: '随机森林中"随机"主要体现在哪两个方面？',
      options: ['随机选择样本和随机初始化', '有放回抽样（Bootstrap）和随机选择特征', '随机设置学习率和随机停止', '随机剪枝和随机排序'],
      correctIndex: 1,
      explanation: '随机森林的"随机"包含两层：(1) 每棵树用 Bootstrap 随机抽样训练；(2) 每次分裂时仅随机考虑部分特征。这保证了树与树之间的多样性和相互独立性。',
    },
    {
      id: 'rf-quiz-2',
      algorithmId: 'random-forest',
      question: '单棵决策树很容易过拟合，为什么随机森林能有效缓解这个问题？',
      options: ['每棵树都使用了正则化', '多棵树各自过拟合不同的部分，投票/平均后过拟合互相抵消', '随机森林不能解决过拟合', '因为用了更简单的分裂准则'],
      correctIndex: 1,
      explanation: '多棵树在 Bootstrap 不同样本上训练，可能在不同区域过拟合。但通过投票或平均，这些偏差互相抵消，最终结果比单棵树更稳定，泛化能力更强。',
    },
    {
      id: 'rf-quiz-3',
      algorithmId: 'random-forest',
      question: '随机森林做分类时的最终预测是通过什么方式决定的？',
      options: ['选最浅的那棵树的预测', '所有树的预测结果进行多数投票', '选训练集准确率最高的那棵树', '随机选一棵树的预测'],
      correctIndex: 1,
      explanation: '分类任务中，每棵树各投一票，最终得票最多的类别作为预测结果。回归任务中则取所有树预测值的平均。这种方式利用了"群体智慧"。',
    },
    {
      id: 'rf-quiz-4',
      algorithmId: 'random-forest',
      question: 'Bootstrap（有放回抽样）在随机森林中起什么作用？',
      options: ['减少数据量', '让每棵树看到不同的数据子集，增加多样性', '加快单棵树的训练', '代替特征选择'],
      correctIndex: 1,
      explanation: 'Bootstrap 让每棵树从原始数据中有放回地随机抽取样本，每棵树看到的训练集略有不同。这种数据多样性是随机森林优于单棵树的关键因素之一。',
    },
    {
      id: 'rf-quiz-5',
      algorithmId: 'random-forest',
      question: '在 sklearn 中，RandomForestClassifier 的 n_estimators 参数控制什么？',
      options: ['每棵树的最大深度', '森林中树的数量', '每次分裂考虑的特征数', '学习率'],
      correctIndex: 1,
      explanation: 'n_estimators 控制森林中决策树的数量。树越多通常效果越好，但训练和预测时间也越长。默认值是 100。',
    },
    {
      id: 'rf-quiz-6',
      algorithmId: 'random-forest',
      question: 'max_depth 参数在随机森林中通常起什么作用？',
      options: ['控制特征数量', '控制每棵树的最大深度，防止单棵树过拟合', '控制学习率', '控制森林的大小'],
      correctIndex: 1,
      explanation: 'max_depth 限制每棵树的最大深度。即使有投票机制，如果每棵树都深度很大、严重过拟合，整体效果也不好。适当限制深度可以让森林更稳健。',
    },
    {
      id: 'rf-quiz-7',
      algorithmId: 'random-forest',
      question: 'model.feature_importances_ 返回的是什么信息？',
      options: ['每个特征的缺失值比例', '每个特征在分类中的重要程度', '每个样本的预测置信度', '每棵树的权重'],
      correctIndex: 1,
      explanation: 'feature_importances_ 返回每个特征对分类/回归的重要程度（通常基于杂质减少量或信息增益）。值越大说明该特征对模型判断越关键。',
    },
    {
      id: 'rf-quiz-8',
      algorithmId: 'random-forest',
      question: '随机森林相比单棵决策树的主要缺点是什么？',
      options: ['更容易过拟合', '模型解释性变差，无法像单棵树那样画出清晰的决策路径', '不能处理分类问题', '必须使用GPU训练'],
      correctIndex: 1,
      explanation: '随机森林牺牲了一定可解释性——你无法像单棵决策树那样画出完整的 if-else 路径来解释为什么得到某个预测。不过你可以通过特征重要性来部分弥补。',
    },
  ],
  'k-means': [
    {
      id: 'km-quiz-1',
      algorithmId: 'k-means',
      question: 'K-Means 属于哪一类机器学习算法？',
      options: ['监督学习分类算法', '无监督学习聚类算法', '强化学习算法', '深度学习生成算法'],
      correctIndex: 1,
      explanation: 'K-Means 不需要样本标签，它根据样本之间的距离自动形成簇，因此属于无监督学习中的聚类算法。',
    },
    {
      id: 'km-quiz-2',
      algorithmId: 'k-means',
      question: 'K-Means 中的 K 表示什么？',
      options: ['样本数量', '特征数量', '聚类簇的数量', '迭代轮数'],
      correctIndex: 2,
      explanation: 'K 表示希望算法最终划分出的簇数量。例如 K=3 表示把样本分成 3 个簇。',
    },
    {
      id: 'km-quiz-3',
      algorithmId: 'k-means',
      question: 'K-Means 每轮迭代通常包含哪两个核心步骤？',
      options: ['排序和剪枝', '分配样本和更新中心', '归一化和编码', '训练和反向传播'],
      correctIndex: 1,
      explanation: '每轮迭代先把样本分配给最近的中心，再用每个簇内样本的均值更新聚类中心。',
    },
    {
      id: 'km-quiz-4',
      algorithmId: 'k-means',
      question: 'inertia_ 在 K-Means 中通常表示什么？',
      options: ['分类准确率', '簇内平方和', '模型参数数量', '测试集损失'],
      correctIndex: 1,
      explanation: 'inertia_ 表示所有样本到其所属聚类中心的距离平方和，越小通常说明簇内更紧凑。',
    },
    {
      id: 'km-quiz-5',
      algorithmId: 'k-means',
      question: '使用 K-Means 前，为什么常常需要做特征缩放？',
      options: ['因为它基于距离计算', '因为它只能处理整数', '因为它必须使用 one-hot 编码', '因为它不能处理二维数据'],
      correctIndex: 0,
      explanation: 'K-Means 依赖距离。如果某个特征数值范围特别大，它会主导距离计算，因此常用标准化或归一化。',
    },
    {
      id: 'km-quiz-6',
      algorithmId: 'k-means',
      question: '肘部法主要用来解决什么问题？',
      options: ['选择合适的 K 值', '选择学习率', '选择训练集比例', '选择决策树深度'],
      correctIndex: 0,
      explanation: '肘部法观察不同 K 值下 inertia 的下降曲线，寻找下降速度明显变慢的拐点，辅助选择 K。',
    },
    {
      id: 'km-quiz-7',
      algorithmId: 'k-means',
      question: '下面哪种数据形状通常不太适合基础 K-Means？',
      options: ['近似球状簇', '大小相近的簇', '月牙形或环形簇', '二维可分散点簇'],
      correctIndex: 2,
      explanation: '基础 K-Means 更偏好球状簇。月牙形、环形等复杂形状通常需要 DBSCAN、谱聚类等方法。',
    },
    {
      id: 'km-quiz-8',
      algorithmId: 'k-means',
      question: 'sklearn 中 KMeans 常用哪个方法可以训练模型并直接返回每个样本的簇标签？',
      options: ['fit_predict', 'train_test_split', 'score_class', 'predict_proba'],
      correctIndex: 0,
      explanation: 'fit_predict(X) 会先训练 KMeans，再返回每个样本所属的簇标签，适合聚类入门练习。',
    },
  ],
};

function mergeById<T extends { id: string }>(base: T[], custom: T[]): T[] {
  const merged = new Map(base.map((item) => [item.id, item]));
  custom.forEach((item) => merged.set(item.id, item));
  return Array.from(merged.values());
}

export const getAllExercises = (): Exercise[] =>
  mergeById(exercises, storageService.getCustomExercises());

export const getAllQuizQuestions = (): QuizQuestion[] =>
  mergeById(
    Object.values(quizQuestions).flat(),
    storageService.getCustomQuizQuestions()
  );

export const getExercisesByAlgorithm = (algorithmId: string): Exercise[] =>
  getAllExercises().filter((e) => e.algorithmId === algorithmId);

export const getExerciseById = (id: string): Exercise | undefined =>
  getAllExercises().find((e) => e.id === id);

export const getQuizByAlgorithm = (algorithmId: string): QuizQuestion[] =>
  getAllQuizQuestions().filter((q) => q.algorithmId === algorithmId);
