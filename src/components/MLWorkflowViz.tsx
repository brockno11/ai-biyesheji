import { useState } from 'react';
import type { Algorithm } from '../types';

interface Step {
  icon: string;
  title: string;
  description: string;
  analogy: string;
  platformLink: string;
}

const workflowSteps: Step[] = [
  {
    icon: '📥',
    title: '收集数据',
    description:
      '机器学习的第一步是获取原始数据。数据可以来自数据库、API、传感器、用户行为日志或公开数据集。数据的质量和数量直接影响模型的上限。',
    analogy:
      '就像做饭需要先买菜 —— 食材的新鲜度和种类决定了你能做出什么样的菜。',
    platformLink: '平台上的每个算法课程都附带真实数据集，让你从真实场景开始学习。',
  },
  {
    icon: '🔧',
    title: '数据清洗',
    description:
      '原始数据通常包含缺失值、异常值、重复项和格式不一致。数据清洗阶段需要处理这些问题，确保数据质量。常用的方法包括填充缺失值、删除异常值、标准化格式等。',
    analogy:
      '就像择菜 —— 去掉黄叶、洗掉泥土，只留下能吃的部分。',
    platformLink: '我们的练习模块展示了真实数据清洗过程，让你学会处理各种数据质量问题。',
  },
  {
    icon: '✂️',
    title: '划分数据集',
    description:
      '将清洗后的数据划分为训练集和测试集（有时还有验证集）。训练集用于训练模型，测试集用于评估模型在未见数据上的表现。通常按 7:3 或 8:2 的比例划分。',
    analogy:
      '就像考试 —— 平时做的练习册是训练集，真正的考试是测试集。如果用考试题来练习，那就没有意义了。',
    platformLink: '算法课程中的交互式可视化清楚地展示了数据划分对模型性能的影响。',
  },
  {
    icon: '🎯',
    title: '选择模型',
    description:
      '根据任务类型（分类、回归、聚类等）和数据特点选择合适的算法模型。每种模型有其适用场景：线性回归适合线性关系，决策树适合非线性关系，K-Means 适合无监督聚类等。',
    analogy:
      '就像选择交通工具 —— 近处走路，远处开车，跨海坐船。不同的问题需要不同的工具。',
    platformLink: '平台提供多种算法课程，帮你深入理解每种算法的适用场景和选择策略。',
  },
  {
    icon: '🏋️',
    title: '训练模型',
    description:
      '使用训练集数据来"教"模型学习数据中的规律。对于监督学习，模型通过不断调整参数来最小化预测误差；对于无监督学习，模型寻找数据中的隐藏结构。',
    analogy:
      '就像健身 —— 通过反复练习，肌肉（模型参数）会逐渐适应并变得更强。',
    platformLink: '每个课程的 Python 代码示例让你动手训练自己的第一个模型。',
  },
  {
    icon: '🔮',
    title: '预测',
    description:
      '训练好的模型对新的、未见过的数据进行预测。对于分类任务，预测输出类别标签；对于回归任务，预测输出连续数值。',
    analogy:
      '就像考完驾照后真正上路 —— 你已经学会了规则（训练），现在需要在真实道路上驾驶（预测）。',
    platformLink: '交互式可视化组件让你直观看到模型的预测结果。',
  },
  {
    icon: '📊',
    title: '评估',
    description:
      '使用测试集评估模型的泛化能力。常用指标包括准确率、精确率、召回率、F1 分数（分类任务），以及 MSE、R²（回归任务）。好的模型应该在训练集和测试集上都表现良好。',
    analogy:
      '就像考试后批改试卷 —— 不是为了分数，而是为了知道自己哪里掌握得好、哪里还需要加强。',
    platformLink: '测验模块提供自动评估和详细解析，帮助你对照检查自己的理解程度。',
  },
  {
    icon: '🔄',
    title: '调参',
    description:
      '根据评估结果调整模型参数或更换算法，以提升模型性能。可能包括调整超参数（如 KNN 的 K 值、决策树的深度）、特征工程、尝试不同模型等。这是一个迭代过程。',
    analogy:
      '就像调音 —— 吉他弹出来的声音不太对，就需要微调琴弦，直到音准完美。',
    platformLink: '交互式可视化让你通过拖动滑块实时观察参数变化对模型效果的影响。',
  },
];

interface MLWorkflowVizProps {
  algorithm?: Algorithm;
}

export default function MLWorkflowViz({ algorithm: _algorithm }: MLWorkflowVizProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-1">
          🤖 机器学习工作流程
        </h3>
        <p className="text-sm text-gray-500">点击每个步骤了解详情</p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {workflowSteps.map((step, index) => {
          const isActive = activeStep === index;
          return (
            <div key={index}>
              {/* Step Card */}
              <button
                onClick={() => setActiveStep(isActive ? null : index)}
                className={`w-full text-left bg-white/70 backdrop-blur-md rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                  isActive
                    ? 'border-transparent bg-gradient-to-r from-blue-500 to-violet-500 p-[2px]'
                    : 'border-white/60 p-0'
                }`}
              >
                <div
                  className={`rounded-2xl p-4 ${
                    isActive
                      ? 'bg-white/90 h-full'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">{step.icon}</span>
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">
                        步骤 {index + 1}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 tracking-tight">
                        {step.title}
                      </h4>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Detail */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isActive ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
                }`}
              >
                <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-4 space-y-3">
                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      📖 说明
                    </h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      🌟 生活类比
                    </h5>
                    <p className="text-sm text-amber-700 bg-amber-50/70 rounded-lg p-3 leading-relaxed">
                      {step.analogy}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      🎓 与平台关联
                    </h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.platformLink}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Note */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-100 p-4 text-center">
        <p className="text-sm text-gray-600 leading-relaxed">
          💡 <span className="font-bold">核心思想：</span>
          机器学习是一个循环迭代的过程。评估结果不佳时，需要回到前面的步骤进行调整 ——
          可能需要更多数据、更好的特征工程、或者换一个更适合的算法。
        </p>
      </div>
    </div>
  );
}
