import { describe, it, expect } from 'vitest';
import {
  detectConflicts,
  analyzeConflictSeverity,
  compareExpertOpinions,
} from '@domain/conflict';
import type { ExpertOpinion } from '@domain/conflict';
import { createTestExpertOpinion, createTestConflictOpinions } from '../../__helpers__/test-factory';

describe('Conflict Detection', () => {
  describe('detectConflicts', () => {
    it('should detect conflicts in same category', () => {
      const opinions = createTestConflictOpinions();
      const conflicts = detectConflicts(opinions);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('架构分歧');
      expect(conflicts[0].participants).toHaveLength(2);
    });

    it('should not detect conflicts in different categories', () => {
      const opinions: ExpertOpinion[] = [
        createTestExpertOpinion({
          expertId: 'architect',
          expertName: '架构师',
          category: '架构',
          content: '建议使用微服务架构',
        }),
        createTestExpertOpinion({
          expertId: 'security',
          expertName: '安全专家',
          category: '安全',
          content: '建议使用OAuth2认证',
        }),
      ];

      const conflicts = detectConflicts(opinions);
      expect(conflicts).toHaveLength(0);
    });

    it('should handle empty input', () => {
      const conflicts = detectConflicts([]);
      expect(conflicts).toHaveLength(0);
    });

    it('should return conflict details', () => {
      const opinions = createTestConflictOpinions();
      const conflicts = detectConflicts(opinions);

      expect(conflicts[0]).toMatchObject({
        id: expect.any(String),
        type: '架构分歧',
        severity: expect.any(String),
        participants: expect.arrayContaining([
          expect.objectContaining({ expertId: 'expert-1' }),
          expect.objectContaining({ expertId: 'expert-2' }),
        ]),
        summary: expect.any(String),
        detectedAt: expect.any(Date),
      });
    });
  });

  describe('analyzeConflictSeverity', () => {
    it('should classify architecture conflict as critical', () => {
      const severity = analyzeConflictSeverity('架构', 0.8, 0.85);
      expect(severity).toBe('严重');
    });

    it('should classify security conflict as critical', () => {
      const severity = analyzeConflictSeverity('安全', 0.9, 0.95);
      expect(severity).toBe('严重');
    });

    it('should classify performance conflict as warning', () => {
      const severity = analyzeConflictSeverity('性能', 0.6, 0.7);
      expect(severity).toBe('警告');
    });

    it('should classify other conflicts as suggestion', () => {
      const severity = analyzeConflictSeverity('代码风格', 0.5, 0.6);
      expect(severity).toBe('建议');
    });
  });

  describe('compareExpertOpinions', () => {
    it('should detect opposite meanings', () => {
      const opinion1 = createTestExpertOpinion({ content: '应该使用微服务' });
      const opinion2 = createTestExpertOpinion({ content: '不应该使用微服务' });

      const result = compareExpertOpinions(opinion1, opinion2);

      expect(result.hasConflict).toBe(true);
      expect(result.divergencePoints.length).toBeGreaterThan(0);
    });

    it('should recognize similar opinions', () => {
      const opinion1 = createTestExpertOpinion({ content: '建议使用微服务架构' });
      const opinion2 = createTestExpertOpinion({ content: '推荐采用微服务模式' });

      const result = compareExpertOpinions(opinion1, opinion2);

      expect(result.similarity).toBeGreaterThan(0.2);
    });

    it('should extract common points', () => {
      const opinion1 = createTestExpertOpinion({ content: '使用微服务和Docker部署' });
      const opinion2 = createTestExpertOpinion({ content: '使用微服务和Kubernetes部署' });

      const result = compareExpertOpinions(opinion1, opinion2);

      // Both contain common technical terms
      expect(result.commonPoints.length).toBeGreaterThan(0);
    });
  });
});
