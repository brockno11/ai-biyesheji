import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Brain, LogIn, LogOut, Menu, Shield, User, X } from 'lucide-react';
import { useState } from 'react';
import { useCourses } from '../hooks/useCourses';
import { useAuth } from '../hooks/useAuth';
import LoginModal from './LoginModal';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const algorithms = useCourses();
  const { user, logout } = useAuth();

  const navLinks = [
    { to: '/', label: '首页', icon: BookOpen, requireAuth: false },
    { to: '/progress', label: '学习中心', icon: BarChart3, requireAuth: true },
    { to: '/profile', label: '个人中心', icon: User, requireAuth: true },
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const handleNavClick = (e: React.MouseEvent, link: { to: string; requireAuth: boolean }) => {
    if (link.requireAuth && !user) {
      e.preventDefault();
      setPendingPath(link.to);
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
  };

  const handleCloseLogin = () => {
    setShowLoginModal(false);
    setPendingPath(null);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 shadow-sm transition-transform group-hover:-translate-y-0.5">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <span className="block text-base font-extrabold text-slate-950">ML 教学平台</span>
            <span className="hidden text-[11px] font-medium text-slate-400 sm:block">交互式算法学习</span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavClick(e, link)}
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
          </nav>

          <div className="w-px h-6 bg-slate-200 mx-1.5" />

          {/* Auth section */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                {user.role === 'admin' && (
                  <Shield className="h-3.5 w-3.5 text-amber-500" />
                )}
                {user.nickname}
              </span>
              {user.role === 'admin' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                  管理员
                </span>
              )}
              <button
                onClick={logout}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                title="退出登录"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all"
            >
              <LogIn className="h-4 w-4" />
              登录
            </button>
          )}
        </div>

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
              onClick={(e) => {
                if (link.requireAuth && !user) {
                  e.preventDefault();
                  setMobileOpen(false);
                  setPendingPath(link.to);
                  setShowLoginModal(true);
                } else {
                  setMobileOpen(false);
                }
              }}
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
          <div className="h-px bg-slate-100" />
          {/* Mobile auth */}
          {user ? (
            <div className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">{user.nickname}</span>
                {user.role === 'admin' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                    管理员
                  </span>
                )}
              </div>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:text-red-500"
              >
                <LogOut className="h-3.5 w-3.5" />
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowLoginModal(true); setMobileOpen(false); }}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold w-full bg-primary-50 text-primary-700 hover:bg-primary-100"
            >
              <LogIn className="h-4 w-4" />
              登录 / 注册
            </button>
          )}
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

      <LoginModal
        show={showLoginModal}
        onClose={handleCloseLogin}
        onSuccess={handleLoginSuccess}
      />
    </header>
  );
}
