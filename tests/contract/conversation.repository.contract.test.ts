/**
 * Conversation Repository 契约测试
 *
 * 确保所有 IConversationRepository 实现都遵守契约
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Conversation, ConversationType, Message } from '@domain/conversation';
import type { IConversationRepository } from '@infrastructure/repositories/conversation.repository';

/**
 * 运行 Conversation Repository 契约测试
 */
export function runConversationRepositoryContractTests(
  createRepository: () => IConversationRepository
): void {
  describe('Conversation Repository Contract', () => {
    let repository: IConversationRepository;

    beforeEach(() => {
      repository = createRepository();
    });

    describe('save', () => {
      it('应该保存会话并可以通过 ID 找回', async () => {
        const conversation = Conversation.create({
          name: '测试会话',
          type: ConversationType.SINGLE,
          expertIds: ['expert-1'],
        });

        await repository.save(conversation);
        const found = await repository.findById(conversation.id);

        expect(found).toBeDefined();
        expect(found?.id).toBe(conversation.id);
        expect(found?.name).toBe('测试会话');
      });

      it('应该更新已存在的会话', async () => {
        const conversation = Conversation.create({
          name: '原始名称',
          type: ConversationType.SINGLE,
          expertIds: ['expert-1'],
        });

        await repository.save(conversation);
        conversation.rename('更新名称');
        await repository.save(conversation);

        const found = await repository.findById(conversation.id);
        expect(found?.name).toBe('更新名称');
      });

      it('应该保存消息到会话', async () => {
        const conversation = Conversation.create({
          name: '消息测试',
          type: ConversationType.SINGLE,
          expertIds: ['expert-1'],
        });

        const message = new Message({
          role: 'user',
          content: '测试消息',
        });
        conversation.addMessage(message);

        await repository.save(conversation);
        const found = await repository.findById(conversation.id);

        expect(found?.messages).toHaveLength(1);
        expect(found?.messages[0].content).toBe('测试消息');
      });
    });

    describe('findById', () => {
      it('应该返回 null 当会话不存在', async () => {
        const found = await repository.findById('non-existent-id');
        expect(found).toBeNull();
      });

      it('应该返回正确的会话类型', async () => {
        const single = Conversation.create({
          name: '单聊',
          type: ConversationType.SINGLE,
          expertIds: ['expert-1'],
        });

        await repository.save(single);
        const found = await repository.findById(single.id);

        expect(found?.type).toBe(ConversationType.SINGLE);
      });
    });

    describe('findAll', () => {
      it('应该返回空数组当没有会话', async () => {
        const all = await repository.findAll();
        expect(all).toEqual([]);
      });

      it('应该返回所有已保存的会话', async () => {
        const conv1 = Conversation.create({
          name: '会话A',
          type: ConversationType.SINGLE,
          expertIds: ['expert-1'],
        });
        const conv2 = Conversation.create({
          name: '会话B',
          type: ConversationType.GROUP,
          expertIds: ['expert-1', 'expert-2'],
        });

        await repository.save(conv1);
        await repository.save(conv2);

        const all = await repository.findAll();
        expect(all).toHaveLength(2);
      });

      it('应该按更新时间排序', async () => {
        const conv1 = Conversation.create({
          name: '会话1',
          type: ConversationType.SINGLE,
          expertIds: ['expert-1'],
        });
        await repository.save(conv1);

        // 等待一点时间确保不同时间戳
        await new Promise((resolve) => setTimeout(resolve, 10));

        const conv2 = Conversation.create({
          name: '会话2',
          type: ConversationType.SINGLE,
          expertIds: ['expert-2'],
        });
        await repository.save(conv2);

        const all = await repository.findAll();
        expect(all[0].name).toBe('会话2'); // 最新的在前
        expect(all[1].name).toBe('会话1');
      });
    });

    describe('delete', () => {
      it('应该删除会话', async () => {
        const conversation = Conversation.create({
          name: '待删除',
          type: ConversationType.SINGLE,
          expertIds: ['expert-1'],
        });

        await repository.save(conversation);
        await repository.delete(conversation.id);

        const found = await repository.findById(conversation.id);
        expect(found).toBeNull();
      });

      it('删除不存在的会话不应该报错', async () => {
        await expect(
          repository.delete('non-existent-id')
        ).resolves.not.toThrow();
      });
    });

    describe('findByName', () => {
      it('应该通过名称搜索会话', async () => {
        const conversation = Conversation.create({
          name: '架构评审',
          type: ConversationType.GROUP,
          expertIds: ['expert-1'],
        });

        await repository.save(conversation);
        const results = await repository.findByName('架构');

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('架构评审');
      });

      it('应该支持模糊搜索', async () => {
        const conv1 = Conversation.create({
          name: '前端开发讨论',
          type: ConversationType.GROUP,
          expertIds: ['expert-1'],
        });
        const conv2 = Conversation.create({
          name: '后端开发讨论',
          type: ConversationType.GROUP,
          expertIds: ['expert-2'],
        });

        await repository.save(conv1);
        await repository.save(conv2);

        const results = await repository.findByName('开发');
        expect(results).toHaveLength(2);
      });
    });

    describe('findPinned', () => {
      it('应该返回置顶的会话', async () => {
        const conv1 = Conversation.create({
          name: '置顶会话',
          type: ConversationType.SINGLE,
          expertIds: ['expert-1'],
        });
        conv1.pin();

        const conv2 = Conversation.create({
          name: '普通会话',
          type: ConversationType.SINGLE,
          expertIds: ['expert-2'],
        });

        await repository.save(conv1);
        await repository.save(conv2);

        const pinned = await repository.findPinned();
        expect(pinned).toHaveLength(1);
        expect(pinned[0].name).toBe('置顶会话');
      });

      it('应该返回空数组当没有置顶会话', async () => {
        const conversation = Conversation.create({
          name: '普通会话',
          type: ConversationType.SINGLE,
          expertIds: ['expert-1'],
        });

        await repository.save(conversation);
        const pinned = await repository.findPinned();
        expect(pinned).toEqual([]);
      });
    });
  });
}
