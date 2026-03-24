/**
 * FollowUpInput 追问输入组件
 *
 * 显示追问上下文并接收追问输入
 */

import { useState, useMemo } from 'react';
import {
  createFollowUpContext,
  formatFollowUpMessage,
  isFollowUpValid,
  type MessageForFollowUp,
} from '@domain/follow-up';

interface FollowUpInputProps {
  originalMessage: MessageForFollowUp;
  onSubmit: (content: string, formattedContent: string) => void;
  onCancel: () => void;
  followUpCount?: number;
}

export function FollowUpInput({
  originalMessage,
  onSubmit,
  onCancel,
  followUpCount = 1,
}: FollowUpInputProps) {
  const [content, setContent] = useState('');

  const context = useMemo(() => {
    const ctx = createFollowUpContext(originalMessage);
    ctx.followUpCount = followUpCount;
    return ctx;
  }, [originalMessage, followUpCount]);

  const isValid = useMemo(() => {
    return isFollowUpValid(content, context);
  }, [content, context]);

  const isOverLimit = followUpCount > 5;

  const handleSubmit = () => {
    if (!isValid) return;

    const formattedContent = formatFollowUpMessage(content, context);
    onSubmit(content, formattedContent);
    setContent('');
  };

  // 截断显示原始内容
  const truncatedContent = originalMessage.content.slice(0, 100) + (
    originalMessage.content.length > 100 ? '...' : ''
  );

  return (
    <div className="bg-slate-800 border border-cyan-500/30 rounded-xl p-4 mb-4">
      {/* 追问上下文 */}
      <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
        <div className="text-xs text-cyan-400 mb-2">
          追问 - {originalMessage.expertName || '助手'}
          {followUpCount > 1 && (
            <span className="ml-2 text-slate-400">(第 {followUpCount} 次追问)</span>
          )}
        </div>
        <div className="text-sm text-slate-300 border-l-2 border-cyan-500/50 pl-3">
          {truncatedContent}
        </div>
      </div>

      {/* 追问输入 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="请输入追问内容..."
        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 min-h-[80px] resize-y focus:outline-none focus:border-cyan-500 text-slate-100"
      />

      {/* 警告提示 */}
      {isOverLimit && (
        <div className="mt-3 text-xs text-yellow-400">
          ⚠️ 追问次数过多，建议开启新对话
        </div>
      )}

      {/* 按钮 */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          发送
        </button>
      </div>
    </div>
  );
}
