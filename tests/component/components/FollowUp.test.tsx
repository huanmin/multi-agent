import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageActions } from '@presentation/components/MessageActions';
import { FollowUpInput } from '@presentation/components/FollowUpInput';
import { createTestAssistantMessage, createTestUserMessage } from '../../__helpers__/test-factory';
import { clearAllMocks } from '../../__helpers__/test-mocks';

describe('Follow-up Feature', () => {
  const mockMessage = createTestAssistantMessage('建议使用微服务架构', '架构师', {
    expertId: 'architect',
  });

  const mockOnFollowUp = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    clearAllMocks();
  });

  describe('MessageActions', () => {
    it('renders follow-up button for assistant messages', () => {
      render(<MessageActions message={mockMessage} onFollowUp={mockOnFollowUp} />);
      expect(screen.getByText('追问')).toBeInTheDocument();
    });

    it('does not show follow-up button for user messages', () => {
      const userMessage = createTestUserMessage('用户问题');
      render(<MessageActions message={userMessage} onFollowUp={mockOnFollowUp} />);
      expect(screen.queryByText('追问')).not.toBeInTheDocument();
    });

    it('calls onFollowUp when clicking follow-up button', () => {
      render(<MessageActions message={mockMessage} onFollowUp={mockOnFollowUp} />);
      fireEvent.click(screen.getByText('追问'));
      expect(mockOnFollowUp).toHaveBeenCalledWith(mockMessage);
    });

    it('renders copy button', () => {
      render(<MessageActions message={mockMessage} onFollowUp={mockOnFollowUp} />);
      expect(screen.getByText('复制')).toBeInTheDocument();
    });
  });

  describe('FollowUpInput', () => {
    it('displays follow-up context', () => {
      render(
        <FollowUpInput
          originalMessage={mockMessage}
          onSubmit={mockOnFollowUp}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/追问 - 架构师/)).toBeInTheDocument();
      expect(screen.getByText(/建议使用微服务架构/)).toBeInTheDocument();
    });

    it('allows input of follow-up content', () => {
      render(
        <FollowUpInput
          originalMessage={mockMessage}
          onSubmit={mockOnFollowUp}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByPlaceholderText('请输入追问内容...') as HTMLTextAreaElement;
      fireEvent.change(input, { target: { value: '为什么不用单体架构？' } });

      expect(input.value).toBe('为什么不用单体架构？');
    });

    it('submits follow-up when clicking send', async () => {
      render(
        <FollowUpInput
          originalMessage={mockMessage}
          onSubmit={mockOnFollowUp}
          onCancel={mockOnCancel}
        />
      );

      const input = screen.getByPlaceholderText('请输入追问内容...');
      fireEvent.change(input, { target: { value: '为什么不用单体架构？' } });
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() => {
        expect(mockOnFollowUp).toHaveBeenCalled();
      });
    });

    it('disables send button for empty content', () => {
      render(
        <FollowUpInput
          originalMessage={mockMessage}
          onSubmit={mockOnFollowUp}
          onCancel={mockOnCancel}
        />
      );

      const sendButton = screen.getByText('发送');
      expect(sendButton).toBeDisabled();
    });

    it('calls onCancel when clicking cancel', () => {
      render(
        <FollowUpInput
          originalMessage={mockMessage}
          onSubmit={mockOnFollowUp}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText('取消'));
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('displays follow-up count hint', () => {
      render(
        <FollowUpInput
          originalMessage={mockMessage}
          onSubmit={mockOnFollowUp}
          onCancel={mockOnCancel}
          followUpCount={3}
        />
      );

      expect(screen.getByText(/第 3 次追问/)).toBeInTheDocument();
    });

    it('displays warning for excessive follow-ups', () => {
      render(
        <FollowUpInput
          originalMessage={mockMessage}
          onSubmit={mockOnFollowUp}
          onCancel={mockOnCancel}
          followUpCount={6}
        />
      );

      expect(screen.getByText(/追问次数过多/)).toBeInTheDocument();
    });
  });
});
