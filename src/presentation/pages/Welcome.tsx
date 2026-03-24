/**
 * 欢迎引导页
 *
 * 首次启动时显示的引导流程
 */

import { useState } from 'react';

interface WelcomeProps {
  onComplete?: () => void;
}

export function Welcome({ onComplete }: WelcomeProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: '欢迎使用 Multi-Agent',
      description: '您的智能协作平台，让多个 AI 专家协同工作',
      icon: '🤖',
    },
    {
      title: '发现专家团队',
      description: '预配置的专家组覆盖架构、代码审查、安全等多个领域',
      icon: '👥',
    },
    {
      title: '多专家并行对话',
      description: '同时向多个专家提问，获得多角度的专业建议',
      icon: '💬',
    },
    {
      title: '代码审查',
      description: '专门的代码审查流程，从多个维度提升代码质量',
      icon: '🔍',
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    onComplete?.();
  };

  const currentStep = steps[step]!;
  const isLastStep = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
        {/* 进度指示器 */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === step ? 'bg-cyan-500' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* 内容 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-6">{currentStep.icon}</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            {currentStep.title}
          </h1>
          <p className="text-slate-400 text-lg">{currentStep.description}</p>
        </div>

        {/* 按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          >
            跳过
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-medium"
          >
            {isLastStep ? '开始使用' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  );
}
