/**
 * 追问功能领域模型
 *
 * 处理消息追问的上下文管理和格式化
 */

/**
 * 追问上下文
 */
export interface FollowUpContext {
  /** 原始消息ID */
  originalMessageId: string;
  /** 原始消息内容 */
  originalContent: string;
  /** 专家ID */
  expertId: string;
  /** 专家名称 */
  expertName: string;
  /** 时间戳 */
  timestamp: Date;
  /** 追问次数 */
  followUpCount: number;
  /** 追问深度（层级） */
  depth?: number;
  /** 父上下文（用于追问链） */
  parentContext?: FollowUpContext;
  /** 根消息ID */
  rootMessageId?: string;
}

/**
 * 消息接口（用于创建追问上下文）
 */
export interface MessageForFollowUp {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  expertId?: string;
  expertName?: string;
}

/**
 * 追问选项
 */
export interface FollowUpOptions {
  /** 最大内容长度（用于截断） */
  maxLength?: number;
  /** 自定义前缀 */
  prefix?: string;
  /** 最大追问次数 */
  maxFollowUps?: number;
}

/**
 * 创建追问上下文
 */
export function createFollowUpContext(
  originalMessage: MessageForFollowUp,
  parentContext?: FollowUpContext
): FollowUpContext {
  const depth = parentContext ? (parentContext.depth || 1) + 1 : 1;
  const followUpCount = parentContext ? (parentContext.followUpCount || 0) + 1 : 1;
  const rootMessageId = parentContext?.rootMessageId || originalMessage.id;

  return {
    originalMessageId: originalMessage.id,
    originalContent: originalMessage.content,
    expertId: originalMessage.expertId || '',
    expertName: originalMessage.expertName || '助手',
    timestamp: new Date(),
    followUpCount,
    depth,
    parentContext,
    rootMessageId,
  };
}

/**
 * 截断内容
 */
function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + '...';
}

/**
 * 格式化追问消息
 */
export function formatFollowUpMessage(
  followUpContent: string,
  context: FollowUpContext,
  options: FollowUpOptions = {}
): string {
  const { maxLength = 200, prefix = '追问' } = options;

  const truncatedContent = truncateContent(context.originalContent, maxLength);

  return `[${prefix} - ${context.expertName}]
> ${truncatedContent}

${followUpContent}`;
}

/**
 * 验证追问是否有效
 */
export function isFollowUpValid(
  content: string,
  context: FollowUpContext,
  options: FollowUpOptions = {}
): boolean {
  const { maxFollowUps = 5 } = options;

  // 内容不能为空
  if (!content || content.trim().length === 0) {
    return false;
  }

  // 原始消息必须存在
  if (!context.originalMessageId) {
    return false;
  }

  // 追问次数不能超过限制
  if (context.followUpCount > maxFollowUps) {
    return false;
  }

  return true;
}

/**
 * 获取追问链信息
 */
export function getFollowUpChain(context: FollowUpContext): FollowUpContext[] {
  const chain: FollowUpContext[] = [context];
  let current = context;

  while (current.parentContext) {
    chain.unshift(current.parentContext);
    current = current.parentContext;
  }

  return chain;
}

/**
 * 生成追问摘要
 */
export function generateFollowUpSummary(context: FollowUpContext): string {
  const chain = getFollowUpChain(context);
  return `追问链：${chain.length} 层，共 ${context.followUpCount} 次追问`;
}
