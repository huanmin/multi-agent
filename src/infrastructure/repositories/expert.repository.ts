/**
 * Expert 仓储接口
 *
 * 定义 Expert 数据持久化的抽象
 */

import { Expert } from '@domain/expert';

/**
 * Expert 仓储接口
 */
export interface IExpertRepository {
  /**
   * 根据 ID 查找专家
   */
  findById(id: string): Promise<Expert | null>;

  /**
   * 查找所有专家
   */
  findAll(): Promise<Expert[]>;

  /**
   * 保存专家（创建或更新）
   */
  save(expert: Expert): Promise<void>;

  /**
   * 删除专家
   */
  delete(id: string): Promise<void>;

  /**
   * 根据名称搜索专家
   */
  findByName(keyword: string): Promise<Expert[]>;

  /**
   * 根据标签搜索专家
   */
  findByTags(tags: string[]): Promise<Expert[]>;
}

/**
 * 内存 Expert 仓储实现
 * 用于测试和开发
 */
export class InMemoryExpertRepository implements IExpertRepository {
  private experts: Map<string, Expert> = new Map();

  async findById(id: string): Promise<Expert | null> {
    const expert = this.experts.get(id);
    return expert ? Expert.fromJSON(expert.toJSON()) : null;
  }

  async findAll(): Promise<Expert[]> {
    return Array.from(this.experts.values()).map(e => Expert.fromJSON(e.toJSON()));
  }

  async save(expert: Expert): Promise<void> {
    this.experts.set(expert.id, Expert.fromJSON(expert.toJSON()));
  }

  async delete(id: string): Promise<void> {
    this.experts.delete(id);
  }

  async findByName(keyword: string): Promise<Expert[]> {
    const all = await this.findAll();
    return all.filter(e => e.name.toLowerCase().includes(keyword.toLowerCase()));
  }

  async findByTags(tags: string[]): Promise<Expert[]> {
    const all = await this.findAll();
    return all.filter(e => tags.some(tag => e.hasTag(tag)));
  }

  /**
   * 清空所有数据（仅用于测试）
   */
  clear(): void {
    this.experts.clear();
  }

  /**
   * 获取数量（仅用于测试）
   */
  size(): number {
    return this.experts.size;
  }
}
