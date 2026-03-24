/**
 * MessageActions 消息操作组件
 *
 * 显示消息的操作按钮（追问、复制等）
 */

import { useState } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  expertId?: string;
  expertName?: string;
}

interface MessageActionsProps {
  message: Message;
  onFollowUp?: (message: Message) => void;
  onCopy?: (content: string) => void;
}

export function MessageActions({
  message,
  onFollowUp,
  onCopy,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  // 只有助手消息可以追问
  const canFollowUp = message.role === 'assistant';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopy?.(message.content);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {canFollowUp && (
        <button
          onClick={() => onFollowUp?.(message)}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
        >
          <span>💬</span>
          追问
        </button>
      )}
      <button
        onClick={handleCopy}
        className="text-xs text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1"
      >
        <span>{copied ? '✓' : '📋'}</span>
        {copied ? '已复制' : '复制'}
      </button>
    </div>
  );
}
