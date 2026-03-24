/**
 * 聊天页面
 *
 * 与专家对话的界面
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageInput } from '../components/MessageInput';
import { ConversationList } from '../components/ConversationList';
import { MessageExportDialog } from '../components/MessageExportDialog';
import { MessageActions } from '../components/MessageActions';
import { FollowUpInput } from '../components/FollowUpInput';
import { detectConflicts } from '@domain/conflict';
import type { ExpertOpinion, Conflict } from '@domain/conflict';
import type { MessageForFollowUp } from '@domain/follow-up';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  expertId?: string;
  expertName?: string;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage?: string;
  unreadCount: number;
}

// 模拟专家数据
const experts = [
  { id: 'architect', name: '架构师' },
  { id: 'frontend', name: '前端专家' },
  { id: 'backend', name: '后端专家' },
  { id: 'security', name: '安全专家' },
];

export function Chat() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', name: '与 架构师 的对话', lastMessage: 'Hello', unreadCount: 0 },
  ]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinkingExperts, setThinkingExperts] = useState<string[]>([]);
  const [detectedConflicts, setDetectedConflicts] = useState<Conflict[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState<MessageForFollowUp | null>(null);
  const [followUpCount, setFollowUpCount] = useState<Record<string, number>>({});

  const currentConversation = conversations.find((c) => c.id === currentConversationId);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingExperts]);

  // 冲突检测
  useEffect(() => {
    const assistantMessages = messages.filter((m) => m.role === 'assistant');
    if (assistantMessages.length >= 2 && thinkingExperts.length === 0) {
      // 转换为专家意见并检测冲突
      const opinions: ExpertOpinion[] = assistantMessages.map((msg) => ({
        expertId: msg.expertId || 'unknown',
        expertName: msg.expertName || '专家',
        category: '架构',
        content: msg.content,
        confidence: 0.85,
      }));

      const conflicts = detectConflicts(opinions);
      if (conflicts.length > 0) {
        setDetectedConflicts(conflicts);
      }
    }
  }, [messages, thinkingExperts]);

  // 发送消息
  const handleSendMessage = async (content: string) => {
    // 添加用户消息
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, userMessage]);

    // 模拟多专家响应
    const selectedExperts = ['architect', 'frontend'];
    setThinkingExperts(selectedExperts);

    // 模拟延迟响应 - 产生冲突
    selectedExperts.forEach((expertId, index) => {
      setTimeout(() => {
        const expert = experts.find((e) => e.id === expertId);
        // 故意产生冲突：架构师建议微服务，后端专家建议单体
        let content: string;
        if (expertId === 'architect') {
          content = '这是架构师的回复：建议使用微服务架构，可以更好地实现服务解耦和独立部署。';
        } else {
          content = '这是后端专家的回复：不建议使用微服务，当前团队规模较小，单体架构更易于维护和开发。';
        }
        const response: Message = {
          id: `msg-${Date.now()}-${index}`,
          role: 'assistant',
          content,
          expertId,
          expertName: expert?.name,
        };
        setMessages((prev) => [...prev, response]);
        setThinkingExperts((prev) => prev.filter((id) => id !== expertId));
      }, 1000 + index * 500);
    });
  };

  // 创建新会话
  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setMessages([]);
    setFollowUpMessage(null);
  };

  // 处理追问
  const handleFollowUp = (message: MessageForFollowUp) => {
    setFollowUpMessage(message);
  };

  // 取消追问
  const handleCancelFollowUp = () => {
    setFollowUpMessage(null);
  };

  // 提交追问
  const handleSubmitFollowUp = (content: string, formattedContent: string) => {
    // 添加追问消息
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: formattedContent,
    };
    setMessages((prev) => [...prev, userMessage]);

    // 更新追问次数
    if (followUpMessage) {
      const currentCount = followUpCount[followUpMessage.id] || 0;
      setFollowUpCount((prev) => ({
        ...prev,
        [followUpMessage.id]: currentCount + 1,
      }));
    }

    // 清除追问状态
    setFollowUpMessage(null);

    // 模拟专家回复（复用原来的逻辑）
    const selectedExperts = ['architect', 'frontend'];
    setThinkingExperts(selectedExperts);

    selectedExperts.forEach((expertId, index) => {
      setTimeout(() => {
        const expert = experts.find((e) => e.id === expertId);
        const response: Message = {
          id: `msg-${Date.now()}-${index}`,
          role: 'assistant',
          content: `这是${expert?.name}对追问的回复：我会进一步解释...`,
          expertId,
          expertName: expert?.name,
        };
        setMessages((prev) => [...prev, response]);
        setThinkingExperts((prev) => prev.filter((id) => id !== expertId));
      }, 1000 + index * 500);
    });
  };

  return (
    <div className="h-screen bg-slate-900 flex">
      {/* 左侧会话列表 */}
      <div className="w-64 flex-shrink-0">
        <ConversationList
          conversations={conversations}
          onSelect={handleSelectConversation}
          selectedId={currentConversationId}
        />
      </div>

      {/* 右侧聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 头部 */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">
            {currentConversation?.name || '聊天'}
          </h1>
          <button
            onClick={() => setShowExportDialog(true)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <span>📥</span>
            导出
          </button>
        </header>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 冲突检测提示 */}
          {detectedConflicts.length > 0 && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-red-400 font-medium">
                    ⚠️ 检测到 {detectedConflicts.length} 个意见冲突
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    {detectedConflicts[0]?.summary}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/conflict/${detectedConflicts[0]?.id}`)}
                  className="px-4 py-2 bg-red-500/30 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                >
                  查看冲突
                </button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              data-testid={message.role === 'assistant' ? 'expert-response' : undefined}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } group`}
            >
              <div
                className={`max-w-[70%] rounded-xl p-4 ${
                  message.role === 'user'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-100'
                }`}
              >
                {message.role === 'assistant' && message.expertName && (
                  <div className="text-xs text-cyan-400 mb-1">
                    {message.expertName}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.role === 'assistant' && (
                  <MessageActions
                    message={message}
                    onFollowUp={handleFollowUp}
                  />
                )}
              </div>
            </div>
          ))}

          {/* 思考状态 */}
          {thinkingExperts.map((expertId) => {
            const expert = experts.find((e) => e.id === expertId);
            return (
              <div key={expertId} className="flex justify-start">
                <div className="bg-slate-700/50 rounded-xl p-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-slate-400">
                    {expert?.name} 正在思考...
                  </span>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入框区域 */}
        {followUpMessage ? (
          <FollowUpInput
            originalMessage={followUpMessage}
            onSubmit={handleSubmitFollowUp}
            onCancel={handleCancelFollowUp}
            followUpCount={(followUpCount[followUpMessage.id] || 0) + 1}
          />
        ) : (
          <MessageInput
            onSend={handleSendMessage}
            experts={experts}
            placeholder="输入消息..."
          />
        )}
      </div>

      {/* 导出对话框 */}
      <MessageExportDialog
        messages={messages.map((m) => ({
          id: m.id,
          content: m.content,
          role: m.role,
          expertId: m.expertId,
          expertName: m.expertName,
          createdAt: new Date(),
        }))}
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </div>
  );
}
