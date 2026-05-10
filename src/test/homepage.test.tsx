import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '../pages/HomePage';

vi.mock('../hooks/useCourses', () => ({
  useCourses: () => [
    {
      id: 'linear-regression',
      name: '线性回归',
      category: 'regression',
      difficulty: '入门',
      icon: '📈',
      intro: '测试简介',
    },
  ],
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
    isAdmin: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

describe('HomePage', () => {
  it('renders the platform name', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getByText('基于 AI 赋能的机器学习算法教学平台')).toBeInTheDocument();
  });

  it('renders the AI workflow banner', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getByText('AI 学习助手工作流')).toBeInTheDocument();
  });
});
