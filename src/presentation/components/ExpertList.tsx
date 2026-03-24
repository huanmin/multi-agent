/**
 * ExpertList 组件
 *
 * 专家列表，支持搜索和分类展示
 */

import { useState, useMemo } from 'react';

interface Expert {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  tags?: string[];
  role?: string;
}

interface ExpertListProps {
  experts: Expert[];
  onSelect?: (id: string) => void;
  onDoubleClick?: (id: string) => void;
  selectedId?: string | null;
  searchable?: boolean;
}

export function ExpertList({
  experts,
  onSelect,
  onDoubleClick,
  selectedId,
  searchable = true,
}: ExpertListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExperts = useMemo(() => {
    if (!searchQuery.trim()) return experts;
    const query = searchQuery.toLowerCase();
    return experts.filter(
      (expert) =>
        expert.name.toLowerCase().includes(query) ||
        expert.description?.toLowerCase().includes(query) ||
        expert.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [experts, searchQuery]);

  // 按角色分组
  const groupedExperts = useMemo(() => {
    const groups: Record<string, Expert[]> = {};
    filteredExperts.forEach((expert) => {
      const role = expert.role || '其他';
      if (!groups[role]) groups[role] = [];
      groups[role].push(expert);
    });
    return groups;
  }, [filteredExperts]);

  return (
    <div className="flex flex-col h-full bg-slate-800">
      {searchable && (
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索专家..."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(groupedExperts).map(([role, roleExperts]) => (
          <div key={role}>
            <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
              {role}
            </h3>
            <div className="space-y-2">
              {roleExperts.map((expert) => (
                <button
                  key={expert.id}
                  onClick={() => onSelect?.(expert.id)}
                  onDoubleClick={() => onDoubleClick?.(expert.id)}
                  className={`w-full p-3 rounded-lg border transition-colors text-left ${
                    selectedId === expert.id
                      ? 'bg-slate-700 border-cyan-500'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {expert.avatar ? (
                        <img
                          src={expert.avatar}
                          alt={expert.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        expert.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-100 truncate">
                        {expert.name}
                      </h4>
                      {expert.description && (
                        <p className="text-sm text-slate-400 truncate">
                          {expert.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredExperts.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            没有找到匹配的专家
          </div>
        )}
      </div>
    </div>
  );
}
