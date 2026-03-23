/**
 * 应用层入口
 *
 * 协调用例和业务流程
 */

// 应用层仅依赖领域层
import type { Entity, Repository } from '@domain';

/**
 * 用例接口
 */
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

/**
 * 应用服务
 */
export class ApplicationService implements UseCase<unknown, unknown> {
  constructor(private readonly repository: Repository) {}

  async execute(input: unknown): Promise<unknown> {
    // 业务流程协调
    return this.repository.findAll();
  }
}