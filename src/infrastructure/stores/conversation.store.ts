/**
 * Conversation Store
 *
 * 简单的内存状态管理（便于测试）
 */

/**
 * 会话状态
 */
export interface Conversation {
  id: string;
  name: string;
  type?: 'single' | 'group';
  expertIds?: string[];
  lastMessage?: string;
  unreadCount?: number;
  isPinned?: boolean;
  updatedAt?: Date;
}

/**
 * Conversation Store
 */
class ConversationStore {
  conversations: Conversation[] = [];
  currentId: string | null = null;

  addConversation(conversation: Partial<Conversation>): void {
    const id = conversation.id || `conv_${Date.now()}`;
    const newConversation: Conversation = {
      id,
      name: conversation.name || '新会话',
      type: conversation.type || 'single',
      expertIds: conversation.expertIds || [],
      lastMessage: conversation.lastMessage || '',
      unreadCount: conversation.unreadCount || 0,
      isPinned: conversation.isPinned || false,
      updatedAt: new Date(),
    };
    this.conversations = [newConversation, ...this.conversations];
  }

  deleteConversation(id: string): void {
    this.conversations = this.conversations.filter((c) => c.id !== id);
    if (this.currentId === id) {
      this.currentId = null;
    }
  }

  renameConversation(id: string, name: string): void {
    this.conversations = this.conversations.map((c) =>
      c.id === id ? { ...c, name, updatedAt: new Date() } : c
    );
  }

  setCurrentId(id: string | null): void {
    this.currentId = id;
  }

  pinConversation(id: string): void {
    this.conversations = this.conversations.map((c) =>
      c.id === id ? { ...c, isPinned: true, updatedAt: new Date() } : c
    );
  }

  unpinConversation(id: string): void {
    this.conversations = this.conversations.map((c) =>
      c.id === id ? { ...c, isPinned: false, updatedAt: new Date() } : c
    );
  }

  updateUnreadCount(id: string, count: number): void {
    this.conversations = this.conversations.map((c) =>
      c.id === id ? { ...c, unreadCount: count } : c
    );
  }

  updateLastMessage(id: string, message: string): void {
    this.conversations = this.conversations.map((c) =>
      c.id === id ? { ...c, lastMessage: message, updatedAt: new Date() } : c
    );
  }

  reset(): void {
    this.conversations = [];
    this.currentId = null;
  }

  getCurrentConversation(): Conversation | undefined {
    return this.conversations.find((c) => c.id === this.currentId);
  }

  getSortedConversations(): Conversation[] {
    return [...this.conversations].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });
  }
}

// 导出单例（用于 React Hook）
const conversationStore = new ConversationStore();

/**
 * 用于测试的工厂函数
 */
export function createConversationStore(): ConversationStore {
  return new ConversationStore();
}

/**
 * 获取 store 实例（React 组件中使用）
 */
export function useConversationStore(): ConversationStore {
  return conversationStore;
}

export { conversationStore };
export default conversationStore;
