import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageExportDialog } from '@presentation/components/MessageExportDialog';
import * as exportUtils from '@infrastructure/utils/export';
import { createExportUtilsMock, setupGlobalMocks, clearAllMocks } from '../../__helpers__/test-mocks';
import { createTestMessages } from '../../__helpers__/test-factory';

// Setup global mocks
setupGlobalMocks({ url: true });

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

describe('MessageExportDialog', () => {
  const mockMessages = createTestMessages(2);
  const mockOnClose = vi.fn();
  const mockOnExport = vi.fn();

  beforeEach(() => {
    clearAllMocks();
  });

  describe('rendering', () => {
    it('renders export dialog when open', () => {
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

    it('does not render when closed', () => {
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

    it('displays message count', () => {
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

    it('displays format options', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('Markdown')).toBeInTheDocument();
      expect(screen.getByText('JSON')).toBeInTheDocument();
      expect(screen.getByText('纯文本')).toBeInTheDocument();
    });
  });

  describe('format selection', () => {
    it('selects Markdown by default', () => {
      render(
        <MessageExportDialog
          messages={mockMessages}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('value', 'markdown');
      expect(radios[0]).toBeChecked();
    });

    it('switches export format', () => {
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

  describe('export action', () => {
    it('calls onExport when clicking export', async () => {
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

    it('calls onClose after export', async () => {
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

  describe('cancel action', () => {
    it('calls onClose when clicking cancel', () => {
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

  describe('empty messages', () => {
    it('displays no messages hint', () => {
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

    it('does not show export button when no messages', () => {
      render(
        <MessageExportDialog
          messages={[]}
          isOpen={true}
          onClose={mockOnClose}
          onExport={mockOnExport}
        />
      );

      expect(screen.queryByText('导出')).not.toBeInTheDocument();
    });
  });
});
