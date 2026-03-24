import { describe, it, expect } from 'vitest';
import {
  createFollowUpContext,
  formatFollowUpMessage,
  isFollowUpValid,
  getFollowUpChain,
} from '@domain/follow-up';
import {
  createTestFollowUpContext,
  createTestFollowUpContextWithParent,
} from '../../__helpers__/test-factory';
import type { MessageForFollowUp } from '@domain/follow-up';

describe('Follow-up Domain', () => {
  const mockMessage: MessageForFollowUp = {
    id: 'msg-1',
    content: '建议使用微服务架构',
    role: 'assistant',
    expertId: 'architect',
    expertName: '架构师',
  };

  describe('createFollowUpContext', () => {
    it('should create follow-up context for expert response', () => {
      const context = createFollowUpContext(mockMessage);

      expect(context.originalMessageId).toBe('msg-1');
      expect(context.originalContent).toBe('建议使用微服务架构');
      expect(context.expertId).toBe('architect');
      expect(context.expertName).toBe('架构师');
      expect(context.timestamp).toBeDefined();
    });

    it('should set initial follow-up count to 1', () => {
      const context = createFollowUpContext(mockMessage);
      expect(context.followUpCount).toBe(1);
    });

    it('should increment follow-up count with parent context', () => {
      const parentContext = createTestFollowUpContext({ followUpCount: 2 });
      const context = createFollowUpContext(mockMessage, parentContext);

      expect(context.followUpCount).toBe(3);
    });
  });

  describe('formatFollowUpMessage', () => {
    it('should format follow-up message with context', () => {
      const context = createTestFollowUpContext({
        expertName: '架构师',
        originalContent: '建议使用微服务架构',
      });

      const formatted = formatFollowUpMessage('为什么不用单体架构？', context);

      expect(formatted).toContain('追问 - 架构师');
      expect(formatted).toContain('建议使用微服务架构');
      expect(formatted).toContain('为什么不用单体架构？');
    });

    it('should truncate long content', () => {
      const context = createTestFollowUpContext({
        originalContent: '这是一个非常长的回复内容'.repeat(10),
      });

      const formatted = formatFollowUpMessage('追问内容', context, { maxLength: 50 });

      expect(formatted.length).toBeLessThan(150);
    });

    it('should support custom prefix', () => {
      const context = createTestFollowUpContext();
      const formatted = formatFollowUpMessage('为什么？', context, {
        prefix: '针对你的回答',
      });

      expect(formatted).toContain('针对你的回答');
    });
  });

  describe('isFollowUpValid', () => {
    it('should reject empty content', () => {
      const context = createTestFollowUpContext();
      expect(isFollowUpValid('', context)).toBe(false);
      expect(isFollowUpValid('   ', context)).toBe(false);
    });

    it('should reject when follow-up count exceeds limit', () => {
      const context = createTestFollowUpContext({ followUpCount: 6 });
      expect(isFollowUpValid('追问内容', context)).toBe(false);
      expect(isFollowUpValid('追问内容', context, { maxFollowUps: 10 })).toBe(true);
    });

    it('should reject when original message is missing', () => {
      const context = createTestFollowUpContext({ originalMessageId: '' });
      expect(isFollowUpValid('追问内容', context)).toBe(false);
    });

    it('should accept valid follow-up', () => {
      const context = createTestFollowUpContext();
      expect(isFollowUpValid('有效的追问内容', context)).toBe(true);
    });
  });

  describe('getFollowUpChain', () => {
    it('should return chain of contexts', () => {
      const context1 = createTestFollowUpContext({ depth: 1 });
      const context2 = createTestFollowUpContextWithParent(context1, { depth: 2 });
      const context3 = createTestFollowUpContextWithParent(context2, { depth: 3 });

      const chain = getFollowUpChain(context3);

      expect(chain).toHaveLength(3);
      expect(chain[0].depth).toBe(1);
      expect(chain[2].depth).toBe(3);
    });
  });
});
