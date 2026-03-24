/**
 * SQLite Expert Repository
 *
 * 使用 sql.js 的 SQLite 实现
 * 可用于浏览器环境和测试
 */

import { Expert, ExpertRole } from '@domain/expert';
import type { IExpertRepository } from '../expert.repository';

interface Database {
  exec(sql: string): void;
    run(sql: string, params?: unknown[]): void;
    get(sql: string, params?: unknown[]): unknown;
    all(sql: string, params?: unknown[]): unknown[];
    close(): void;
}

/**
 * SQLite Expert Repository 实现
 */
export class SQLiteExpertRepository implements IExpertRepository {
  private db: Database | null = null;
  private initialized = false;

  constructor(private dbPath: string = ':memory:') {}

  /**
   * 初始化数据库
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // 动态导入 sql.js（只在需要时加载）
    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });

    this.db = new SQL.Database();
    await this.createTables();
    this.initialized = true;
  }

  /**
   * 创建表结构
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS experts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role_code TEXT NOT NULL,
        role_name TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
        avatar TEXT,
        tags TEXT,
        temperature REAL DEFAULT 0.7,
        max_tokens INTEGER DEFAULT 2048,
        is_active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_experts_name ON experts(name);
      CREATE INDEX IF NOT EXISTS idx_experts_role ON experts(role_code);
    `);
  }

  /**
   * 将 Expert 转换为数据库记录
   */
  private toRecord(expert: Expert): Record<string, unknown> {
    return {
      id: expert.id,
      name: expert.name,
      role_code: expert.role.code,
      role_name: expert.role.name,
      system_prompt: expert.systemPrompt,
      avatar: expert.avatar || null,
      tags: JSON.stringify(expert.tags),
      temperature: expert.temperature,
      max_tokens: expert.maxTokens,
      is_active: expert.isActive ? 1 : 0,
      created_at: expert.createdAt.toISOString(),
      updated_at: expert.updatedAt.toISOString(),
    };
  }

  /**
   * 将数据库记录转换为 Expert
   */
  private fromRecord(record: Record<string, unknown>): Expert {
    const expert = Expert.create({
      id: record.id as string,
      name: record.name as string,
      role: this.resolveRole(
        record.role_code as string,
        record.role_name as string
      ),
      systemPrompt: record.system_prompt as string,
      avatar: record.avatar as string | undefined,
      tags: JSON.parse((record.tags as string) || '[]'),
      temperature: record.temperature as number,
      maxTokens: record.max_tokens as number,
    });

    // 恢复时间戳
    expert.createdAt = new Date(record.created_at as string);
    expert.updatedAt = new Date(record.updated_at as string);

    // 恢复状态
    if (!(record.is_active as number)) {
      expert.deactivate();
    }

    return expert;
  }

  /**
   * 解析角色
   */
  private resolveRole(code: string, name: string): ExpertRole {
    switch (code.toUpperCase()) {
      case 'ARCHITECT':
        return ExpertRole.ARCHITECT();
      case 'FRONTEND':
        return ExpertRole.FRONTEND();
      case 'BACKEND':
        return ExpertRole.BACKEND();
      case 'SECURITY':
        return ExpertRole.SECURITY();
      case 'CODE_REVIEWER':
        return ExpertRole.CODE_REVIEWER();
      case 'QA':
        return ExpertRole.QA();
      default:
        return ExpertRole.CUSTOM(name);
    }
  }

  async findById(id: string): Promise<Expert | null> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.get(
      'SELECT * FROM experts WHERE id = ?',
      [id]
    ) as Record<string, unknown> | undefined;

    return result ? this.fromRecord(result) : null;
  }

  async findAll(): Promise<Expert[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const results = this.db.all(
      'SELECT * FROM experts ORDER BY updated_at DESC'
    ) as Record<string, unknown>[];

    return results.map((r) => this.fromRecord(r));
  }

  async save(expert: Expert): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const record = this.toRecord(expert);

    this.db.run(
      `
      INSERT OR REPLACE INTO experts (
        id, name, role_code, role_name, system_prompt, avatar, tags,
        temperature, max_tokens, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        record.id,
        record.name,
        record.role_code,
        record.role_name,
        record.system_prompt,
        record.avatar,
        record.tags,
        record.temperature,
        record.max_tokens,
        record.is_active,
        record.created_at,
        record.updated_at,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM experts WHERE id = ?', [id]);
  }

  async findByName(name: string): Promise<Expert[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const results = this.db.all(
      'SELECT * FROM experts WHERE name LIKE ? ORDER BY name',
      [`%${name}%`]
    ) as Record<string, unknown>[];

    return results.map((r) => this.fromRecord(r));
  }

  async findByTags(tags: string[]): Promise<Expert[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    // SQLite 不支持数组参数，使用 OR 连接多个 LIKE 条件
    const conditions = tags.map(() => 'tags LIKE ?').join(' OR ');
    const params = tags.map((tag) => `%${tag}%`);

    const results = this.db.all(
      `SELECT * FROM experts WHERE ${conditions}`,
      params
    ) as Record<string, unknown>[];

    return results.map((r) => this.fromRecord(r));
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
   * 导出数据库为 Uint8Array（用于持久化）
   */
  async export(): Promise<Uint8Array> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    // sql.js 的 Database 实例有 export 方法
    return (this.db as unknown as { export(): Uint8Array }).export();
  }

  /**
   * 从 Uint8Array 导入数据库
   */
  async import(data: Uint8Array): Promise<void> {
    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });

    this.db = new SQL.Database(data);
    this.initialized = true;
  }
}
