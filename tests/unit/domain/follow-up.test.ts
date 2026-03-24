import { describe, it, expect, beforeEach } from 'vitest';
import {
  createFollowUpContext,
  formatFollowUpMessage,
  isFollowUpValid,
  type FollowUpContext,
} from '@domain/follow-up';

describe('追问功能', () => {
  describe('创建追问上下文', () => {
    it('应该为专家回复创建追问上下文', () => {
      const originalMessage = {
        id: 'msg-1',
        content: '建议使用微服务架构',
        role: 'assistant',
        expertId: 'architect',
        expertName: '架构师',
      };

      const context = createFollowUpContext(originalMessage);

      expect(context.originalMessageId).toBe('msg-1');
      expect(context.originalContent).toBe('建议使用微服务架构');
      expect(context.expertId).toBe('architect');
      expect(context.expertName).toBe('架构师');
      expect(context.timestamp).toBeDefined();
    });

    it('追问上下文应该包含追问次数', () => {
      const originalMessage = {
        id: 'msg-1',
        content: '建议使用微服务架构',
        role: 'assistant',
        expertId: 'architect',
        expertName: '架构师',
      };

      const context = createFollowUpContext(originalMessage);

      expect(context.followUpCount).toBe(1);
    });

    it('多次追问应该增加追问次数', () => {
      const originalMessage = {
        id: 'msg-1',
        content: '建议使用微服务架构',
        role: 'assistant',
        expertId: 'architect',
        expertName: '架构师',
      };

      const context1 = createFollowUpContext(originalMessage);
      const context2 = createFollowUpContext(originalMessage, context1);

      expect(context2.followUpCount).toBe(2);
    });
  });

  describe('格式化追问消息', () => {
    it('应该将追问消息格式化为带引用的形式', () => {
      const context: FollowUpContext = {
        originalMessageId: 'msg-1',
        originalContent: '建议使用微服务架构',
        expertId: 'architect',
        expertName: '架构师',
        timestamp: new Date(),
        followUpCount: 1,
      };

      const followUpContent = '为什么不用单体架构？';
      const formatted = formatFollowUpMessage(followUpContent, context);

      expect(formatted).toContain('追问');
      expect(formatted).toContain('架构师');
      expect(formatted).toContain('建议使用微服务架构');
      expect(formatted).toContain('为什么不用单体架构？');
    });

    it('应该处理长内容的截断', () => {
      const context: FollowUpContext = {
        originalMessageId: 'msg-1',
        originalContent: '这是一个非常长的回复内容'.repeat(10),
        expertId: 'architect',
        expertName: '架构师',
        timestamp: new Date(),
        followUpCount: 1,
      };

      const followUpContent = '追问内容';
      const formatted = formatFollowUpMessage(followUpContent, context, { maxLength: 50 });

      expect(formatted.length).toBeLessThanOrEqual(150); // 基础模板 + 截断内容
    });

    it('应该支持自定义追问前缀', () => {
      const context: FollowUpContext = {
        originalMessageId: 'msg-1',
        originalContent: '建议使用微服务架构',
        expertId: 'architect',
        expertName: '架构师',
        timestamp: new Date(),
        followUpCount: 1,
      };

      const followUpContent = '为什么不用单体架构？';
      const formatted = formatFollowUpMessage(followUpContent, context, {
        prefix: '针对你的回答',
      });

      expect(formatted).toContain('针对你的回答');
    });
  });

  describe('追问有效性验证', () => {
    it('应该验证追问内容不能为空', () => {
      const context: FollowUpContext = {
        originalMessageId: 'msg-1',
        originalContent: '建议使用微服务架构',
        expertId: 'architect',
        expertName: '架构师',
        timestamp: new Date(),
        followUpCount: 1,
      };

      expect(isFollowUpValid('', context)).toBe(false);
      expect(isFollowUpValid('   ', context)).toBe(false);
      expect(isFollowUpValid('追问内容', context)).toBe(true);
    });

    it('应该验证追问次数限制', () => {
      const context: FollowUpContext = {
        originalMessageId: 'msg-1',
        originalContent: '建议使用微服务架构',
        expertId: 'architect',
        expertName: '架构师',
        timestamp: new Date(),
        followUpCount: 6, // 超过默认限制5
      };

      expect(isFollowUpValid('追问内容', context)).toBe(false);
      expect(isFollowUpValid('追问内容', context, { maxFollowUps: 10 })).toBe(true);
    });

    it('应该验证原始消息是否存在', () => {
      const context: FollowUpContext = {
        originalMessageId: '',
        originalContent: '',
        expertId: 'architect',
        expertName: '架构师',
        timestamp: new Date(),
        followUpCount: 1,
      };

      expect(isFollowUpValid('追问内容', context)).toBe(false);
    });
  });

  describe('追问层级管理', () => {
    it('应该正确追踪追问层级', () => {
      const message1 = {
        id: 'msg-1',
        content: '原始回答',
        role: 'assistant',
        expertId: 'expert1',
        expertName: '专家A',
      };

      const context1 = createFollowUpContext(message1);
      expect(context1.depth).toBe(1);

      const message2 = {
        id: 'msg-2',
        content: '第一次追问回复',
        role: 'assistant',
        expertId: 'expert1',
        expertName: '专家A',
      };

      const context2 = createFollowUpContext(message2, context1);
      expect(context2.depth).toBe(2);
    });

    it('应该支持追问链', () => {
      const message1 = { id: 'msg-1', content: 'A', role: 'assistant', expertId: 'e1', expertName: '专家' };
      const context1 = createFollowUpContext(message1);

      const message2 = { id: 'msg-2', content: 'B', role: 'assistant', expertId: 'e1', expertName: '专家' };
      const context2 = createFollowUpContext(message2, context1);

      expect(context2.parentContext).toBe(context1);
      expect(context2.rootMessageId).toBe('msg-1');
    });
  });
});
