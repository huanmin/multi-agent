/**
 * LocalStorage Conversation Repository
 *
 * 使用 localStorage 的持久化实现
 */

import { Conversation, ConversationType, Message, MessageRole } from '@domain/conversation';
import type { IConversationRepository } from '../conversation.repository';

/**
 * LocalStorage Conversation Repository 实现
 */
export class LocalStorageConversationRepository implements IConversationRepository {
  private readonly storageKey = 'multi-agent:conversations';
  private cache: Map<string, Conversation> | null = null;

  /**
   * 从 localStorage 加载数据
   */
  private loadFromStorage(): Map<string, Conversation> {
    if (this.cache) return this.cache;

    const data = localStorage.getItem(this.storageKey);
    const map = new Map<string, Conversation>();

    if (data) {
      try {
        const records = JSON.parse(data) as Array<Record<string, unknown>>;
        for (const record of records) {
          const conversation = this.fromRecord(record);
          map.set(conversation.id, conversation);
        }
      } catch {
        // 解析失败时返回空 map
      }
    }

    this.cache = map;
    return map;
  }

  /**
   * 保存到 localStorage
   */
  private saveToStorage(): void {
    if (!this.cache) return;

    const records = Array.from(this.cache.values()).map((c) => this.toRecord(c));
    localStorage.setItem(this.storageKey, JSON.stringify(records));
  }

  /**
   * 将 Conversation 转换为可序列化记录
   */
  private toRecord(conv: Conversation): Record<string, unknown> {
    return {
      id: conv.id,
      name: conv.name,
      type: conv.type,
      expertIds: conv.expertIds,
      messages: conv.messages.map((m) => this.messageToRecord(m)),
      isPinned: conv.isPinned,
      unreadCount: conv.unreadCount,
      lastReadAt: conv.lastReadAt.toISOString(),
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
    };
  }

  /**
   * 将 Message 转换为可序列化记录
   */
  private messageToRecord(msg: Message): Record<string, unknown> {
    return {
      id: msg.id,
      role: msg.role,
      content: msg.content,
      expertId: msg.expertId,
      mentions: msg.mentions,
      inputTokens: msg.inputTokens,
      outputTokens: msg.outputTokens,
      latencyMs: msg.latencyMs,
      createdAt: msg.createdAt.toISOString(),
    };
  }

  /**
   * 将记录转换为 Conversation
   */
  private fromRecord(record: Record<string, unknown>): Conversation {
    const conversation = Conversation.create({
      id: record.id as string,
      name: record.name as string,
      type: record.type as ConversationType,
      expertIds: record.expertIds as string[],
    });

    // 恢复消息
    const messageRecords = (record.messages || []) as Array<Record<string, unknown>>;
    conversation.messages = messageRecords.map((m) => this.messageFromRecord(m));

    // 恢复状态
    if (record.isPinned) conversation.pin();
    conversation.unreadCount = (record.unreadCount as number) || 0;
    conversation.lastReadAt = new Date(record.lastReadAt as string);
    conversation.createdAt = new Date(record.createdAt as string);
    conversation.updatedAt = new Date(record.updatedAt as string);

    return conversation;
  }

  /**
   * 将记录转换为 Message
   */
  private messageFromRecord(record: Record<string, unknown>): Message {
    const message = new Message({
      id: record.id as string,
      role: record.role as MessageRole,
      content: record.content as string,
      expertId: record.expertId as string | undefined,
      mentions: (record.mentions as string[]) || [],
    });

    message.inputTokens = (record.inputTokens as number) || 0;
    message.outputTokens = (record.outputTokens as number) || 0;
    message.latencyMs = (record.latencyMs as number) || 0;
    message.createdAt = new Date(record.createdAt as string);

    return message;
  }

  async findById(id: string): Promise<Conversation | null> {
    const map = this.loadFromStorage();
    return map.get(id) || null;
  }

  async findAll(): Promise<Conversation[]> {
    const map = this.loadFromStorage();
    return Array.from(map.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async save(conversation: Conversation): Promise<void> {
    const map = this.loadFromStorage();
    map.set(conversation.id, conversation);
    this.saveToStorage();
  }

  async delete(id: string): Promise<void> {
    const map = this.loadFromStorage();
    map.delete(id);
    this.saveToStorage();
  }

  async findByName(name: string): Promise<Conversation[]> {
    const map = this.loadFromStorage();
    const keyword = name.toLowerCase();
    return Array.from(map.values()).filter((c) =>
      c.name.toLowerCase().includes(keyword)
    );
  }

  async findPinned(): Promise<Conversation[]> {
    const map = this.loadFromStorage();
    return Array.from(map.values())
      .filter((c) => c.isPinned)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * 清空所有数据
   */
  async clear(): Promise<void> {
    this.cache = new Map();
    localStorage.removeItem(this.storageKey);
  }
}
