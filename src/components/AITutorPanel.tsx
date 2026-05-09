import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2 } from 'lucide-react';
import { askAIChat, askAI } from '../services/aiService';
import type { Algorithm } from '../types';

interface Props {
  algorithm: Algorithm;
  context?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AITutorPanel({ algorithm, context }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
      const reply = await askAIChat(text, algorithm);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，我暂时无法回复。请稍后再试~' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: '解释概念', icon: '📖', action: () => handleQuickAction('explain') },
    { label: '诊断代码', icon: '🔍', action: () => handleQuickAction('diagnose') },
    { label: '学习建议', icon: '💡', action: () => handleQuickAction('suggest') },
    { label: '来道题', icon: '📝', action: () => handleQuickAction('quiz') },
  ];

  const handleQuickAction = async (type: 'explain' | 'diagnose' | 'suggest' | 'quiz') => {
    if (loading) return;
    setLoading(true);
    try {
      const reply = await askAI(type, algorithm, context);
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: `[${quickActions.find((a) => a.action.name.includes(type))?.label}]` },
        { role: 'assistant', content: reply },
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
    <div className="bg-white rounded-2xl border border-gray-200 flex flex-col h-[600px] shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">AI 助教 · 小智</div>
          <div className="text-xs text-gray-400">关于 {algorithm.name}，尽管问我</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-primary-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-4">我是你的 AI 学习助手，可以帮你：</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((qa) => (
                <button
                  key={qa.label}
                  onClick={qa.action}
                  disabled={loading}
                  className="text-left px-3 py-2 rounded-xl border border-gray-200 text-sm hover:border-primary-300 hover:bg-primary-50 transition-colors disabled:opacity-50"
                >
                  <span className="mr-1">{qa.icon}</span>
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
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
              <span className="text-sm text-gray-500">小智正在思考...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="输入你的问题..."
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
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
