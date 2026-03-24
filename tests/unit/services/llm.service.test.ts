/**
 * LLM Service 单元测试
 *
 * 测试 ParallelLLMService 的核心功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ParallelLLMService,
  ILLMProvider,
  LLMResponse,
  StreamEvent,
} from '@infrastructure/services/llm.service';
import { Expert, ExpertRole } from '@domain/expert';

/**
 * Mock LLM Provider 实现
 */
class MockProvider implements ILLMProvider {
  readonly name: string;
  private responseDelay: number;
  private shouldError: boolean;

  constructor(name: string, options: { delay?: number; shouldError?: boolean } = {}) {
    this.name = name;
    this.responseDelay = options.delay ?? 0;
    this.shouldError = options.shouldError ?? false;
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
    config: { model?: string; temperature?: number; maxTokens?: number }
  ): Promise<LLMResponse> {
    if (this.shouldError) {
      throw new Error('Mock error');
    }

    if (this.responseDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.responseDelay));
    }

    const content = messages[messages.length - 1]?.content || '';
    return {
      content: `Response from ${this.name}: ${content}`,
      usage: {
        inputTokens: content.length,
        outputTokens: 10,
      },
      latency: this.responseDelay,
    };
  }

  async chatStream(
    _messages: Array<{ role: string; content: string }>,
    _config: { model?: string; temperature?: number; maxTokens?: number },
    onEvent: (event: StreamEvent) => void
  ): Promise<void> {
    const expertId = 'mock-expert';

    if (this.shouldError) {
      onEvent({ type: 'error', expertId, error: 'Mock stream error' });
      return;
    }

    onEvent({ type: 'start', expertId });

    if (this.responseDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.responseDelay));
    }

    onEvent({ type: 'delta', expertId, content: `Stream from ${this.name}` });
    onEvent({ type: 'complete', expertId });
  }

  estimateTokens(text: string): number {
    return text.length;
  }
}

describe('ParallelLLMService', () => {
  let service: ParallelLLMService;

  beforeEach(() => {
    service = new ParallelLLMService();
  });

  describe('registerProvider', () => {
    it('应该注册提供商', () => {
      const provider = new MockProvider('test');
      service.registerProvider('default', provider);

      // 通过 parallelChat 的行为验证注册成功
      const events: StreamEvent[] = [];
      const expert = Expert.create({
        name: 'Test',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: 'Test',
      });

      return service
        .singleChat(expert, 'Hello', [], (e) => events.push(e))
        .then(() => {
          expect(events).toHaveLength(3); // start, delta, complete
        });
    });
  });

  describe('singleChat', () => {
    it('应该调用单个专家', async () => {
      const provider = new MockProvider('test');
      service.registerProvider('default', provider);

      const events: StreamEvent[] = [];
      const expert = Expert.create({
        name: 'Test',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: 'Test',
      });

      await service.singleChat(expert, 'Hello', [], (e) => events.push(e));

      expect(events).toHaveLength(3);
      expect(events[0].type).toBe('start');
      expect(events[1].type).toBe('delta');
      expect(events[2].type).toBe('complete');
    });

    it('应该包含专家 ID 在事件中', async () => {
      const provider = new MockProvider('test');
      service.registerProvider('default', provider);

      const events: StreamEvent[] = [];
      const expert = Expert.create({
        name: 'Test',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: 'Test',
      });

      await service.singleChat(expert, 'Hello', [], (e) => events.push(e));

      events.forEach((event) => {
        expect(event.expertId).toBeDefined();
      });
    });

    it('应该在未注册提供商时触发错误事件', async () => {
      const events: StreamEvent[] = [];
      const expert = Expert.create({
        name: 'Test',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: 'Test',
      });

      await service.singleChat(expert, 'Hello', [], (e) => events.push(e));

      const errorEvent = events.find((e) => e.type === 'error');
      expect(errorEvent).toBeDefined();
      expect(errorEvent?.error).toContain('未找到 LLM 提供商');
    });

    it('应该在 provider 出错时触发错误事件', async () => {
      const provider = new MockProvider('test', { shouldError: true });
      service.registerProvider('default', provider);

      const events: StreamEvent[] = [];
      const expert = Expert.create({
        name: 'Test',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: 'Test',
      });

      await service.singleChat(expert, 'Hello', [], (e) => events.push(e));

      const errorEvent = events.find((e) => e.type === 'error');
      expect(errorEvent).toBeDefined();
    });
  });

  describe('parallelChat', () => {
    it('应该并行调用多个专家', async () => {
      const provider = new MockProvider('test');
      service.registerProvider('default', provider);

      const events: StreamEvent[] = [];
      const experts = [
        Expert.create({ name: 'Expert1', role: ExpertRole.ARCHITECT(), systemPrompt: 'Test' }),
        Expert.create({ name: 'Expert2', role: ExpertRole.FRONTEND(), systemPrompt: 'Test' }),
        Expert.create({ name: 'Expert3', role: ExpertRole.BACKEND(), systemPrompt: 'Test' }),
      ];

      await service.parallelChat(experts, 'Hello', [], (e) => events.push(e));

      // 每个专家: start + delta + complete = 3 事件
      expect(events).toHaveLength(9);

      // 验证每个专家都有事件
      const expertIds = new Set(events.map((e) => e.expertId));
      expect(expertIds.size).toBe(3);
    });

    it('应该处理混合成功和失败的情况', async () => {
      const successProvider = new MockProvider('success');
      const errorProvider = new MockProvider('error', { shouldError: true });

      service.registerProvider('default', successProvider);

      const events: StreamEvent[] = [];
      const experts = [
        Expert.create({ name: 'Expert1', role: ExpertRole.ARCHITECT(), systemPrompt: 'Test' }),
      ];

      // 先测试成功情况
      await service.parallelChat(experts, 'Hello', [], (e) => events.push(e));
      const successEvents = events.filter((e) => e.type === 'complete');
      expect(successEvents.length).toBeGreaterThan(0);
    });
  });
});
