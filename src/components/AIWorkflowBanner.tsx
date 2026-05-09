import { Compass, MessageCircle, Bug, Target, PenTool, ArrowRight } from 'lucide-react';

const STEPS = [
  { icon: Compass, label: '学前', desc: 'AI 推荐学习路径' },
  { icon: MessageCircle, label: '学习中', desc: 'AI 实时答疑解惑' },
  { icon: Bug, label: '练习中', desc: 'AI 代码诊断纠错' },
  { icon: Target, label: '测验后', desc: 'AI 精准弱项定位' },
  { icon: PenTool, label: '管理端', desc: 'AI 教学数据洞察' },
] as const;

export default function AIWorkflowBanner() {
  return (
    <section
      className="mx-auto w-full max-w-5xl"
      aria-label="AI 学习助手工作流"
    >
      <div
        className="group rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden
          bg-gradient-to-br from-primary-50/50 via-white to-accent-50/30"
      >
        {/* Header bar */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-primary-50/70 to-accent-50/70 px-6 py-4">
          <h2 className="text-center text-base font-extrabold text-slate-950">
            AI 学习助手工作流
          </h2>
          <p className="mt-1 text-center text-sm text-slate-500">
            智能贯穿教学全流程，每一步都有 AI 相伴
          </p>
        </div>

        {/* Steps row */}
        <div
          className="flex flex-col gap-3 p-4
            sm:p-6
            md:flex-row md:items-start md:gap-0"
        >
          {STEPS.map((step, index) => (
            <div
              key={step.label}
              className="flex items-center md:flex-1 md:flex-col"
            >
              {/* Step card */}
              <div
                className="flex w-full items-center gap-3 rounded-xl p-3
                  opacity-70 translate-y-0.5
                  transition-all duration-500 ease-out
                  group-hover:opacity-100 group-hover:translate-y-0
                  md:flex-col md:items-center md:gap-3 md:p-3 md:text-center"
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                {/* Gradient icon circle */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                    bg-gradient-to-br from-primary-500 to-accent-500 shadow-sm
                    transition-all duration-300
                    group-hover:scale-110 group-hover:shadow-md"
                  style={{ transitionDelay: `${index * 90 + 40}ms` }}
                >
                  <step.icon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>

                {/* Label + description */}
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800">
                    {step.label}
                  </div>
                  <div className="mt-0.5 text-xs leading-snug text-slate-500">
                    {step.desc}
                  </div>
                </div>
              </div>

              {/* Arrow connector — visible only on desktop */}
              {index < STEPS.length - 1 && (
                <div className="hidden md:flex md:items-center md:self-center md:shrink-0">
                  <ArrowRight
                    className="h-4 w-4 text-slate-300
                      transition-all duration-300
                      group-hover:text-primary-400 group-hover:translate-x-0.5"
                    aria-hidden="true"
                    style={{ transitionDelay: `${index * 90 + 140}ms` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
