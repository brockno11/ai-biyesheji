import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AlgorithmPage from './pages/AlgorithmPage';
import PracticePage from './pages/PracticePage';
import QuizPage from './pages/QuizPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route element={<Layout />}>
          <Route path="/algorithms/:id" element={<AlgorithmPage />} />
          <Route path="/practice/:algorithmId" element={<PracticePage />} />
          <Route path="/quiz/:algorithmId" element={<QuizPage />} />
          <Route path="/progress" element={<ProgressPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
