/**
 * SQLite Conversation Repository
 *
 * 使用 sql.js 的 SQLite 实现
 */

import {
  Conversation,
  ConversationType,
  Message,
  MessageRole,
} from '@domain/conversation';
import type { IConversationRepository } from '../conversation.repository';

interface Database {
  run(sql: string, params?: unknown[]): void;
  exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
  get(sql: string, params?: unknown[]): unknown;
  all(sql: string, params?: unknown[]): unknown[];
  close(): void;
  export(): Uint8Array;
}

/**
 * SQLite Conversation Repository 实现
 */
export class SQLiteConversationRepository implements IConversationRepository {
  private db: Database | null = null;
  private initialized = false;

  constructor(private dbPath: string = ':memory:') {}

  /**
   * 初始化数据库
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });

    this.db = new SQL.Database() as unknown as Database;
    await this.createTables();
    this.initialized = true;
  }

  /**
   * 创建表结构
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        expert_ids TEXT NOT NULL,
        is_pinned INTEGER DEFAULT 0,
        unread_count INTEGER DEFAULT 0,
        last_read_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        expert_id TEXT,
        mentions TEXT,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        latency_ms INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_conversations_pinned ON conversations(is_pinned) WHERE is_pinned = 1;
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    `);
  }

  /**
   * 将 Conversation 转换为数据库记录
   */
  private conversationToRecord(conv: Conversation): Record<string, unknown> {
    return {
      id: conv.id,
      name: conv.name,
      type: conv.type,
      expert_ids: JSON.stringify(conv.expertIds),
      is_pinned: conv.isPinned ? 1 : 0,
      unread_count: conv.unreadCount,
      last_read_at: conv.lastReadAt.toISOString(),
      created_at: conv.createdAt.toISOString(),
      updated_at: conv.updatedAt.toISOString(),
    };
  }

  /**
   * 将 Message 转换为数据库记录
   */
  private messageToRecord(msg: Message, conversationId: string): Record<string, unknown> {
    return {
      id: msg.id,
      conversation_id: conversationId,
      role: msg.role,
      content: msg.content,
      expert_id: msg.expertId || null,
      mentions: JSON.stringify(msg.mentions),
      input_tokens: msg.inputTokens,
      output_tokens: msg.outputTokens,
      latency_ms: msg.latencyMs,
      created_at: msg.createdAt.toISOString(),
    };
  }

  /**
   * 将数据库记录转换为 Conversation
   */
  private conversationFromRecord(record: Record<string, unknown>): Conversation {
    const conversation = Conversation.create({
      id: record.id as string,
      name: record.name as string,
      type: record.type as ConversationType,
      expertIds: JSON.parse(record.expert_ids as string),
    });

    // 恢复状态
    if (record.is_pinned) conversation.pin();
    conversation.unreadCount = record.unread_count as number;
    conversation.lastReadAt = new Date(record.last_read_at as string);
    conversation.createdAt = new Date(record.created_at as string);
    conversation.updatedAt = new Date(record.updated_at as string);

    return conversation;
  }

  /**
   * 将数据库记录转换为 Message
   */
  private messageFromRecord(record: Record<string, unknown>): Message {
    const message = new Message({
      id: record.id as string,
      role: record.role as MessageRole,
      content: record.content as string,
      expertId: record.expert_id as string | undefined,
      mentions: JSON.parse((record.mentions as string) || '[]'),
    });

    message.inputTokens = record.input_tokens as number;
    message.outputTokens = record.output_tokens as number;
    message.latencyMs = record.latency_ms as number;
    message.createdAt = new Date(record.created_at as string);

    return message;
  }

  async findById(id: string): Promise<Conversation | null> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const record = this.db.get(
      'SELECT * FROM conversations WHERE id = ?',
      [id]
    ) as Record<string, unknown> | undefined;

    if (!record) return null;

    const conversation = this.conversationFromRecord(record);

    // 加载消息
    const messages = this.db.all(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [id]
    ) as Record<string, unknown>[];

    conversation.messages = messages.map((m) => this.messageFromRecord(m));

    return conversation;
  }

  async findAll(): Promise<Conversation[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const records = this.db.all(
      'SELECT * FROM conversations ORDER BY is_pinned DESC, updated_at DESC'
    ) as Record<string, unknown>[];

    return records.map((r) => this.conversationFromRecord(r));
  }

  async save(conversation: Conversation): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const record = this.conversationToRecord(conversation);

    this.db.run(
      `
      INSERT OR REPLACE INTO conversations (
        id, name, type, expert_ids, is_pinned, unread_count,
        last_read_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        record.id,
        record.name,
        record.type,
        record.expert_ids,
        record.is_pinned,
        record.unread_count,
        record.last_read_at,
        record.created_at,
        record.updated_at,
      ]
    );

    // 保存消息
    for (const message of conversation.messages) {
      const msgRecord = this.messageToRecord(message, conversation.id);
      this.db.run(
        `
        INSERT OR REPLACE INTO messages (
          id, conversation_id, role, content, expert_id, mentions,
          input_tokens, output_tokens, latency_ms, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          msgRecord.id,
          msgRecord.conversation_id,
          msgRecord.role,
          msgRecord.content,
          msgRecord.expert_id,
          msgRecord.mentions,
          msgRecord.input_tokens,
          msgRecord.output_tokens,
          msgRecord.latency_ms,
          msgRecord.created_at,
        ]
      );
    }
  }

  async delete(id: string): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    // 外键约束会自动删除关联的消息
    this.db.run('DELETE FROM conversations WHERE id = ?', [id]);
  }

  async findByName(name: string): Promise<Conversation[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const records = this.db.all(
      'SELECT * FROM conversations WHERE name LIKE ? ORDER BY updated_at DESC',
      [`%${name}%`]
    ) as Record<string, unknown>[];

    return records.map((r) => this.conversationFromRecord(r));
  }

  async findPinned(): Promise<Conversation[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const records = this.db.all(
      'SELECT * FROM conversations WHERE is_pinned = 1 ORDER BY updated_at DESC'
    ) as Record<string, unknown>[];

    return records.map((r) => this.conversationFromRecord(r));
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }

  /**
   * 导出数据库
   */
  async export(): Promise<Uint8Array> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return (this.db as unknown as { export(): Uint8Array }).export();
  }

  /**
   * 导入数据库
   */
  async import(data: Uint8Array): Promise<void> {
    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });

    this.db = new SQL.Database(data) as unknown as Database;
    this.initialized = true;
  }
}
