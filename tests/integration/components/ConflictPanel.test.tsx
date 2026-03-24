import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConflictPanel, ConflictList } from '@presentation/components/ConflictPanel';
import type { Conflict, ExpertOpinion } from '@domain/conflict';

describe('ConflictPanel', () => {
  const mockConflict: Conflict = {
    id: 'conflict-1',
    type: '架构分歧',
    severity: '严重',
    category: '架构',
    participants: [
      {
        expertId: 'architect',
        expertName: '架构师',
        category: '架构',
        content: '建议使用微服务架构，提高可扩展性',
        confidence: 0.9,
        pros: ['可扩展性强', '独立部署'],
        cons: ['复杂度增加'],
      },
      {
        expertId: 'backend',
        expertName: '后端专家',
        category: '架构',
        content: '建议保持单体架构，降低复杂度',
        confidence: 0.85,
        pros: ['开发简单', '易于调试'],
        cons: ['扩展性受限'],
      },
    ],
    summary: '微服务 vs 单体架构之争',
    recommendation: '根据团队规模选择，7人以下建议单体',
    status: 'pending',
    detectedAt: new Date(),
  };

  const mockOnResolve = vi.fn();
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    mockOnResolve.mockClear();
    mockOnDismiss.mockClear();
  });

  it('应该渲染冲突标题和严重程度', () => {
    render(
      <ConflictPanel
        conflict={mockConflict}
        onResolve={mockOnResolve}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('架构分歧')).toBeInTheDocument();
    expect(screen.getByText('严重')).toBeInTheDocument();
  });

  it('应该显示双方专家观点', () => {
    render(
      <ConflictPanel
        conflict={mockConflict}
        onResolve={mockOnResolve}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('架构师')).toBeInTheDocument();
    expect(screen.getByText('后端专家')).toBeInTheDocument();
    expect(screen.getByText('建议使用微服务架构，提高可扩展性')).toBeInTheDocument();
    expect(screen.getByText('建议保持单体架构，降低复杂度')).toBeInTheDocument();
  });

  it('应该显示优缺点列表', () => {
    render(
      <ConflictPanel
        conflict={mockConflict}
        onResolve={mockOnResolve}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getAllByText('优点:').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('缺点:').length).toBeGreaterThanOrEqual(1);
  });

  it('应该显示决策建议', () => {
    render(
      <ConflictPanel
        conflict={mockConflict}
        onResolve={mockOnResolve}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText(/根据团队规模选择/)).toBeInTheDocument();
  });

  it('应该支持选择专家决策', async () => {
    const user = userEvent.setup();
    render(
      <ConflictPanel
        conflict={mockConflict}
        onResolve={mockOnResolve}
        onDismiss={mockOnDismiss}
      />
    );

    // 点击选择按钮（第一个专家的"选择"按钮）
    const selectButtons = screen.getAllByRole('button', { name: /选择/ });
    await user.click(selectButtons[0]);

    // 输入决策理由
    const reasonInput = screen.getByPlaceholderText(/输入决策理由/);
    await user.type(reasonInput, '团队需要更好的扩展性');

    // 确认决策
    const confirmButton = screen.getByRole('button', { name: /确认决策/ });
    await user.click(confirmButton);

    expect(mockOnResolve).toHaveBeenCalledWith('architect', '团队需要更好的扩展性');
  });

  it('应该支持忽略冲突', async () => {
    const user = userEvent.setup();
    render(
      <ConflictPanel
        conflict={mockConflict}
        onResolve={mockOnResolve}
        onDismiss={mockOnDismiss}
      />
    );

    const dismissButton = screen.getByRole('button', { name: /忽略/ });
    await user.click(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('应该显示冲突检测时间', () => {
    render(
      <ConflictPanel
        conflict={mockConflict}
        onResolve={mockOnResolve}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText(/检测时间/)).toBeInTheDocument();
  });
});

describe('ConflictList', () => {
  const mockConflicts: Conflict[] = [
    {
      id: 'conflict-1',
      type: '架构分歧',
      severity: '严重',
      category: '架构',
      participants: [],
      summary: '微服务 vs 单体',
      status: 'pending',
      detectedAt: new Date(),
    },
    {
      id: 'conflict-2',
      type: '安全分歧',
      severity: '警告',
      category: '安全',
      participants: [],
      summary: 'JWT vs Session',
      status: 'resolved',
      detectedAt: new Date(),
    },
  ];

  it('应该渲染冲突列表', () => {
    render(
      <ConflictList
        conflicts={mockConflicts}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('架构分歧')).toBeInTheDocument();
    expect(screen.getByText('安全分歧')).toBeInTheDocument();
  });

  it('应该按严重程度排序', () => {
    render(
      <ConflictList
        conflicts={mockConflicts}
        onSelect={() => {}}
      />
    );

    const items = screen.getAllByTestId('conflict-item');
    expect(items[0]).toHaveTextContent('严重');
  });

  it('应该支持筛选状态', async () => {
    const user = userEvent.setup();
    render(
      <ConflictList
        conflicts={mockConflicts}
        onSelect={() => {}}
      />
    );

    // 点击筛选按钮
    const filterButton = screen.getByRole('button', { name: /待处理/ });
    await user.click(filterButton);

    expect(screen.queryByText('安全分歧')).not.toBeInTheDocument();
    expect(screen.getByText('架构分歧')).toBeInTheDocument();
  });
});
