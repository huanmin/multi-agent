/**
 * 冲突面板组件
 *
 * 展示冲突详情，支持用户决策
 */

import { useState } from 'react';
import type { Conflict, ConflictSeverity } from '@domain/conflict';

interface ConflictPanelProps {
  conflict: Conflict;
  onResolve: (expertId: string, reason: string) => void;
  onDismiss: () => void;
}

const severityColors: Record<ConflictSeverity, string> = {
  '严重': 'bg-red-500/20 text-red-400 border-red-500/30',
  '警告': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  '建议': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export function ConflictPanel({ conflict, onResolve, onDismiss }: ConflictPanelProps) {
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const handleResolve = () => {
    if (selectedExpertId && reason.trim()) {
      onResolve(selectedExpertId, reason.trim());
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">{conflict.type}</h2>
          <p className="text-slate-400 text-sm mt-1">{conflict.summary}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${severityColors[conflict.severity]}`}
        >
          {conflict.severity}
        </span>
      </div>

      {/* 对比视图 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {conflict.participants.map((opinion) => (
          <div
            key={opinion.expertId}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              selectedExpertId === opinion.expertId
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
            onClick={() => setSelectedExpertId(opinion.expertId)}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                {opinion.expertName[0]}
              </div>
              <span className="font-medium text-white">{opinion.expertName}</span>
              <span className="text-xs text-slate-400">
                置信度: {Math.round(opinion.confidence * 100)}%
              </span>
            </div>

            <p className="text-slate-300 text-sm mb-4">{opinion.content}</p>

            {/* 优缺点 */}
            {opinion.pros && opinion.pros.length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-green-400">优点:</span>
                <ul className="text-xs text-slate-400 mt-1">
                  {opinion.pros.map((pro, i) => (
                    <li key={i}>• {pro}</li>
                  ))}
                </ul>
              </div>
            )}

            {opinion.cons && opinion.cons.length > 0 && (
              <div>
                <span className="text-xs text-red-400">缺点:</span>
                <ul className="text-xs text-slate-400 mt-1">
                  {opinion.cons.map((con, i) => (
                    <li key={i}>• {con}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 选择按钮 */}
            <button
              className={`w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedExpertId === opinion.expertId
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              onClick={() => setSelectedExpertId(opinion.expertId)}
            >
              {selectedExpertId === opinion.expertId ? '已选择' : '选择'}
            </button>
          </div>
        ))}
      </div>

      {/* 决策建议 */}
      {conflict.recommendation && (
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
          <span className="text-xs text-cyan-400">💡 决策建议:</span>
          <p className="text-slate-300 text-sm mt-1">{conflict.recommendation}</p>
        </div>
      )}

      {/* 决策理由输入 */}
      {selectedExpertId && (
        <div className="mb-6">
          <label className="text-sm text-slate-400 mb-2 block">决策理由</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="输入决策理由..."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500"
            rows={3}
          />
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onDismiss}
          className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
        >
          忽略
        </button>
        <button
          onClick={handleResolve}
          disabled={!selectedExpertId || !reason.trim()}
          className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          确认决策
        </button>
      </div>

      {/* 检测时间 */}
      <div className="mt-4 text-xs text-slate-500 text-right">
        检测时间: {conflict.detectedAt.toLocaleString()}
      </div>
    </div>
  );
}

interface ConflictListProps {
  conflicts: Conflict[];
  onSelect: (conflict: Conflict) => void;
}

export function ConflictList({ conflicts, onSelect }: ConflictListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const filteredConflicts = conflicts.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  // 按严重程度排序
  const severityOrder = { '严重': 3, '警告': 2, '建议': 1 };
  const sortedConflicts = [...filteredConflicts].sort(
    (a, b) => severityOrder[b.severity] - severityOrder[a.severity]
  );

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-white">冲突列表</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'pending'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            待处理
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'resolved'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            已解决
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sortedConflicts.map((conflict) => (
          <div
            key={conflict.id}
            data-testid="conflict-item"
            onClick={() => onSelect(conflict)}
            className="p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">{conflict.type}</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  severityColors[conflict.severity]
                }`}
              >
                {conflict.severity}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{conflict.summary}</p>
          </div>
        ))}

        {sortedConflicts.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>暂无冲突</p>
          </div>
        )}
      </div>
    </div>
  );
}
