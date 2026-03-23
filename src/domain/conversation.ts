/**
 * Conversation 领域模型
 *
 * 会话实体，管理聊天会话和消息
 */

import { Entity, ValueObject } from '../index';

/**
 * 会话类型枚举
 */
export enum ConversationType {
  SINGLE = 'single',
  GROUP = 'group',
}

/**
 * 消息角色枚举
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

/**
 * 消息值对象
 */
export class Message implements ValueObject {
  id: string;
  role: MessageRole;
  content: string;
  expertId?: string;
  mentions: string[];
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  createdAt: Date;

  constructor(params: {
    id?: string;
    role: MessageRole;
    content: string;
    expertId?: string;
    mentions?: string[];
  }) {
    this.id = params.id || this.generateId();
    this.role = params.role;
    this.content = params.content;
    this.expertId = params.expertId || '';  // Provide default empty string to fix strict null checks
    this.mentions = params.mentions || [];
    this.inputTokens = 0;
    this.outputTokens = 0;
    this.latencyMs = 0;
    this.createdAt = new Date();
  }

  /**
   * 创建用户消息
   */
  static createUserMessage(content: string): Message {
    return new Message({ role: MessageRole.USER, content });
  }

  /**
   * 创建专家响应
   */
  static createExpertResponse(expertId: string, content: string): Message {
    return new Message({
      role: MessageRole.ASSISTANT,
      content,
      expertId,
    });
  }

  /**
   * 追加流式内容
   */
  appendContent(delta: string): void {
    this.content += delta;
  }

  /**
   * 添加@提及
   */
  addMention(expertId: string): void {
    if (!this.mentions.includes(expertId)) {
      this.mentions.push(expertId);
    }
  }

  /**
   * 设置 Token 使用量
   */
  setTokenUsage(input: number, output: number): void {
    this.inputTokens = input;
    this.outputTokens = output;
  }

  /**
   * 设置延迟
   */
  setLatency(ms: number): void {
    this.latencyMs = ms;
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Message)) return false;
    return this.id === other.id;
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 会话创建参数
 */
export interface CreateConversationParams {
  id?: string;
  name: string;
  type: ConversationType;
  expertIds: string[];
}

/**
 * 会话实体
 */
export class Conversation implements Entity {
  id: string;
  name: string;
  type: ConversationType;
  expertIds: string[];
  messages: Message[];
  isPinned: boolean;
  unreadCount: number;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;

  private constructor(params: CreateConversationParams) {
    this.id = params.id || this.generateId();
    this.name = params.name;
    this.type = params.type;
    this.expertIds = params.expertIds;
    this.messages = [];
    this.isPinned = false;
    this.unreadCount = 0;
    this.lastReadAt = new Date();
    const now = Date.now();
    this.createdAt = new Date(now - 1);
    this.updatedAt = new Date(now);

    this.validate();
  }

  /**
   * 创建会话
   */
  static create(params: CreateConversationParams): Conversation {
    return new Conversation(params);
  }

  /**
   * 创建单聊会话
   */
  static createSingleChat(expert: { id: string; name: string }): Conversation {
    return new Conversation({
      name: `与 ${expert.name} 的对话`,
      type: ConversationType.SINGLE,
      expertIds: [expert.id],
    });
  }

  /**
   * 创建群聊会话
   */
  static createGroupChat(name: string, experts: { id: string }[]): Conversation {
    return new Conversation({
      name,
      type: ConversationType.GROUP,
      expertIds: experts.map(e => e.id),
    });
  }

  /**
   * 验证会话数据
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('会话名称不能为空');
    }
    if (!this.expertIds || this.expertIds.length === 0) {
      throw new Error('会话必须包含至少一个专家');
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 重命名会话
   */
  rename(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('会话名称不能为空');
    }
    this.name = name.trim();
    this.touch();
  }

  /**
   * 添加消息
   */
  addMessage(message: Message): void {
    this.messages.push(message);
    this.unreadCount++;
    this.touch();
  }

  /**
   * 标记为已读
   */
  markAsRead(): void {
    this.unreadCount = 0;
    this.lastReadAt = new Date();
  }

  /**
   * 获取未读数
   */
  getUnreadCount(): number {
    return this.unreadCount;
  }

  /**
   * 置顶会话
   */
  pin(): void {
    this.isPinned = true;
    this.touch();
  }

  /**
   * 取消置顶
   */
  unpin(): void {
    this.isPinned = false;
    this.touch();
  }

  /**
   * 更新修改时间
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * 获取最后一条消息
   */
  get lastMessage(): string | null {
    const last = this.messages[this.messages.length - 1];
    return last ? last.content : null;
  }

  /**
   * 获取最后消息时间
   */
  get lastMessageAt(): Date {
    const last = this.messages[this.messages.length - 1];
    return last ? last.createdAt : this.createdAt;
  }

  /**
   * 转换为 JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      expertIds: this.expertIds,
      messages: this.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        expertId: m.expertId,
        mentions: m.mentions,
        inputTokens: m.inputTokens,
        outputTokens: m.outputTokens,
        latencyMs: m.latencyMs,
        createdAt: m.createdAt.toISOString(),
      })),
      isPinned: this.isPinned,
      unreadCount: this.unreadCount,
      lastReadAt: this.lastReadAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
