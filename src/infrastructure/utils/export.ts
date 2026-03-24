/**
 * 消息导出工具
 *
 * 支持多种格式导出对话消息
 */

import type { Message } from '@infrastructure/stores/message.store';

/**
 * 导出格式
 */
export type ExportFormat = 'markdown' | 'json' | 'txt';

/**
 * 导出选项
 */
export interface ExportOptions {
  format?: ExportFormat;
  includeTimestamp?: boolean;
  includeMetadata?: boolean;
  includeStats?: boolean;
  separator?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * 格式化日期
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] || '';
}

/**
 * 格式化时间
 */
function formatTime(date: Date): string {
  return date.toTimeString().split(' ')[0] || '';
}

/**
 * 获取发送者名称
 */
function getSenderName(message: Message): string {
  if (message.role === 'user') return '用户';
  if (message.role === 'system') return '系统';
  return message.expertName || '助手';
}

/**
 * 导出消息为 Markdown 格式
 */
export function exportMessagesToMarkdown(
  messages: Message[],
  options: ExportOptions = {}
): string {
  const { includeTimestamp = false, includeMetadata = true } = options;

  let markdown = '# 对话记录\n\n';

  messages.forEach((message, index) => {
    const sender = getSenderName(message);

    if (includeTimestamp && message.createdAt) {
      const date = new Date(message.createdAt);
      markdown += `**${formatDate(date)} ${formatTime(date)}**\n\n`;
    }

    if (includeMetadata) {
      markdown += `**${sender}**:\n\n`;
    }

    markdown += `${message.content}\n\n`;

    if (index < messages.length - 1) {
      markdown += '---\n\n';
    }
  });

  return markdown.trim();
}

/**
 * 导出消息为 JSON 格式
 */
export function exportMessagesToJSON(
  messages: Message[],
  options: ExportOptions = {}
): string {
  const exportData = messages.map((message) => {
    const data: Record<string, unknown> = {
      id: message.id,
      content: message.content,
      role: message.role,
      inputTokens: message.inputTokens || 0,
      outputTokens: message.outputTokens || 0,
      latencyMs: message.latencyMs || 0,
    };

    if (message.expertId) data.expertId = message.expertId;
    if (message.expertName) data.expertName = message.expertName;
    if (message.conversationId) data.conversationId = message.conversationId;
    if (message.createdAt) data.createdAt = message.createdAt.toISOString();

    return data;
  });

  return JSON.stringify(exportData, null, 2);
}

/**
 * 导出消息为纯文本格式
 */
export function exportMessagesToText(
  messages: Message[],
  options: ExportOptions = {}
): string {
  const { separator = '\n\n' } = options;

  return messages
    .map((message) => {
      const sender = getSenderName(message);
      return `${sender}: ${message.content}`;
    })
    .join(separator);
}

/**
 * 通用格式化导出
 */
export function formatMessagesForExport(
  messages: Message[],
  options: ExportOptions = {}
): string {
  const { format = 'markdown' } = options;

  switch (format) {
    case 'json':
      return exportMessagesToJSON(messages, options);
    case 'txt':
      return exportMessagesToText(messages, options);
    case 'markdown':
    default:
      return exportMessagesToMarkdown(messages, options);
  }
}

/**
 * 按日期范围过滤消息
 */
export function filterMessagesByDateRange(
  messages: Message[],
  startDate: Date,
  endDate: Date
): Message[] {
  return messages.filter((message) => {
    if (!message.createdAt) return false;
    const date = new Date(message.createdAt);
    return date >= startDate && date <= endDate;
  });
}

/**
 * 获取导出文件名
 */
export function getExportFileName(format: ExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const extensions: Record<ExportFormat, string> = {
    markdown: 'md',
    json: 'json',
    txt: 'txt',
  };
  return `conversation-${timestamp}.${extensions[format]}`;
}

/**
 * 获取 MIME 类型
 */
export function getMimeType(format: ExportFormat): string {
  const types: Record<ExportFormat, string> = {
    markdown: 'text/markdown',
    json: 'application/json',
    txt: 'text/plain',
  };
  return types[format];
}
