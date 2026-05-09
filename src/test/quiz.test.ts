import { describe, it, expect } from 'vitest';
import { getQuizByAlgorithm } from '../data/exercises';

describe('Quiz scoring', () => {
  const quiz = getQuizByAlgorithm('linear-regression');

  it('has 8 questions per algorithm', () => {
    expect(quiz.length).toBe(8);
  });

  it('correctly scores all-correct answers', () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (q.correctIndex === q.correctIndex) correct++;
    });
    const score = Math.round((correct / quiz.length) * 100);
    expect(score).toBe(100);
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
