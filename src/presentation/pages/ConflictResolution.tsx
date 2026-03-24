/**
 * 冲突解决页面
 *
 * 展示冲突列表和详情
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConflictPanel, ConflictList } from '../components/ConflictPanel';
import { detectConflicts, resolveConflict, dismissConflict } from '@domain/conflict';
import type { Conflict, ExpertOpinion } from '@domain/conflict';

// 模拟消息数据转换为专家意见
const mockMessagesToOpinions = (messages: any[]): ExpertOpinion[] => {
  return messages
    .filter((m) => m.role === 'assistant')
    .map((m) => ({
      expertId: m.expertId || 'unknown',
      expertName: m.expertName || '专家',
      category: '架构', // 简化处理
      content: m.content,
      confidence: 0.85,
      pros: ['可扩展性强'],
      cons: ['复杂度增加'],
    }));
};

export function ConflictResolution() {
  const { conflictId } = useParams<{ conflictId?: string }>();
  const navigate = useNavigate();
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

  // 加载冲突（模拟）
  useEffect(() => {
    // 模拟一些冲突数据
    const mockConflicts: Conflict[] = [
      {
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
        detectedAt: new Date(Date.now() - 86400000),
      },
    ];

    setConflicts(mockConflicts);

    if (conflictId) {
      const found = mockConflicts.find((c) => c.id === conflictId);
      if (found) {
        setSelectedConflict(found);
      }
    }
  }, [conflictId]);

  const handleResolve = (expertId: string, reason: string) => {
    if (selectedConflict) {
      const resolved = resolveConflict(selectedConflict, expertId, reason);
      setConflicts((prev) =>
        prev.map((c) => (c.id === resolved.id ? resolved : c))
      );
      setSelectedConflict(resolved);

      // 2秒后返回
      setTimeout(() => {
        navigate('/chat/1');
      }, 2000);
    }
  };

  const handleDismiss = () => {
    if (selectedConflict) {
      const dismissed = dismissConflict(selectedConflict);
      setConflicts((prev) =>
        prev.map((c) => (c.id === dismissed.id ? dismissed : c))
      );
      navigate('/chat/1');
    }
  };

  const handleSelect = (conflict: Conflict) => {
    setSelectedConflict(conflict);
    navigate(`/conflict/${conflict.id}`);
  };

  // 单个冲突详情视图
  if (selectedConflict) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮 */}
          <button
            onClick={() => navigate('/conflicts')}
            className="mb-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← 返回冲突列表
          </button>

          {selectedConflict.status === 'resolved' && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
              ✅ 冲突已解决 - 已选择
              {selectedConflict.participants.find(
                (p) => p.expertId === selectedConflict.resolution?.chosenExpertId
              )?.expertName || '专家'}
              的方案
            </div>
          )}

          <ConflictPanel
            conflict={selectedConflict}
            onResolve={handleResolve}
            onDismiss={handleDismiss}
          />
        </div>
      </div>
    );
  }

  // 冲突列表视图
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">冲突列表</h1>
          <button
            onClick={() => navigate('/chat/1')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            返回聊天
          </button>
        </div>

        <ConflictList conflicts={conflicts} onSelect={handleSelect} />
      </div>
    </div>
  );
}

export function detectMessageConflicts(messages: any[]): Conflict[] {
  const opinions = mockMessagesToOpinions(messages);
  return detectConflicts(opinions);
}
