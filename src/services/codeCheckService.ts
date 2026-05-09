import type { Exercise, AIReviewResult } from '../types';

export function checkCode(
  exercise: Exercise,
  code: string
): AIReviewResult {
  const problems: string[] = [];
  const suggestions: string[] = [];
  let totalPoints = 0;
  let earnedPoints = 0;

  for (const rule of exercise.checkRules) {
    totalPoints += rule.points;

    if (rule.type === 'keyword' && rule.keyword) {
      const escaped = rule.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      if (regex.test(code)) {
        earnedPoints += rule.points;
      } else {
        problems.push(`缺少关键 API：${rule.keyword}`);
        suggestions.push(`请添加 "${rule.keyword}" 到你的代码中（${rule.description}）`);
      }
    }

    if (rule.type === 'structure') {
      // Simple structure check: look for the description content pattern
      if (code.includes(rule.description.split('的')[0])) {
        earnedPoints += rule.points;
      } else {
        problems.push(`结构问题：${rule.description}`);
        suggestions.push(`调整代码结构：${rule.description}`);
      }
    }
  }

  // Check if TODO comments are resolved
  const todoCount = (code.match(/TODO|___|---/g) || []).length;
  if (todoCount > 2) {
    problems.push(`还有 ${todoCount} 处未完成的代码（TODO 标记）`);
    suggestions.push('请逐个完成 TODO 标记的代码部分');
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= 60;

  let summary: string;
  let nextStep: string;

  if (score >= 90) {
    summary = `太棒了！你的代码非常完整，得分 ${score} 分。核心 API 使用正确，代码结构清晰。`;
    nextStep = '建议挑战更高难度的练习，或者尝试修改参数观察模型变化。';
  } else if (score >= 60) {
    summary = `不错！得分 ${score} 分。基本框架正确，但还有一些关键部分需要补充。`;
    nextStep = '根据上方的建议补全缺失的 API，完善代码后再次检查。';
  } else if (score >= 30) {
    summary = `继续努力！得分 ${score} 分。你已完成了部分代码，但核心功能还需要完善。`;
    nextStep = '仔细阅读题目说明和提示，逐步实现每个 TODO 部分。';
  } else {
    summary = `刚开始学习，得分 ${score} 分。不要气馁，这是学习的第一步！`;
    nextStep = '建议先回顾对应算法的课程内容，理解基本概念后再尝试。';
  }

  return {
    score,
    passed,
    summary,
    problems,
    suggestions,
    nextStep,
  };
}
