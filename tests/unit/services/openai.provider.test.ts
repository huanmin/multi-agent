/**
 * OpenAI Provider 测试
 *
 * 按 TDD 流程：先写测试，再实现
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider } from '@infrastructure/services/llm/openai.provider';

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    provider = new OpenAIProvider(mockApiKey);
    // Mock fetch
    global.fetch = vi.fn();
  });

  describe('基本属性', () => {
    it('应该有名称', () => {
      expect(provider.name).toBe('OpenAI');
    });

    it('应该保存 API Key', () => {
      expect(provider['apiKey']).toBe(mockApiKey);
    });
  });

  describe('estimateTokens', () => {
    it('应该估算英文 token 数', () => {
      const text = 'Hello world';
      const tokens = provider.estimateTokens(text);
      expect(tokens).toBeGreaterThan(0);
    });

    it('应该估算中文 token 数', () => {
      const text = '你好世界';
      const tokens = provider.estimateTokens(text);
      expect(tokens).toBeGreaterThan(0);
    });

    it('空字符串应该返回 0', () => {
      expect(provider.estimateTokens('')).toBe(0);
    });

    it('长文本应该有更多 token', () => {
      const short = 'Hi';
      const long = 'This is a much longer text with many words';
      expect(provider.estimateTokens(long)).toBeGreaterThan(
        provider.estimateTokens(short)
      );
    });
  });

  describe('chat', () => {
    it('应该发送请求到 OpenAI API', async () => {
      const mockResponse = {
        id: 'chatcmpl_123',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello!',
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const messages = [{ role: 'user', content: 'Hello' }];
      const result = await provider.chat(messages, {});

      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        })
      );

      expect(result.content).toBe('Hello!');
      expect(result.usage.inputTokens).toBe(10);
      expect(result.usage.outputTokens).toBe(5);
    });

    it('应该在 API 错误时抛出错误', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      const messages = [{ role: 'user', content: 'Hello' }];
      await expect(provider.chat(messages, {})).rejects.toThrow('OpenAI API');
    });
  });

  describe('chatStream', () => {
    it('应该发送流式请求', async () => {
      const events: Array<{ type: string; content?: string }> = [];

      // Mock SSE 响应
      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"choices":[{"delta":{"content":" world"}}]}\n\n'
            ),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      const mockBody = {
        getReader: () => mockReader,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        body: mockBody,
      } as Response);

      await provider.chatStream(
        [{ role: 'user', content: 'Hello' }],
        {},
        (event) => {
          events.push({ type: event.type, content: event.content });
        }
      );

      expect(events).toContainEqual({ type: 'start' });
      expect(events).toContainEqual({ type: 'complete' });
    });
  });
});
