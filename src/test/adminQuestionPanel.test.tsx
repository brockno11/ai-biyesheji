import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminQuestionPanel from '../components/AdminQuestionPanel';

// ── Mock data (must use vi.hoisted for vi.mock factory access) ──
const {
  mockCourses,
  mockStorageExercises,
  mockStorageQuizzes,
} = vi.hoisted(() => ({
  mockCourses: [
    { id: 'ml-intro-workflow', type: 'foundation' as const, name: '机器学习入门', category: 'basic' as const, difficulty: '入门' as const, icon: '🌱', intro: '', description: '', videoUrl: '' },
    { id: 'linear-regression', type: 'algorithm' as const, name: '线性回归', category: 'regression' as const, difficulty: '入门' as const, icon: '📈', intro: '', description: '', videoUrl: '' },
    { id: 'knn', type: 'algorithm' as const, name: 'K近邻', category: 'classification' as const, difficulty: '入门' as const, icon: '🎯', intro: '', description: '', videoUrl: '' },
    { id: 'decision-tree', type: 'algorithm' as const, name: '决策树', category: 'tree' as const, difficulty: '中级' as const, icon: '🌳', intro: '', description: '', videoUrl: '' },
  ],
  mockStorageExercises: [] as unknown[],
  mockStorageQuizzes: [] as unknown[],
}));

// ── Mock modules ──
vi.mock('../hooks/useCourses', () => ({
  useCourses: () => mockCourses,
}));

vi.mock('../data/exercises', () => ({
  exercises: [
    {
      id: 'lr-ex-1', algorithmId: 'linear-regression', title: '线性回归训练流程', difficulty: '入门' as const,
      description: '使用 sklearn 完成线性回归', instructions: ['导入库', '训练模型'],
      starterCode: '# TODO', expectedKeywords: ['LinearRegression', 'fit'], checkRules: [
        { type: 'keyword' as const, keyword: 'LinearRegression', description: '导入', points: 50 },
        { type: 'keyword' as const, keyword: 'fit', description: '训练', points: 50 },
      ],
    },
  ],
  quizQuestions: {
    'linear-regression': [
      { id: 'lr-qz-1', algorithmId: 'linear-regression', question: 'MSE越小说明什么？', options: ['差距大', '差距小', '速度快', '数据多'], correctIndex: 1, explanation: 'MSE衡量误差' },
      { id: 'lr-qz-2', algorithmId: 'linear-regression', question: 'R²的取值范围？', options: ['0~1', '-1~1', '-∞~1', '任意值'], correctIndex: 2, explanation: 'R²≤1' },
    ],
  },
}));

vi.mock('../services/storageService', () => ({
  storageService: {
    getCustomExercises: () => [...mockStorageExercises],
    getCustomQuizQuestions: () => [...mockStorageQuizzes],
    saveCustomExercise: vi.fn((ex: unknown) => {
      const idx = mockStorageExercises.findIndex((e: any) => e.id === (ex as any).id);
      if (idx >= 0) mockStorageExercises[idx] = ex;
      else mockStorageExercises.push(ex);
    }),
    saveCustomQuizQuestion: vi.fn((q: unknown) => {
      const idx = mockStorageQuizzes.findIndex((item: any) => item.id === (q as any).id);
      if (idx >= 0) mockStorageQuizzes[idx] = q;
      else mockStorageQuizzes.push(q);
    }),
    deleteCustomExercise: vi.fn((id: string) => {
      const idx = mockStorageExercises.findIndex((e: any) => e.id === id);
      if (idx >= 0) mockStorageExercises.splice(idx, 1);
    }),
    deleteCustomQuizQuestion: vi.fn((id: string) => {
      const idx = mockStorageQuizzes.findIndex((q: any) => q.id === id);
      if (idx >= 0) mockStorageQuizzes.splice(idx, 1);
    }),
  },
}));

vi.mock('../services/aiService', () => ({
  aiService: {
    generateExerciseDraft: vi.fn().mockResolvedValue({
      mode: 'mock' as const,
      data: {
        title: 'AI生成的KNN练习',
        description: '这是一道AI生成的KNN练习题',
        difficulty: '入门' as const,
        instructions: ['导入KNeighborsClassifier', '训练模型'],
        starterCode: '# AI生成\nfrom sklearn.neighbors import KNeighborsClassifier\n# TODO',
        expectedKeywords: ['KNeighborsClassifier', 'fit', 'predict'],
        hints: ['提示1', '提示2'],
        teachingNotes: '教学笔记',
      },
    }),
    generateQuizDraft: vi.fn().mockResolvedValue({
      mode: 'mock' as const,
      data: {
        question: 'AI生成的KNN选择题',
        options: ['选项A', '选项B', '选项C', '选项D'],
        correctIndex: 1,
        explanation: '详细解析',
        difficulty: '入门' as const,
      },
    }),
  },
}));

// ── Tests ──
describe('AdminQuestionPanel', () => {
  beforeEach(() => {
    mockStorageExercises.length = 0;
    mockStorageQuizzes.length = 0;
  });

  // ═══ 1. Basic rendering ═══
  describe('渲染', () => {
    it('渲染统计卡片、模式切换和筛选栏', () => {
      render(<AdminQuestionPanel />);

      expect(screen.getByText('题库与练习管理')).toBeInTheDocument();
      expect(screen.getByText('练习题')).toBeInTheDocument();
      expect(screen.getByText('测验题')).toBeInTheDocument();
      // Stats cards (texts appear both in stats and filter dropdown)
      expect(screen.getByText('练习题总数')).toBeInTheDocument();
      expect(screen.getAllByText('已启用').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('已停用').length).toBeGreaterThanOrEqual(2);
      // Filter bar
      expect(screen.getByText('全部课程')).toBeInTheDocument();
      expect(screen.getByText('全部来源')).toBeInTheDocument();
      expect(screen.getByText('全部状态')).toBeInTheDocument();
    });

    it('默认显示练习列表（含静态练习）', () => {
      render(<AdminQuestionPanel />);

      expect(screen.getByText('线性回归训练流程')).toBeInTheDocument();
      expect(screen.getByText('新增练习')).toBeInTheDocument();
    });

    it('切换到测验题Tab后显示测验列表', async () => {
      render(<AdminQuestionPanel />);

      const quizBtn = screen.getByText('测验题');
      await userEvent.click(quizBtn);

      await waitFor(() => {
        expect(screen.getByText('MSE越小说明什么？')).toBeInTheDocument();
        expect(screen.getByText('新增测验')).toBeInTheDocument();
      });
    });
  });

  // ═══ 2. New exercise button opens form ═══
  describe('新增练习题', () => {
    it('点击"新增练习"按钮打开表单弹窗', async () => {
      render(<AdminQuestionPanel />);

      const addBtn = screen.getByText('新增练习');
      await userEvent.click(addBtn);

      await waitFor(() => {
        expect(screen.getByText('保存练习')).toBeInTheDocument();
        expect(screen.getByText('取消')).toBeInTheDocument();
      });
    });

    it('点击弹窗背景或取消按钮关闭表单', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByText('新增练习'));
      await waitFor(() => expect(screen.getByText('保存练习')).toBeInTheDocument());

      await userEvent.click(screen.getByText('取消'));
      await waitFor(() => expect(screen.queryByText('保存练习')).not.toBeInTheDocument());
    });

    it('填写表单后保存成功显示toast', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByText('新增练习'));

      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText('例：逻辑回归分类器基础实现');
        expect(titleInput).toBeInTheDocument();
      });

      // Fill form
      const titleInput = screen.getByPlaceholderText('例：逻辑回归分类器基础实现');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, '测试练习题');

      const descInput = screen.getByPlaceholderText('描述练习目标和背景...');
      await userEvent.clear(descInput);
      await userEvent.type(descInput, '这是一个测试练习的描述');

      const codeInput = screen.getByPlaceholderText('# Starter Code');
      await userEvent.clear(codeInput);
      await userEvent.type(codeInput, '# 测试代码\nimport numpy as np');

      // Add keyword
      const keywordInput = screen.getByPlaceholderText(/例：LogisticRegression, fit, predict/);
      await userEvent.clear(keywordInput);
      await userEvent.type(keywordInput, 'fit, predict');

      // Save
      const saveBtn = screen.getByText('保存练习');
      await userEvent.click(saveBtn);

      // Wait for toast
      await waitFor(() => {
        expect(screen.getByText('练习已保存')).toBeInTheDocument();
      });
    });

    it('标题为空时保存失败并显示错误', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByText('新增练习'));

      await waitFor(() => expect(screen.getByText('保存练习')).toBeInTheDocument());

      const saveBtn = screen.getByText('保存练习');
      await userEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText('请填写练习标题')).toBeInTheDocument();
      });
    });
  });

  // ═══ 3. New quiz button opens form ═══
  describe('新增测验题', () => {
    it('点击"新增测验"按钮打开表单弹窗', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByText('测验题'));

      await waitFor(() => {
        expect(screen.getByText('新增测验')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('新增测验'));

      await waitFor(() => {
        expect(screen.getByText('保存测验题')).toBeInTheDocument();
        // 4 option inputs
        const inputs = screen.getAllByPlaceholderText(/选项 \d/);
        expect(inputs).toHaveLength(4);
      });
    });

    it('填写测验题并保存成功', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByText('测验题'));
      await waitFor(() => expect(screen.getByText('新增测验')).toBeInTheDocument());
      await userEvent.click(screen.getByText('新增测验'));

      await waitFor(() => expect(screen.getByText('保存测验题')).toBeInTheDocument());

      // Fill question
      const questionInput = screen.getByPlaceholderText('输入题目...');
      await userEvent.clear(questionInput);
      await userEvent.type(questionInput, '测试题目');

      // Fill options
      const optionInputs = screen.getAllByPlaceholderText(/选项 \d/);
      await userEvent.clear(optionInputs[0]);
      await userEvent.type(optionInputs[0], '选项1');
      await userEvent.clear(optionInputs[1]);
      await userEvent.type(optionInputs[1], '选项2（正确）');
      await userEvent.clear(optionInputs[2]);
      await userEvent.type(optionInputs[2], '选项3');
      await userEvent.clear(optionInputs[3]);
      await userEvent.type(optionInputs[3], '选项4');

      // Fill explanation
      const explanationInput = screen.getByPlaceholderText('解释为什么这个答案是正确的...');
      await userEvent.clear(explanationInput);
      await userEvent.type(explanationInput, '这是解析');

      await userEvent.click(screen.getByText('保存测验题'));

      await waitFor(() => {
        expect(screen.getByText('测验题已保存')).toBeInTheDocument();
      });
    });
  });

  // ═══ 4. Enable/disable toggle ═══
  describe('启用/停用切换', () => {
    it('练习列表显示启用切换按钮', () => {
      render(<AdminQuestionPanel />);

      const toggleBtns = screen.getAllByText('启用');
      expect(toggleBtns.length).toBeGreaterThan(0);
    });

    it('测验列表显示启用切换按钮', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByText('测验题'));

      await waitFor(() => {
        const toggleBtns = screen.getAllByText('启用');
        expect(toggleBtns.length).toBeGreaterThan(0);
      });
    });

    it('点击启用按钮切换为停用并显示toast', async () => {
      render(<AdminQuestionPanel />);

      const toggleBtns = screen.getAllByText('启用');
      await userEvent.click(toggleBtns[0]);

      // Toast appears with "已停用" message
      await waitFor(() => {
        const allEls = screen.getAllByText('已停用');
        expect(allEls.length).toBeGreaterThanOrEqual(3); // stats + filter + toast
      }, { timeout: 3000 });
    });
  });

  // ═══ 5. AI generate exercise Mock ═══
  describe('AI 生成练习题', () => {
    it('点击"AI 生成练习"打开AI生成弹窗', async () => {
      render(<AdminQuestionPanel />);

      const aiBtn = screen.getByText('AI 生成练习');
      await userEvent.click(aiBtn);

      await waitFor(() => {
        expect(screen.getByText('AI 生成练习题')).toBeInTheDocument();
        expect(screen.getByText('生成草稿')).toBeInTheDocument();
      });
    });

    it('AI生成弹窗包含课程选择、难度和生成要求', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByText('AI 生成练习'));

      await waitFor(() => {
        expect(screen.getByText('选择课程 *')).toBeInTheDocument();
        // 线性回归 appears in both filter dropdown and AI modal - check modal content
        const modalHeading = screen.getByText('AI 生成练习题');
        expect(modalHeading).toBeInTheDocument();
      });
    });

    it('选择课程后点击生成，Mock返回草稿并打开编辑表单', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByText('AI 生成练习'));

      await waitFor(() => expect(screen.getByText('AI 生成练习题')).toBeInTheDocument());

      const genBtn = screen.getByText('生成草稿');
      await userEvent.click(genBtn);

      // Should open the exercise form with AI draft
      await waitFor(() => {
        expect(screen.getByText('AI生成的KNN练习')).toBeInTheDocument();
      });
    });
  });

  // ═══ 6. AI generate quiz Mock ═══
  describe('AI 生成测验题', () => {
    it('切换到测验Tab后点击"AI 生成测验"打开弹窗', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByText('测验题'));
      await waitFor(() => expect(screen.getByText('AI 生成测验')).toBeInTheDocument());

      await userEvent.click(screen.getByText('AI 生成测验'));

      await waitFor(() => {
        expect(screen.getByText('AI 生成测验题')).toBeInTheDocument();
      });
    });

    it('Mock生成测验题后打开编辑表单', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByText('测验题'));
      await waitFor(() => expect(screen.getByText('AI 生成测验')).toBeInTheDocument());

      await userEvent.click(screen.getByText('AI 生成测验'));

      await waitFor(() => expect(screen.getByText('AI 生成测验题')).toBeInTheDocument());

      await userEvent.click(screen.getByText('生成草稿'));

      await waitFor(() => {
        // AI-generated question text appears both in h3 title and textarea value
        const matches = screen.getAllByText('AI生成的KNN选择题');
        expect(matches.length).toBeGreaterThanOrEqual(2);
      }, { timeout: 3000 });
    });
  });

  // ═══ 7. More actions dropdown ═══
  describe('更多操作下拉菜单', () => {
    it('默认不显示下拉菜单', () => {
      render(<AdminQuestionPanel />);

      expect(screen.queryByText(/导出.*题库/)).not.toBeInTheDocument();
      expect(screen.queryByText('恢复默认题库')).not.toBeInTheDocument();
    });

    it('点击"更多操作"展开下拉菜单', async () => {
      render(<AdminQuestionPanel />);

      const moreBtn = screen.getByRole('button', { name: /更多操作/ });
      await userEvent.click(moreBtn);

      await waitFor(() => {
        expect(screen.getByText(/导出.*题库/)).toBeInTheDocument();
        expect(screen.getByText(/导入.*题库/)).toBeInTheDocument();
        expect(screen.getByText('恢复默认题库')).toBeInTheDocument();
      });
    });

    it('恢复默认题库为红色文字', async () => {
      render(<AdminQuestionPanel />);

      const moreBtn = screen.getByRole('button', { name: /更多操作/ });
      await userEvent.click(moreBtn);

      await waitFor(() => {
        const restoreBtn = screen.getByText('恢复默认题库');
        expect(restoreBtn.closest('button')?.className).toContain('red');
      });
    });
  });

  // ═══ 8. Restore defaults requires confirmation ═══
  describe('恢复默认题库二次确认', () => {
    it('点击恢复默认题库弹出确认弹窗', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByRole('button', { name: /更多操作/ }));
      await waitFor(() => expect(screen.getByText('恢复默认题库')).toBeInTheDocument());

      await userEvent.click(screen.getByText('恢复默认题库'));

      await waitFor(() => {
        expect(screen.getByText('此操作不可恢复')).toBeInTheDocument();
        expect(screen.getByText('确认恢复')).toBeInTheDocument();
      });
    });

    it('点击取消关闭确认弹窗', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByRole('button', { name: /更多操作/ }));
      await waitFor(() => expect(screen.getByText('恢复默认题库')).toBeInTheDocument());
      await userEvent.click(screen.getByText('恢复默认题库'));

      await waitFor(() => expect(screen.getByText('确认恢复')).toBeInTheDocument());

      await userEvent.click(screen.getByText('取消'));

      await waitFor(() => {
        expect(screen.queryByText('确认恢复')).not.toBeInTheDocument();
      });
    });

    it('点击确认恢复执行恢复操作', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByRole('button', { name: /更多操作/ }));
      await waitFor(() => expect(screen.getByText('恢复默认题库')).toBeInTheDocument());
      await userEvent.click(screen.getByText('恢复默认题库'));

      await waitFor(() => expect(screen.getByText('确认恢复')).toBeInTheDocument());

      await userEvent.click(screen.getByText('确认恢复'));

      await waitFor(() => {
        expect(screen.getByText(/已恢复默认题库/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // ═══ 9. Filtering ═══
  describe('筛选功能', () => {
    it('按课程筛选后列表更新', async () => {
      render(<AdminQuestionPanel />);

      const courseSelect = screen.getByDisplayValue('全部课程');
      await userEvent.selectOptions(courseSelect, 'knn');

      await waitFor(() => {
        // No exercises for KNN in static data
        expect(screen.getByText('没有匹配的练习题')).toBeInTheDocument();
      });
    });

    it('按来源筛选', async () => {
      render(<AdminQuestionPanel />);

      const sourceSelect = screen.getByDisplayValue('全部来源');
      await userEvent.selectOptions(sourceSelect, 'ai');

      await waitFor(() => {
        expect(screen.getByText('没有匹配的练习题')).toBeInTheDocument();
      });
    });

    it('按状态筛选已启用', async () => {
      render(<AdminQuestionPanel />);

      const statusSelect = screen.getByDisplayValue('全部状态');
      await userEvent.selectOptions(statusSelect, 'enabled');

      await waitFor(() => {
        // Static exercise should still be visible (enabled by default)
        expect(screen.getByText('线性回归训练流程')).toBeInTheDocument();
      });
    });

    it('清除筛选按钮出现和点击', async () => {
      render(<AdminQuestionPanel />);

      const courseSelect = screen.getByDisplayValue('全部课程');
      await userEvent.selectOptions(courseSelect, 'knn');

      await waitFor(() => {
        expect(screen.getByText('清除筛选')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('清除筛选'));

      await waitFor(() => {
        expect(screen.getByText('线性回归训练流程')).toBeInTheDocument();
      });
    });

    it('搜索框按关键词过滤', async () => {
      render(<AdminQuestionPanel />);

      const searchInput = screen.getByPlaceholderText('搜索关键词...');
      await userEvent.type(searchInput, '不存在的练习');

      await waitFor(() => {
        expect(screen.getByText('没有匹配的练习题')).toBeInTheDocument();
      });
    });
  });

  // ═══ 10. Preview modal ═══
  describe('题目预览', () => {
    it('测验题可预览并关闭', async () => {
      render(<AdminQuestionPanel />);

      await userEvent.click(screen.getByText('测验题'));

      await waitFor(() => expect(screen.getByText('MSE越小说明什么？')).toBeInTheDocument());

      // Find preview button (eye icon button)
      const previewBtns = screen.getAllByTitle('预览题目');
      expect(previewBtns.length).toBeGreaterThan(0);

      await userEvent.click(previewBtns[0]);

      await waitFor(() => {
        expect(screen.getByText('题目预览（学生视角）')).toBeInTheDocument();
        expect(screen.getByText('关闭预览')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('关闭预览'));

      await waitFor(() => {
        expect(screen.queryByText('题目预览（学生视角）')).not.toBeInTheDocument();
      });
    });
  });

  // ═══ 11. Exercise list operations ═══
  describe('练习列表操作', () => {
    it('覆盖编辑内置练习打开编辑表单', async () => {
      render(<AdminQuestionPanel />);

      const editBtn = screen.getByText('覆盖编辑');
      expect(editBtn).toBeInTheDocument();

      await userEvent.click(editBtn);

      await waitFor(() => {
        // Form should have the existing title pre-filled
        const titleInput = screen.getByDisplayValue('线性回归训练流程');
        expect(titleInput).toBeInTheDocument();
      });
    });
  });

  // ═══ 12. Mode switching preserves filter state ═══
  describe('模式切换', () => {
    it('练习Tab和测验Tab互相切换', async () => {
      render(<AdminQuestionPanel />);

      // Start in exercise mode
      expect(screen.getByText('新增练习')).toBeInTheDocument();
      expect(screen.queryByText('新增测验')).not.toBeInTheDocument();

      // Switch to quiz
      await userEvent.click(screen.getByText('测验题'));

      await waitFor(() => {
        expect(screen.getByText('新增测验')).toBeInTheDocument();
        expect(screen.queryByText('新增练习')).not.toBeInTheDocument();
      });

      // Switch back
      await userEvent.click(screen.getByText('练习题'));

      await waitFor(() => {
        expect(screen.getByText('新增练习')).toBeInTheDocument();
        expect(screen.getByText('线性回归训练流程')).toBeInTheDocument();
      });
    });
  });
});
