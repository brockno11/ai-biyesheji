import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { Algorithm } from '../types';

const difficultyColors: Record<string, string> = {
  '入门': 'bg-green-100 text-green-700',
  '中级': 'bg-yellow-100 text-yellow-700',
  '进阶': 'bg-red-100 text-red-700',
};

const categoryLabels: Record<string, string> = {
  regression: '回归',
  classification: '分类',
  tree: '树形',
  clustering: '聚类',
  ensemble: '集成学习',
};

interface Props {
  algorithm: Algorithm;
  progress?: { completed: boolean; bestScore: number; practiceCount: number };
}

export default function AlgorithmCard({ algorithm, progress }: Props) {
  return (
    <Link
      to={`/algorithms/${algorithm.id}`}
      className="block bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-2xl shadow-sm">
          {algorithm.icon}
        </div>
        <div className="flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[algorithm.difficulty]}`}>
            {algorithm.difficulty}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
            {categoryLabels[algorithm.category]}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {algorithm.name}
      </h3>

      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
        {algorithm.intro}
      </p>

      {progress && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>完成状态</span>
            <span className={progress.completed ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {progress.completed ? '✓ 已完成' : '○ 未完成'}
            </span>
          </div>
          {progress.bestScore > 0 && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>最佳得分</span>
              <span className="font-medium text-primary-600">{progress.bestScore} 分</span>
            </div>
          )}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${progress.completed ? 100 : Math.min(progress.practiceCount * 33, 90)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
        <BookOpen className="w-4 h-4" />
        <span>开始学习</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
