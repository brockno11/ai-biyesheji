import { CheckCircle2, Circle, Play } from 'lucide-react';
import type { FoundationLesson } from '../types';

interface Props {
  lessons: FoundationLesson[];
  currentLessonId: string;
  completedLessons: string[];
  onSelect: (id: string) => void;
}

export default function LessonTimeline({
  lessons,
  currentLessonId,
  completedLessons,
  onSelect,
}: Props) {
  const sorted = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">
        课程目录
      </h3>
      <div className="relative">
        {sorted.map((lesson, i) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isCurrent = lesson.id === currentLessonId;
          const isPast = sorted.findIndex((l) => l.id === currentLessonId) > i;

          let dotColor = 'bg-slate-200 border-slate-200';
          let lineColor = 'bg-slate-200';
          let textStyle = 'text-slate-400';

          if (isCompleted) {
            dotColor = 'bg-green-100 border-green-400 text-green-600';
            lineColor = 'bg-green-200';
            textStyle = 'text-green-700';
          } else if (isCurrent) {
            dotColor = 'bg-blue-100 border-blue-500 text-blue-600';
            lineColor = 'bg-blue-200';
            textStyle = 'text-blue-700';
          }

          return (
            <div key={lesson.id} className="relative flex gap-3">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center flex-shrink-0">
                {/* Top connecting line */}
                {i > 0 && (
                  <div
                    className={`w-0.5 h-2 ${lineColor} transition-colors duration-300`}
                  />
                )}
                {/* Dot */}
                <button
                  onClick={() => onSelect(lesson.id)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${dotColor} ${
                    isCompleted
                      ? 'cursor-pointer hover:scale-110'
                      : isCurrent
                        ? 'ring-2 ring-blue-200 cursor-default'
                        : 'cursor-pointer hover:bg-slate-100'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : isCurrent ? (
                    <Play className="w-3 h-3 text-blue-600 ml-0.5" />
                  ) : (
                    <Circle className="w-3 h-3 text-slate-300" />
                  )}
                </button>
                {/* Bottom connecting line */}
                {i < sorted.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[12px] ${lineColor} transition-colors duration-300`}
                  />
                )}
              </div>

              {/* Label */}
              <button
                onClick={() => onSelect(lesson.id)}
                className={`flex-1 text-left py-1.5 px-2 rounded-lg transition-all duration-200 ${
                  isCurrent
                    ? 'bg-blue-50/80 border border-blue-100'
                    : 'hover:bg-slate-50'
                }`}
              >
                <p
                  className={`text-xs leading-tight transition-colors duration-300 ${
                    isCompleted
                      ? 'text-green-700'
                      : isCurrent
                        ? 'text-blue-700 font-semibold'
                        : 'text-slate-500'
                  }`}
                >
                  {lesson.order}. {lesson.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {lesson.subtitle}
                </p>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
