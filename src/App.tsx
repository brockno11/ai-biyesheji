import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminPage />
            </Suspense>
          }
        />
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
          <Route
            path="/progress"
            element={
              <Suspense fallback={<PageLoader />}>
                <ProgressPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
