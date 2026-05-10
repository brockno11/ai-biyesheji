import type {
  AICodeReviewResult,
  AICourseDraftResult,
  AIExerciseDraftResult,
  AIQuizDraftResult,
  AIQuizReviewResult,
  AIRequestContext,
  AIStudyPlanResult,
} from './aiTypes';

function algorithmName(context: AIRequestContext) {
  return context.algorithm?.name || '当前算法';
}

export const aiMockService = {
  askTutor(context: AIRequestContext): string {
    const name = algorithmName(context);
    const question = context.userQuestion || '';
    if (question.includes('例子')) return this.lifeExample(context);
    if (question.includes('总结')) return this.summarizeLesson(context);
    if (question.includes('代码')) return this.diagnoseCodeText(context);
    return `我们先抓住 ${name} 的核心：它不是要“背公式”，而是理解模型怎样从数据里做判断。\n\n你可以按三步看：\n1. 它输入什么特征；\n2. 它如何学习或比较样本；\n3. 它用什么标准输出结果。\n\n如果你现在卡在某个公式或代码 API，可以把具体点发我，我会先给提示，再帮你一步步拆开。`;
  },

  explainConcept(context: AIRequestContext): string {
    return `${algorithmName(context)} 可以先用一句话理解：${context.algorithm?.intro || '它是一种机器学习算法。'}\n\n建议你先看“输入、计算、输出”三件事，再回到公式。这样不会被符号吓住，也更容易写出代码。`;
  },

  diagnoseCodeText(context: AIRequestContext): string {
    const missing = context.missingKeywords?.join('、') || '关键 API';
    return `我先不给完整答案，我们看修改方向：当前代码最需要检查的是 ${missing} 是否真正用于训练、预测和评估流程。\n\n建议按顺序补齐：导入模型 → 划分数据 → 创建模型 → fit 训练 → predict 预测 → 指标评估。每补一步就运行一次思路检查。`;
  },

  suggestStudy(context: AIRequestContext): string {
    return `学习 ${algorithmName(context)} 的下一步建议：先复述核心思想，再完成一题代码练习，最后用测验题检查概念漏洞。\n\n如果练习得分低于 80，优先复习 API 调用流程；如果测验得分低，优先回看公式含义和适用场景。`;
  },

  explainVisualization(context: AIRequestContext): string {
    const vs = context.visualState || {};
    const params = Object.entries(vs)
      .map(([k, v]) => `  - ${k}: ${v}`)
      .join('\n');
    return `当前 ${algorithmName(context)} 可视化参数：\n${params}\n\n从这些参数来看，你可以观察：当关键超参数变化时，模型的结果和误差曲线会相应改变。建议先改变一个参数小幅调整，观察图表变化趋势，再对比多个参数共同影响。`;
  },

  generateQuiz(context: AIRequestContext): string {
    return `来一道思考题：${algorithmName(context)} 在什么情况下容易表现不好？\n\n提示：从“数据特点、参数选择、模型假设”三个角度想。答完后再对照课程里的优缺点，你会更容易记住。`;
  },

  summarizeLesson(context: AIRequestContext): string {
    return `本节 ${algorithmName(context)} 可以总结成三点：\n1. 核心思想：${context.algorithm?.intro || '理解算法如何做预测'}\n2. 关键步骤：${(context.algorithm?.steps || []).slice(0, 3).join('；') || '先理解流程'}\n3. 易错点：不要只记 API，要知道每一步为什么存在。\n\n学完后建议马上做一题练习巩固。`;
  },

  lifeExample(context: AIRequestContext): string {
    const id = context.algorithm?.id;
    if (id === 'knn') return 'KNN 像找朋友投票：你不确定一个新同学属于哪个社团，就看他最像的 K 个同学大多在哪个社团，然后跟着多数票判断。K 太小容易被个别人影响，K 太大又可能太“随大流”。';
    if (id === 'decision-tree') return '决策树像问诊流程：先问“有没有发烧”，再问“是否咳嗽”，每个回答都会把你带到下一步，最后得到可能诊断。关键是每个问题都要尽量减少不确定性。';
    return '线性回归像给一堆散点拉一条最合适的趋势线。比如根据学习时长预测成绩，它会找出“每多学一小时，成绩大概变化多少”的关系。';
  },

  codeReview(context: AIRequestContext): AICodeReviewResult {
    const local = context.localReview;
    const missing = context.missingKeywords || [];
    const runtime = context.runtimeResult;
    const runtimeProblem = runtime?.error
      ? `Python 真运行失败：${runtime.error.split('\n').slice(-3).join('\n')}`
      : undefined;
    const passedRuntime = runtime?.status === 'success';
    return {
      summary: passedRuntime
        ? '本地规则检查和 Python 真运行都已经通过，核心训练流程已经能实际跑起来。'
        : local?.passed
          ? '关键词层面已经接近正确，但真实运行还暴露出变量、语法或评估流程问题。'
          : '代码已经有了雏形，但训练、预测或评估链路还没有完全闭合。',
      scoreReason: `本地规则评分为 ${local?.score ?? 0} 分；Python 运行状态为 ${
        runtime?.status === 'success' ? '通过' : runtime?.status === 'error' ? '失败' : '暂未覆盖'
      }。关键词出现只能说明流程可能完整，真运行结果更能证明代码是否可用。`,
      problems: runtimeProblem
        ? [runtimeProblem, ...(local?.problems || [])]
        : local?.problems.length
          ? local.problems
          : missing.length
            ? missing.map((kw) => `还需要补充或正确使用 ${kw}`)
            : ['暂未发现明显规则问题，可以继续检查变量是否前后一致。'],
      suggestions: runtimeProblem
        ? ['先根据 Python 报错定位对应行，检查变量名、取消注释的 TODO 代码和 sklearn API 调用是否一致。', '不要急着改整段代码，优先让数据划分、fit、predict、指标计算这条链路逐步跑通。']
        : local?.suggestions.length
          ? local.suggestions
          : ['按“划分数据 → 创建模型 → fit → predict → 评估”的顺序逐行检查。'],
      nextStep: passedRuntime
        ? '可以尝试修改测试集比例或噪声大小，观察 MSE、R2 等指标如何变化。'
        : runtimeProblem
          ? '先修复 Python 报错，再重新点击“检查并运行”，确认真实执行通过。'
          : local?.passed
            ? '尝试修改参数或换一组数据，观察模型指标如何变化。'
            : '先补齐缺失 API，再确认每个变量名和训练/测试集对应正确。',
      encouragement: '你已经走到实践环节了，哪怕现在分数不高，也是在把抽象概念变成真正能力。',
    };
  },

  quizReview(context: AIRequestContext): AIQuizReviewResult {
    const questions = context.quizQuestions || [];
    const wrong = questions.filter((q, index) => context.quizAnswers?.[index] !== q.correctIndex);
    return {
      weakPoints: wrong.length > 0 ? ['核心概念辨析', '参数作用理解'] : ['整体掌握较好，可继续进阶'],
      wrongQuestionAnalysis: wrong.map((q, index) => ({
        question: q.question,
        whyWrong: `这题容易错在只记住关键词，没有把它和 ${algorithmName(context)} 的实际流程联系起来。`,
        correctThinking: q.explanation || `先判断题目问的是概念、公式还是 API，再回到算法步骤定位。`,
      })).slice(0, 5),
      reviewAdvice: wrong.length > 0
        ? '建议先复习错题对应的公式和适用场景，再做一遍同类题。'
        : '这次表现很好，可以进入代码练习或下一个算法。',
      extraQuestion: {
        question: `${algorithmName(context)} 的一个关键超参数或核心步骤会如何影响模型表现？`,
        options: ['完全没有影响', '只影响页面展示', '会影响训练或预测效果', '只影响文件大小'],
        answer: 2,
        explanation: '算法的参数和步骤通常直接影响拟合、泛化或预测结果，不只是展示层面的变化。',
      },
    };
  },

  studyPlan(context: AIRequestContext): AIStudyPlanResult {
    const next = context.unfinishedCourses?.[0] || context.courseStats?.find((s) => !s.completed)?.algorithmName || '复习已学算法';
    return {
      summary: context.completedAlgorithms?.length
        ? `你已经完成了 ${context.completedAlgorithms.length} 门算法，适合开始查漏补缺。`
        : '你还处在起步阶段，建议先稳定完成第一门算法的学习闭环。',
      nextAlgorithm: next,
      reason: '推荐优先处理未完成课程，同时回看低分练习，能最快形成完整学习闭环。',
      reviewList: ['复习核心公式含义', '检查代码 API 调用顺序', '回看测验错题解析'],
      dailyPlan: ['阅读一节课程并总结三句话', '完成一题代码练习', '做一次测验并记录错题'],
    };
  },

  courseDraft(context: AIRequestContext): AICourseDraftResult {
    const input = context.courseDraftInput;
    const name = input?.name || '新算法课程';
    return {
      name,
      intro: `${name} 是机器学习中的重要算法，适合通过概念、可视化和代码练习逐步掌握。`,
      description: `${name} 课程草稿会围绕核心思想、训练流程、适用场景和常见误区展开，便于本科初学者理解。`,
      steps: ['明确输入特征和目标', '理解模型如何学习规律', '训练模型并调整参数', '评估效果并分析误差'],
      pros: ['结构清晰，便于教学演示', '适合与已有课程形成对比'],
      cons: ['需要结合真实数据进一步讲解', '部分参数含义需要配合可视化理解'],
      useCases: ['课堂演示', '课程设计扩展', '毕业设计功能加分'],
      formula: '请在这里补充核心公式或伪代码。',
      codeExample: '# Python 示例代码\n# TODO: 根据具体算法补充 sklearn 或手写实现',
      quizQuestions: [],
      practiceExercise: {},
    };
  },

  exerciseDraft(context: AIRequestContext): AIExerciseDraftResult {
    const input = context.exerciseDraftInput;
    const courseName = input?.courseName || '当前算法';
    const courseId = input?.courseId || 'linear-regression';
    const isClassification = ['knn', 'logistic-regression', 'decision-tree', 'random-forest'].includes(courseId);
    const modelName = courseId === 'linear-regression' ? 'LinearRegression' :
      courseId === 'knn' ? 'KNeighborsClassifier' :
      courseId === 'logistic-regression' ? 'LogisticRegression' :
      courseId === 'decision-tree' ? 'DecisionTreeClassifier' :
      courseId === 'k-means' ? 'KMeans' :
      'RandomForestClassifier';
    return {
      title: `${courseName} 基础练习`,
      description: `使用 sklearn 的 ${modelName} 完成${isClassification ? '分类' : '回归/聚类'}模型的训练、预测和评估。`,
      difficulty: (input?.difficulty as '入门' | '中级' | '进阶') || '入门',
      instructions: [
        `导入 ${modelName} 和相关模块`,
        '使用 train_test_split 划分数据集',
        '创建模型实例并训练',
        '进行预测并评估模型性能',
      ],
      starterCode: `# ${courseName} 练习\nimport numpy as np\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import ${isClassification ? 'accuracy_score' : 'mean_squared_error, r2_score'}\n# TODO: 导入 ${modelName}\n\n# TODO: 划分训练集和测试集\n# X_train, X_test, y_train, y_test = ...\n\n# TODO: 创建并训练模型\n# model = ...\n\n# TODO: 预测并评估\n# y_pred = ...\n`,
      expectedKeywords: ['train_test_split', 'fit', 'predict', modelName],
      hints: [
        `先导入 ${modelName}`,
        '用 train_test_split 划分数据，test_size=0.2',
        '创建模型实例后调用 .fit() 训练',
        '用 .predict() 获取预测结果',
        `用 ${isClassification ? 'accuracy_score' : 'mean_squared_error'} 评估`,
      ],
      teachingNotes: `这道题训练学生掌握 ${modelName} 的基本训练流程：导入→划分→创建→训练→预测→评估。重点检查 fit/predict 的使用顺序和评估指标的选择。`,
    };
  },

  quizDraft(context: AIRequestContext): AIQuizDraftResult {
    const input = context.quizDraftInput;
    const courseName = input?.courseName || '当前课程';
    const courseId = input?.courseId || 'linear-regression';
    const questionBank: Record<string, AIQuizDraftResult> = {
      'linear-regression': {
        question: '在线性回归中，MSE（均方误差）的值越小说明什么？',
        options: ['模型预测值与真实值差距越大', '模型预测值与真实值差距越小', '模型训练速度越快', '数据量越大'],
        correctIndex: 1,
        explanation: 'MSE 衡量预测值与真实值之间的平均平方误差，值越小说明预测越接近真实值。但需注意，过小的 MSE 可能意味着过拟合。',
        difficulty: '入门',
      },
      'knn': {
        question: 'KNN 算法中 K 值过小会导致什么问题？',
        options: ['模型过于简单，欠拟合', '模型对噪声点过于敏感，容易过拟合', '训练速度变慢', '预测结果不再变化'],
        correctIndex: 1,
        explanation: 'K 值越小，模型越容易受到少数噪声点的影响，导致过拟合；K 值越大，决策边界越平滑，但可能欠拟合。',
        difficulty: '入门',
      },
      'decision-tree': {
        question: '决策树中限制最大深度（max_depth）的主要目的是什么？',
        options: ['加快训练速度', '减少内存占用', '防止过拟合', '增加模型复杂度'],
        correctIndex: 2,
        explanation: '限制 max_depth 可以防止树长得太深而记住训练数据的噪声（过拟合），是决策树最重要的正则化参数。',
        difficulty: '入门',
      },
    };
    return questionBank[courseId] || {
      question: `在 ${courseName} 中，以下关于模型评估的说法哪个是正确的？`,
      options: [
        '训练集准确率越高，模型一定越好',
        '测试集表现才是衡量泛化能力的关键',
        '不需要划分训练集和测试集',
        '模型参数越多越好',
      ],
      correctIndex: 1,
      explanation: '测试集上的表现反映了模型的泛化能力。训练集准确率高可能只是"背下了"训练数据（过拟合），真正重要的是在未见过的数据上的表现。',
      difficulty: '入门',
    };
  },
};
