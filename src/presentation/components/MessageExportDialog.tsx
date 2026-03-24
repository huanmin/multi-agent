/**
 * MessageExportDialog 消息导出对话框
 *
 * 支持多种格式导出对话消息
 */

import { useState, useMemo } from 'react';
import type { Message } from '@infrastructure/stores/message.store';
import {
  exportMessagesToMarkdown,
  exportMessagesToJSON,
  exportMessagesToText,
  filterMessagesByDateRange,
  getExportFileName,
  getMimeType,
  type ExportFormat,
} from '@infrastructure/utils/export';

interface MessageExportDialogProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
  onExport?: (content: string, filename: string, mimeType: string) => void;
}

export function MessageExportDialog({
  messages,
  isOpen,
  onClose,
  onExport,
}: MessageExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('markdown');
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [enableDateFilter, setEnableDateFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customFilename, setCustomFilename] = useState('');

  const filteredMessages = useMemo(() => {
    if (!enableDateFilter || !startDate || !endDate) {
      return messages;
    }
    return filterMessagesByDateRange(
      messages,
      new Date(startDate),
      new Date(endDate)
    );
  }, [messages, enableDateFilter, startDate, endDate]);

  const preview = useMemo(() => {
    const options = {
      includeTimestamp,
      includeMetadata,
    };

    switch (format) {
      case 'json':
        return exportMessagesToJSON(filteredMessages, options);
      case 'txt':
        return exportMessagesToText(filteredMessages, options);
      case 'markdown':
      default:
        return exportMessagesToMarkdown(filteredMessages, options);
    }
  }, [filteredMessages, format, includeTimestamp, includeMetadata]);

  const filename = useMemo(() => {
    if (customFilename.trim()) {
      const ext = format === 'markdown' ? 'md' : format;
      return `${customFilename.trim()}.${ext}`;
    }
    return getExportFileName(format);
  }, [customFilename, format]);

  const mimeType = useMemo(() => getMimeType(format), [format]);

  const handleExport = () => {
    if (filteredMessages.length === 0) return;

    if (onExport) {
      onExport(preview, filename, mimeType);
    } else {
      // 默认导出行为
      const blob = new Blob([preview], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">导出消息</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">暂无可导出的消息</p>
          </div>
        ) : (
          <>
            {/* 消息数量 */}
            <div className="mb-4 text-sm text-slate-400">
              共 {filteredMessages.length} 条消息
              {enableDateFilter && filteredMessages.length !== messages.length && (
                <span className="ml-2 text-cyan-400">
                  (已过滤，原 {messages.length} 条)
                </span>
              )}
            </div>

            {/* 格式选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">导出格式</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="export-format"
                    value="markdown"
                    checked={format === 'markdown'}
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                    className="w-4 h-4 text-cyan-600"
                  />
                  <span>Markdown</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="export-format"
                    value="json"
                    checked={format === 'json'}
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                    className="w-4 h-4 text-cyan-600"
                  />
                  <span>JSON</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="export-format"
                    value="txt"
                    checked={format === 'txt'}
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                    className="w-4 h-4 text-cyan-600"
                  />
                  <span>纯文本</span>
                </label>
              </div>
            </div>

            {/* 选项设置 */}
            <div className="mb-6 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600"
                />
                <span>包含时间戳</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600"
                />
                <span>包含元数据（发送者信息）</span>
              </label>
            </div>

            {/* 日期过滤 */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={enableDateFilter}
                  onChange={(e) => setEnableDateFilter(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600"
                />
                <span>按日期过滤</span>
              </label>

              {enableDateFilter && (
                <div className="flex gap-4 ml-6">
                  <div className="flex-1">
                    <label className="block text-sm text-slate-400 mb-1">
                      开始日期
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-slate-400 mb-1">
                      结束日期
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 文件名设置 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                文件名
              </label>
              <input
                type="text"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder={filename.replace(/\.\w+$/, '')}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
              />
              <p className="text-xs text-slate-400 mt-1">
                默认文件名: {filename}
              </p>
            </div>

            {/* 预览 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">预览</label>
              <div className="bg-slate-900 rounded-lg p-4 max-h-48 overflow-y-auto">
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                  {preview.slice(0, 1000)}
                  {preview.length > 1000 && '\n...'}
                </pre>
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleExport}
                disabled={filteredMessages.length === 0}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                导出
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
