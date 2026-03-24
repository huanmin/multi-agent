import { describe, it, expect, beforeEach } from 'vitest';
import { Expert, ExpertRole } from '@domain/expert';
import { IExpertRepository, InMemoryExpertRepository } from '@infrastructure/repositories/expert.repository';
import { CreateExpertUseCase, UpdateExpertUseCase, CloneExpertUseCase, GetExpertsUseCase, SearchExpertsUseCase } from '@application/use-cases/expert.use-case';

describe('Expert Use Cases', () => {
  let repository: IExpertRepository;
  let createUseCase: CreateExpertUseCase;
  let updateUseCase: UpdateExpertUseCase;
  let cloneUseCase: CloneExpertUseCase;
  let getExpertsUseCase: GetExpertsUseCase;
  let searchExpertsUseCase: SearchExpertsUseCase;

  beforeEach(() => {
    repository = new InMemoryExpertRepository();
    createUseCase = new CreateExpertUseCase(repository);
    updateUseCase = new UpdateExpertUseCase(repository);
    cloneUseCase = new CloneExpertUseCase(repository);
    getExpertsUseCase = new GetExpertsUseCase(repository);
    searchExpertsUseCase = new SearchExpertsUseCase(repository);
  });

  describe('CreateExpertUseCase', () => {
    it('应该创建新专家', async () => {
      const result = await createUseCase.execute({
        name: '安全专家',
        roleCode: 'SECURITY',
        systemPrompt: '你是一个安全专家...',
        tags: ['安全', '审查'],
      });

      expect(result.success).toBe(true);
      expect(result.expert).toBeDefined();
      expect(result.expert?.name).toBe('安全专家');

      const saved = await repository.findById(result.expert!.id);
      expect(saved).not.toBeNull();
    });

    it('应该验证必填字段', async () => {
      const result = await createUseCase.execute({
        name: '',
        roleCode: 'SECURITY',
        systemPrompt: '提示词',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该支持自定义角色', async () => {
      const result = await createUseCase.execute({
        name: '自定义专家',
        roleCode: 'CUSTOM',
        systemPrompt: '自定义提示词',
      });

      expect(result.success).toBe(true);
      expect(result.expert?.role.code).toBe('CUSTOM');
    });
  });

  describe('UpdateExpertUseCase', () => {
    it('应该更新专家信息', async () => {
      const created = await createUseCase.execute({
        name: '原始名称',
        roleCode: 'ARCHITECT',
        systemPrompt: '原始提示词',
      });

      const result = await updateUseCase.execute({
        expertId: created.expert!.id,
        name: '新名称',
        systemPrompt: '新提示词',
      });

      expect(result.success).toBe(true);

      const updated = await repository.findById(created.expert!.id);
      expect(updated?.name).toBe('新名称');
      expect(updated?.systemPrompt).toBe('新提示词');
    });

    it('找不到专家时应该返回错误', async () => {
      const result = await updateUseCase.execute({
        expertId: 'non-existent',
        name: '新名称',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('找不到');
    });

    it('应该支持部分更新', async () => {
      const created = await createUseCase.execute({
        name: '原始名称',
        roleCode: 'ARCHITECT',
        systemPrompt: '原始提示词',
      });

      const result = await updateUseCase.execute({
        expertId: created.expert!.id,
        name: '仅更新名称',
      });

      expect(result.success).toBe(true);

      const updated = await repository.findById(created.expert!.id);
      expect(updated?.name).toBe('仅更新名称');
      expect(updated?.systemPrompt).toBe('原始提示词');
    });
  });

  describe('CloneExpertUseCase', () => {
    it('应该克隆专家', async () => {
      const created = await createUseCase.execute({
        name: '原始专家',
        roleCode: 'ARCHITECT',
        systemPrompt: '原始提示词',
        tags: ['标签1', '标签2'],
      });

      const result = await cloneUseCase.execute({
        expertId: created.expert!.id,
      });

      expect(result.success).toBe(true);
      expect(result.expert?.id).not.toBe(created.expert!.id);
      expect(result.expert?.name).toContain('副本');
      expect(result.expert?.systemPrompt).toBe('原始提示词');

      const cloned = await repository.findById(result.expert!.id);
      expect(cloned).not.toBeNull();
    });

    it('找不到专家时应该返回错误', async () => {
      const result = await cloneUseCase.execute({
        expertId: 'non-existent',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('GetExpertsUseCase', () => {
    it('应该获取所有专家', async () => {
      await createUseCase.execute({
        name: '专家1',
        roleCode: 'ARCHITECT',
        systemPrompt: '提示词1',
      });
      await createUseCase.execute({
        name: '专家2',
        roleCode: 'DEVELOPER',
        systemPrompt: '提示词2',
      });

      const result = await getExpertsUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('没有专家时返回空数组', async () => {
      const result = await getExpertsUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('SearchExpertsUseCase', () => {
    it('应该根据关键词搜索专家', async () => {
      await createUseCase.execute({
        name: '安全专家',
        roleCode: 'SECURITY',
        systemPrompt: '安全审查',
      });
      await createUseCase.execute({
        name: '架构师',
        roleCode: 'ARCHITECT',
        systemPrompt: '架构设计',
      });

      const result = await searchExpertsUseCase.execute('安全');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].name).toBe('安全专家');
    });

    it('空搜索返回所有专家', async () => {
      await createUseCase.execute({
        name: '专家1',
        roleCode: 'SECURITY',
        systemPrompt: '提示词',
      });

      const result = await searchExpertsUseCase.execute('');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });
});
