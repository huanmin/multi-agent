import { describe, it, expect } from 'vitest';
import {
  exportMessagesToMarkdown,
  exportMessagesToJSON,
  exportMessagesToText,
  formatMessagesForExport,
  filterMessagesByDateRange,
} from '@infrastructure/utils/export';
import {
  createTestMessage,
  createTestUserMessage,
  createTestAssistantMessage,
} from '../../__helpers__/test-factory';
import type { Message } from '@infrastructure/stores/message.store';

describe('export utils', () => {
  describe('exportMessagesToMarkdown', () => {
    it('should export messages to Markdown format', () => {
      const messages = [
        createTestUserMessage('你好'),
        createTestAssistantMessage('您好，有什么可以帮助您的？', '架构师'),
      ];

      const markdown = exportMessagesToMarkdown(messages);

      expect(markdown).toContain('# 对话记录');
      expect(markdown).toContain('**用户**');
      expect(markdown).toContain('你好');
      expect(markdown).toContain('**架构师**');
    });

    it('should include timestamps when enabled', () => {
      const messages = [
        createTestUserMessage('测试消息', { createdAt: new Date('2024-01-15T10:30:00') }),
      ];

      const markdown = exportMessagesToMarkdown(messages, { includeTimestamp: true });

      expect(markdown).toContain('2024-01-15');
    });

    it('should support excluding metadata', () => {
      const messages = [createTestUserMessage('测试消息')];

      const markdown = exportMessagesToMarkdown(messages, { includeMetadata: false });

      expect(markdown).not.toContain('**用户**');
      expect(markdown).toContain('测试消息');
    });
  });

  describe('exportMessagesToJSON', () => {
    it('should export messages to JSON format', () => {
      const messages = [createTestUserMessage('测试消息')];

      const json = exportMessagesToJSON(messages);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].content).toBe('测试消息');
      expect(parsed[0].role).toBe('user');
    });

    it('should include complete message metadata', () => {
      const messages = [
        createTestAssistantMessage('测试', '专家A', {
          expertId: 'expert1',
          inputTokens: 100,
          outputTokens: 50,
          latencyMs: 1200,
        }),
      ];

      const json = exportMessagesToJSON(messages);
      const parsed = JSON.parse(json);

      expect(parsed[0].expertId).toBe('expert1');
      expect(parsed[0].expertName).toBe('专家A');
      expect(parsed[0].inputTokens).toBe(100);
      expect(parsed[0].outputTokens).toBe(50);
      expect(parsed[0].latencyMs).toBe(1200);
    });
  });

  describe('exportMessagesToText', () => {
    it('should export messages to plain text format', () => {
      const messages = [
        createTestUserMessage('问题？'),
        createTestAssistantMessage('答案。', '专家'),
      ];

      const text = exportMessagesToText(messages);

      expect(text).toContain('用户: 问题？');
      expect(text).toContain('专家: 答案。');
    });

    it('should support custom separator', () => {
      const messages = [
        createTestUserMessage('消息1'),
        createTestAssistantMessage('消息2', '专家'),
      ];

      const text = exportMessagesToText(messages, { separator: '\n---\n' });

      expect(text).toContain('---');
    });
  });

  describe('formatMessagesForExport', () => {
    it('should format messages as JSON with stats', () => {
      const messages = [
        createTestMessage({
          role: 'user',
          inputTokens: 10,
          outputTokens: 20,
        }),
      ];

      const formatted = formatMessagesForExport(messages, {
        format: 'json',
        includeStats: true,
      });

      expect(formatted).toContain('inputTokens');
      expect(formatted).toContain('10');
    });

    it('should handle empty message list', () => {
      expect(exportMessagesToMarkdown([])).toContain('# 对话记录');
      expect(JSON.parse(exportMessagesToJSON([]))).toEqual([]);
      expect(exportMessagesToText([])).toBe('');
    });
  });

  describe('filterMessagesByDateRange', () => {
    it('should filter messages within date range', () => {
      const messages: Message[] = [
        createTestMessage({ content: 'A', createdAt: new Date('2024-01-15') }),
        createTestMessage({ content: 'B', createdAt: new Date('2024-02-15') }),
        createTestMessage({ content: 'C', createdAt: new Date('2024-03-15') }),
      ];

      const filtered = filterMessagesByDateRange(
        messages,
        new Date('2024-01-20'),
        new Date('2024-03-01')
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].content).toBe('B');
    });

    it('should filter out messages without date', () => {
      const messages: Message[] = [
        createTestMessage({ content: 'A' }),
        createTestMessage({ content: 'B', createdAt: new Date('2024-02-01') }),
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
