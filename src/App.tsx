import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';

// HomePage loaded eagerly for instant landing page
import HomePage from './pages/HomePage';

// Lazy-loaded pages for code splitting
const AlgorithmPage = lazy(() => import('./pages/AlgorithmPage'));
const CoursePage = lazy(() => import('./pages/CoursePage'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function PageLoader() {
  return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        <span className="text-sm text-slate-500">页面加载中...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route element={<Layout />}>
            <Route
              path="/algorithms/:id"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CoursePage />
                </Suspense>
              }
            />
            <Route
              path="/practice/:algorithmId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <PracticePage />
                </Suspense>
              }
            />
            <Route
              path="/quiz/:algorithmId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <QuizPage />
                </Suspense>
              }
            />
            {/* Protected: requires login */}
            <Route
              path="/progress"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute>
                    <ProgressPage />
                  </ProtectedRoute>
                </Suspense>
              }
            />
          </Route>

          {/* Protected: requires login */}
          <Route
            path="/profile"
            element={
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </Suspense>
            }
          />

          {/* Protected: requires login (backend login gates admin features) */}
          <Route
            path="/admin"
            element={
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
