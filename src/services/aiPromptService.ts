import type { AIActionType, AIMessage, AIRequestContext } from './aiTypes';

const TUTOR_SYSTEM_PROMPT = `你是机器学习课程的 AI 助教，名字叫”小智”，面向本科初学者。
回答要求：
1. 通俗、鼓励、分步骤，优先启发学生思考。
2. 默认控制在 200-300 字以内。
3. 不要直接给完整代码答案，除非用户明确要求参考答案。
4. 指出错误时先说原因，再给修改方向。
5. 使用中文教学风格，语气友好但专业。
6. 回复要像网页端 AI 助教的自然说明：短段落、少堆字、不要输出 Markdown 标题、不要使用 **、###、代码围栏等符号。
7. 需要列步骤时直接使用 1. 2. 3.，每点一句话即可。

【硬规则 — 必须遵守】
- 必须以系统提供的数据（本地规则检查结果、Python 运行结果、测验得分等）为准，不得编造不存在的运行结果或测试数据。
- 如果 Python 运行失败，必须如实指出失败原因，不能说”代码已经正确”或”做得很好”。
- 如果本地规则检查显示缺少某些 API，必须明确指出缺少了什么。
- 不要猜测学生的代码行为，只基于已提供的数据进行分析。

【课程类型适配】
你会收到课程类型（courseType）：foundation（基础概念课）、algorithm（算法课）、project（综合实践课）。
- foundation 课程：面向零基础，多用生活例子解释概念，引导用户理解"为什么"，不要强调代码。
- algorithm 课程：保持现有算法解释、代码诊断、学习建议的完整能力。`;

const JSON_SYSTEM_PROMPT = `${TUTOR_SYSTEM_PROMPT}
你必须只返回合法 JSON，不要输出 Markdown，不要添加代码围栏，不要添加额外说明。`;

function algorithmContext(context: AIRequestContext) {
  const a = context.algorithm;
  if (!a) return '当前未提供具体算法。';
  return [
    `课程 ID：${a.id}`,
    `课程名称：${a.name}`,
    `课程类型：${a.type || 'algorithm'}`,
    `分类：${a.category}`,
    `难度：${a.difficulty}`,
    `简介：${a.intro}`,
    a.formula ? `核心公式：${a.formula}` : '',
    (a.steps || []).length > 0 ? `算法步骤：${(a.steps || []).join('；')}` : '',
    context.pagePosition ? `当前页面位置：${context.pagePosition}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function foundationContext(context: AIRequestContext) {
  const pageInfo = context.pagePosition || '';
  const lessonTitleMatch = pageInfo.match(/基础课 - (.+)/);
  const lessonTitle = lessonTitleMatch ? lessonTitleMatch[1] : '';
  const openingInfo = pageInfo.includes('【已答引导题】') ? pageInfo.split('【已答引导题】\n')[1] || '' : '';

  return [
    lessonTitle ? `当前小节：${lessonTitle}` : '',
    openingInfo ? `引导题反馈：\n${openingInfo}` : '',
  ].filter(Boolean).join('\n');
}

function buildTutorUserPrompt(context: AIRequestContext, actionType: AIActionType) {
  const question = context.userQuestion || '';
  const isFoundation = context.algorithm?.type === 'foundation';

  const actionGuide: Record<string, string> = {
    askTutor: `请结合上下文回答学生问题：${question}`,
    explainConcept: '请解释当前算法的核心概念，适合初学者理解。',
    diagnoseCode: '请诊断当前代码的主要问题，优先给提示和修改方向。',
    generatePracticeHint: '请给出练习提示，不要直接给完整答案。',
    generateQuiz: '请出一道相关思考题，并给出简短解析。',
    summarizeLesson: '请总结本节课的关键知识点和易错点。',
    lifeExample: '请用一个生活例子解释当前算法。',
    explainVisualization: '请解释当前可视化参数和图形现象。',
  };

  const foundationActionGuide: Record<string, string> = {
    askTutor: `请结合上下文回答学生问题：${question}`,
    lifeExample: '请用一个生活中的例子解释当前这个概念，用做饭、开车、看病等常见场景。',
    generateQuiz: '请出一道和当前知识点相关的思考题（选择题），并给出简短解析。',
    summarizeLesson: '请用一句话总结当前知识点的最核心内容，然后列出2-3个最易错的点。',
  };

  const guide = isFoundation
    ? (foundationActionGuide[actionType] || actionGuide[actionType] || actionGuide.askTutor)
    : (actionGuide[actionType] || actionGuide.askTutor);

  const baseContext = isFoundation
    ? `${algorithmContext(context)}\n${foundationContext(context)}`
    : algorithmContext(context);

  return `${baseContext}

任务：${guide}
${isFoundation ? '【基础课提示】这是面向零基础学生的基础概念课，请优先用生活例子和类比来讲解，不要引入代码细节。鼓励学生思考"为什么"，而不是"怎么做"。' : ''}
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
  const runtime = context.runtimeResult;
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
评分维度：${JSON.stringify(local?.dimensions || [], null, 2)}
本地发现问题：${local?.problems.join('；') || '无'}
缺失关键词或 API：${context.missingKeywords?.join('、') || '无'}
Python 真运行是否覆盖：${runtime?.supported ? '已覆盖' : '暂未覆盖'}
Python 运行状态：${
        runtime
          ? runtime.status === 'success'
            ? '运行通过'
            : runtime.status === 'error'
              ? '运行失败'
              : '当前题目暂未执行'
          : '未执行'
      }
Python 运行输出：${runtime?.output || '无'}
Python 错误信息：${runtime?.error || '无'}
自动测试项：${runtime?.tests.join('；') || '无'}

诊断要求：
1. 如果 Python 运行失败，优先解释报错原因和修改方向。
2. 不要直接给完整答案，只给提示、排查顺序和关键 API 使用方向。
3. 如果规则检查通过但 Python 失败，要明确指出“关键词出现不等于代码一定能运行”。
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
  const input = context.courseDraftInput;
  const name = input?.name || '新算法';
  const difficulty = input?.difficulty || '入门';
  const category = input?.category || 'classification';
  const keywords = input?.keywords || '无';
  const type = input?.type || 'algorithm';
  const requirements = input?.requirements || '无';
  return [
    { role: 'system', content: JSON_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请生成一份机器学习课程草稿，返回 JSON：
{
  "name": "算法名称",
  "intro": "简介（50字以内）",
  "description": "详细说明（含核心思想、通俗理解、引导思考、常见误区）",
  "steps": ["步骤1", "步骤2"],
  "pros": ["优点1", "优点2"],
  "cons": ["缺点1", "缺点2"],
  "useCases": ["场景1", "场景2"],
  "formula": "核心公式（Markdown格式）",
  "codeExample": "完整Python示例代码（含注释）",
  "quizQuestions": [],
  "practiceExercise": {}
}

课程名称：${name}
难度：${difficulty}
分类：${category}
关键词：${keywords}
课程类型：${type}
额外要求：${requirements}

生成要求：
${type === 'foundation' ? '- 这是基础概念课，要生成 lessons 结构，每节含故事、解释、互动和测验' : '- 这是算法课，要生成核心思想、通俗理解、引导思考、公式步骤、评估调参、常见误区、代码示例'}
- 内容要完整充实，不能只生成简介
- 中文输出，面向本科初学者`,
    },
  ];
}

export function buildExerciseDraftMessages(context: AIRequestContext): AIMessage[] {
  const input = context.exerciseDraftInput;
  const courseName = input?.courseName || '未知';
  const courseId = input?.courseId || '';
  const difficulty = input?.difficulty || '入门';
  const requirements = input?.requirements || '生成一道基础练习题';
  return [
    { role: 'system', content: JSON_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请生成一道机器学习代码练习题，返回 JSON：
{
  "title": "练习标题",
  "description": "练习描述（含目标和背景）",
  "difficulty": "入门",
  "instructions": ["步骤1：导入库", "步骤2：划分数据", "步骤3：训练模型"],
  "starterCode": "# TODO: 补全代码\\nimport numpy as np\\n...",
  "expectedKeywords": ["LinearRegression", "fit", "predict"],
  "hints": ["提示1：注意导入顺序", "提示2：先fit再predict"],
  "teachingNotes": "教学要点说明"
}

课程：${courseName} (${courseId})
难度：${difficulty}
要求：${requirements}

生成要求：
- starterCode 必须包含 TODO 标记，让学生补全关键代码
- expectedKeywords 是需要检查的核心 API（如 fit、predict、score）
- hints 给出3-5条递进提示，先给方向再给具体API
- 中文输出`,
    },
  ];
}

export function buildQuizDraftMessages(context: AIRequestContext): AIMessage[] {
  const input = context.quizDraftInput;
  const courseName = input?.courseName || '未知';
  const courseId = input?.courseId || '';
  const difficulty = input?.difficulty || '入门';
  const lessonId = input?.lessonId || '';
  const conceptId = input?.conceptId || '';
  const requirements = input?.requirements || '生成一道概念理解题';
  return [
    { role: 'system', content: JSON_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请生成一道 4 选 1 机器学习选择题，返回 JSON：
{
  "question": "题目内容",
  "options": ["选项A", "选项B", "选项C", "选项D"],
  "correctIndex": 0,
  "explanation": "详细解析，解释为什么这个答案正确，其他选项错在哪里",
  "difficulty": "入门"
}

课程：${courseName} (${courseId})
难度：${difficulty}
${lessonId ? `关联小节：${lessonId}` : ''}
${conceptId ? `关联概念：${conceptId}` : ''}
要求：${requirements}

生成要求：
- 4个选项必须有区分度，不能太明显
- 正确选项分散在A/B/C/D中，不要总是A或D
- 解析要详细，说明正确思路和常见错误原因
- 中文输出`,
    },
  ];
}
