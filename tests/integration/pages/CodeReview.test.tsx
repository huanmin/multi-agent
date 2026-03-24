/**
 * CodeReview 页面测试
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeReview } from '@presentation/pages/CodeReview';
import { MemoryRouter } from 'react-router-dom';

const renderCodeReview = () => {
  return render(
    <MemoryRouter>
      <CodeReview />
    </MemoryRouter>
  );
};

describe('CodeReview Page', () => {
  it('应该显示页面标题', () => {
    renderCodeReview();
    expect(screen.getByText('代码审查')).toBeInTheDocument();
  });

  it('应该显示代码输入区域', () => {
    renderCodeReview();
    expect(screen.getByPlaceholderText(/在此粘贴/i)).toBeInTheDocument();
  });

  it('应该显示开始审查按钮', () => {
    renderCodeReview();
    expect(screen.getByRole('button', { name: /开始审查/i })).toBeInTheDocument();
  });

  it('应该显示清空按钮', () => {
    renderCodeReview();
    expect(screen.getByRole('button', { name: /清空/i })).toBeInTheDocument();
  });

  it('应该显示审查结果区域', () => {
    renderCodeReview();
    expect(screen.getByText('审查结果')).toBeInTheDocument();
  });

  it('空代码时开始审查按钮应该被禁用', async () => {
    renderCodeReview();

    const reviewButton = screen.getByRole('button', { name: /开始审查/i });
    // 检查按钮是否被禁用（通过 disabled 属性）
    expect(reviewButton).toBeDisabled();
  });
});
