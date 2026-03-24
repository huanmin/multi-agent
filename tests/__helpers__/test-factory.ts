/**
 * 测试工厂函数
 *
 * 提供统一的测试数据创建函数
 */

import { Expert, ExpertRole } from '@domain/expert';
import { Conversation, ConversationType } from '@domain/conversation';

/**
 * 创建测试专家
 */
export function createTestExpert(overrides: {
  name?: string;
  role?: ReturnType<typeof ExpertRole.ARCHITECT>;
  systemPrompt?: string;
  tags?: string[];
} = {}): Expert {
  return Expert.create({
    name: overrides.name ?? '测试专家',
    role: overrides.role ?? ExpertRole.ARCHITECT(),
    systemPrompt: overrides.systemPrompt ?? '你是一个测试专家',
    tags: overrides.tags ?? [],
  });
}

/**
 * 创建测试对话
 */
export function createTestConversation(overrides: {
  name?: string;
  type?: ConversationType;
  expertIds?: string[];
} = {}): Conversation {
  return Conversation.create({
    name: overrides.name ?? '测试对话',
    type: overrides.type ?? ConversationType.SINGLE,
    expertIds: overrides.expertIds ?? [],
  });
}

/**
 * 创建多个测试专家
 */
export function createTestExperts(count: number): Expert[] {
  const roles = [
    ExpertRole.ARCHITECT(),
    ExpertRole.FRONTEND(),
    ExpertRole.BACKEND(),
    ExpertRole.SECURITY(),
    ExpertRole.QA(),
    ExpertRole.CODE_REVIEWER(),
  ];

  return Array.from({ length: count }, (_, i) =>
    Expert.create({
      name: `测试专家${i + 1}`,
      role: roles[i % roles.length],
      systemPrompt: `这是专家${i + 1}的系统提示词`,
      tags: [`标签${i % 3}`, `标签${(i + 1) % 3}`],
    })
  );
}

/**
 * 创建多个测试对话
 */
export function createTestConversations(count: number): Conversation[] {
  const types = [ConversationType.SINGLE, ConversationType.ROUND_ROBIN, ConversationType.PANEL];

  return Array.from({ length: count }, (_, i) =>
    Conversation.create({
      name: `测试对话${i + 1}`,
      type: types[i % types.length],
      expertIds: [],
    })
  );
}
