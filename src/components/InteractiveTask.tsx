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

interface Props {
  type: InteractionType;
  onComplete?: (passed: boolean) => void;
  onAskAI?: () => void;
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

// ─── Placeholder ───────────────────────────────────────────────────────────

function PlaceholderTask({
  typeName,
  onAskAI,
}: {
  typeName: string;
  onAskAI?: () => void;
}) {
  return (
    <div className="bg-amber-50/60 rounded-xl p-6 border border-amber-200 text-center space-y-3">
      <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-amber-600" />
      </div>
      <div>
        <p className="text-sm font-extrabold text-amber-800">此交互模块正在开发中</p>
        <p className="text-xs text-amber-600 mt-1">
          交互类型: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-700">{typeName}</code>
        </p>
      </div>
      {onAskAI && (
        <button
          onClick={onAskAI}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-amber-300 rounded-xl text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          问 AI 了解更多
        </button>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

const IMPLEMENTED_TYPES = new Set<InteractionType>([
  'programming-vs-ml',
  'task-type-classifier',
  'workflow-simulator',
]);

export default function InteractiveTask({ type, onComplete, onAskAI }: Props) {
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

  return <PlaceholderTask typeName={type} onAskAI={onAskAI} />;
}
