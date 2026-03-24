import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageActions } from '@presentation/components/MessageActions';
import { FollowUpInput } from '@presentation/components/FollowUpInput';

describe('追问功能组件', () => {
  const mockMessage = {
    id: 'msg-1',
    content: '建议使用微服务架构',
    role: 'assistant',
    expertId: 'architect',
    expertName: '架构师',
  };

  const mockOnFollowUp = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MessageActions 组件', () => {
    it('应该渲染追问按钮', () => {
      render(
        <MessageActions
          message={mockMessage}
          onFollowUp={mockOnFollowUp}
        />
      );

      expect(screen.getByText('追问')).toBeInTheDocument();
    });

    it('用户消息不应该显示追问按钮', () => {
      const userMessage = { ...mockMessage, role: 'user' };
      render(
        <MessageActions
          message={userMessage}
          onFollowUp={mockOnFollowUp}
        />
      );

      expect(screen.queryByText('追问')).not.toBeInTheDocument();
    });

    it('点击追问按钮应该调用 onFollowUp', () => {
      render(
        <MessageActions
          message={mockMessage}
          onFollowUp={mockOnFollowUp}
        />
      );

      fireEvent.click(screen.getByText('追问'));

      expect(mockOnFollowUp).toHaveBeenCalledWith(mockMessage);
    });

    it('应该显示其他操作按钮', () => {
      render(
        <MessageActions
          message={mockMessage}
          onFollowUp={mockOnFollowUp}
        />
      );

      expect(screen.getByText('复制')).toBeInTheDocument();
    });
  });

  describe('FollowUpInput 组件', () => {
    it('应该显示追问上下文', () => {
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

    it('应该能输入追问内容', () => {
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

    it('点击发送应该提交追问', async () => {
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

    it('空内容不应该提交', () => {
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

    it('点击取消应该调用 onCancel', () => {
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

    it('应该显示追问次数提示', () => {
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

    it('追问次数过多应该显示警告', () => {
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
