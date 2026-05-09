import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from '../components/Sidebar';

vi.mock('../hooks/useCourses', () => ({
  useCourses: () => [
    {
      id: 'ml-intro-workflow',
      type: 'foundation',
      name: '机器学习入门',
      category: 'basic',
      difficulty: '入门',
      icon: '🌱',
      intro: '测试',
      description: '',
      videoUrl: '',
      lessons: [
        { id: 'ml-intro-1', title: '第一节', order: 1, subtitle: '', goal: '', story: '', explanation: '', example: '', interactionType: 'programming-vs-ml' as const, keyTakeaway: '', commonMistakes: [], checkpointQuestions: [], aiPrompts: [] },
        { id: 'ml-intro-2', title: '第二节', order: 2, subtitle: '', goal: '', story: '', explanation: '', example: '', interactionType: 'ai-ml-dl-map' as const, keyTakeaway: '', commonMistakes: [], checkpointQuestions: [], aiPrompts: [] },
      ],
    },
    {
      id: 'data-feature-evaluation',
      type: 'foundation',
      name: '数据与特征',
      category: 'basic',
      difficulty: '入门',
      icon: '📊',
      intro: '测试',
      description: '',
      videoUrl: '',
      lessons: [],
    },
    {
      id: 'linear-regression',
      type: 'algorithm',
      name: '线性回归',
      category: 'regression',
      difficulty: '入门',
      icon: '📈',
      intro: '测试',
      description: '',
      videoUrl: '',
    },
    {
      id: 'knn',
      type: 'algorithm',
      name: 'K近邻算法',
      category: 'classification',
      difficulty: '入门',
      icon: '🎯',
      intro: '测试',
      description: '',
      videoUrl: '',
    },
  ],
}));

vi.mock('../services/storageService', () => ({
  storageService: {
    getProgress: () => ({
      practiceRecords: [],
      quizRecords: [],
      completedAlgorithms: [],
      lastActive: Date.now(),
    }),
    getCustomExercises: () => [],
    getCustomQuizQuestions: () => [],
    isCompleted: () => false,
    getBestScore: () => 0,
    getPracticeCount: () => 0,
    getQuizRecords: () => [],
  },
}));

vi.mock('../services/lessonProgressService', () => ({
  lessonProgressService: {
    getProgress: () => ({}),
  },
}));

describe('Sidebar', () => {
  it('renders both foundation (基础入门) and algorithm (核心算法) group headers', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('基础入门')).toBeInTheDocument();
    expect(screen.getByText('核心算法')).toBeInTheDocument();
  });

  it('renders foundation course names', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('机器学习入门')).toBeInTheDocument();
    expect(screen.getByText('数据与特征')).toBeInTheDocument();
  });

  it('renders algorithm course names', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('线性回归')).toBeInTheDocument();
    expect(screen.getByText('K近邻算法')).toBeInTheDocument();
  });

  it('expands course to show lessons when clicked', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Find the button by role and name instead of text content
    // The button contains "机器学习入门" as accessible name
    const courseButton = screen.getByRole('button', { name: /机器学习入门/ });
    fireEvent.click(courseButton);

    // Lessons should appear
    expect(screen.getByText(/1\. 第一节/)).toBeInTheDocument();
    expect(screen.getByText(/2\. 第二节/)).toBeInTheDocument();
  });
});
