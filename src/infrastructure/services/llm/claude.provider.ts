/**
 * Claude Provider 实现
 *
 * Anthropic Claude API 的 LLM 提供商实现
 */

import type { ILLMProvider, LLMResponse, StreamEvent } from '../llm.service';

/**
 * Claude API 响应格式
 */
interface ClaudeApiResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Claude SSE 事件格式
 */
interface ClaudeStreamEvent {
  type: string;
  delta?: {
    text?: string;
  };
  content_block?: {
    text?: string;
  };
}

/**
 * Claude Provider 实现
 */
export class ClaudeProvider implements ILLMProvider {
  readonly name = 'Claude';
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.anthropic.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 发送聊天请求
   */
  async chat(
    messages: Array<{ role: string; content: string }>,
    config: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    const { systemMessages, userMessages } = this.separateMessages(messages);

    const requestBody = {
      model: config.model || 'claude-3-sonnet-20240229',
      messages: userMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      system: systemMessages.map((m) => m.content).join('\n'),
      max_tokens: config.maxTokens || 1024,
      temperature: config.temperature ?? 0.7,
    };

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as ClaudeApiResponse;
    const latency = Date.now() - startTime;

    return {
      content: data.content[0]?.text || '',
      usage: {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
      },
      latency,
    };
  }

  /**
   * 流式聊天
   */
  async chatStream(
    messages: Array<{ role: string; content: string }>,
    config: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    },
    onEvent: (event: StreamEvent) => void
  ): Promise<void> {
    const { systemMessages, userMessages } = this.separateMessages(messages);

    // 生成专家 ID（从消息中推断或使用默认值）
    const expertId = this.extractExpertId(messages) || 'claude-expert';

    const requestBody = {
      model: config.model || 'claude-3-sonnet-20240229',
      messages: userMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      system: systemMessages.map((m) => m.content).join('\n'),
      max_tokens: config.maxTokens || 1024,
      temperature: config.temperature ?? 0.7,
      stream: true,
    };

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    onEvent({ type: 'start', expertId });

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    try {
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const event = JSON.parse(data) as ClaudeStreamEvent;

              if (event.type === 'content_block_delta' && event.delta?.text) {
                onEvent({
                  type: 'delta',
                  expertId,
                  content: event.delta.text,
                });
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      onEvent({ type: 'complete', expertId });
    } catch (error) {
      onEvent({
        type: 'error',
        expertId,
        error: error instanceof Error ? error.message : 'Stream error',
      });
    } finally {
      if (typeof reader.releaseLock === 'function') {
        reader.releaseLock();
      }
    }
  }

  /**
   * 估算 token 数
   * 简单估算：英文按空格分割，中文按字符
   */
  estimateTokens(text: string): number {
    if (!text) return 0;

    // 英文单词估算（按空格分割）
    const englishTokens = text.split(/\s+/).filter((w) => w.length > 0).length;

    // 中文字符估算（每个汉字约 1.5 个 token）
    const chineseChars = text.replace(/[\x00-\x7F]/g, '').length;
    const chineseTokens = Math.ceil(chineseChars * 1.5);

    // 其他字符（标点符号等）
    const otherChars = text.length - text.replace(/[^\x00-\x7F\u4e00-\u9fa5]/g, '').length;
    const otherTokens = Math.ceil(otherChars * 0.5);

    return englishTokens + chineseTokens + otherTokens;
  }

  /**
   * 分离 system 消息和 user/assistant 消息
   */
  private separateMessages(messages: Array<{ role: string; content: string }>): {
    systemMessages: Array<{ role: string; content: string }>;
    userMessages: Array<{ role: string; content: string }>;
  } {
    const systemMessages: Array<{ role: string; content: string }> = [];
    const userMessages: Array<{ role: string; content: string }> = [];

    for (const message of messages) {
      if (message.role === 'system') {
        systemMessages.push(message);
      } else {
        userMessages.push(message);
      }
    }

    return { systemMessages, userMessages };
  }

  /**
   * 从消息中提取专家 ID
   */
  private extractExpertId(messages: Array<{ role: string; content: string }>): string | null {
    // 尝试从 system prompt 中提取专家名称
    const systemMessage = messages.find((m) => m.role === 'system');
    if (systemMessage) {
      // 简单启发式：使用 system prompt 的前几个字符作为 ID
      const hash = systemMessage.content.slice(0, 20).replace(/\s+/g, '-');
      return `expert-${hash}`;
    }
    return null;
  }
}
