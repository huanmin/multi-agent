/**
 * 专家管理页
 *
 * 查看、创建、编辑、克隆专家
 */

import { useState } from 'react';
import { ExpertList } from '../components/ExpertList';
import { ExpertCard } from '../components/ExpertCard';

interface Expert {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  tags: string[];
  role: string;
  systemPrompt: string;
}

// 模拟内置专家数据
const builtInExperts: Expert[] = [
  {
    id: '1',
    name: '架构师',
    description: '专注于系统架构设计',
    tags: ['架构', '设计'],
    role: '架构',
    systemPrompt: '你是一个资深的系统架构师，擅长设计和评估系统架构。',
  },
  {
    id: '2',
    name: '前端专家',
    description: '专注于前端开发最佳实践',
    tags: ['前端', 'React', 'Vue'],
    role: '开发',
    systemPrompt: '你是一个资深的前端开发专家，精通现代前端技术栈。',
  },
  {
    id: '3',
    name: '后端专家',
    description: '专注于后端架构和性能优化',
    tags: ['后端', 'Node.js', '数据库'],
    role: '开发',
    systemPrompt: '你是一个资深的后端开发专家，精通服务端架构。',
  },
  {
    id: '4',
    name: '安全专家',
    description: '专注于代码安全审查',
    tags: ['安全', '审计'],
    role: '安全',
    systemPrompt: '你是一个代码安全专家，专注于发现安全漏洞。',
  },
  {
    id: '5',
    name: '代码审查员',
    description: '专注于代码质量和规范',
    tags: ['代码审查', '规范'],
    role: '审查',
    systemPrompt: '你是一个代码审查专家，关注代码质量和最佳实践。',
  },
  {
    id: '6',
    name: 'QA工程师',
    description: '专注于测试策略',
    tags: ['测试', 'QA'],
    role: '测试',
    systemPrompt: '你是一个 QA 专家，专注于测试覆盖率和质量保障。',
  },
];

interface ExpertManagerProps {
  onStartChat?: (expertId: string) => void;
}

export function ExpertManager({ onStartChat }: ExpertManagerProps) {
  const [experts, setExperts] = useState<Expert[]>(builtInExperts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [hoveredExpert, setHoveredExpert] = useState<string | null>(null);

  // 创建新专家
  const handleCreateExpert = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const newExpert: Expert = {
      id: `expert-${Date.now()}`,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      systemPrompt: formData.get('systemPrompt') as string,
      tags: (formData.get('tags') as string)?.split(',').map((t) => t.trim()) || [],
      role: '自定义',
    };

    setExperts([...experts, newExpert]);
    setShowCreateModal(false);
    form.reset();
  };

  // 克隆专家
  const handleCloneExpert = (expert: Expert) => {
    const cloned: Expert = {
      ...expert,
      id: `expert-${Date.now()}`,
      name: `${expert.name} 副本`,
    };
    setExperts([...experts, cloned]);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* 头部 */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">专家团队</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
          >
            创建专家
          </button>
        </div>
      </header>

      {/* 专家列表 */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="relative group"
              onMouseEnter={() => setHoveredExpert(expert.id)}
              onMouseLeave={() => setHoveredExpert(null)}
            >
              <ExpertCard
                expert={expert}
                onDoubleClick={() => onStartChat?.(expert.id)}
              />
              {/* 悬停操作按钮 */}
              {hoveredExpert === expert.id && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => handleCloneExpert(expert)}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded transition-colors"
                    title="克隆"
                  >
                    克隆
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 创建专家弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">创建专家</h2>
            <form onSubmit={handleCreateExpert} className="space-y-4">
              <div>
                <label htmlFor="expert-name" className="block text-sm text-slate-400 mb-1">名称</label>
                <input
                  id="expert-name"
                  name="name"
                  type="text"
                  required
                  aria-label="名称"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="expert-desc" className="block text-sm text-slate-400 mb-1">描述</label>
                <input
                  id="expert-desc"
                  name="description"
                  type="text"
                  aria-label="描述"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="expert-prompt" className="block text-sm text-slate-400 mb-1">系统提示词</label>
                <textarea
                  id="expert-prompt"
                  name="systemPrompt"
                  rows={3}
                  required
                  aria-label="系统提示词"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
              <div>
                <label htmlFor="expert-tags" className="block text-sm text-slate-400 mb-1">标签（逗号分隔）</label>
                <input
                  id="expert-tags"
                  name="tags"
                  type="text"
                  placeholder="标签1, 标签2"
                  aria-label="标签"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
