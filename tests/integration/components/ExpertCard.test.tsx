import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpertCard } from '@presentation/components/ExpertCard';

describe('ExpertCard', () => {
  const expert = {
    id: '1',
    name: '安全专家',
    avatar: 'avatar.png',
    description: '安全审查专家',
    tags: ['安全', '代码审查'],
  };

  it('应该渲染专家信息', () => {
    render(<ExpertCard expert={expert} />);
    expect(screen.getByText('安全专家')).toBeInTheDocument();
    expect(screen.getByText('安全审查专家')).toBeInTheDocument();
  });

  it('应该显示标签', () => {
    render(<ExpertCard expert={expert} />);
    expect(screen.getByText('安全')).toBeInTheDocument();
    expect(screen.getByText('代码审查')).toBeInTheDocument();
  });

  it('应该触发双击事件', async () => {
    const onDoubleClick = vi.fn();
    render(<ExpertCard expert={expert} onDoubleClick={onDoubleClick} />);

    await userEvent.dblClick(screen.getByText('安全专家'));
    expect(onDoubleClick).toHaveBeenCalledWith('1');
  });
});
