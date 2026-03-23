import { describe, it, expect, beforeEach } from 'vitest';
import { Expert, ExpertRole } from '@domain/expert';
import { IExpertRepository, InMemoryExpertRepository } from '@infrastructure/repositories/expert.repository';

describe('Expert Repository', () => {
  let repository: IExpertRepository;

  beforeEach(() => {
    repository = new InMemoryExpertRepository();
  });

  describe('save', () => {
    it('应该保存专家到仓库', async () => {
      const expert = Expert.create({
        name: '测试专家',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: '测试',
      });

      await repository.save(expert);
      const found = await repository.findById(expert.id);

      expect(found).not.toBeNull();
      expect(found?.name).toBe('测试专家');
    });

    it('应该更新已存在的专家', async () => {
      const expert = Expert.create({
        name: '测试专家',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: '测试',
      });

      await repository.save(expert);

      expert.updateName('更新名称');
      await repository.save(expert);

      const found = await repository.findById(expert.id);
      expect(found?.name).toBe('更新名称');
    });
  });

  describe('findById', () => {
    it('应该通过 ID 找到专家', async () => {
      const expert = Expert.create({
        name: '测试专家',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: '测试',
      });

      await repository.save(expert);
      const found = await repository.findById(expert.id);

      expect(found?.id).toBe(expert.id);
    });

    it('找不到时应该返回 null', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('应该返回所有专家', async () => {
      const expert1 = Expert.create({
        name: '专家1',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: '测试1',
      });
      const expert2 = Expert.create({
        name: '专家2',
        role: ExpertRole.FRONTEND(),
        systemPrompt: '测试2',
      });

      await repository.save(expert1);
      await repository.save(expert2);

      const all = await repository.findAll();
      expect(all).toHaveLength(2);
    });

    it('空仓库应该返回空数组', async () => {
      const all = await repository.findAll();
      expect(all).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('应该删除专家', async () => {
      const expert = Expert.create({
        name: '测试专家',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: '测试',
      });

      await repository.save(expert);
      await repository.delete(expert.id);

      const found = await repository.findById(expert.id);
      expect(found).toBeNull();
    });

    it('删除不存在的专家不应该报错', async () => {
      await expect(repository.delete('non-existent')).resolves.not.toThrow();
    });
  });

  describe('findByName', () => {
    it('应该通过名称搜索专家', async () => {
      const expert = Expert.create({
        name: '安全审查专家',
        role: ExpertRole.SECURITY(),
        systemPrompt: '测试',
      });

      await repository.save(expert);
      const results = await repository.findByName('安全');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('安全审查专家');
    });

    it('应该支持模糊搜索', async () => {
      const expert1 = Expert.create({
        name: '前端开发专家',
        role: ExpertRole.FRONTEND(),
        systemPrompt: '测试',
      });
      const expert2 = Expert.create({
        name: '前端架构专家',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: '测试',
      });

      await repository.save(expert1);
      await repository.save(expert2);

      const results = await repository.findByName('前端');
      expect(results).toHaveLength(2);
    });
  });

  describe('findByTags', () => {
    it('应该通过标签搜索专家', async () => {
      const expert = Expert.create({
        name: '测试专家',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: '测试',
        tags: ['安全', '代码审查'],
      });

      await repository.save(expert);
      const results = await repository.findByTags(['安全']);

      expect(results).toHaveLength(1);
    });

    it('应该支持多标签搜索', async () => {
      const expert = Expert.create({
        name: '测试专家',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: '测试',
        tags: ['安全', '代码审查'],
      });

      await repository.save(expert);
      const results = await repository.findByTags(['安全', '性能']);

      expect(results).toHaveLength(1);
    });
  });
});
