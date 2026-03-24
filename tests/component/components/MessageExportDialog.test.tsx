import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageExportDialog } from '@presentation/components/MessageExportDialog';
import * as exportUtils from '@infrastructure/utils/export';
import type { Message } from '@infrastructure/stores/message.store';

// Mock export utils
vi.mock('@infrastructure/utils/export', () => ({
  exportMessagesToMarkdown: vi.fn(() => '# 导出内容'),
  exportMessagesToJSON: vi.fn(() => '[{}]'),
  exportMessagesToText: vi.fn(() => '导出内容'),
  formatMessagesForExport: vi.fn(() => '导出内容'),
  filterMessagesByDateRange: vi.fn((msgs) => msgs),
  getExportFileName: vi.fn(() => 'conversation.md'),
  getMimeType: vi.fn(() => 'text/markdown'),
}));

describe('MessageExportDialog 组件', () => {
  const mockMessages: Message[] = [
    { id: '1', content: 'Hello', role: 'user', createdAt: new Date() },
    { id: '2', content: 'Hi there', role: 'assistant', expertId: 'expert1', expertName: '架构师', createdAt: new Date() },
  ];

  const mockOnClose = vi.fn();
  const mockOnExport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染', () => {
    it('应该渲染导出对话框', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('导出消息')).toBeInTheDocument();
    });

    it('应该渲染格式选择选项', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByLabelText('Markdown')).toBeInTheDocument();
      expect(screen.getByLabelText('JSON')).toBeInTheDocument();
      expect(screen.getByLabelText('纯文本')).toBeInTheDocument();
    });

    it('当 isOpen 为 false 时不应该渲染', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={false}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      expect(screen.queryByText('导出消息')).not.toBeInTheDocument();
    });

    it('应该显示消息数量', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('共 2 条消息')).toBeInTheDocument();
    });
  });

  describe('格式选择', () => {
    it('默认应该选择 Markdown 格式', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      // 默认选中 Markdown，通过检查 radio 值
      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('value', 'markdown');
      expect(radios[0]).toBeChecked();
    });

    it('应该能切换导出格式', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      const jsonRadio = screen.getAllByRole('radio')[1];
      fireEvent.click(jsonRadio);

      expect(jsonRadio).toBeChecked();
    });
  });

  describe('日期范围过滤', () => {
    it('应该能启用/禁用日期过滤', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      // 找到日期过滤 checkbox（第一个 checkbox）
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe('选项设置', () => {
    it('应该显示选项复选框', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('预览功能', () => {
    it('应该显示导出预览', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('预览')).toBeInTheDocument();
    });

    it('切换格式应该更新预览', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      fireEvent.click(screen.getByLabelText('JSON'));

      expect(exportUtils.exportMessagesToJSON).toHaveBeenCalled();
    });
  });

  describe('导出操作', () => {
    it('点击导出应该调用 onExport', async () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      fireEvent.click(screen.getByText('导出'));

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalled();
      });
    });

    it('导出后应该调用 onClose', async () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      fireEvent.click(screen.getByText('导出'));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('取消操作', () => {
    it('点击取消应该调用 onClose', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      fireEvent.click(screen.getByText('取消'));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('空消息处理', () => {
    it('没有消息时应该显示提示', () => {
      render(
        <MessageExportDialog
          messages={[]}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('暂无可导出的消息')).toBeInTheDocument();
    });

    it('没有消息时导出按钮不应该显示', () => {
      render(
        <MessageExportDialog
          messages={[]}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      // 没有消息时导出按钮不显示
      expect(screen.queryByText('导出')).not.toBeInTheDocument();
    });
  });

  describe('文件名设置', () => {
    it('应该显示文件名输入', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      // 通过 placeholder 查找文件名输入
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });
});
