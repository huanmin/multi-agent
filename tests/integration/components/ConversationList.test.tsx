import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationList } from '@presentation/components/ConversationList';

describe('ConversationList', () => {
  const mockConversations = [
    { id: '1', name: '会话A', lastMessage: '最后消息', unreadCount: 2 },
    { id: '2', name: '会话B', lastMessage: '已读消息', unreadCount: 0 },
  ];

  it('应该渲染会话列表', () => {
    render(<ConversationList conversations={mockConversations} />);
    expect(screen.getByText('会话A')).toBeInTheDocument();
    expect(screen.getByText('会话B')).toBeInTheDocument();
  });

  it('应该显示未读徽章', () => {
    render(<ConversationList conversations={mockConversations} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('应该触发会话选择', async () => {
    const onSelect = vi.fn();
    render(<ConversationList conversations={mockConversations} onSelect={onSelect} />);

    await userEvent.click(screen.getByText('会话A'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
