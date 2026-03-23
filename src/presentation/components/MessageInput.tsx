/**
 * MessageInput 组件
 *
 * 消息输入框，支持@提及
 */

import { useState, useRef, useCallback } from 'react';

interface Expert {
  id: string;
  name: string;
}

interface MessageInputProps {
  onSend: (content: string, mentions?: string[]) => void;
  experts?: Expert[];
  placeholder?: string;
}

export function MessageInput({
  onSend,
  experts = [],
  placeholder = '输入消息...',
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const filteredExperts = experts.filter((e) =>
    e.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setContent(value);

      // 检测@提及
      const lastAtIndex = value.lastIndexOf('@');
      if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
        setShowMentionList(true);
        setMentionQuery('');
      } else if (lastAtIndex !== -1) {
        const afterAt = value.slice(lastAtIndex + 1);
        // 如果@后面是空格，关闭提及列表
        if (afterAt.includes(' ')) {
          setShowMentionList(false);
        } else {
          setMentionQuery(afterAt);
          setShowMentionList(true);
        }
      } else {
        setShowMentionList(false);
      }
    },
    []
  );

  const handleMentionSelect = useCallback(
    (expert: Expert) => {
      const lastAtIndex = content.lastIndexOf('@');
      const beforeAt = content.slice(0, lastAtIndex);
      const newContent = `${beforeAt}@${expert.name} `;
      setContent(newContent);
      setShowMentionList(false);
      inputRef.current?.focus();
    },
    [content]
  );

  const handleSend = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed) return;

    // 提取@提及的专家ID
    const mentions: string[] = [];
    experts.forEach((expert) => {
      if (trimmed.includes(`@${expert.name}`)) {
        mentions.push(expert.id);
      }
    });

    onSend(trimmed, mentions.length > 0 ? mentions : undefined);
    setContent('');
    setShowMentionList(false);
  }, [content, experts, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="relative">
      <div className="flex items-end gap-2 p-3 bg-slate-800 border-t border-slate-700">
        <textarea
          ref={inputRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 min-h-[44px] max-h-[120px] px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          发送
        </button>
      </div>

      {showMentionList && filteredExperts.length > 0 && (
        <div className="absolute bottom-full left-4 mb-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-10">
          {filteredExperts.map((expert) => (
            <button
              key={expert.id}
              onClick={() => handleMentionSelect(expert)}
              className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {expert.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
