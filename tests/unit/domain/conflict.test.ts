import { describe, it, expect } from 'vitest';
import {
  detectConflicts,
  analyzeConflictSeverity,
  compareExpertOpinions,
  type Conflict,
  type ConflictSeverity,
  type ExpertOpinion,
} from '@domain/conflict';

describe('Conflict Detection', () => {
  const mockOpinions: ExpertOpinion[] = [
    {
      expertId: 'architect',
      expertName: '架构师',
      category: '架构',
      content: '建议使用微服务架构，将单体应用拆分成多个独立服务',
      confidence: 0.9,
    },
    {
      expertId: 'backend',
      expertName: '后端专家',
      category: '架构',
      content: '建议保持单体架构，当前业务复杂度不需要微服务',
      confidence: 0.85,
    },
    {
      expertId: 'security',
      expertName: '安全专家',
      category: '安全',
      content: '建议使用OAuth2认证，避免JWT token泄露风险',
      confidence: 0.95,
    },
  ];

  describe('detectConflicts', () => {
    it('应该检测相同领域的意见冲突', () => {
      const conflicts = detectConflicts(mockOpinions);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('架构分歧');
      expect(conflicts[0].participants).toHaveLength(2);
    });

    it('不应该检测不同领域的意见', () => {
      const differentOpinions: ExpertOpinion[] = [
        {
          expertId: 'architect',
          expertName: '架构师',
          category: '架构',
          content: '建议使用微服务架构',
          confidence: 0.9,
        },
        {
          expertId: 'security',
          expertName: '安全专家',
          category: '安全',
          content: '建议使用OAuth2认证',
          confidence: 0.95,
        },
      ];

      const conflicts = detectConflicts(differentOpinions);
      expect(conflicts).toHaveLength(0);
    });

    it('应该处理空输入', () => {
      const conflicts = detectConflicts([]);
      expect(conflicts).toHaveLength(0);
    });

    it('应该返回冲突详情', () => {
      const conflicts = detectConflicts(mockOpinions);

      expect(conflicts[0]).toMatchObject({
        id: expect.any(String),
        type: '架构分歧',
        severity: expect.any(String),
        participants: expect.arrayContaining([
          expect.objectContaining({ expertId: 'architect' }),
          expect.objectContaining({ expertId: 'backend' }),
        ]),
        summary: expect.any(String),
        detectedAt: expect.any(Date),
      });
    });
  });

  describe('analyzeConflictSeverity', () => {
    it('应该判定架构分歧为严重', () => {
      const severity = analyzeConflictSeverity('架构', 0.8, 0.85);
      expect(severity).toBe('严重');
    });

    it('应该判定安全分歧为严重', () => {
      const severity = analyzeConflictSeverity('安全', 0.9, 0.95);
      expect(severity).toBe('严重');
    });

    it('应该判定性能分歧为警告', () => {
      const severity = analyzeConflictSeverity('性能', 0.6, 0.65);
      expect(severity).toBe('警告');
    });

    it('应该判定低置信度为建议', () => {
      const severity = analyzeConflictSeverity('代码风格', 0.4, 0.45);
      expect(severity).toBe('建议');
    });
  });

  describe('compareExpertOpinions', () => {
    it('应该识别语义相反的观点', () => {
      const opinion1: ExpertOpinion = {
        expertId: 'expert1',
        expertName: '专家1',
        category: '架构',
        content: '应该使用微服务架构',
        confidence: 0.9,
      };

      const opinion2: ExpertOpinion = {
        expertId: 'expert2',
        expertName: '专家2',
        category: '架构',
        content: '不应该使用微服务架构',
        confidence: 0.85,
      };

      const result = compareExpertOpinions(opinion1, opinion2);

      expect(result.hasConflict).toBe(true);
      expect(result.similarity).toBeGreaterThan(0.3); // 有共同关键词，相似度不应该太低
      expect(result.commonPoints).toContain('微服务'); // 共同包含微服务
    });

    it('应该识别语义相似的观点', () => {
      const opinion1: ExpertOpinion = {
        expertId: 'expert1',
        expertName: '专家1',
        category: '安全',
        content: '建议使用OAuth2认证',
        confidence: 0.9,
      };

      const opinion2: ExpertOpinion = {
        expertId: 'expert2',
        expertName: '专家2',
        category: '安全',
        content: '推荐采用OAuth2进行身份验证',
        confidence: 0.85,
      };

      const result = compareExpertOpinions(opinion1, opinion2);

      expect(result.hasConflict).toBe(false);
      expect(result.similarity).toBeGreaterThan(0.3);
    });

    it('应该处理不同长度的文本', () => {
      const opinion1: ExpertOpinion = {
        expertId: 'expert1',
        expertName: '专家1',
        category: '性能',
        content: '短文本',
        confidence: 0.8,
      };

      const opinion2: ExpertOpinion = {
        expertId: 'expert2',
        expertName: '专家2',
        category: '性能',
        content: '这是一段非常长的文本，包含了很多详细的内容和建议',
        confidence: 0.75,
      };

      const result = compareExpertOpinions(opinion1, opinion2);

      expect(result.similarity).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeLessThanOrEqual(1);
    });
  });
});

describe('Conflict Resolution', () => {
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
        content: '建议使用微服务架构',
        confidence: 0.9,
        pros: ['可扩展性强', '独立部署'],
        cons: ['复杂度增加', '运维成本高'],
      },
      {
        expertId: 'backend',
        expertName: '后端专家',
        category: '架构',
        content: '建议保持单体架构',
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

  describe('Conflict Analysis', () => {
    it('应该生成决策建议', () => {
      expect(mockConflict.recommendation).toContain('根据团队规模');
    });

    it('应该列出各方优缺点', () => {
      const architectOpinion = mockConflict.participants[0];
      expect(architectOpinion.pros).toHaveLength(2);
      expect(architectOpinion.cons).toHaveLength(2);
    });

    it('应该支持冲突状态更新', () => {
      const updated = { ...mockConflict, status: 'resolved', resolvedAt: new Date() };
      expect(updated.status).toBe('resolved');
      expect(updated.resolvedAt).toBeDefined();
    });
  });
});
