/**
 * 领域层入口
 *
 * 核心业务逻辑，不依赖任何外层
 */

/**
 * 实体接口
 */
export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 值对象
 */
export interface ValueObject {
  equals(other: unknown): boolean;
}

/**
 * 仓储接口
 */
export interface Repository<T extends Entity = Entity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * 领域服务
 */
export class DomainService {
  // 领域逻辑
}

/**
 * 领域事件
 */
export interface DomainEvent {
  occurredAt: Date;
  eventType: string;
}