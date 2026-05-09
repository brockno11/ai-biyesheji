import { useMemo, useState } from 'react';
import { ClipboardList, Code2, CopyPlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { exercises as staticExercises, quizQuestions } from '../data/exercises';
import { storageService } from '../services/storageService';
import type { Exercise, QuizQuestion } from '../types';

type PanelMode = 'exercise' | 'quiz';

const emptyExercise: Exercise = {
  id: '',
  algorithmId: 'linear-regression',
  title: '',
  difficulty: '入门',
  description: '',
  instructions: [''],
  starterCode: '',
  expectedKeywords: [],
  checkRules: [],
};

const emptyQuiz: QuizQuestion = {
  id: '',
  algorithmId: 'linear-regression',
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
};

function keywordsToRules(keywords: string[]) {
  const points = Math.max(1, Math.floor(100 / Math.max(keywords.length, 1)));
  return keywords.map((keyword) => ({
    type: 'keyword' as const,
    keyword,
    description: `使用 ${keyword}`,
    points,
  }));
}

function linesToList(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminQuestionPanel() {
  const courses = useCourses();
  const [mode, setMode] = useState<PanelMode>('exercise');
  const [customExercises, setCustomExercises] = useState(() => storageService.getCustomExercises());
  const [customQuizzes, setCustomQuizzes] = useState(() => storageService.getCustomQuizQuestions());
  const [exerciseForm, setExerciseForm] = useState<Exercise>(emptyExercise);
  const [quizForm, setQuizForm] = useState<QuizQuestion>(emptyQuiz);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);

  const staticQuizList = useMemo(() => Object.values(quizQuestions).flat(), []);
  const customExerciseIds = new Set(customExercises.map((item) => item.id));
  const customQuizIds = new Set(customQuizzes.map((item) => item.id));
  const exerciseList = [
    ...staticExercises.map((item) => ({ ...item, source: customExerciseIds.has(item.id) ? '覆盖' : '内置' })),
    ...customExercises
      .filter((item) => !staticExercises.some((base) => base.id === item.id))
      .map((item) => ({ ...item, source: '自定义' })),
  ];
  const quizList = [
    ...staticQuizList.map((item) => ({ ...item, source: customQuizIds.has(item.id) ? '覆盖' : '内置' })),
    ...customQuizzes
      .filter((item) => !staticQuizList.some((base) => base.id === item.id))
      .map((item) => ({ ...item, source: '自定义' })),
  ];

  const courseName = (id: string) => courses.find((course) => course.id === id)?.name || id;

  const openNewExercise = () => {
    setExerciseForm({ ...emptyExercise, id: `custom-ex-${Date.now()}` });
    setShowExerciseForm(true);
  };

  const openEditExercise = (exercise: Exercise) => {
    setExerciseForm({
      ...exercise,
      instructions: [...exercise.instructions],
      expectedKeywords: [...exercise.expectedKeywords],
      checkRules: [...exercise.checkRules],
    });
    setShowExerciseForm(true);
  };

  const saveExercise = () => {
    const keywords = exerciseForm.expectedKeywords.filter(Boolean);
    storageService.saveCustomExercise({
      ...exerciseForm,
      instructions: exerciseForm.instructions.filter(Boolean),
      expectedKeywords: keywords,
      checkRules: keywordsToRules(keywords),
    });
    setCustomExercises(storageService.getCustomExercises());
    setShowExerciseForm(false);
  };

  const deleteExercise = (id: string) => {
    storageService.deleteCustomExercise(id);
    setCustomExercises(storageService.getCustomExercises());
  };

  const openNewQuiz = () => {
    setQuizForm({ ...emptyQuiz, id: `custom-quiz-${Date.now()}` });
    setShowQuizForm(true);
  };

  const openEditQuiz = (question: QuizQuestion) => {
    setQuizForm({ ...question, options: [...question.options] });
    setShowQuizForm(true);
  };

  const saveQuiz = () => {
    storageService.saveCustomQuizQuestion({
      ...quizForm,
      options: quizForm.options.map((option) => option.trim()).filter(Boolean),
    });
    setCustomQuizzes(storageService.getCustomQuizQuestions());
    setShowQuizForm(false);
  };

  const deleteQuiz = (id: string) => {
    storageService.deleteCustomQuizQuestion(id);
    setCustomQuizzes(storageService.getCustomQuizQuestions());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">题库与练习管理</h2>
          <p className="text-sm text-gray-500">支持新增题目，也支持对内置题目做本地覆盖编辑。</p>
        </div>
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setMode('exercise')}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'exercise' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Code2 className="h-4 w-4" />
            练习题
          </button>
          <button
            onClick={() => setMode('quiz')}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'quiz' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ClipboardList className="h-4 w-4" />
            测验题
          </button>
        </div>
      </div>

      {mode === 'exercise' ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="text-sm font-bold text-gray-900">练习题共 {exerciseList.length} 道</div>
            <button onClick={openNewExercise} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              新增练习
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {exerciseList.map((exercise) => (
              <div key={exercise.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{exercise.title}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{courseName(exercise.algorithmId)}</span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{exercise.source}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{exercise.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditExercise(exercise)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    {exercise.source === '内置' ? <CopyPlus className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    {exercise.source === '内置' ? '覆盖编辑' : '编辑'}
                  </button>
                  {exercise.source !== '内置' && (
                    <button onClick={() => deleteExercise(exercise.id)} className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="text-sm font-bold text-gray-900">测验题共 {quizList.length} 道</div>
            <button onClick={openNewQuiz} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              新增测验
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {quizList.map((question) => (
              <div key={question.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{question.question}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{courseName(question.algorithmId)}</span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{question.source}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">正确答案：{question.options[question.correctIndex]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditQuiz(question)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    {question.source === '内置' ? <CopyPlus className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    {question.source === '内置' ? '覆盖编辑' : '编辑'}
                  </button>
                  {question.source !== '内置' && (
                    <button onClick={() => deleteQuiz(question.id)} className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showExerciseForm && (
        <div className="rounded-2xl border border-primary-100 bg-white p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">编辑练习题</h3>
            <button onClick={() => setShowExerciseForm(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={exerciseForm.id} onChange={(e) => setExerciseForm((prev) => ({ ...prev, id: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="ID" />
            <select value={exerciseForm.algorithmId} onChange={(e) => setExerciseForm((prev) => ({ ...prev, algorithmId: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
              {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
            </select>
            <input value={exerciseForm.title} onChange={(e) => setExerciseForm((prev) => ({ ...prev, title: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2" placeholder="练习标题" />
            <textarea value={exerciseForm.description} onChange={(e) => setExerciseForm((prev) => ({ ...prev, description: e.target.value }))} className="min-h-20 rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2" placeholder="练习描述" />
            <textarea value={exerciseForm.instructions.join('\n')} onChange={(e) => setExerciseForm((prev) => ({ ...prev, instructions: linesToList(e.target.value) }))} className="min-h-24 rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="步骤说明，每行一条" />
            <textarea value={exerciseForm.expectedKeywords.join(', ')} onChange={(e) => setExerciseForm((prev) => ({ ...prev, expectedKeywords: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) }))} className="min-h-24 rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="关键词，用逗号分隔" />
            <textarea value={exerciseForm.starterCode} onChange={(e) => setExerciseForm((prev) => ({ ...prev, starterCode: e.target.value }))} className="min-h-52 rounded-xl border border-gray-200 px-3 py-2 font-mono text-xs md:col-span-2" placeholder="Starter Code" />
          </div>
          <button onClick={saveExercise} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
            <Save className="h-4 w-4" />
            保存练习
          </button>
        </div>
      )}

      {showQuizForm && (
        <div className="rounded-2xl border border-primary-100 bg-white p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">编辑测验题</h3>
            <button onClick={() => setShowQuizForm(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={quizForm.id} onChange={(e) => setQuizForm((prev) => ({ ...prev, id: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="ID" />
            <select value={quizForm.algorithmId} onChange={(e) => setQuizForm((prev) => ({ ...prev, algorithmId: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
              {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
            </select>
            <textarea value={quizForm.question} onChange={(e) => setQuizForm((prev) => ({ ...prev, question: e.target.value }))} className="min-h-20 rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2" placeholder="题干" />
            {quizForm.options.map((option, index) => (
              <input key={index} value={option} onChange={(e) => setQuizForm((prev) => ({ ...prev, options: prev.options.map((item, i) => (i === index ? e.target.value : item)) }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder={`选项 ${index + 1}`} />
            ))}
            <select value={quizForm.correctIndex} onChange={(e) => setQuizForm((prev) => ({ ...prev, correctIndex: Number(e.target.value) }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
              {quizForm.options.map((_, index) => <option key={index} value={index}>正确答案：选项 {index + 1}</option>)}
            </select>
            <textarea value={quizForm.explanation} onChange={(e) => setQuizForm((prev) => ({ ...prev, explanation: e.target.value }))} className="min-h-20 rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2" placeholder="解析" />
          </div>
          <button onClick={saveQuiz} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
            <Save className="h-4 w-4" />
            保存测验题
          </button>
        </div>
      )}
    </div>
  );
}
