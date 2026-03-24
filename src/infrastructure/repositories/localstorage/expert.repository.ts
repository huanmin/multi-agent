/**
 * LocalStorage Expert Repository
 *
 * 使用 localStorage 的持久化实现
 * 适合 Tauri 桌面应用
 */

import { Expert, ExpertRole } from '@domain/expert';
import type { IExpertRepository } from '../expert.repository';

/**
 * LocalStorage Expert Repository 实现
 */
export class LocalStorageExpertRepository implements IExpertRepository {
  private readonly storageKey = 'multi-agent:experts';
  private cache: Map<string, Expert> | null = null;

  /**
   * 从 localStorage 加载数据
   */
  private loadFromStorage(): Map<string, Expert> {
    if (this.cache) return this.cache;

    const data = localStorage.getItem(this.storageKey);
    const map = new Map<string, Expert>();

    if (data) {
      try {
        const records = JSON.parse(data) as Array<Record<string, unknown>>;
        for (const record of records) {
          const expert = this.fromRecord(record);
          map.set(expert.id, expert);
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

    const records = Array.from(this.cache.values()).map((e) => this.toRecord(e));
    localStorage.setItem(this.storageKey, JSON.stringify(records));
  }

  /**
   * 将 Expert 转换为可序列化记录
   */
  private toRecord(expert: Expert): Record<string, unknown> {
    return {
      id: expert.id,
      name: expert.name,
      role: {
        code: expert.role.code,
        name: expert.role.name,
      },
      systemPrompt: expert.systemPrompt,
      avatar: expert.avatar,
      tags: expert.tags,
      temperature: expert.temperature,
      maxTokens: expert.maxTokens,
      isActive: expert.isActive,
      createdAt: expert.createdAt.toISOString(),
      updatedAt: expert.updatedAt.toISOString(),
    };
  }

  /**
   * 将记录转换为 Expert
   */
  private fromRecord(record: Record<string, unknown>): Expert {
    const roleData = record.role as { code: string; name: string };
    const expert = Expert.create({
      id: record.id as string,
      name: record.name as string,
      role: this.resolveRole(roleData.code, roleData.name),
      systemPrompt: record.systemPrompt as string,
      avatar: record.avatar as string | undefined,
      tags: record.tags as string[],
      temperature: record.temperature as number,
      maxTokens: record.maxTokens as number,
    });

    expert.createdAt = new Date(record.createdAt as string);
    expert.updatedAt = new Date(record.updatedAt as string);

    if (!(record.isActive as boolean)) {
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
    const map = this.loadFromStorage();
    return map.get(id) || null;
  }

  async findAll(): Promise<Expert[]> {
    const map = this.loadFromStorage();
    return Array.from(map.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async save(expert: Expert): Promise<void> {
    const map = this.loadFromStorage();
    map.set(expert.id, expert);
    this.saveToStorage();
  }

  async delete(id: string): Promise<void> {
    const map = this.loadFromStorage();
    map.delete(id);
    this.saveToStorage();
  }

  async findByName(name: string): Promise<Expert[]> {
    const map = this.loadFromStorage();
    const keyword = name.toLowerCase();
    return Array.from(map.values()).filter((e) =>
      e.name.toLowerCase().includes(keyword)
    );
  }

  async findByTags(tags: string[]): Promise<Expert[]> {
    const map = this.loadFromStorage();
    return Array.from(map.values()).filter((e) =>
      tags.some((tag) => e.tags.includes(tag))
    );
  }

  /**
   * 清空所有数据
   */
  async clear(): Promise<void> {
    this.cache = new Map();
    localStorage.removeItem(this.storageKey);
  }
}
