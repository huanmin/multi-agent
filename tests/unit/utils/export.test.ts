import { describe, it, expect, beforeEach } from 'vitest';
import { createMessageStore, type Message } from '@infrastructure/stores/message.store';
import {
  exportMessagesToMarkdown,
  exportMessagesToJSON,
  exportMessagesToText,
  formatMessagesForExport,
  filterMessagesByDateRange,
  type ExportFormat,
  type ExportOptions,
} from '@infrastructure/utils/export';

describe('消息导出功能', () => {
  let store: ReturnType<typeof createMessageStore>;

  beforeEach(() => {
    store = createMessageStore();
    store.reset();
  });

  describe('导出为 Markdown', () => {
    it('应该将消息导出为 Markdown 格式', () => {
      store.addMessage({
        id: '1',
        content: '你好',
        role: 'user',
        conversationId: 'conv1',
        createdAt: new Date('2024-01-01'),
      });
      store.addMessage({
        id: '2',
        content: '您好，有什么可以帮助您的？',
        role: 'assistant',
        expertId: 'architect',
        expertName: '架构师',
        conversationId: 'conv1',
        createdAt: new Date('2024-01-01'),
      });

      const markdown = exportMessagesToMarkdown(store.messages);

      expect(markdown).toContain('# 对话记录');
      expect(markdown).toContain('**用户**');
      expect(markdown).toContain('你好');
      expect(markdown).toContain('**架构师**');
      expect(markdown).toContain('您好，有什么可以帮助您的？');
    });

    it('应该包含时间戳', () => {
      const date = new Date('2024-01-15 10:30:00');
      store.addMessage({
        id: '1',
        content: '测试消息',
        role: 'user',
        createdAt: date,
      });

      const markdown = exportMessagesToMarkdown(store.messages, { includeTimestamp: true });

      expect(markdown).toContain('2024-01-15');
      expect(markdown).toContain('10:30:00');
    });

    it('应该支持不包含元数据', () => {
      store.addMessage({
        id: '1',
        content: '测试消息',
        role: 'user',
      });

      const markdown = exportMessagesToMarkdown(store.messages, { includeMetadata: false });

      expect(markdown).not.toContain('**用户**');
      expect(markdown).toContain('测试消息');
    });
  });

  describe('导出为 JSON', () => {
    it('应该将消息导出为 JSON 格式', () => {
      store.addMessage({
        id: '1',
        content: '测试消息',
        role: 'user',
        conversationId: 'conv1',
      });

      const json = exportMessagesToJSON(store.messages);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].content).toBe('测试消息');
      expect(parsed[0].role).toBe('user');
    });

    it('应该包含完整的消息元数据', () => {
      store.addMessage({
        id: '1',
        content: '测试',
        role: 'assistant',
        expertId: 'expert1',
        expertName: '专家A',
        inputTokens: 100,
        outputTokens: 50,
        latencyMs: 1200,
      });

      const json = exportMessagesToJSON(store.messages);
      const parsed = JSON.parse(json);

      expect(parsed[0].expertId).toBe('expert1');
      expect(parsed[0].expertName).toBe('专家A');
      expect(parsed[0].inputTokens).toBe(100);
      expect(parsed[0].outputTokens).toBe(50);
      expect(parsed[0].latencyMs).toBe(1200);
    });

    it('应该按日期过滤后导出', () => {
      store.addMessage({
        id: '1',
        content: '旧消息',
        role: 'user',
        createdAt: new Date('2024-01-01'),
      });
      store.addMessage({
        id: '2',
        content: '新消息',
        role: 'user',
        createdAt: new Date('2024-03-01'),
      });

      const filtered = filterMessagesByDateRange(
        store.messages,
        new Date('2024-02-01'),
        new Date('2024-12-31')
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].content).toBe('新消息');
    });
  });

  describe('导出为纯文本', () => {
    it('应该将消息导出为纯文本格式', () => {
      store.addMessage({ id: '1', content: '问题？', role: 'user' });
      store.addMessage({ id: '2', content: '答案。', role: 'assistant', expertName: '架构师' });

      const text = exportMessagesToText(store.messages);

      expect(text).toContain('用户: 问题？');
      expect(text).toContain('架构师: 答案。');
    });

    it('应该支持自定义分隔符', () => {
      store.addMessage({ id: '1', content: '消息1', role: 'user' });
      store.addMessage({ id: '2', content: '消息2', role: 'assistant' });

      const text = exportMessagesToText(store.messages, { separator: '\n---\n' });

      expect(text).toContain('---');
    });
  });

  describe('通用格式化功能', () => {
    it('应该根据选项格式化消息为 JSON 并包含统计信息', () => {
      store.addMessage({
        id: '1',
        content: '测试',
        role: 'user',
        inputTokens: 10,
        outputTokens: 20,
      });

      const formatted = formatMessagesForExport(store.messages, {
        format: 'json',
        includeStats: true,
      });

      expect(formatted).toContain('inputTokens');
      expect(formatted).toContain('10');
      expect(formatted).toContain('20');
    });

    it('应该处理空消息列表', () => {
      const markdown = exportMessagesToMarkdown([]);
      expect(markdown).toContain('# 对话记录');

      const json = exportMessagesToJSON([]);
      expect(JSON.parse(json)).toEqual([]);

      const text = exportMessagesToText([]);
      expect(text).toBe('');
    });
  });

  describe('日期范围过滤', () => {
    it('应该正确过滤日期范围内的消息', () => {
      const messages: Message[] = [
        { id: '1', content: 'A', createdAt: new Date('2024-01-15') },
        { id: '2', content: 'B', createdAt: new Date('2024-02-15') },
        { id: '3', content: 'C', createdAt: new Date('2024-03-15') },
      ];

      const filtered = filterMessagesByDateRange(
        messages,
        new Date('2024-01-20'),
        new Date('2024-03-01')
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].content).toBe('B');
    });

    it('应该处理没有日期的消息', () => {
      const messages: Message[] = [
        { id: '1', content: 'A' },
        { id: '2', content: 'B', createdAt: new Date('2024-02-01') },
      ];

      const filtered = filterMessagesByDateRange(
        messages,
        new Date('2024-01-01'),
        new Date('2024-12-31')
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].content).toBe('B');
    });
  });
});
