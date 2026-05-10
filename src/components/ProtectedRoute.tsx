import { useState } from 'react';
import { Shield, ArrowLeft, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginModal from './LoginModal';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl max-w-md w-full p-8 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary-100 flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">请先登录</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          登录后可保存学习进度、练习记录、测验成绩和 AI 学习建议。
        </p>
        <button
          onClick={onLogin}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          <LogIn className="h-4 w-4" />
          立即登录
        </button>
        <Link
          to="/"
          className="block mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (!user) {
    return (
      <>
        <LoginPrompt onLogin={() => setShowLogin(true)} />
        <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
      </>
    );
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl max-w-md w-full p-8 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center">
            <Shield className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">需要管理员权限</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            此页面仅限管理员访问。如需管理课程和题库，请使用管理员账号登录。
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            返回个人中心
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
