/**
 * ExpertList 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpertList } from '@presentation/components/ExpertList';

describe('ExpertList', () => {
  const mockExperts = [
    {
      id: '1',
      name: '架构师',
      description: '系统架构设计专家',
      tags: ['架构', '设计'],
      role: '架构',
    },
    {
      id: '2',
      name: '前端专家',
      description: '前端开发专家',
      tags: ['前端', 'React'],
      role: '开发',
    },
    {
      id: '3',
      name: '后端专家',
      description: '后端开发专家',
      tags: ['后端', 'Node.js'],
      role: '开发',
    },
  ];

  it('应该渲染专家列表', () => {
    render(<ExpertList experts={mockExperts} />);

    expect(screen.getByText('架构师')).toBeInTheDocument();
    expect(screen.getByText('前端专家')).toBeInTheDocument();
    expect(screen.getByText('后端专家')).toBeInTheDocument();
  });

  it('应该显示专家描述', () => {
    render(<ExpertList experts={mockExperts} />);

    expect(screen.getByText('系统架构设计专家')).toBeInTheDocument();
    expect(screen.getByText('前端开发专家')).toBeInTheDocument();
  });

  it('应该按角色分组显示', () => {
    render(<ExpertList experts={mockExperts} />);

    expect(screen.getByText('架构')).toBeInTheDocument();
    expect(screen.getByText('开发')).toBeInTheDocument();
  });

  it('应该触发选择事件', async () => {
    const onSelect = vi.fn();
    render(<ExpertList experts={mockExperts} onSelect={onSelect} />);

    await userEvent.click(screen.getByText('架构师'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('应该触发双击事件', async () => {
    const onDoubleClick = vi.fn();
    render(<ExpertList experts={mockExperts} onDoubleClick={onDoubleClick} />);

    await userEvent.dblClick(screen.getByText('架构师'));
    expect(onDoubleClick).toHaveBeenCalledWith('1');
  });

  it('应该高亮选中的专家', () => {
    render(<ExpertList experts={mockExperts} selectedId="1" />);

    const selectedButton = screen.getByText('架构师').closest('button');
    expect(selectedButton?.className).toContain('border-cyan-500');
  });

  it('应该支持搜索过滤', async () => {
    render(<ExpertList experts={mockExperts} />);

    const searchInput = screen.getByPlaceholderText('搜索专家...');
    await userEvent.type(searchInput, '前端');

    expect(screen.getByText('前端专家')).toBeInTheDocument();
    expect(screen.queryByText('架构师')).not.toBeInTheDocument();
    expect(screen.queryByText('后端专家')).not.toBeInTheDocument();
  });

  it('应该支持按标签搜索', async () => {
    render(<ExpertList experts={mockExperts} />);

    const searchInput = screen.getByPlaceholderText('搜索专家...');
    await userEvent.type(searchInput, 'React');

    expect(screen.getByText('前端专家')).toBeInTheDocument();
    expect(screen.queryByText('架构师')).not.toBeInTheDocument();
  });

  it('应该支持按描述搜索', async () => {
    render(<ExpertList experts={mockExperts} />);

    const searchInput = screen.getByPlaceholderText('搜索专家...');
    await userEvent.type(searchInput, '系统架构');

    expect(screen.getByText('架构师')).toBeInTheDocument();
    expect(screen.queryByText('前端专家')).not.toBeInTheDocument();
  });

  it('应该显示无结果提示', async () => {
    render(<ExpertList experts={mockExperts} />);

    const searchInput = screen.getByPlaceholderText('搜索专家...');
    await userEvent.type(searchInput, '不存在');

    expect(screen.getByText('没有找到匹配的专家')).toBeInTheDocument();
  });

  it('应该支持清空搜索', async () => {
    render(<ExpertList experts={mockExperts} />);

    const searchInput = screen.getByPlaceholderText('搜索专家...');
    await userEvent.type(searchInput, '前端');

    const clearButton = screen.getByText('✕');
    await userEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
    expect(screen.getByText('架构师')).toBeInTheDocument();
  });

  it('应该支持禁用搜索', () => {
    render(<ExpertList experts={mockExperts} searchable={false} />);

    expect(screen.queryByPlaceholderText('搜索专家...')).not.toBeInTheDocument();
  });

  it('应该显示默认头像', () => {
    render(<ExpertList experts={mockExperts} />);

    // 检查是否有默认头像（专家名称首字母）
    expect(screen.getAllByText('架')).toHaveLength(1);
    expect(screen.getAllByText('前')).toHaveLength(1);
    expect(screen.getAllByText('后')).toHaveLength(1);
  });

  it('应该正确处理空列表', () => {
    render(<ExpertList experts={[]} />);

    expect(screen.getByText('没有找到匹配的专家')).toBeInTheDocument();
  });
});
