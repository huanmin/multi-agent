/**
 * CodeReview 页面测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

  it('应该能够输入代码', async () => {
    renderCodeReview();

    const textarea = screen.getByPlaceholderText(/在此粘贴/i);
    fireEvent.change(textarea, { target: { value: 'function test() { return 1; }' } });

    expect(textarea).toHaveValue('function test() { return 1; }');
  });

  it('输入代码后应该启用开始审查按钮', async () => {
    renderCodeReview();

    const textarea = screen.getByPlaceholderText(/在此粘贴/i);
    fireEvent.change(textarea, { target: { value: 'function test() { return 1; }' } });

    const reviewButton = screen.getByRole('button', { name: /开始审查/i });
    expect(reviewButton).not.toBeDisabled();
  });

  it('应该能够清空代码', async () => {
    renderCodeReview();

    const textarea = screen.getByPlaceholderText(/在此粘贴/i);
    fireEvent.change(textarea, { target: { value: 'function test() { return 1; }' } });
    expect(textarea).toHaveValue('function test() { return 1; }');

    const clearButton = screen.getByRole('button', { name: /清空/i });
    await userEvent.click(clearButton);

    expect(textarea).toHaveValue('');
  });

  it('应该显示审查中状态', async () => {
    renderCodeReview();

    const textarea = screen.getByPlaceholderText(/在此粘贴/i);
    fireEvent.change(textarea, { target: { value: 'function test() { return 1; }' } });

    const reviewButton = screen.getByRole('button', { name: /开始审查/i });
    await userEvent.click(reviewButton);

    // 应该显示审查中状态
    expect(screen.getByText('审查中...')).toBeInTheDocument();
    expect(screen.getByText(/多专家正在审查中/)).toBeInTheDocument();
  });

  it('应该显示审查结果', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderCodeReview();

    const textarea = screen.getByPlaceholderText(/在此粘贴/i);
    fireEvent.change(textarea, { target: { value: 'function test() { return 1; }' } });

    const reviewButton = screen.getByRole('button', { name: /开始审查/i });
    await userEvent.click(reviewButton);

    // 等待审查完成
    vi.advanceTimersByTime(2000);

    // 应该显示审查结果
    await waitFor(() => {
      expect(screen.getByText('函数命名应该使用 camelCase')).toBeInTheDocument();
      expect(screen.getByText('未验证的输入可能导致安全问题')).toBeInTheDocument();
    }, { timeout: 3000 });

    vi.useRealTimers();
  });

  it('应该显示分类统计', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderCodeReview();

    const textarea = screen.getByPlaceholderText(/在此粘贴/i);
    fireEvent.change(textarea, { target: { value: 'function test() { return 1; }' } });

    const reviewButton = screen.getByRole('button', { name: /开始审查/i });
    await userEvent.click(reviewButton);

    // 等待审查完成
    vi.advanceTimersByTime(2000);

    // 应该显示分类统计
    await waitFor(() => {
      expect(screen.getAllByText('代码规范').length).toBeGreaterThan(0);
      expect(screen.getAllByText('性能优化').length).toBeGreaterThan(0);
      expect(screen.getAllByText('安全漏洞').length).toBeGreaterThan(0);
      expect(screen.getAllByText('最佳实践').length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    vi.useRealTimers();
  });

  it('应该显示严重级别标签', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderCodeReview();

    const textarea = screen.getByPlaceholderText(/在此粘贴/i);
    fireEvent.change(textarea, { target: { value: 'function test() { return 1; }' } });

    const reviewButton = screen.getByRole('button', { name: /开始审查/i });
    await userEvent.click(reviewButton);

    // 等待审查完成
    vi.advanceTimersByTime(2000);

    // 应该显示严重级别
    await waitFor(() => {
      expect(screen.getAllByText('严重').length).toBeGreaterThan(0);
      expect(screen.getAllByText('警告').length).toBeGreaterThan(0);
      expect(screen.getAllByText('建议').length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    vi.useRealTimers();
  });

  it('提交审查后应该禁用按钮', async () => {
    renderCodeReview();

    const textarea = screen.getByPlaceholderText(/在此粘贴/i);
    fireEvent.change(textarea, { target: { value: 'function test() { return 1; }' } });

    const reviewButton = screen.getByRole('button', { name: /开始审查/i });
    await userEvent.click(reviewButton);

    // 审查中按钮应该被禁用
    expect(reviewButton).toBeDisabled();
  });
});
