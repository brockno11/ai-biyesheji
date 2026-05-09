import { Link, useLocation } from 'react-router-dom';
import { BarChart3, ChevronRight, User } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';

const categoryLabels: Record<string, string> = {
  regression: '回归算法',
  classification: '分类算法',
  tree: '树形算法',
  clustering: '聚类算法',
};

const difficultyColors: Record<string, string> = {
  '入门': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  '中级': 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  '进阶': 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
};

export default function Sidebar() {
  const location = useLocation();
  const currentAlgoId = location.pathname.split('/').pop();
  const algorithms = useCourses();

  const categories = Array.from(new Set(algorithms.map((a) => a.category)));

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 flex-shrink-0 overflow-y-auto border-r border-slate-200/80 bg-white/75 backdrop-blur lg:block">
      <div className="p-4">
        <Link
          to="/progress"
          className={`mb-5 flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
            location.pathname === '/progress'
              ? 'bg-primary-50 text-primary-800 shadow-sm ring-1 ring-primary-100'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 hover:text-slate-950'
          }`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <BarChart3 className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold">学习中心</span>
            <span className="block text-xs font-medium text-slate-400">查看进度与下一步</span>
          </span>
        </Link>

        <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          课程列表
        </h3>

        {categories.map((cat) => (
          <div key={cat} className="mb-5">
            <div className="mb-2 px-2 text-xs font-semibold text-slate-500">
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
                    className={`group mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-800 shadow-sm ring-1 ring-primary-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <span className="text-lg leading-none">{algo.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {algo.name}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${difficultyColors[algo.difficulty]}`}
                    >
                      {algo.difficulty}
                    </span>
                    {isActive && <ChevronRight className="h-4 w-4 text-primary-500" />}
                  </Link>
                );
              })}
          </div>
        ))}

        <div className="mt-6 space-y-1 border-t border-slate-100 pt-4">
          <Link
            to="/profile"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
              location.pathname === '/profile'
                ? 'bg-primary-50 text-primary-800 shadow-sm ring-1 ring-primary-100'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <User className="h-4 w-4" />
            <span className="text-sm font-semibold">个人中心</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
