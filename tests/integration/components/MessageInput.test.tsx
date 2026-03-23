import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInput } from '@presentation/components/MessageInput';

describe('MessageInput', () => {
  it('应该渲染输入框', () => {
    render(<MessageInput onSend={vi.fn()} />);
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });


  it('应该触发发送', async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('输入消息...');
    await userEvent.type(input, 'Hello');
    await userEvent.click(screen.getByRole('button', { name: '发送' }));

    expect(onSend).toHaveBeenCalledWith('Hello', undefined);
  });

  it('应该支持@提及', async () => {
    const experts = [{ id: '1', name: 'Expert' }];
    render(<MessageInput onSend={vi.fn()} experts={experts} />);


    const input = screen.getByPlaceholderText('输入消息...');
    await userEvent.type(input, '@Ex');

    expect(screen.getByText('Expert')).toBeInTheDocument();
  });

  it('应该禁用空消息发送', async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);


    await userEvent.click(screen.getByRole('button', { name: '发送' }));
    expect(onSend).not.toHaveBeenCalled();
  });
});
