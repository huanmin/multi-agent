/**
 * ExpertManager 页面测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpertManager } from '@presentation/pages/ExpertManager';

describe('ExpertManager Page', () => {
  it('应该显示页面标题', () => {
    render(<ExpertManager />);
    expect(screen.getByText('专家团队')).toBeInTheDocument();
  });

  it('应该显示创建专家按钮', () => {
    render(<ExpertManager />);
    expect(screen.getByRole('button', { name: /创建专家/i })).toBeInTheDocument();
  });

  it('应该显示内置专家列表', () => {
    render(<ExpertManager />);
    expect(screen.getByText('架构师')).toBeInTheDocument();
    expect(screen.getByText('前端专家')).toBeInTheDocument();
    expect(screen.getByText('后端专家')).toBeInTheDocument();
  });

  it('应该打开创建专家模态框', async () => {
    const user = userEvent.setup();
    render(<ExpertManager />);

    const createButton = screen.getByRole('button', { name: /^创建专家$/i });
    await user.click(createButton);

    await waitFor(() => {
      // 使用 heading 角色查找模态框标题
      expect(screen.getByRole('heading', { name: /^创建专家$/i })).toBeInTheDocument();
    });
  });

  it('应该在模态框中显示表单字段', async () => {
    const user = userEvent.setup();
    render(<ExpertManager />);

    const createButton = screen.getByRole('button', { name: /^创建专家$/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^创建专家$/i })).toBeInTheDocument();
    });

    // 表单字段
    expect(screen.getByLabelText(/名称/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/描述/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/系统提示词/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/标签/i)).toBeInTheDocument();
  });

  it('应该可以关闭模态框', async () => {
    const user = userEvent.setup();
    render(<ExpertManager />);

    // 打开模态框
    const createButton = screen.getByRole('button', { name: /^创建专家$/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^创建专家$/i })).toBeInTheDocument();
    });

    // 点击取消
    const cancelButton = screen.getByRole('button', { name: /取消/i });
    await user.click(cancelButton);

    // 验证模态框关闭
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /^创建专家$/i })).not.toBeInTheDocument();
    });
  });

  it('应该支持创建新专家', async () => {
    const user = userEvent.setup();
    render(<ExpertManager />);

    // 打开模态框
    const createButton = screen.getByRole('button', { name: /^创建专家$/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^创建专家$/i })).toBeInTheDocument();
    });

    // 填写表单
    await user.type(screen.getByLabelText(/名称/i), '新专家');
    await user.type(screen.getByLabelText(/描述/i), '测试描述');
    await user.type(screen.getByLabelText(/系统提示词/i), '你是一个测试专家');

    // 提交表单
    const saveButton = screen.getByRole('button', { name: /保存/i });
    await user.click(saveButton);

    // 验证新专家被创建
    await waitFor(() => {
      expect(screen.getByText('新专家')).toBeInTheDocument();
    });
  });
});
