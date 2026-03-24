/**
 * Welcome 页面测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Welcome } from '@presentation/pages/Welcome';

const renderWelcome = (onComplete = vi.fn()) => {
  return render(<Welcome onComplete={onComplete} />);
};

describe('Welcome Page', () => {
  it('应该显示欢迎标题', () => {
    renderWelcome();
    expect(screen.getByText('欢迎使用 Multi-Agent')).toBeInTheDocument();
  });

  it('应该显示功能介绍', () => {
    renderWelcome();
    expect(screen.getByText('您的智能协作平台，让多个 AI 专家协同工作')).toBeInTheDocument();
  });

  it('应该显示进度指示器', () => {
    renderWelcome();
    const indicators = screen.getAllByText('', { selector: '.rounded-full' });
    expect(indicators.length).toBeGreaterThanOrEqual(4);
  });

  it('应该响应下一步按钮', async () => {
    const user = userEvent.setup();
    renderWelcome();

    const nextButton = screen.getByRole('button', { name: /下一步/i });
    await user.click(nextButton);

    // 验证切换到第二页
    expect(screen.getByText('发现专家团队')).toBeInTheDocument();
  });

  it('应该响应跳过按钮', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWelcome(onComplete);

    const skipButton = screen.getByRole('button', { name: /跳过/i });
    await user.click(skipButton);

    expect(onComplete).toHaveBeenCalled();
  });

  it('应该在最后一步显示开始使用', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWelcome(onComplete);

    // 点击下一步直到最后一步
    for (let i = 0; i < 3; i++) {
      const nextButton = screen.getByRole('button', { name: /下一步/i });
      await user.click(nextButton);
    }

    // 在最后一步应该显示"开始使用"
    const startButton = screen.getByRole('button', { name: /开始使用/i });
    expect(startButton).toBeInTheDocument();

    await user.click(startButton);
    expect(onComplete).toHaveBeenCalled();
  });

  it('应该显示步骤图标', () => {
    renderWelcome();
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });
});
