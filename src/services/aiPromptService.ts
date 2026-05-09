import type { AIActionType, AIMessage, AIRequestContext } from './aiTypes';

const TUTOR_SYSTEM_PROMPT = `你是机器学习课程的 AI 助教，名字叫“小智”，面向本科初学者。
回答要求：
1. 通俗、鼓励、分步骤，优先启发学生思考。
2. 默认控制在 200-300 字以内。
3. 不要直接给完整代码答案，除非用户明确要求参考答案。
4. 指出错误时先说原因，再给修改方向。
5. 使用中文教学风格，语气友好但专业。`;

const JSON_SYSTEM_PROMPT = `${TUTOR_SYSTEM_PROMPT}
你必须只返回合法 JSON，不要输出 Markdown，不要添加代码围栏，不要添加额外说明。`;

function algorithmContext(context: AIRequestContext) {
  const a = context.algorithm;
  if (!a) return '当前未提供具体算法。';
  return [
    `算法 ID：${a.id}`,
    `算法名称：${a.name}`,
    `分类：${a.category}`,
    `难度：${a.difficulty}`,
    `简介：${a.intro}`,
    `核心公式：${a.formula}`,
    `算法步骤：${a.steps.join('；')}`,
    context.pagePosition ? `当前页面位置：${context.pagePosition}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildTutorUserPrompt(context: AIRequestContext, actionType: AIActionType) {
  const question = context.userQuestion || '';
  const actionGuide: Record<string, string> = {
    askTutor: `请结合上下文回答学生问题：${question}`,
    explainConcept: '请解释当前算法的核心概念，适合初学者理解。',
    diagnoseCode: '请诊断当前代码的主要问题，优先给提示和修改方向。',
    generatePracticeHint: '请给出练习提示，不要直接给完整答案。',
    generateQuiz: '请出一道相关思考题，并给出简短解析。',
    summarizeLesson: '请总结本节课的关键知识点和易错点。',
    lifeExample: '请用一个生活例子解释当前算法。',
    explainVisualization: '请解释当前可视化参数和图体现象。',
  };

  return `${algorithmContext(context)}

任务：${actionGuide[actionType] || actionGuide.askTutor}
${context.visualState ? `当前可视化状态：${JSON.stringify(context.visualState, null, 2)}` : ''}
${context.userCode ? `学生代码：\n${context.userCode}` : ''}`;
}

export function buildChatMessages(
  actionType: AIActionType,
  context: AIRequestContext
): AIMessage[] {
  return [
    { role: 'system', content: TUTOR_SYSTEM_PROMPT },
    ...(context.chatHistory || []).slice(-8),
    { role: 'user', content: buildTutorUserPrompt(context, actionType) },
  ];
}

export function buildCodeReviewMessages(context: AIRequestContext): AIMessage[] {
  const local = context.localReview;
  return [
    { role: 'system', content: JSON_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `${algorithmContext(context)}

请根据以下练习信息生成 AI 代码诊断报告。
返回 JSON 格式：
{
  "summary": "总体评价",
  "scoreReason": "得分原因",
  "problems": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"],
  "nextStep": "下一步建议",
  "encouragement": "鼓励语"
}

练习标题：${context.exercise?.title || '未知练习'}
练习目标：${context.exercise?.description || ''}
本地规则得分：${local?.score ?? 0}
本地规则是否通过：${local?.passed ? '通过' : '未通过'}
本地发现问题：${local?.problems.join('；') || '无'}
缺失关键词或 API：${context.missingKeywords?.join('、') || '无'}
学生代码：
${context.userCode || ''}`,
    },
  ];
}

export function buildQuizReviewMessages(context: AIRequestContext): AIMessage[] {
  const wrongQuestions = (context.quizQuestions || [])
    .map((question, index) => ({ question, index }))
    .filter(({ question, index }) => context.quizAnswers?.[index] !== question.correctIndex);

  return [
    { role: 'system', content: JSON_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `${algorithmContext(context)}

请分析学生测验错题，返回 JSON：
{
  "weakPoints": ["薄弱点1", "薄弱点2"],
  "wrongQuestionAnalysis": [
    {
      "question": "题目",
      "whyWrong": "为什么错",
      "correctThinking": "正确思路"
    }
  ],
  "reviewAdvice": "复习建议",
  "extraQuestion": {
    "question": "相似练习题",
    "options": ["A", "B", "C", "D"],
    "answer": 0,
    "explanation": "解析"
  }
}

最终得分：${context.quizScore ?? 0}
错题列表：${JSON.stringify(
        wrongQuestions.map(({ question, index }) => ({
          question: question.question,
          userAnswer: context.quizAnswers?.[index],
          correctAnswer: question.correctIndex,
          options: question.options,
          explanation: question.explanation,
        })),
        null,
        2
      )}`,
    },
  ];
}

export function buildStudyPlanMessages(context: AIRequestContext): AIMessage[] {
  return [
    { role: 'system', content: JSON_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请根据学生学习记录生成个性化学习路径推荐，返回 JSON：
{
  "summary": "当前学习状态总结",
  "nextAlgorithm": "推荐下一门算法",
  "reason": "推荐原因",
  "reviewList": ["建议复习点1", "建议复习点2"],
  "dailyPlan": ["今天任务1", "今天任务2", "今天任务3"]
}

已完成算法：${context.completedAlgorithms?.join('、') || '无'}
每门课数据：${JSON.stringify(context.courseStats || [], null, 2)}
最近活动：${context.recentActivity || '暂无'}
未完成课程：${context.unfinishedCourses?.join('、') || '无'}`,
    },
  ];
}

export function buildCourseDraftMessages(context: AIRequestContext): AIMessage[] {
  return [
    { role: 'system', content: JSON_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请生成一份机器学习课程草稿，返回 JSON：
{
  "name": "算法名称",
  "intro": "简介",
  "description": "详细说明",
  "steps": ["步骤1", "步骤2"],
  "pros": ["优点1", "优点2"],
  "cons": ["缺点1", "缺点2"],
  "useCases": ["场景1", "场景2"],
  "formula": "核心公式",
  "codeExample": "Python 示例代码",
  "quizQuestions": [],
  "practiceExercise": {}
}

管理员输入：${JSON.stringify(context.courseDraftInput || {}, null, 2)}`,
    },
  ];
}
