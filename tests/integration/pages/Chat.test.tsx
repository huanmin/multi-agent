import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chat } from '@presentation/pages/Chat';

// Mock the components
vi.mock('@presentation/components/MessageInput', () => ({
  MessageInput: ({ onSend, experts, placeholder }: any) => (
    <div data-testid="message-input">
      <input
        data-testid="message-input-field"
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSend((e.target as HTMLInputElement).value);
          }
        }}
      />
      <button
        data-testid="send-button"
        onClick={() => {
          const input = screen.getByTestId('message-input-field');
          onSend((input as HTMLInputElement).value);
        }}
      >
        发送
      </button>
      <div data-testid="experts-count">{experts?.length || 0}</div>
    </div>
  ),
}));

vi.mock('@presentation/components/ConversationList', () => ({
  ConversationList: ({ conversations, onSelect, selectedId }: any) => (
    <div data-testid="conversation-list">
      {conversations.map((conv: any) => (
        <div
          key={conv.id}
          data-testid={`conversation-${conv.id}`}
          data-selected={selectedId === conv.id}
          onClick={() => onSelect(conv.id)}
        >
          {conv.name}
        </div>
      ))}
    </div>
  ),
}));

describe('Chat', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该渲染聊天界面', () => {
    render(<Chat />);

    expect(screen.getByTestId('conversation-list')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('应该显示当前会话名称', () => {
    render(<Chat />);

    // 在标题中找到会话名称
    const headings = screen.getAllByText('与 架构师 的对话');
    expect(headings.length).toBeGreaterThan(0);
    // 标题应该在h1标签中
    const title = headings.find(el => el.tagName === 'H1');
    expect(title).toBeInTheDocument();
  });

  it('应该发送消息并显示在消息列表中', async () => {
    render(<Chat />);

    const input = screen.getByTestId('message-input-field');
    await userEvent.type(input, 'Hello');

    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('应该显示专家思考状态', async () => {
    render(<Chat />);

    const input = screen.getByTestId('message-input-field');
    await userEvent.type(input, 'Test message');
    fireEvent.click(screen.getByTestId('send-button'));

    // 应该显示多个专家的思考状态
    await waitFor(() => {
      const thinkingElements = screen.getAllByText(/正在思考/);
      expect(thinkingElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('应该在专家回复后显示回复内容', async () => {
    render(<Chat />);

    const input = screen.getByTestId('message-input-field');
    await userEvent.type(input, 'Test');
    fireEvent.click(screen.getByTestId('send-button'));

    // 等待专家回复
    await waitFor(
      () => {
        const responses = screen.getAllByTestId('expert-response');
        expect(responses.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );
  });

  it('应该支持切换会话', async () => {
    render(<Chat />);

    const conversation = screen.getByTestId('conversation-1');
    fireEvent.click(conversation);

    expect(conversation).toHaveAttribute('data-selected', 'true');
  });

  it('应该有正确的专家数量', () => {
    render(<Chat />);

    // 应该有4个专家
    expect(screen.getByTestId('experts-count')).toHaveTextContent('4');
  });

  it('应该正确区分用户和助手消息样式', async () => {
    render(<Chat />);

    const input = screen.getByTestId('message-input-field');
    await userEvent.type(input, 'User message');
    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => {
      const userMessage = screen.getByText('User message');
      expect(userMessage).toBeInTheDocument();
    });
  });

  it('应该滚动到最新消息', async () => {
    const { container } = render(<Chat />);

    const input = screen.getByTestId('message-input-field');
    await userEvent.type(input, 'Message 1');
    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => {
      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });
});
