/**
 * 测试工厂函数
 *
 * 提供统一的测试数据创建函数
 */

import { Expert, ExpertRole } from '@domain/expert';
import { Conversation, ConversationType } from '@domain/conversation';
import type { Message } from '@infrastructure/stores/message.store';
import type { LLMProvider, Settings, Theme, Language } from '@infrastructure/stores/settings.store';
import type { Conflict, ConflictSeverity, ConflictStatus, ExpertOpinion } from '@domain/conflict';
import type { FollowUpContext } from '@domain/follow-up';

// ==================== ExpertOpinion Factories ====================

/**
 * 创建测试专家意见
 */
export function createTestExpertOpinion(overrides: Partial<ExpertOpinion> = {}): ExpertOpinion {
  return {
    expertId: overrides.expertId ?? 'expert-1',
    expertName: overrides.expertName ?? '测试专家',
    category: overrides.category ?? '架构',
    content: overrides.content ?? '建议使用微服务架构',
    confidence: overrides.confidence ?? 0.85,
    pros: overrides.pros ?? [],
    cons: overrides.cons ?? [],
  };
}

/**
 * 创建测试冲突意见对
 */
export function createTestConflictOpinions(): ExpertOpinion[] {
  return [
    createTestExpertOpinion({
      expertId: 'expert-1',
      expertName: '架构师',
      category: '架构',
      content: '建议使用微服务架构，将单体应用拆分成多个独立服务',
      confidence: 0.9,
    }),
    createTestExpertOpinion({
      expertId: 'expert-2',
      expertName: '后端专家',
      category: '架构',
      content: '建议保持单体架构，当前业务复杂度不需要微服务',
      confidence: 0.85,
    }),
  ];
}

// ==================== Original Factories ====================

/**
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

// ==================== Settings Store Factories ====================

/**
 * 创建测试 Provider
 */
export function createTestProvider(overrides: Partial<LLMProvider> = {}): LLMProvider {
  return {
    id: overrides.id ?? `provider-${Date.now()}`,
    name: overrides.name ?? 'Test Provider',
    apiKey: overrides.apiKey ?? 'test-api-key',
    baseUrl: overrides.baseUrl ?? 'https://api.test.com',
    model: overrides.model ?? 'test-model',
    enabled: overrides.enabled ?? true,
  };
}

/**
 * 创建测试 Settings
 */
export function createTestSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    providers: overrides.providers ?? [],
    defaultProviderId: overrides.defaultProviderId ?? null,
    theme: (overrides.theme as Theme) ?? 'dark',
    language: (overrides.language as Language) ?? 'zh',
    dataPath: overrides.dataPath ?? '',
    autoBackup: overrides.autoBackup ?? false,
  };
}

// ==================== Message Store Factories ====================

/**
 * 创建测试消息
 */
export function createTestMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: overrides.id ?? `msg-${Date.now()}`,
    content: overrides.content ?? '测试消息内容',
    role: overrides.role ?? 'user',
    conversationId: overrides.conversationId ?? 'conv-1',
    expertId: overrides.expertId,
    expertName: overrides.expertName,
    mentions: overrides.mentions ?? [],
    inputTokens: overrides.inputTokens ?? 0,
    outputTokens: overrides.outputTokens ?? 0,
    latencyMs: overrides.latencyMs ?? 0,
    createdAt: overrides.createdAt ?? new Date(),
  };
}

/**
 * 创建测试用户消息
 */
export function createTestUserMessage(content: string, overrides: Partial<Message> = {}): Message {
  return createTestMessage({ ...overrides, content, role: 'user' });
}

/**
 * 创建测试助手消息
 */
export function createTestAssistantMessage(
  content: string,
  expertName: string,
  overrides: Partial<Message> = {}
): Message {
  return createTestMessage({
    ...overrides,
    content,
    role: 'assistant',
    expertId: overrides.expertId ?? 'expert-1',
    expertName,
  });
}

/**
 * 创建多个测试消息
 */
export function createTestMessages(count: number, conversationId?: string): Message[] {
  return Array.from({ length: count }, (_, i) =>
    createTestMessage({
      id: `msg-${i}`,
      content: `消息内容 ${i + 1}`,
      role: i % 2 === 0 ? 'user' : 'assistant',
      conversationId: conversationId ?? `conv-${i % 3}`,
      expertName: i % 2 === 1 ? `专家${i}` : undefined,
    })
  );
}

// ==================== Conflict Domain Factories ====================

/**
 * 创建测试冲突
 */
export function createTestConflict(overrides: Partial<Conflict> = {}): Conflict {
  return {
    id: overrides.id ?? `conflict-${Date.now()}`,
    type: overrides.type ?? '架构分歧',
    severity: (overrides.severity as ConflictSeverity) ?? '警告',
    category: overrides.category ?? '架构',
    participants: overrides.participants ?? [
      {
        expertId: 'expert-1',
        expertName: '专家A',
        category: '架构',
        content: '建议A',
        confidence: 0.8,
      },
      {
        expertId: 'expert-2',
        expertName: '专家B',
        category: '架构',
        content: '建议B',
        confidence: 0.75,
      },
    ],
    summary: overrides.summary ?? '专家A与专家B在架构上存在分歧',
    recommendation: overrides.recommendation ?? '建议综合考虑',
    status: (overrides.status as ConflictStatus) ?? 'pending',
    detectedAt: overrides.detectedAt ?? new Date(),
    resolvedAt: overrides.resolvedAt,
    resolution: overrides.resolution,
  };
}

// ==================== Follow-up Domain Factories ====================

/**
 * 创建测试追问上下文
 */
export function createTestFollowUpContext(
  overrides: Partial<FollowUpContext> = {}
): FollowUpContext {
  return {
    originalMessageId: overrides.originalMessageId ?? 'msg-1',
    originalContent: overrides.originalContent ?? '原始消息内容',
    expertId: overrides.expertId ?? 'expert-1',
    expertName: overrides.expertName ?? '测试专家',
    timestamp: overrides.timestamp ?? new Date(),
    followUpCount: overrides.followUpCount ?? 1,
    depth: overrides.depth ?? 1,
    rootMessageId: overrides.rootMessageId ?? 'msg-1',
  };
}

/**
 * 创建带父上下文的测试追问上下文
 */
export function createTestFollowUpContextWithParent(
  parentContext: FollowUpContext,
  overrides: Partial<FollowUpContext> = {}
): FollowUpContext {
  return {
    ...createTestFollowUpContext(),
    ...overrides,
    parentContext,
    depth: (parentContext.depth ?? 1) + 1,
    followUpCount: (parentContext.followUpCount ?? 1) + 1,
    rootMessageId: parentContext.rootMessageId ?? parentContext.originalMessageId,
  };
}
