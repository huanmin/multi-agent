/**
 * LLM Provider 契约测试
 *
 * 确保所有 ILLMProvider 实现都遵守契约
 */

import { describe, it, expect } from 'vitest';
import type { ILLMProvider, LLMResponse, StreamEvent } from '@infrastructure/services/llm.service';

/**
 * 运行 LLM Provider 契约测试
 */
export function runLLMProviderContractTests(
  createProvider: () => ILLMProvider
): void {
  describe('LLM Provider Contract', () => {
    let provider: ILLMProvider;

    beforeEach(() => {
      provider = createProvider();
    });

    describe('name', () => {
      it('应该有名称属性', () => {
        expect(provider.name).toBeDefined();
        expect(typeof provider.name).toBe('string');
        expect(provider.name.length).toBeGreaterThan(0);
      });
    });

    describe('chat', () => {
      it('应该返回 LLMResponse', async () => {
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await provider.chat(messages, {});

        expect(response).toHaveProperty('content');
        expect(response).toHaveProperty('usage');
        expect(response).toHaveProperty('latency');
      });

      it('应该返回正确的 usage 结构', async () => {
        const messages = [{ role: 'user', content: 'Test' }];
        const response = await provider.chat(messages, {});

        expect(response.usage).toHaveProperty('inputTokens');
        expect(response.usage).toHaveProperty('outputTokens');
        expect(typeof response.usage.inputTokens).toBe('number');
        expect(typeof response.usage.outputTokens).toBe('number');
      });

      it('应该返回非负的 latency', async () => {
        const messages = [{ role: 'user', content: 'Test' }];
        const response = await provider.chat(messages, {});

        expect(response.latency).toBeGreaterThanOrEqual(0);
      });

      it('应该支持 system 消息', async () => {
        const messages = [
          { role: 'system', content: '你是一个助手' },
          { role: 'user', content: 'Hello' },
        ];

        await expect(provider.chat(messages, {})).resolves.not.toThrow();
      });

      it('应该支持 temperature 配置', async () => {
        const messages = [{ role: 'user', content: 'Test' }];
        const response = await provider.chat(messages, { temperature: 0.5 });

        expect(response).toBeDefined();
      });

      it('应该支持 maxTokens 配置', async () => {
        const messages = [{ role: 'user', content: 'Test' }];
        const response = await provider.chat(messages, { maxTokens: 100 });

        expect(response).toBeDefined();
      });
    });

    describe('chatStream', () => {
      it('应该触发 start 事件', async () => {
        const events: StreamEvent[] = [];
        const messages = [{ role: 'user', content: 'Hello' }];

        await provider.chatStream(messages, {}, (event) => {
          events.push(event);
        });

        const startEvent = events.find((e) => e.type === 'start');
        expect(startEvent).toBeDefined();
      });

      it('应该触发 complete 事件', async () => {
        const events: StreamEvent[] = [];
        const messages = [{ role: 'user', content: 'Hello' }];

        await provider.chatStream(messages, {}, (event) => {
          events.push(event);
        });

        const completeEvent = events.find((e) => e.type === 'complete');
        expect(completeEvent).toBeDefined();
      });

      it('应该按顺序触发事件', async () => {
        const events: StreamEvent[] = [];
        const messages = [{ role: 'user', content: 'Hello' }];

        await provider.chatStream(messages, {}, (event) => {
          events.push(event);
        });

        const startIndex = events.findIndex((e) => e.type === 'start');
        const completeIndex = events.findIndex((e) => e.type === 'complete');

        expect(startIndex).toBeLessThan(completeIndex);
      });

      it('应该包含专家 ID 在事件中', async () => {
        const events: StreamEvent[] = [];
        const messages = [{ role: 'user', content: 'Hello' }];

        await provider.chatStream(messages, {}, (event) => {
          events.push(event);
        });

        events.forEach((event) => {
          expect(event.expertId).toBeDefined();
        });
      });
    });

    describe('estimateTokens', () => {
      it('应该返回非负数', () => {
        const tokens = provider.estimateTokens('Hello world');
        expect(tokens).toBeGreaterThanOrEqual(0);
      });

      it('应该为英文文本估算 token', () => {
        const tokens = provider.estimateTokens('Hello world');
        expect(tokens).toBeGreaterThan(0);
      });

      it('应该为中文文本估算 token', () => {
        const tokens = provider.estimateTokens('你好世界');
        expect(tokens).toBeGreaterThan(0);
      });

      it('空字符串应该返回 0', () => {
        const tokens = provider.estimateTokens('');
        expect(tokens).toBe(0);
      });

      it('更长的文本应该有更多的 token', () => {
        const shortTokens = provider.estimateTokens('Hi');
        const longTokens = provider.estimateTokens(
          'This is a much longer text with many words'
        );
        expect(longTokens).toBeGreaterThan(shortTokens);
      });
    });
  });
}
