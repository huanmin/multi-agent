/**
 * Message Store
 *
 * 简单的内存状态管理（便于测试）
 */

/**
 * 消息状态
 */
export interface Message {
  id: string;
  conversationId?: string;
  role?: 'user' | 'assistant' | 'system';
  content: string;
  expertId?: string;
  mentions?: string[];
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  createdAt?: Date;
}

/**
 * Message Store
 */
class MessageStore {
  messages: Message[] = [];

  addMessage(message: Partial<Message>): void {
    const id = message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: Message = {
      id,
      conversationId: message.conversationId,
      role: message.role || 'user',
      content: message.content || '',
      expertId: message.expertId,
      mentions: message.mentions || [],
      inputTokens: message.inputTokens || 0,
      outputTokens: message.outputTokens || 0,
      latencyMs: message.latencyMs || 0,
      createdAt: message.createdAt || new Date(),
    };
    this.messages = [...this.messages, newMessage];
  }

  appendContent(id: string, delta: string): void {
    this.messages = this.messages.map((m) =>
      m.id === id ? { ...m, content: m.content + delta } : m
    );
  }

  updateTokenUsage(id: string, input: number, output: number): void {
    this.messages = this.messages.map((m) =>
      m.id === id ? { ...m, inputTokens: input, outputTokens: output } : m
    );
  }

  updateLatency(id: string, ms: number): void {
    this.messages = this.messages.map((m) =>
      m.id === id ? { ...m, latencyMs: ms } : m
    );
  }

  clearConversationMessages(conversationId: string): void {
    this.messages = this.messages.filter((m) => m.conversationId !== conversationId);
  }

  clearAllMessages(): void {
    this.messages = [];
  }

  reset(): void {
    this.messages = [];
  }

  getMessagesByConversation(conversationId: string): Message[] {
    return this.messages.filter((m) => m.conversationId === conversationId);
  }

  getMessageById(id: string): Message | undefined {
    return this.messages.find((m) => m.id === id);
  }
}

// 导出单例
const messageStore = new MessageStore();

/**
 * 用于测试的工厂函数
 */
export function createMessageStore(): MessageStore {
  return new MessageStore();
}

/**
 * 获取 store 实例
 */
export function useMessageStore(): MessageStore {
  return messageStore;
}

export { messageStore };
export default messageStore;
