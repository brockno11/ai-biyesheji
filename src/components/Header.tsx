import { Link, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, Brain, Menu, Shield, User, X } from 'lucide-react';
import { useState } from 'react';
import { useCourses } from '../hooks/useCourses';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const algorithms = useCourses();

  const navLinks = [
    { to: '/', label: '首页', icon: BookOpen },
    { to: '/progress', label: '学习中心', icon: BarChart3 },
    { to: '/profile', label: '个人中心', icon: User },
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 shadow-sm transition-transform group-hover:-translate-y-0.5">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <span className="block text-base font-extrabold text-slate-950">ML 教学平台</span>
            <span className="hidden text-[11px] font-medium text-slate-400 sm:block">交互式算法学习</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                isActive(link.to)
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition-all hover:bg-amber-50 hover:text-amber-700"
            title="课程管理"
          >
            <Shield className="h-4 w-4" />
            管理
          </Link>
        </nav>

        <button
          className="focus-ring rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="打开导航菜单"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="space-y-3 border-t border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                isActive(link.to)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50"
          >
            <Shield className="h-4 w-4" />
            课程管理
          </Link>
          <div className="h-px bg-slate-100" />
          <div className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">课程列表</div>
          <div className="grid grid-cols-1 gap-1">
            {algorithms.map((algo) => (
              <Link
                key={algo.id}
                to={`/algorithms/${algo.id}`}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  location.pathname.includes(algo.id)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{algo.icon}</span>
                  {algo.name}
                </span>
                <span className="text-xs font-medium text-slate-400">{algo.difficulty}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
