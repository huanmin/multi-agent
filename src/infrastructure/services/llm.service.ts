/**
 * LLM 服务接口
 *
 * 定义与 LLM 提供商交互的抽象
 */

import { Expert } from '@domain/expert';

/**
 * LLM 响应
 */
export interface LLMResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  latency: number;
}

/**
 * 流式响应事件
 */
export interface StreamEvent {
  type: 'start' | 'delta' | 'complete' | 'error';
  expertId: string;
  content?: string;
  error?: string;
}

/**
 * LLM 提供商接口
 */
export interface ILLMProvider {
  readonly name: string;

  /**
   * 发送聊天请求
   */
  chat(messages: Array<{ role: string; content: string }>, config: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<LLMResponse>;

  /**
   * 流式聊天
   */
  chatStream(
    messages: Array<{ role: string; content: string }>,
    config: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    },
    onEvent: (event: StreamEvent) => void
  ): Promise<void>;

  /**
   * 估算 token 数
   */
  estimateTokens(text: string): number;
}

/**
 * 并行 LLM 调用服务
 */
export class ParallelLLMService {
  private providers: Map<string, ILLMProvider> = new Map();

  /**
   * 注册提供商
   */
  registerProvider(name: string, provider: ILLMProvider): void {
    this.providers.set(name, provider);
  }

  /**
   * 并行调用多个专家
   */
  async parallelChat(
    experts: Expert[],
    userMessage: string,
    context: Array<{ role: string; content: string }>,
    onEvent: (event: StreamEvent) => void
  ): Promise<void> {
    const promises = experts.map(async (expert) => {
      const provider = this.providers.get('default'); // 简化实现
      if (!provider) {
        onEvent({
          type: 'error',
          expertId: expert.id,
          error: '未找到 LLM 提供商',
        });
        return;
      }

      onEvent({ type: 'start', expertId: expert.id });

      try {
        const messages = [
          { role: 'system', content: expert.systemPrompt },
          ...context,
          { role: 'user', content: userMessage },
        ];

        await provider.chatStream(
          messages,
          {
            model: 'claude-sonnet-4-6',
            temperature: expert.temperature,
            maxTokens: expert.maxTokens,
          },
          (event) => {
            onEvent({
              ...event,
              expertId: expert.id,
            });
          }
        );
      } catch (error) {
        onEvent({
          type: 'error',
          expertId: expert.id,
          error: error instanceof Error ? error.message : '未知错误',
        });
      }
    });

    await Promise.all(promises);
  }

  /**
   * 调用单个专家
   */
  async singleChat(
    expert: Expert,
    userMessage: string,
    context: Array<{ role: string; content: string }>,
    onEvent: (event: StreamEvent) => void
  ): Promise<void> {
    await this.parallelChat([expert], userMessage, context, onEvent);
  }
}
