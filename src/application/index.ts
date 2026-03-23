/**
 * 应用层入口
 *
 * 协调用例和业务流程
 */

/**
 * 用例接口
 */
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

/**
 * 应用服务
 */
export class ApplicationService<T, R> implements UseCase<T, R> {
  async execute(_input: T): Promise<R> {
    throw new Error('Not implemented');
  }
}