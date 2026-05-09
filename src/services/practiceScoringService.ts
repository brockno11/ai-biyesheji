import type { AIReviewResult, Exercise } from '../types';
import type { PythonRunResult } from './aiTypes';
import { getMissingKeywords } from './codeCheckService';

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function todoScore(code: string) {
  const count = (code.match(/\bTODO\b/gi) || []).length;
  return {
    count,
    score: clamp(20 - count * 4, 0, 20),
  };
}

function runtimeScore(runtime?: PythonRunResult) {
  if (!runtime) return 0;
  if (runtime?.status === 'success') return 25;
  if (runtime?.status === 'unsupported') return 10;
  return 0;
}

function testScore(runtime?: PythonRunResult) {
  if (!runtime) return 0;
  if (runtime?.status === 'success') return 15;
  if (runtime?.status === 'unsupported') return 5;
  return 0;
}

export function buildPracticeReview(
  exercise: Exercise,
  code: string,
  ruleReview: AIReviewResult,
  runtime?: PythonRunResult
): AIReviewResult {
  const missingKeywords = getMissingKeywords(exercise, code);
  const todo = todoScore(code);
  const apiScore = Math.round(ruleReview.score * 0.4);
  const executionScore = runtimeScore(runtime);
  const fixedTestScore = testScore(runtime);
  const score = clamp(apiScore + todo.score + executionScore + fixedTestScore);
  const runtimeFailed = runtime?.status === 'error';
  const passed = runtime?.supported ? runtime?.status === 'success' && score >= 70 : score >= 60;

  const problems = [
    ...ruleReview.problems,
    ...(runtimeFailed ? [`Python 真运行失败：${runtime?.error || '请查看运行结果中的错误信息。'}`] : []),
  ];

  const suggestions = [
    ...ruleReview.suggestions,
    ...(runtimeFailed
      ? ['优先修复 Python 报错对应的语法、变量名或 API 调用，再重新运行评分。']
      : []),
  ];

  const dimensions: AIReviewResult['dimensions'] = [
    {
      label: '核心 API 使用',
      score: apiScore,
      maxScore: 40,
      description: missingKeywords.length
        ? `仍缺少：${missingKeywords.join('、')}`
        : '核心 API 已出现在可执行代码中',
      status: apiScore >= 32 ? 'good' : apiScore >= 16 ? 'warning' : 'bad',
    },
    {
      label: 'TODO 完成度',
      score: todo.score,
      maxScore: 20,
      description: todo.count > 0 ? `还有 ${todo.count} 处 TODO 未清理` : 'TODO 已清理',
      status: todo.count === 0 ? 'good' : todo.count <= 2 ? 'warning' : 'bad',
    },
    {
      label: 'Python 可执行性',
      score: executionScore,
      maxScore: 25,
      description:
        runtime?.status === 'success'
          ? '代码可以在 Pyodide 中真实执行'
          : runtime?.status === 'unsupported'
            ? '当前题目暂未接入真运行'
            : '代码执行失败，需要先修复报错',
      status: runtime?.status === 'success' ? 'good' : runtime?.status === 'unsupported' ? 'neutral' : 'bad',
    },
    {
      label: '固定测试表现',
      score: fixedTestScore,
      maxScore: 15,
      description:
        runtime?.status === 'success'
          ? '预测长度和模型指标通过固定测试'
          : runtime?.status === 'unsupported'
            ? '等待后续扩展固定测试'
            : '固定测试未通过或未执行到测试阶段',
      status: runtime?.status === 'success' ? 'good' : runtime?.status === 'unsupported' ? 'neutral' : 'bad',
    },
  ];

  return {
    score,
    passed,
    dimensions,
    summary: passed
      ? `综合评分 ${score} 分：代码不仅包含关键 API，也已经通过 Python 真运行和固定测试。`
      : runtimeFailed
        ? `综合评分 ${score} 分：关键词检查不能代表代码能运行，当前 Python 执行失败，需要先修复报错。`
        : `综合评分 ${score} 分：代码结构还需要补齐，建议先处理缺失 API 和 TODO。`,
    problems: problems.length ? problems : ['暂未发现明显问题。'],
    suggestions: suggestions.length
      ? suggestions
      : ['可以尝试调整参数或数据规模，观察模型指标如何变化。'],
    nextStep: runtimeFailed
      ? '先根据 Python 真运行结果定位第一条报错，再点击“运行并评分”重新验证。'
      : passed
        ? '继续尝试修改测试集比例、噪声大小或样本数量，观察 MSE 与 R² 的变化。'
        : '先补齐真正会执行的代码，再运行评分。注释里的关键词不会计入核心 API 使用分。',
  };
}
