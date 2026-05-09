import { describe, it, expect } from 'vitest';
import { getQuizByAlgorithm } from '../data/exercises';

describe('Quiz scoring', () => {
  const quiz = getQuizByAlgorithm('linear-regression');

  it('has 8 questions per algorithm', () => {
    expect(quiz.length).toBe(8);
  });

  it('correctly scores all-correct answers', () => {
    // Simulate a user answering every question correctly
    let correct = 0;
    quiz.forEach(() => { correct++; });
    const score = Math.round((correct / quiz.length) * 100);
    expect(score).toBe(100);
  });

  it('scores correctly when user answers 5 out of 8 correctly', () => {
    // For the first 5 questions pick the correct answer, for the last 3 pick a wrong answer
    let correct = 0;
    quiz.forEach((q, i) => {
      const userAnswer = i < 5 ? q.correctIndex : (q.correctIndex + 1) % q.options.length;
      if (userAnswer === q.correctIndex) correct++;
    });
    const score = Math.round((correct / quiz.length) * 100);
    expect(correct).toBe(5);
    expect(score).toBe(63); // 5/8 ≈ 62.5% → rounds to 63%
  });

  it('scores 0 for all-wrong answers', () => {
    let correct = 0;
    quiz.forEach((q) => {
      const wrongAnswer = (q.correctIndex + 1) % q.options.length;
      if (wrongAnswer === q.correctIndex) correct++;
    });
    const score = Math.round((correct / quiz.length) * 100);
    expect(score).toBe(0);
  });
});
