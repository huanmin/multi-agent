/**
 * Conversation 用例测试
 *
 * 应用层用例的集成测试
 * 按照 Harness Engineering TDD 流程：先写测试，再实现
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Conversation, ConversationType, Message } from '@domain/conversation';
import {
  InMemoryConversationRepository,
  type IConversationRepository,
} from '@infrastructure/repositories/conversation.repository';
import {
  CreateConversationUseCase,
  SendMessageUseCase,
  GetConversationHistoryUseCase,
  DeleteConversationUseCase,
  type CreateConversationInput,
  type SendMessageInput,
} from '@application/use-cases/conversation.use-case';

describe('Conversation Use Cases', () => {
  let repository: IConversationRepository;
  let createUseCase: CreateConversationUseCase;
  let sendMessageUseCase: SendMessageUseCase;
  let getHistoryUseCase: GetConversationHistoryUseCase;
  let deleteUseCase: DeleteConversationUseCase;

  beforeEach(() => {
    repository = new InMemoryConversationRepository();
    createUseCase = new CreateConversationUseCase(repository);
    sendMessageUseCase = new SendMessageUseCase(repository);
    getHistoryUseCase = new GetConversationHistoryUseCase(repository);
    deleteUseCase = new DeleteConversationUseCase(repository);
  });

  describe('CreateConversationUseCase', () => {
    it('应该创建单聊会话', async () => {
      const input: CreateConversationInput = {
        name: '与架构师的对话',
        type: ConversationType.SINGLE,
        expertIds: ['expert-1'],
      };

      const result = await createUseCase.execute(input);

      expect(result.success).toBe(true);
      expect(result.conversation).toBeDefined();
      expect(result.conversation?.name).toBe('与架构师的对话');
      expect(result.conversation?.type).toBe(ConversationType.SINGLE);
      expect(result.conversation?.expertIds).toContain('expert-1');
    });

    it('应该创建群聊会话', async () => {
      const input: CreateConversationInput = {
        name: '技术评审组',
        type: ConversationType.GROUP,
        expertIds: ['expert-1', 'expert-2', 'expert-3'],
      };

      const result = await createUseCase.execute(input);

      expect(result.success).toBe(true);
      expect(result.conversation?.type).toBe(ConversationType.GROUP);
      expect(result.conversation?.expertIds).toHaveLength(3);
    });

    it('应该验证会话名称不能为空', async () => {
      const input: CreateConversationInput = {
        name: '',
        type: ConversationType.SINGLE,
        expertIds: ['expert-1'],
      };

      const result = await createUseCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('名称');
    });

    it('应该验证至少需要一个专家', async () => {
      const input: CreateConversationInput = {
        name: '测试会话',
        type: ConversationType.SINGLE,
        expertIds: [],
      };

      const result = await createUseCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('专家');
    });

    it('应该将会话保存到仓储', async () => {
      const input: CreateConversationInput = {
        name: '测试会话',
        type: ConversationType.SINGLE,
        expertIds: ['expert-1'],
      };

      const result = await createUseCase.execute(input);
      expect(result.success).toBe(true);

      // 验证可以从仓储中读取
      const saved = await repository.findById(result.conversation!.id);
      expect(saved).toBeDefined();
      expect(saved?.name).toBe('测试会话');
    });
  });

  describe('SendMessageUseCase', () => {
    it('应该在会话中发送消息', async () => {
      // 先创建会话
      const createResult = await createUseCase.execute({
        name: '测试会话',
        type: ConversationType.SINGLE,
        expertIds: ['expert-1'],
      });
      const conversationId = createResult.conversation!.id;

      // 发送消息
      const input: SendMessageInput = {
        conversationId,
        content: 'Hello, experts!',
        role: 'user',
      };

      const result = await sendMessageUseCase.execute(input);

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(result.message?.content).toBe('Hello, experts!');
    });

    it('应该找不到会话时返回错误', async () => {
      const input: SendMessageInput = {
        conversationId: 'non-existent-id',
        content: 'Hello',
        role: 'user',
      };

      const result = await sendMessageUseCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('找不到');
    });

    it('应该验证消息内容不能为空', async () => {
      // 先创建会话
      const createResult = await createUseCase.execute({
        name: '测试会话',
        type: ConversationType.SINGLE,
        expertIds: ['expert-1'],
      });

      const input: SendMessageInput = {
        conversationId: createResult.conversation!.id,
        content: '',
        role: 'user',
      };

      const result = await sendMessageUseCase.execute(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('内容');
    });

    it('应该支持专家响应消息', async () => {
      // 创建会话
      const createResult = await createUseCase.execute({
        name: '测试会话',
        type: ConversationType.SINGLE,
        expertIds: ['expert-1'],
      });
      const conversationId = createResult.conversation!.id;

      // 发送专家响应
      const input: SendMessageInput = {
        conversationId,
        content: '这是我的建议...',
        role: 'assistant',
        expertId: 'expert-1',
      };

      const result = await sendMessageUseCase.execute(input);

      expect(result.success).toBe(true);
      expect(result.message?.expertId).toBe('expert-1');
    });
  });

  describe('GetConversationHistoryUseCase', () => {
    it('应该获取会话历史消息', async () => {
      // 创建会话并发送消息
      const createResult = await createUseCase.execute({
        name: '测试会话',
        type: ConversationType.SINGLE,
        expertIds: ['expert-1'],
      });
      const conversationId = createResult.conversation!.id;

      // 发送多条消息
      await sendMessageUseCase.execute({
        conversationId,
        content: '第一条消息',
        role: 'user',
      });
      await sendMessageUseCase.execute({
        conversationId,
        content: '第二条消息',
        role: 'assistant',
        expertId: 'expert-1',
      });

      // 获取历史
      const result = await getHistoryUseCase.execute({ conversationId });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('应该返回空数组给新会话', async () => {
      const createResult = await createUseCase.execute({
        name: '新会话',
        type: ConversationType.SINGLE,
        expertIds: ['expert-1'],
      });

      const result = await getHistoryUseCase.execute({
        conversationId: createResult.conversation!.id,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('DeleteConversationUseCase', () => {
    it('应该删除会话', async () => {
      // 创建会话
      const createResult = await createUseCase.execute({
        name: '要删除的会话',
        type: ConversationType.SINGLE,
        expertIds: ['expert-1'],
      });
      const conversationId = createResult.conversation!.id;

      // 删除
      const result = await deleteUseCase.execute({ conversationId });

      expect(result.success).toBe(true);

      // 验证已删除
      const found = await repository.findById(conversationId);
      expect(found).toBeNull();
    });

    it('应该找不到会话时返回错误', async () => {
      const result = await deleteUseCase.execute({
        conversationId: 'non-existent-id',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('找不到');
    });
  });
});
