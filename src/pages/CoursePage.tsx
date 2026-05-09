import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCourseById } from '../hooks/useCourses';
import { getAlgorithmById } from '../data/algorithms';
import AlgorithmPage from './AlgorithmPage';
import FoundationCourseContent from '../components/FoundationCourseContent';

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const algorithm = useCourseById(id || '') || getAlgorithmById(id || '');

  if (!algorithm) {
    return (
      <div className="app-container max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">课程未找到</h2>
        <p className="text-gray-500 mb-4">请检查 URL 是否正确</p>
        <Link to="/" className="text-primary-600 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  // Route to foundation course content for foundation-type courses
  if (algorithm.type === 'foundation') {
    return (
      <div className="app-container">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回课程列表
        </Link>
        <FoundationCourseContent algorithm={algorithm} />
      </div>
    );
  }

  // Default: render the algorithm course page
  return <AlgorithmPage />;
}
