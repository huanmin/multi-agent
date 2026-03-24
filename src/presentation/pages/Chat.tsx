/**
 * 聊天页面
 *
 * 与专家对话的界面
 */

import { useState, useRef, useEffect } from 'react';
import { MessageInput } from '../components/MessageInput';
import { ConversationList } from '../components/ConversationList';

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
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', name: '与 架构师 的对话', lastMessage: 'Hello', unreadCount: 0 },
  ]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinkingExperts, setThinkingExperts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find((c) => c.id === currentConversationId);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    // 模拟延迟响应
    selectedExperts.forEach((expertId, index) => {
      setTimeout(() => {
        const expert = experts.find((e) => e.id === expertId);
        const response: Message = {
          id: `msg-${Date.now()}-${index}`,
          role: 'assistant',
          content: `这是${expert?.name}的回复：根据您的描述，建议采用分层架构设计，将业务逻辑与数据访问分离。`,
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
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <h1 className="text-lg font-bold text-white">
            {currentConversation?.name || '聊天'}
          </h1>
        </header>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              data-testid={message.role === 'assistant' ? 'expert-response' : undefined}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
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

        {/* 输入框 */}
        <MessageInput
          onSend={handleSendMessage}
          experts={experts}
          placeholder="输入消息..."
        />
      </div>
    </div>
  );
}
