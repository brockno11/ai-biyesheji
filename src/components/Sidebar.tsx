import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';

const categoryLabels: Record<string, string> = {
  regression: '回归算法',
  classification: '分类算法',
  tree: '树形算法',
};

const difficultyColors: Record<string, string> = {
  '入门': 'bg-green-100 text-green-700',
  '中级': 'bg-yellow-100 text-yellow-700',
  '进阶': 'bg-red-100 text-red-700',
};

export default function Sidebar() {
  const location = useLocation();
  const currentAlgoId = location.pathname.split('/').pop();
  const algorithms = useCourses();

  const categories = Array.from(new Set(algorithms.map((a) => a.category)));

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          课程导航
        </h3>

        {categories.map((cat) => (
          <div key={cat} className="mb-4">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">
              {categoryLabels[cat] || cat}
            </div>
            {algorithms
              .filter((a) => a.category === cat)
              .map((algo) => {
                const isActive = currentAlgoId === algo.id;
                return (
                  <Link
                    key={algo.id}
                    to={`/algorithms/${algo.id}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{algo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {algo.name}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${difficultyColors[algo.difficulty]}`}
                    >
                      {algo.difficulty}
                    </span>
                  </Link>
                );
              })}
          </div>
        ))}

        <div className="mt-6 pt-4 border-t border-gray-100 space-y-1">
          <Link
            to="/progress"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              location.pathname === '/progress'
                ? 'bg-primary-50 text-primary-700 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">📊</span>
            <span className="text-sm font-medium">学习进度</span>
          </Link>
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              location.pathname === '/profile'
                ? 'bg-primary-50 text-primary-700 shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">个人中心</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
