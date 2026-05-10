import { useState, useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  ChevronRight,
  ChevronDown,
  User,
  Circle,
  CheckCircle2,
  Play,
  BookOpen,
  Target,
} from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { lessonProgressService } from '../services/lessonProgressService';
import { storageService } from '../services/storageService';

const difficultyColors: Record<string, string> = {
  '入门': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  '中级': 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  '进阶': 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
};

export default function Sidebar() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const algorithms = useCourses();

  const currentPath = location.pathname;
  const currentCourseId =
    currentPath.startsWith('/algorithms/')
      ? currentPath.split('/algorithms/')[1]?.split('?')[0]
      : undefined;
  const currentLessonId = searchParams.get('lesson') || undefined;

  // Expand state for foundation courses
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>(
    () => {
      // Auto-expand current course
      if (currentCourseId) {
        return { [currentCourseId]: true };
      }
      return {};
    },
  );

  // Progress from storage
  const storageProgress = storageService.getProgress();
  const lessonProgress = lessonProgressService.getProgress();

  // Split courses into foundation and algorithm groups
  const foundationCourses = useMemo(
    () => algorithms.filter((a) => a.type === 'foundation'),
    [algorithms],
  );

  const algorithmCourses = useMemo(
    () => algorithms.filter((a) => !a.type || a.type === 'algorithm'),
    [algorithms],
  );

  // Compute progress summary
  const totalFoundationLessons = foundationCourses.reduce(
    (sum, c) => sum + (c.lessons?.length || 0),
    0,
  );
  const completedFoundationLessons = foundationCourses.reduce((sum, c) => {
    const progress = lessonProgress[c.id];
    return sum + (progress?.completedLessons?.length || 0);
  }, 0);
  const totalAlgorithmCourses = algorithmCourses.length;
  const completedAlgorithmCourses = algorithmCourses.filter((a) =>
    storageProgress.completedAlgorithms.includes(a.id),
  ).length;

  const handleToggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const getLessonLink = (courseId: string, lessonId: string) =>
    `/algorithms/${courseId}?lesson=${lessonId}`;

  const getLessonStatus = (
    courseId: string,
    lessonId: string,
  ): 'completed' | 'current' | 'not-started' => {
    if (lessonProgress[courseId]?.completedLessons?.includes(lessonId)) {
      return 'completed';
    }
    if (currentCourseId === courseId && currentLessonId === lessonId) {
      return 'current';
    }
    return 'not-started';
  };

  // Get the first incomplete lesson for a course (for clicking course title)
  const getFirstIncompleteLessonId = (courseId: string): string | undefined => {
    const course = algorithms.find((a) => a.id === courseId);
    if (!course?.lessons) return undefined;
    const completed = lessonProgress[courseId]?.completedLessons || [];
    const firstIncomplete = course.lessons.find(
      (l) => !completed.includes(l.id),
    );
    return firstIncomplete?.id || course.lessons[0]?.id;
  };

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 flex-shrink-0 overflow-y-auto border-r border-slate-200/80 bg-white/75 backdrop-blur lg:block">
      <div className="p-4">
        {/* Progress Summary */}
        <Link
          to="/progress"
          className={`mb-4 flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
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
            <span className="block text-xs font-medium text-slate-400">
              基础课: {completedFoundationLessons}/{totalFoundationLessons} 小节
              {' | '}整体: {completedAlgorithmCourses}/{totalAlgorithmCourses} 门
            </span>
          </span>
        </Link>

        {/* ──────── Foundation Courses Group ──────── */}
        <div className="mb-5">
          <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            基础入门
          </h3>
          <div className="space-y-1">
            {foundationCourses.map((course) => {
              const isActive = currentCourseId === course.id;
              const isExpanded = expandedCourses[course.id] || false;
              const lessons = (course.lessons || []).sort(
                (a, b) => a.order - b.order,
              );
              const courseCompleted =
                lessonProgress[course.id]?.completedLessons?.length || 0;

              return (
                <div key={course.id}>
                  {/* Course title row */}
                  <button
                    onClick={() => handleToggleCourse(course.id)}
                    className={`group mb-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all text-left ${
                      isActive
                        ? 'bg-primary-50 text-primary-800 shadow-sm ring-1 ring-primary-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <span className="text-base leading-none flex-shrink-0">
                      {course.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {course.name}
                      </div>
                      {lessons.length > 0 && (
                        <div className="text-xs text-slate-400">
                          {courseCompleted}/{lessons.length} 小节
                        </div>
                      )}
                    </div>
                    <span className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </span>
                  </button>

                  {/* Lesson list (expanded) */}
                  {isExpanded && lessons.length > 0 && (
                    <div className="ml-5 border-l-2 border-slate-100 pl-3 space-y-0.5 py-1">
                      {lessons.map((lesson) => {
                        const status = getLessonStatus(course.id, lesson.id);
                        let statusIcon: React.ReactNode;
                        let statusClass: string;

                        if (status === 'completed') {
                          statusIcon = (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          );
                          statusClass = 'text-green-700';
                        } else if (status === 'current') {
                          statusIcon = (
                            <Play className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 ml-0.5" />
                          );
                          statusClass =
                            'text-blue-700 font-semibold bg-blue-50/80 border border-blue-100';
                        } else {
                          statusIcon = (
                            <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                          );
                          statusClass = 'text-slate-500';
                        }

                        return (
                          <Link
                            key={lesson.id}
                            to={getLessonLink(course.id, lesson.id)}
                            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all ${statusClass} hover:bg-slate-50`}
                          >
                            {statusIcon}
                            <span className="truncate">
                              {lesson.order}. {lesson.title}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ──────── Algorithm Courses Group ──────── */}
        <div className="mb-5">
          <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            核心算法
          </h3>
          <div className="space-y-1">
            {algorithmCourses.map((algo) => {
              const isActive = currentCourseId === algo.id;
              const isAlgoCompleted = storageProgress.completedAlgorithms.includes(algo.id);
              const isExpanded = expandedCourses[algo.id] || false;
              const practiceCount = storageService.getPracticeCount(algo.id);
              const bestScore = storageService.getBestScore(algo.id);
              const quizRecords = storageProgress.quizRecords.filter((r) => r.algorithmId === algo.id);
              const lastQuizScore = quizRecords.length > 0 ? quizRecords[quizRecords.length - 1].score : null;

              return (
                <div key={algo.id}>
                  {/* Algorithm course header */}
                  <button
                    onClick={() => handleToggleCourse(algo.id)}
                    className={`group mb-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all text-left ${
                      isActive
                        ? 'bg-primary-50 text-primary-800 shadow-sm ring-1 ring-primary-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <span className="text-base leading-none flex-shrink-0">{algo.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{algo.name}</div>
                    </div>
                    {isAlgoCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold flex-shrink-0 ${difficultyColors[algo.difficulty]}`}>{algo.difficulty}</span>
                    <span className="flex-shrink-0">
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                    </span>
                  </button>

                  {/* Algorithm sub-items */}
                  {isExpanded && (
                    <div className="ml-5 border-l-2 border-slate-100 pl-3 space-y-0.5 py-1">
                      <Link to={`/algorithms/${algo.id}`} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all ${isActive && !currentPath.includes('/practice/') && !currentPath.includes('/quiz/') ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}>
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>课程学习</span>
                      </Link>
                      <Link to={algo.hasPractice !== false ? `/practice/${algo.id}` : '#'} onClick={algo.hasPractice === false ? (e) => e.preventDefault() : undefined} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all ${algo.hasPractice === false ? 'text-slate-300 cursor-default' : currentPath === `/practice/${algo.id}` ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Target className="w-3.5 h-3.5" />
                        <span>代码练习{algo.hasPractice === false ? ' (后续开放)' : ''}</span>
                        {bestScore > 0 && <span className="ml-auto text-[10px] text-emerald-600 font-semibold">{bestScore}分</span>}
                      </Link>
                      <Link to={`/quiz/${algo.id}`} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all ${currentPath === `/quiz/${algo.id}` ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}>
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>知识测验</span>
                        {lastQuizScore !== null && <span className="ml-auto text-[10px] text-emerald-600 font-semibold">{lastQuizScore}分</span>}
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>



        {/* ──────── Bottom ──────── */}
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
