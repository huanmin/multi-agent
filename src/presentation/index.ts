/**
 * 表现层入口
 *
 * 处理外部请求和响应
 */

// 表现层仅依赖应用层
import type { UseCase } from '@application/use-case';

export interface Presenter<T> {
  present(data: T): Response;
}

export interface Request {
  // 请求定义
}

export interface Response {
  // 响应定义
}

/**
 * API 控制器
 */
export class Controller {
  constructor(private readonly useCase: UseCase) {}

  async handle(request: Request): Promise<Response> {
    // 转换请求 -> 调用用例 -> 转换响应
    return this.useCase.execute(request);
  }
}