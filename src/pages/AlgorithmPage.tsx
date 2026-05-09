import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Code2, Sparkles, Lightbulb, ThumbsUp, AlertCircle, GraduationCap, Play } from 'lucide-react';
import { useCourseById } from '../hooks/useCourses';
import { getAlgorithmById } from '../data/algorithms';
import { getExercisesByAlgorithm } from '../data/exercises';
import AITutorPanel from '../components/AITutorPanel';
import VideoEmbed from '../components/VideoEmbed';
import LinearRegressionViz from '../components/LinearRegressionViz';
import KNNViz from '../components/KNNViz';
import DecisionTreeViz from '../components/DecisionTreeViz';
import type { Algorithm } from '../types';

const vizComponents: Record<string, React.ComponentType<{ algorithm?: Algorithm }>> = {
  'linear-regression': LinearRegressionViz,
  knn: KNNViz,
  'decision-tree': DecisionTreeViz,
};

export default function AlgorithmPage() {
  const { id } = useParams<{ id: string }>();
  const algorithm = useCourseById(id || '') || getAlgorithmById(id || '');

  if (!algorithm) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">算法未找到</h2>
        <p className="text-gray-500 mb-4">请检查 URL 是否正确</p>
        <Link to="/" className="text-primary-600 hover:underline">返回首页</Link>
      </div>
    );
  }

  const VizComponent = vizComponents[algorithm.id];
  const exercises = getExercisesByAlgorithm(algorithm.id);

  return (
    <div className="app-container">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回课程列表
      </Link>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Hero Card */}
          <div className="app-card p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                {algorithm.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    algorithm.difficulty === '入门' ? 'bg-green-100 text-green-700' :
                    algorithm.difficulty === '中级' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {algorithm.difficulty}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {algorithm.category === 'regression' ? '回归算法' :
                     algorithm.category === 'classification' ? '分类算法' : '树形算法'}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{algorithm.name}</h1>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">{algorithm.description}</p>
          </div>

          {/* Steps */}
          <div className="app-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <GraduationCap className="w-5 h-5 text-primary-500" />
              算法步骤
            </h2>
            <div className="space-y-3">
              {algorithm.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0 text-sm font-bold group-hover:bg-primary-500 group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 pt-1.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="app-card p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-green-700 mb-3">
                <ThumbsUp className="w-4 h-4" />
                优点
              </h3>
              <ul className="space-y-2">
                {algorithm.advantages.map((adv, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-400 mt-1">✓</span>
                    {adv}
                  </li>
                ))}
              </ul>
            </div>
            <div className="app-card p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-3">
                <AlertCircle className="w-4 h-4" />
                缺点
              </h3>
              <ul className="space-y-2">
                {algorithm.disadvantages.map((dis, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-red-400 mt-1">✗</span>
                    {dis}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Formula */}
          <div className="app-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              核心公式
            </h2>
            <div className="bg-gray-900 text-gray-100 rounded-xl p-5 overflow-x-auto">
              <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap">
                {algorithm.formula}
              </pre>
            </div>
          </div>

          {/* Code Example */}
          <div className="app-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <Code2 className="w-5 h-5 text-green-500" />
              Python 代码示例
            </h2>
            <div className="bg-gray-900 text-gray-100 rounded-xl p-5 overflow-x-auto">
              <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap">
                {algorithm.codeExample}
              </pre>
            </div>
          </div>

          {/* Video */}
          <div className="app-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <Play className="w-5 h-5 text-red-500" />
              B 站教学视频
            </h2>
            <VideoEmbed url={algorithm.videoUrl} title={`${algorithm.name} - B站视频教程`} />
          </div>

          {/* Visualization */}
          {VizComponent && (
            <div className="app-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                <Sparkles className="w-5 h-5 text-purple-500" />
                交互式可视化
              </h2>
              <VizComponent algorithm={algorithm} />
            </div>
          )}

          {/* Practice Link */}
          <div className="flex flex-wrap gap-3">
            {exercises.length > 0 && (
              <Link
                to={`/practice/${algorithm.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Code2 className="w-4 h-4" />
                去做代码练习 ({exercises.length} 题)
              </Link>
            )}
            <Link
              to={`/quiz/${algorithm.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:shadow-md transition-all"
            >
              <GraduationCap className="w-4 h-4" />
              测验挑战
            </Link>
          </div>

          {/* Spacer */}
          <div className="h-8" />
        </div>

        {/* AI Tutor Sidebar */}
        <div className="xl:w-96 flex-shrink-0">
          <div className="xl:sticky xl:top-24">
            <AITutorPanel algorithm={algorithm} />
          </div>
        </div>
      </div>
    </div>
  );
}
