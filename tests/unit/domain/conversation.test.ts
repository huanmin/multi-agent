import { describe, it, expect, beforeEach } from 'vitest';
import { Conversation, ConversationType, Message, MessageRole } from '@domain/conversation';
import { Expert, ExpertRole } from '@domain/expert';

describe('Conversation Domain Model', () => {
  describe('Conversation Entity', () => {
    let conversation: Conversation;
    const expert1 = Expert.create({ name: '专家1', role: ExpertRole.ARCHITECT(), systemPrompt: 'test' });
    const expert2 = Expert.create({ name: '专家2', role: ExpertRole.FRONTEND(), systemPrompt: 'test' });

    beforeEach(() => {
      conversation = Conversation.create({
        name: '测试会话',
        type: ConversationType.GROUP,
        expertIds: [expert1.id, expert2.id],
      });
    });

    it('应该创建具有有效属性的会话', () => {
      expect(conversation.id).toBeDefined();
      expect(conversation.name).toBe('测试会话');
      expect(conversation.type).toBe(ConversationType.GROUP);
      expect(conversation.expertIds).toHaveLength(2);
    });

    it('应该支持重命名', () => {
      conversation.rename('新名称');
      expect(conversation.name).toBe('新名称');
    });

    it('空名称不应该通过', () => {
      expect(() => conversation.rename('')).toThrow('会话名称不能为空');
    });

    it('应该支持添加消息', () => {
      const message = Message.createUserMessage('Hello');
      conversation.addMessage(message);

      expect(conversation.messages).toHaveLength(1);
      expect(conversation.lastMessage).toBe('Hello');
    });

    it('应该支持专家响应消息', () => {
      const response = Message.createExpertResponse(expert1.id, '响应内容');
      conversation.addMessage(response);

      expect(conversation.messages[0].expertId).toBe(expert1.id);
    });

    it('应该正确统计未读消息', () => {
      conversation.addMessage(Message.createUserMessage('test1'));
      conversation.addMessage(Message.createExpertResponse(expert1.id, 'test2'));

      expect(conversation.getUnreadCount()).toBe(2);
    });

    it('标记已读后未读数应该归零', () => {
      conversation.addMessage(Message.createUserMessage('test'));
      conversation.markAsRead();
      expect(conversation.getUnreadCount()).toBe(0);
    });

    it('应该支持置顶', () => {
      conversation.pin();
      expect(conversation.isPinned).toBe(true);
    });

    it('应该支持取消置顶', () => {
      conversation.pin();
      conversation.unpin();
      expect(conversation.isPinned).toBe(false);
    });

    it('应该更新最后消息时间', () => {
      const before = conversation.lastMessageAt;
      conversation.addMessage(Message.createUserMessage('test'));
      expect(conversation.lastMessageAt.getTime()).toBeGreaterThan(before.getTime());
    });
  });

  describe('Message Value Object', () => {
    it('应该创建用户消息', () => {
      const msg = Message.createUserMessage('用户消息');
      expect(msg.role).toBe(MessageRole.USER);
      expect(msg.content).toBe('用户消息');
    });

    it('应该创建专家响应', () => {
      const expertId = 'expert-123';
      const msg = Message.createExpertResponse(expertId, '响应内容');
      expect(msg.role).toBe(MessageRole.ASSISTANT);
      expect(msg.expertId).toBe(expertId);
    });

    it('应该支持流式内容追加', () => {
      const msg = Message.createExpertResponse('expert-1', '');
      msg.appendContent('Hello');
      msg.appendContent(' World');
      expect(msg.content).toBe('Hello World');
    });

    it('应该支持@提及', () => {
      const msg = Message.createUserMessage('@专家1 请回答');
      msg.addMention('expert-1');
      expect(msg.mentions).toContain('expert-1');
    });

    it('应该计算 token 使用量', () => {
      const msg = Message.createExpertResponse('expert-1', '测试内容');
      msg.setTokenUsage(100, 50);
      expect(msg.inputTokens).toBe(100);
      expect(msg.outputTokens).toBe(50);
    });
  });

  describe('Conversation Factory', () => {
    it('应该创建单聊会话', () => {
      const expert = Expert.create({ name: '专家', role: ExpertRole.ARCHITECT(), systemPrompt: 'test' });
      const conv = Conversation.createSingleChat(expert);

      expect(conv.type).toBe(ConversationType.SINGLE);
      expect(conv.name).toBe('与 专家 的对话');
      expect(conv.expertIds).toContain(expert.id);
    });

    it('应该创建群聊会话', () => {
      const experts = [
        Expert.create({ name: '专家1', role: ExpertRole.ARCHITECT(), systemPrompt: 'test' }),
        Expert.create({ name: '专家2', role: ExpertRole.FRONTEND(), systemPrompt: 'test' }),
      ];
      const conv = Conversation.createGroupChat('技术讨论', experts);

      expect(conv.type).toBe(ConversationType.GROUP);
      expect(conv.name).toBe('技术讨论');
      expect(conv.expertIds).toHaveLength(2);
    });
  });
});
