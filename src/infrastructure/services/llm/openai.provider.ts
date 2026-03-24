/**
 * OpenAI Provider 实现
 *
 * OpenAI API 的 LLM 提供商实现
 */

import type { ILLMProvider, LLMResponse, StreamEvent } from '../llm.service';

/**
 * OpenAI API 响应格式
 */
interface OpenAIApiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI SSE 事件格式
 */
interface OpenAIStreamEvent {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: Array<{
    index?: number;
    delta?: {
      role?: string;
      content?: string;
    };
    finish_reason?: string | null;
  }>;
}

/**
 * OpenAI Provider 实现
 */
export class OpenAIProvider implements ILLMProvider {
  readonly name = 'OpenAI';
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openai.com/v1';

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

    const requestBody = {
      model: config.model || 'gpt-4',
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: config.maxTokens || 1024,
      temperature: config.temperature ?? 0.7,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as OpenAIApiResponse;
    const latency = Date.now() - startTime;

    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
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
    const expertId = this.extractExpertId(messages) || 'openai-expert';

    const requestBody = {
      model: config.model || 'gpt-4',
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: config.maxTokens || 1024,
      temperature: config.temperature ?? 0.7,
      stream: true,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
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
              const event = JSON.parse(data) as OpenAIStreamEvent;

              const content = event.choices?.[0]?.delta?.content;
              if (content) {
                onEvent({
                  type: 'delta',
                  expertId,
                  content,
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
   * 使用与 ClaudeProvider 相同的算法
   */
  estimateTokens(text: string): number {
    if (!text) return 0;

    // 英文单词估算（按空格分割）
    const englishTokens = text.split(/\s+/).filter((w) => w.length > 0).length;

    // 中文字符估算（每个汉字约 1.5 个 token）
    const chineseChars = text.replace(/[\x00-\x7F]/g, '').length;
    const chineseTokens = Math.ceil(chineseChars * 1.5);

    // 其他字符
    const otherChars = text.length - text.replace(/[^\x00-\x7F\u4e00-\u9fa5]/g, '').length;
    const otherTokens = Math.ceil(otherChars * 0.5);

    return englishTokens + chineseTokens + otherTokens;
  }

  /**
   * 从消息中提取专家 ID
   */
  private extractExpertId(messages: Array<{ role: string; content: string }>): string | null {
    const systemMessage = messages.find((m) => m.role === 'system');
    if (systemMessage) {
      const hash = systemMessage.content.slice(0, 20).replace(/\s+/g, '-');
      return `expert-${hash}`;
    }
    return null;
  }
}
