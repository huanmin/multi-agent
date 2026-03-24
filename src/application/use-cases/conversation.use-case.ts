/**
 * Conversation 用例
 *
 * 应用层协调领域逻辑，实现业务用例
 * 按照 Harness Engineering TDD 流程实现
 */

import {
  Conversation,
  ConversationType,
  Message,
  MessageRole,
} from '@domain/conversation';
import type { IConversationRepository } from '@infrastructure/repositories/conversation.repository';

/**
 * 用例结果封装
 */
export interface UseCaseResult<T = unknown> {
  success: boolean;
  data?: T;
  conversation?: Conversation;
  message?: Message;
  error?: string;
}

/**
 * 创建会话输入
 */
export interface CreateConversationInput {
  name: string;
  type: ConversationType;
  expertIds: string[];
}

/**
 * 创建会话用例
 */
export class CreateConversationUseCase {
  constructor(private readonly repository: IConversationRepository) {}

  async execute(input: CreateConversationInput): Promise<UseCaseResult<Conversation>> {
    try {
      // 验证输入
      if (!input.name?.trim()) {
        return { success: false, error: '会话名称不能为空' };
      }
      if (!input.expertIds || input.expertIds.length === 0) {
        return { success: false, error: '会话必须包含至少一个专家' };
      }

      // 创建会话
      const conversation = Conversation.create({
        name: input.name.trim(),
        type: input.type,
        expertIds: input.expertIds,
      });

      // 保存
      await this.repository.save(conversation);

      return { success: true, conversation };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建会话失败',
      };
    }
  }
}

/**
 * 发送消息输入
 */
export interface SendMessageInput {
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  expertId?: string;
  mentions?: string[];
}

/**
 * 发送消息用例
 */
export class SendMessageUseCase {
  constructor(private readonly repository: IConversationRepository) {}

  async execute(input: SendMessageInput): Promise<UseCaseResult<Message>> {
    try {
      // 查找会话
      const conversation = await this.repository.findById(input.conversationId);
      if (!conversation) {
        return {
          success: false,
          error: `找不到 ID 为 ${input.conversationId} 的会话`,
        };
      }

      // 验证内容
      if (!input.content?.trim()) {
        return { success: false, error: '消息内容不能为空' };
      }

      // 创建消息
      const message = new Message({
        role: input.role as MessageRole,
        content: input.content.trim(),
        expertId: input.expertId,
        mentions: input.mentions,
      });

      // 添加到会话
      conversation.addMessage(message);

      // 保存会话
      await this.repository.save(conversation);

      return { success: true, message };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '发送消息失败',
      };
    }
  }
}

/**
 * 获取会话历史输入
 */
export interface GetConversationHistoryInput {
  conversationId: string;
}

/**
 * 获取会话历史用例
 */
export class GetConversationHistoryUseCase {
  constructor(private readonly repository: IConversationRepository) {}

  async execute(
    input: GetConversationHistoryInput
  ): Promise<UseCaseResult<Message[]>> {
    try {
      // 查找会话
      const conversation = await this.repository.findById(input.conversationId);
      if (!conversation) {
        return {
          success: false,
          error: `找不到 ID 为 ${input.conversationId} 的会话`,
        };
      }

      // 返回消息列表
      return { success: true, data: conversation.messages };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取历史失败',
      };
    }
  }
}

/**
 * 删除会话输入
 */
export interface DeleteConversationInput {
  conversationId: string;
}

/**
 * 删除会话用例
 */
export class DeleteConversationUseCase {
  constructor(private readonly repository: IConversationRepository) {}

  async execute(input: DeleteConversationInput): Promise<UseCaseResult<void>> {
    try {
      // 验证会话存在
      const conversation = await this.repository.findById(input.conversationId);
      if (!conversation) {
        return {
          success: false,
          error: `找不到 ID 为 ${input.conversationId} 的会话`,
        };
      }

      // 删除
      await this.repository.delete(input.conversationId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除会话失败',
      };
    }
  }
}
