import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  Trash2,
  BookOpen,
  Search,
  Lightbulb,
  PenLine,
  CheckCircle2,
  Sprout,
} from 'lucide-react';
import { aiService } from '../services/aiService';
import type { AIMode, AIActionType } from '../services/aiTypes';
import type { Algorithm } from '../types';
import AIModeBadge from './AIModeBadge';
import AITextRenderer from './AITextRenderer';

interface Props {
  algorithm: Algorithm;
  context?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  { type: 'explainConcept' as const, label: '解释概念', icon: BookOpen },
  { type: 'generatePracticeHint' as const, label: '诊断代码', icon: Search },
  { type: 'askTutor' as const, label: '学习建议', icon: Lightbulb, question: '请给我下一步学习建议' },
  { type: 'generateQuiz' as const, label: '来道题', icon: PenLine },
  { type: 'summarizeLesson' as const, label: '总结本节', icon: CheckCircle2 },
  { type: 'lifeExample' as const, label: '生活例子', icon: Sprout },
];

export default function AITutorPanel({ algorithm, context }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AIMode>('mock');
  const [fallbackReason, setFallbackReason] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await aiService.askTutor({
        algorithm,
        userQuestion: text,
        chatHistory: messages,
        pagePosition: context || '课程 AI 助教面板',
      });
      setMode(reply.mode);
      setFallbackReason(reply.fallbackReason);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply.data }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，我暂时无法回复。请稍后再试~' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (type: AIActionType) => {
    if (loading) return;
    setLoading(true);
    const action = QUICK_ACTIONS.find((item) => item.type === type);
    const actionLabel = action?.label || '快捷提问';
    try {
      const request = {
        algorithm,
        chatHistory: messages,
        pagePosition: context || '课程 AI 助教面板',
        userQuestion: action?.question,
      };
      const reply =
        type === 'explainConcept'
          ? await aiService.explainConcept(request)
          : type === 'generatePracticeHint'
            ? await aiService.generatePracticeHint(request)
            : type === 'generateQuiz'
              ? await aiService.generateQuiz(request)
              : type === 'summarizeLesson'
                ? await aiService.summarizeLesson(request)
                : type === 'lifeExample'
                  ? await aiService.lifeExample(request)
                  : await aiService.askTutor(request);
      setMode(reply.mode);
      setFallbackReason(reply.fallbackReason);
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: `[${actionLabel}]` },
        { role: 'assistant', content: reply.data },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，出错了，请再试一次~' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[680px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-sm">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-950">AI 助教 · 小智</div>
              <div className="text-xs text-slate-500">关于 {algorithm.name}，尽管问我</div>
            </div>
          </div>
          <button
            onClick={() => setMessages([])}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
            title="清空对话"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3">
          <AIModeBadge mode={mode} fallbackReason={fallbackReason} />
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4">
        {messages.length === 0 && (
          <div className="py-8 text-center">
            <Sparkles className="w-8 h-8 text-primary-400 mx-auto mb-2" />
            <p className="mb-4 text-sm leading-6 text-slate-500">
              我会把概念拆成更容易理解的小块，也会根据当前课程上下文回答。
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => handleQuickAction(qa.type)}
                  disabled={loading}
                  className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-primary-300 hover:bg-primary-50 disabled:opacity-50"
                >
                  <qa.icon className="h-4 w-4 text-primary-500 transition-transform group-hover:scale-110" />
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-md'
                  : 'border border-slate-200 bg-white text-slate-800 rounded-bl-md'
              }`}
            >
              {msg.role === 'assistant' ? (
                <AITextRenderer text={msg.content} compact />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
              <span className="text-sm text-slate-500">小智正在整理回答...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-100 bg-white px-4 py-3">
        {messages.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.label}
                onClick={() => handleQuickAction(qa.type)}
                disabled={loading}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"
              >
                <qa.icon className="h-3.5 w-3.5" />
                {qa.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="输入你的问题..."
            className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm leading-5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
