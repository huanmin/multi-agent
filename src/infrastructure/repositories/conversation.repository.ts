/**
 * Conversation 仓储接口
 *
 * 领域层定义，基础设施层实现
 */

import type { Conversation } from '@domain/conversation';

/**
 * 会话仓储接口
 */
export interface IConversationRepository {
  /**
   * 根据 ID 查找会话
   */
  findById(id: string): Promise<Conversation | null>;

  /**
   * 查找所有会话
   */
  findAll(): Promise<Conversation[]>;

  /**
   * 保存会话
   */
  save(conversation: Conversation): Promise<void>;

  /**
   * 删除会话
   */
  delete(id: string): Promise<void>;

  /**
   * 根据名称搜索会话
   */
  findByName(name: string): Promise<Conversation[]>;

  /**
   * 获取置顶会话
   */
  findPinned(): Promise<Conversation[]>;
}

/**
 * 内存会话仓储实现（用于测试和开发）
 */
export class InMemoryConversationRepository implements IConversationRepository {
  private conversations: Map<string, Conversation> = new Map();

  async findById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  async findAll(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async save(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation);
  }

  async delete(id: string): Promise<void> {
    this.conversations.delete(id);
  }

  async findByName(name: string): Promise<Conversation[]> {
    const keyword = name.toLowerCase();
    return Array.from(this.conversations.values()).filter((c) =>
      c.name.toLowerCase().includes(keyword)
    );
  }

  async findPinned(): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter((c) => c.isPinned)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * 清空仓储（测试辅助方法）
   */
  clear(): void {
    this.conversations.clear();
  }
}
