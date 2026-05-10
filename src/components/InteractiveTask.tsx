import { useState, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  GripVertical,
} from 'lucide-react';
import type { InteractionType } from '../types';
import {
  DataTableGuide,
  FeatureLabelSelector,
  XYSplitter,
  TrainValidTestSplitSimulator,
  RegressionMetricLab,
  ClassificationMetricLab,
  OverfittingPlayground,
  HyperparameterLab,
  CrossValidationSimulator,
  LeakageDetective,
} from './foundation-interactions';

interface FallbackQuestion {
  id: string;
  prompt?: string;
  scenario?: string;
  options: string[];
  correctIndex: number;
  correctFeedback: string;
  wrongFeedback: string;
  explanation: string;
  relatedAlgorithms?: string[];
}

interface Props {
  type: InteractionType;
  onComplete?: (passed: boolean) => void;
  onAskAI?: () => void;
  fallbackQuestions?: FallbackQuestion[];
}

// ─── Programming vs ML (编程 vs 机器学习) ──────────────────────────────────
const PROGRAMMING_VS_ML_SCENARIOS = [
  {
    scenario: '判断一封邮件是否为垃圾邮件',
    answer: 'machine-learning' as const,
    explanation: '邮件内容千变万化，无法用固定规则穷举，适合用大量历史邮件训练模型自动分类。',
  },
  {
    scenario: '根据用户输入的加减乘除计算结果',
    answer: 'programming' as const,
    explanation: '规则明确且确定（数学运算），用传统编程直接计算即可。',
  },
  {
    scenario: '识别图片中是否有猫',
    answer: 'machine-learning' as const,
    explanation: '猫的形态、姿势、角度无穷无尽，无法用 if-else 规则描述"猫长什么样"。',
  },
  {
    scenario: '计算员工本月工资（基本工资+加班费）',
    answer: 'programming' as const,
    explanation: '规则清晰、公式固定，传统编程直接计算。',
  },
  {
    scenario: '预测明天的气温',
    answer: 'machine-learning' as const,
    explanation: '气温受多因素影响（气压、湿度、季节等），关系复杂，适合从历史数据中学习规律。',
  },
  {
    scenario: '验证用户输入的手机号格式是否正确',
    answer: 'programming' as const,
    explanation: '规则明确（11位数字、特定号段），用正则表达式即可验证。',
  },
] as const;

// ─── Task Type Classifier (回归/分类/聚类) ─────────────────────────────────
const TASK_TYPE_SCENARIOS = [
  {
    scenario: '预测一套房子的市场价（如350万）',
    answer: 'regression' as const,
    explanation: '房价是一个连续的数值，属于回归问题。回归预测的是"多少"。',
  },
  {
    scenario: '判断一笔信用卡交易是否为欺诈',
    answer: 'classification' as const,
    explanation: '输出只有"是"或"不是"两种类别，属于二分类问题。分类判断的是"是不是"。',
  },
  {
    scenario: '把电商用户按消费习惯自动分成几组',
    answer: 'clustering' as const,
    explanation: '没有预先定义的标签，让算法自己发现数据中的分组，属于聚类。',
  },
  {
    scenario: '预测明年的GDP增长率（如5.2%）',
    answer: 'regression' as const,
    explanation: 'GDP增长率是一个连续数值，属于回归问题。',
  },
  {
    scenario: '判断一张X光片是否有肺炎',
    answer: 'classification' as const,
    explanation: '"有肺炎"或"无肺炎"是离散类别，属于二分类。',
  },
  {
    scenario: '把新闻文章按主题自动归类',
    answer: 'clustering' as const,
    explanation: '没有预设的类别标签，让算法根据文章内容相似度自动分组。',
  },
  {
    scenario: '预测某产品下个月的销量（如1234件）',
    answer: 'regression' as const,
    explanation: '销量是一个连续数值，属于回归问题。',
  },
  {
    scenario: '识别手写数字图片是0-9中的哪个数字',
    answer: 'classification' as const,
    explanation: '输出是10个离散类别之一，属于多分类。',
  },
] as const;

// ─── Workflow Steps (机器学习流程排序) ─────────────────────────────────────
const WORKFLOW_STEPS = [
  { id: 'collect', label: '收集数据' },
  { id: 'clean', label: '数据清洗' },
  { id: 'split', label: '划分训练/测试集' },
  { id: 'choose', label: '选择模型' },
  { id: 'train', label: '训练模型' },
  { id: 'predict', label: '预测' },
  { id: 'evaluate', label: '评估' },
  { id: 'tune', label: '调参优化' },
  { id: 'deploy', label: '部署上线' },
] as const;

const CORRECT_ORDER = [
  'collect',
  'clean',
  'split',
  'choose',
  'train',
  'predict',
  'evaluate',
  'tune',
  'deploy',
] as const;

// ─── Sub-components ────────────────────────────────────────────────────────

function ProgrammingVsML({
  onComplete,
  onAskAI,
}: {
  onComplete?: (passed: boolean) => void;
  onAskAI?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = PROGRAMMING_VS_ML_SCENARIOS.every(
    (_, i) => answers[i] !== undefined,
  );

  const correctCount = PROGRAMMING_VS_ML_SCENARIOS.filter(
    (s, i) => answers[i] === s.answer,
  ).length;
  const total = PROGRAMMING_VS_ML_SCENARIOS.length;
  const passed = correctCount >= Math.ceil(total * 0.7);

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete?.(passed);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-blue-800 font-semibold">
          判断以下场景适合用"传统编程"还是"机器学习"来解决？
        </p>
        <p className="text-xs text-blue-600 mt-1">
          传统编程 = 规则明确可穷举；机器学习 = 规则复杂，需要从数据中学习规律
        </p>
      </div>

      <div className="space-y-3">
        {PROGRAMMING_VS_ML_SCENARIOS.map((item, i) => {
          const userAnswer = answers[i];
          const isCorrect = submitted && userAnswer === item.answer;
          const isWrong = submitted && userAnswer !== item.answer;
          return (
            <div
              key={i}
              className={`rounded-xl border p-4 transition-all ${
                submitted
                  ? isCorrect
                    ? 'border-green-200 bg-green-50/40'
                    : isWrong
                      ? 'border-red-200 bg-red-50/40'
                      : 'border-slate-200 bg-white'
                  : 'border-slate-200 bg-white hover:border-primary-200'
              }`}
            >
              <p className="text-sm font-semibold text-slate-800 mb-2">
                {i + 1}. {item.scenario}
              </p>
              {!submitted ? (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [i]: 'programming' }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      userAnswer === 'programming'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    传统编程
                  </button>
                  <button
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [i]: 'machine-learning',
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      userAnswer === 'machine-learning'
                        ? 'bg-violet-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    机器学习
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {isCorrect && (
                    <div className="flex items-center gap-1.5 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-semibold">正确！</span>
                    </div>
                  )}
                  {isWrong && (
                    <div className="flex items-center gap-1.5 text-red-700">
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs font-semibold">
                        正确答案是：{item.answer === 'machine-learning' ? '机器学习' : '传统编程'}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600">💡 {item.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            提交答案
          </button>
          <span className="text-xs text-slate-400">
            {allAnswered ? '已回答全部' : `已答 ${Object.keys(answers).length}/${total}`}
          </span>
        </div>
      )}

      {submitted && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-extrabold text-amber-800">
              得分: {correctCount}/{total}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            机器学习擅长从数据中自动发现规律，适合规则难以穷举的场景；
            传统编程适合规则明确、逻辑清晰的计算任务。
          </p>
          <div className="flex gap-2">
            {onAskAI && (
              <button
                onClick={onAskAI}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-amber-700 text-xs font-semibold hover:bg-amber-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                问 AI
              </button>
            )}
            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              重新作答
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskTypeClassifier({
  onComplete,
  onAskAI,
}: {
  onComplete?: (passed: boolean) => void;
  onAskAI?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = TASK_TYPE_SCENARIOS.every(
    (_, i) => answers[i] !== undefined,
  );

  const correctCount = TASK_TYPE_SCENARIOS.filter(
    (s, i) => answers[i] === s.answer,
  ).length;
  const total = TASK_TYPE_SCENARIOS.length;
  const passed = correctCount >= Math.ceil(total * 0.7);

  const typeColors: Record<string, string> = {
    regression: 'bg-cyan-500 text-white',
    classification: 'bg-emerald-500 text-white',
    clustering: 'bg-purple-500 text-white',
  };

  const typeLabels: Record<string, string> = {
    regression: '回归',
    classification: '分类',
    clustering: '聚类',
  };

  return (
    <div className="space-y-4">
      <div className="bg-violet-50/60 rounded-xl p-4 border border-violet-100">
        <p className="text-sm text-violet-800 font-semibold">
          判断以下场景属于"回归"、"分类"还是"聚类"任务？
        </p>
        <p className="text-xs text-violet-600 mt-1">
          回归→预测连续数值 | 分类→判断离散类别 | 聚类→无标签自动分组
        </p>
      </div>

      <div className="space-y-3">
        {TASK_TYPE_SCENARIOS.map((item, i) => {
          const userAnswer = answers[i];
          const isCorrect = submitted && userAnswer === item.answer;
          const isWrong = submitted && userAnswer !== item.answer;
          return (
            <div
              key={i}
              className={`rounded-xl border p-4 transition-all ${
                submitted
                  ? isCorrect
                    ? 'border-green-200 bg-green-50/40'
                    : isWrong
                      ? 'border-red-200 bg-red-50/40'
                      : 'border-slate-200 bg-white'
                  : 'border-slate-200 bg-white hover:border-violet-200'
              }`}
            >
              <p className="text-sm font-semibold text-slate-800 mb-2">
                {i + 1}. {item.scenario}
              </p>
              {!submitted ? (
                <div className="flex gap-2 flex-wrap">
                  {(['regression', 'classification', 'clustering'] as const).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [i]: t }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          userAnswer === t
                            ? typeColors[t] + ' shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {typeLabels[t]}
                      </button>
                    ),
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {isCorrect && (
                    <div className="flex items-center gap-1.5 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-semibold">正确！</span>
                    </div>
                  )}
                  {isWrong && (
                    <div className="flex items-center gap-1.5 text-red-700">
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs font-semibold">
                        正确答案是：{typeLabels[item.answer]}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600">💡 {item.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSubmitted(true);
              onComplete?.(passed);
            }}
            disabled={!allAnswered}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            提交答案
          </button>
          <span className="text-xs text-slate-400">
            {allAnswered ? '已回答全部' : `已答 ${Object.keys(answers).length}/${total}`}
          </span>
        </div>
      )}

      {submitted && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-extrabold text-amber-800">
              得分: {correctCount}/{total}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            回归=连续值, 分类=离散类, 聚类=无标签分组。区分这三者是理解机器学习任务类型的关键。
          </p>
          <div className="flex gap-2">
            {onAskAI && (
              <button
                onClick={onAskAI}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-amber-700 text-xs font-semibold hover:bg-amber-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                问 AI
              </button>
            )}
            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              重新作答
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI / ML / DL Classifier ────────────────────────────────────────────────
const AI_ML_DL_SCENARIOS = [
  {
    scenario: '游戏中的NPC通过A*算法自动计算最短路径绕开障碍物到达玩家位置',
    answer: 'ai' as const,
    explanation: 'A*寻路算法是经典的人工智能技术，但它不涉及从数据中学习——规则由人类设计。这说明AI包含但不限于机器学习。',
    relatedAlgorithms: [],
  },
  {
    scenario: '根据历史房价数据，训练模型预测新房子的价格',
    answer: 'ml' as const,
    explanation: '让模型从历史数据中学习"面积、地段→房价"的映射规律，属于监督学习中的回归。这是机器学习的典型范式。',
    relatedAlgorithms: ['linear-regression'],
  },
  {
    scenario: '根据邮件内容，自动识别并过滤垃圾邮件',
    answer: 'ml' as const,
    explanation: '从大量标注好的邮件数据中学习分类规则，属于监督学习中的分类问题。后续的逻辑回归课程会教你实现。',
    relatedAlgorithms: ['logistic-regression', 'knn'],
  },
  {
    scenario: '人脸识别门禁系统，使用深度神经网络自动识别员工身份',
    answer: 'dl' as const,
    explanation: '现代人脸识别使用卷积神经网络（CNN）等深度学习方法，通过多层网络自动提取面部特征。',
    relatedAlgorithms: ['random-forest'],
  },
  {
    scenario: '大语言模型（如ChatGPT、DeepSeek）通过海量文本训练，能与人类自然对话',
    answer: 'dl' as const,
    explanation: '大语言模型基于Transformer深度学习架构，包含数十亿参数，需要海量数据和算力训练。这是深度学习的前沿应用。',
    relatedAlgorithms: [],
  },
  {
    scenario: '语音助手（如Siri）将用户的语音实时转写成文字',
    answer: 'dl' as const,
    explanation: '语音识别通常使用循环神经网络（RNN）或Transformer等深度学习模型，从音频波形中提取语言特征。',
    relatedAlgorithms: [],
  },
  {
    scenario: '早期的医疗诊断专家系统，由医生手动编写数百条"如果…就…"规则来判断疾病',
    answer: 'ai' as const,
    explanation: '专家系统是符号AI的经典代表——不依赖数据学习，而是人类专家穷举规则。这证明AI不全是机器学习！',
    relatedAlgorithms: ['decision-tree'],
  },
  {
    scenario: '电商平台根据你的浏览和购买历史，推荐你可能感兴趣的商品',
    answer: 'ml' as const,
    explanation: '推荐系统从用户行为数据中学习偏好模式，属于机器学习应用。协同过滤和矩阵分解是常见方法。',
    relatedAlgorithms: ['k-means'],
  },
] as const;

function AIMLDlMap({
  onComplete,
  onAskAI,
}: {
  onComplete?: (passed: boolean) => void;
  onAskAI?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = AI_ML_DL_SCENARIOS.every(
    (_, i) => answers[i] !== undefined,
  );

  const correctCount = AI_ML_DL_SCENARIOS.filter(
    (s, i) => answers[i] === s.answer,
  ).length;
  const total = AI_ML_DL_SCENARIOS.length;
  const passed = correctCount >= Math.ceil(total * 0.7);

  const typeColors: Record<string, string> = {
    ai: 'bg-rose-500 text-white',
    ml: 'bg-amber-500 text-white',
    dl: 'bg-violet-500 text-white',
  };

  const typeLabels: Record<string, string> = {
    ai: 'AI 人工智能',
    ml: '机器学习',
    dl: '深度学习',
  };

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete?.(passed);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-rose-50 to-violet-50 rounded-xl p-4 border border-rose-100">
        <p className="text-sm text-slate-800 font-semibold">
          判断以下案例更接近 AI（人工智能）、ML（机器学习）还是 DL（深度学习）？
        </p>
        <p className="text-xs text-slate-600 mt-1">
          AI 是最终目标（让机器表现智能）| ML 是实现AI的主流方法（从数据中学规律）| DL 是ML中使用深层神经网络的分支
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          💡 关系：AI ⊃ ML ⊃ DL（俄罗斯套娃）
        </p>
      </div>

      <div className="space-y-3">
        {AI_ML_DL_SCENARIOS.map((item, i) => {
          const userAnswer = answers[i];
          const isCorrect = submitted && userAnswer === item.answer;
          const isWrong = submitted && userAnswer !== item.answer;
          return (
            <div
              key={i}
              className={`rounded-xl border p-4 transition-all ${
                submitted
                  ? isCorrect
                    ? 'border-green-200 bg-green-50/40'
                    : isWrong
                      ? 'border-red-200 bg-red-50/40'
                      : 'border-slate-200 bg-white'
                  : 'border-slate-200 bg-white hover:border-rose-200'
              }`}
            >
              <p className="text-sm font-semibold text-slate-800 mb-2">
                {i + 1}. {item.scenario}
              </p>
              {!submitted ? (
                <div className="flex gap-2 flex-wrap">
                  {(['ai', 'ml', 'dl'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [i]: t }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        userAnswer === t
                          ? typeColors[t] + ' shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {isCorrect && (
                    <div className="flex items-center gap-1.5 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-semibold">正确！</span>
                    </div>
                  )}
                  {isWrong && (
                    <div className="flex items-center gap-1.5 text-red-700">
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs font-semibold">
                        正确答案是：{typeLabels[item.answer]}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600">💡 {item.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            提交答案
          </button>
          <span className="text-xs text-slate-400">
            {allAnswered ? '已回答全部' : `已答 ${Object.keys(answers).length}/${total}`}
          </span>
        </div>
      )}

      {submitted && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-extrabold text-amber-800">
              得分: {correctCount}/{total}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            AI是宏大目标（让机器有智能），机器学习是实现AI的主流方法（用数据训练模型），深度学习是机器学习中借助深层神经网络的分支。三者是包含关系。
          </p>
          <div className="flex gap-2">
            {onAskAI && (
              <button
                onClick={onAskAI}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-amber-700 text-xs font-semibold hover:bg-amber-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                问 AI
              </button>
            )}
            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              重新作答
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkflowSimulator({
  onComplete,
  onAskAI,
}: {
  onComplete?: (passed: boolean) => void;
  onAskAI?: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const available = WORKFLOW_STEPS.filter((s) => !selected.includes(s.id));
  const allPlaced = selected.length === WORKFLOW_STEPS.length;

  const handleSelect = (id: string) => {
    setSelected((prev) => [...prev, id]);
  };

  const handleRemove = (id: string) => {
    setSelected((prev) => prev.filter((s) => s !== id));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    for (let i = 0; i < selected.length; i++) {
      if (selected[i] === CORRECT_ORDER[i]) correct++;
    }
    const totalSteps = CORRECT_ORDER.length;
    const passed = correct >= Math.ceil(totalSteps * 0.7);
    onComplete?.(passed);
  };

  const allCorrect = submitted && selected.every((id, i) => id === CORRECT_ORDER[i]);

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100">
        <p className="text-sm text-indigo-800 font-semibold">
          按正确顺序点击步骤，排好机器学习的完整流程
        </p>
        <p className="text-xs text-indigo-600 mt-1">
          依次点击下方按钮，把它们按正确顺序排列。点错可以点击排列中的步骤移除。
        </p>
      </div>

      {/* Ordered list */}
      <div className="space-y-2 min-h-[120px]">
        {selected.length === 0 && !submitted && (
          <p className="text-sm text-slate-400 text-center py-6">
            点击下方步骤开始排序...
          </p>
        )}
        {selected.map((id, i) => {
          const step = WORKFLOW_STEPS.find((s) => s.id === id)!;
          const isCorrectPosition = submitted && id === CORRECT_ORDER[i];
          const isWrongPosition = submitted && id !== CORRECT_ORDER[i];
          const correctStep =
            submitted && isWrongPosition
              ? WORKFLOW_STEPS.find((s) => s.id === CORRECT_ORDER[i])
              : undefined;
          return (
            <div
              key={id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                submitted
                  ? isCorrectPosition
                    ? 'border-green-300 bg-green-50'
                    : 'border-red-300 bg-red-50'
                  : 'border-slate-200 bg-white hover:border-indigo-200'
              }`}
            >
              <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-semibold text-slate-700">
                {step.label}
              </span>
              {submitted && isCorrectPosition && (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
              {submitted && isWrongPosition && (
                <span className="text-xs text-red-500 flex-shrink-0">
                  应为: {correctStep?.label}
                </span>
              )}
              {!submitted && (
                <button
                  onClick={() => handleRemove(id)}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Available steps */}
      {!submitted && available.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {available.map((step) => (
            <button
              key={step.id}
              onClick={() => handleSelect(step.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-sm"
            >
              <GripVertical className="w-3.5 h-3.5 text-slate-400" />
              {step.label}
            </button>
          ))}
        </div>
      )}

      {!submitted && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!allPlaced}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            提交排序
          </button>
          <span className="text-xs text-slate-400">
            {allPlaced ? '已排列全部步骤' : `已排列 ${selected.length}/${WORKFLOW_STEPS.length}`}
          </span>
        </div>
      )}

      {submitted && (
        <div
          className={`rounded-xl p-4 border space-y-2 ${
            allCorrect
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-extrabold text-slate-800">
              {allCorrect ? '全部正确！' : `正确排列了 ${selected.filter((id, i) => id === CORRECT_ORDER[i]).length}/${CORRECT_ORDER.length} 步`}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {allCorrect
              ? '你已经完整掌握了机器学习项目的标准流程！'
              : '机器学习流程：收集数据 → 清洗 → 划分训练/测试集 → 选模型 → 训练 → 预测 → 评估 → 调参 → 部署'}
          </p>
          <div className="flex gap-2">
            {onAskAI && (
              <button
                onClick={onAskAI}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-amber-700 text-xs font-semibold hover:bg-amber-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                问 AI
              </button>
            )}
            <button
              onClick={() => {
                setSelected([]);
                setSubmitted(false);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              重新作答
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Guided Question Block (universal fallback for unimplemented interaction types) ─
function GuidedQuestionBlock({
  questions,
  onAskAI,
  onComplete,
}: {
  questions: { id: string; prompt?: string; scenario?: string; options: string[]; correctIndex: number; correctFeedback: string; wrongFeedback: string; explanation: string; relatedAlgorithms?: string[] }[];
  onAskAI?: () => void;
  onComplete?: (passed: boolean) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (!questions || questions.length === 0) return null;

  const q = questions[currentIdx];
  const isCorrect = selectedIndex === q.correctIndex;
  const allAnswered = Object.keys(answers).length === questions.length;
  const correctCount = Object.entries(answers).filter(([i, a]) => a === questions[parseInt(i)].correctIndex).length;

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelectedIndex(idx);
    setRevealed(true);
    setAnswers((prev) => ({ ...prev, [currentIdx]: idx }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedIndex(null);
      setRevealed(false);
    } else {
      onComplete?.(correctCount >= Math.ceil(questions.length * 0.7));
    }
  };

  const algorithmNameMap: Record<string, string> = {
    'linear-regression': '线性回归',
    'knn': 'K近邻(KNN)',
    'logistic-regression': '逻辑回归',
    'decision-tree': '决策树',
    'k-means': 'K-Means聚类',
    'random-forest': '随机森林',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          第 {currentIdx + 1} / {questions.length} 题
        </span>
        {Object.keys(answers).length > 0 && (
          <span className="text-xs text-primary-600 font-semibold">
            已答 {Object.keys(answers).length} 题
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
          style={{ width: `${((currentIdx + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Scenario */}
      {q.scenario && (
        <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-100">
          <h4 className="text-xs font-bold text-blue-700 mb-1">场景</h4>
          <p className="text-sm text-blue-800 leading-relaxed">{q.scenario}</p>
        </div>
      )}

      {/* Question */}
      <p className="text-sm font-semibold text-gray-800 leading-relaxed">
        {q.prompt || '请选择正确答案'}
      </p>

      {/* Options */}
      <div className="space-y-2">
        {q.options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;
          const showCorrect = revealed && idx === q.correctIndex;
          const showWrong = revealed && isSelected && !isCorrect;

          let buttonStyle = 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50';
          if (revealed) {
            if (showCorrect) buttonStyle = 'border-green-400 bg-green-50 text-green-800 font-semibold';
            else if (showWrong) buttonStyle = 'border-red-400 bg-red-50 text-red-800';
            else buttonStyle = 'border-slate-100 bg-slate-50 text-slate-400';
          } else if (isSelected) {
            buttonStyle = 'border-blue-400 bg-blue-50 text-blue-800 font-semibold';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={revealed}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${buttonStyle} ${revealed ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{opt.replace(/^[A-D]\.\s*/, '')}</span>
              {revealed && showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
              {revealed && showWrong && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {revealed && (
        <div className={`rounded-xl p-4 border ${isCorrect ? 'bg-green-50/70 border-green-200' : 'bg-red-50/70 border-red-200'}`}>
          <div className="flex items-start gap-2 mb-2">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className={`text-sm font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '回答正确！' : '回答有误'}
              </h4>
              <p className={`text-sm mt-1 leading-relaxed ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? q.correctFeedback : q.wrongFeedback}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/50">
            <h4 className="text-xs font-bold text-slate-600 mb-1">知识点</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{q.explanation}</p>
          </div>

          {q.relatedAlgorithms && q.relatedAlgorithms.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200/50">
              <h4 className="text-xs font-bold text-primary-600 mb-1">这个知识点会在以下算法中用到</h4>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {q.relatedAlgorithms.map((algId) => (
                  <span key={algId} className="inline-block px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
                    {algorithmNameMap[algId] || algId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      {revealed && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
          >
            {currentIdx < questions.length - 1 ? '下一题' : allAnswered ? '完成' : '继续'}
          </button>
          {onAskAI && (
            <button
              onClick={onAskAI}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-amber-300 bg-white text-amber-700 text-sm font-semibold hover:bg-amber-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              问 AI
            </button>
          )}
        </div>
      )}

      {/* Summary on last question after all answered */}
      {revealed && currentIdx === questions.length - 1 && allAnswered && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-extrabold text-amber-800">
              得分: {correctCount}/{questions.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Fallback (no placeholder, just hidden) ─────────────────────────────────
function NoInteraction() {
  return null;
}

// ─── Main Component ────────────────────────────────────────────────────────

const IMPLEMENTED_TYPES = new Set<InteractionType>([
  'programming-vs-ml',
  'ai-ml-dl-map',
  'task-type-classifier',
  'workflow-simulator',
  'data-table-guide',
  'feature-label-selector',
  'xy-splitter',
  'train-test-split',
  'regression-metric-lab',
  'classification-metric-lab',
  'overfitting-playground',
  'hyperparameter-lab',
  'cross-validation-simulator',
  'leakage-detective',
]);

export default function InteractiveTask({ type, onComplete, onAskAI, fallbackQuestions }: Props) {
  const handleComplete = useCallback(
    (passed: boolean) => {
      onComplete?.(passed);
    },
    [onComplete],
  );

  if (type === 'programming-vs-ml') {
    return (
      <ProgrammingVsML onComplete={handleComplete} onAskAI={onAskAI} />
    );
  }

  if (type === 'ai-ml-dl-map') {
    return (
      <AIMLDlMap onComplete={handleComplete} onAskAI={onAskAI} />
    );
  }

  if (type === 'task-type-classifier') {
    return (
      <TaskTypeClassifier onComplete={handleComplete} onAskAI={onAskAI} />
    );
  }

  if (type === 'workflow-simulator') {
    return (
      <WorkflowSimulator onComplete={handleComplete} onAskAI={onAskAI} />
    );
  }

  if (type === 'data-table-guide')
    return <DataTableGuide onComplete={handleComplete} onAskAI={onAskAI} />;
  if (type === 'feature-label-selector')
    return <FeatureLabelSelector onComplete={handleComplete} onAskAI={onAskAI} />;
  if (type === 'xy-splitter')
    return <XYSplitter onComplete={handleComplete} onAskAI={onAskAI} />;
  if (type === 'train-test-split')
    return <TrainValidTestSplitSimulator onComplete={handleComplete} onAskAI={onAskAI} />;
  if (type === 'regression-metric-lab')
    return <RegressionMetricLab onComplete={handleComplete} onAskAI={onAskAI} />;
  if (type === 'classification-metric-lab')
    return <ClassificationMetricLab onComplete={handleComplete} onAskAI={onAskAI} />;
  if (type === 'overfitting-playground')
    return <OverfittingPlayground onComplete={handleComplete} onAskAI={onAskAI} />;
  if (type === 'hyperparameter-lab')
    return <HyperparameterLab onComplete={handleComplete} onAskAI={onAskAI} />;
  if (type === 'cross-validation-simulator')
    return <CrossValidationSimulator onComplete={handleComplete} onAskAI={onAskAI} />;
  if (type === 'leakage-detective')
    return <LeakageDetective onComplete={handleComplete} onAskAI={onAskAI} />;

  // Fallback: use GuidedQuestionBlock if questions available, otherwise hide
  if (fallbackQuestions && fallbackQuestions.length > 0) {
    return (
      <GuidedQuestionBlock
        questions={fallbackQuestions}
        onAskAI={onAskAI}
        onComplete={handleComplete}
      />
    );
  }
  return <NoInteraction />;
}
