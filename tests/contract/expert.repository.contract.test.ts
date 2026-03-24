/**
 * Expert Repository 契约测试
 *
 * 确保所有 IExpertRepository 实现都遵守契约
 * 按照 Harness Engineering: 契约是架构约束的一部分
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Expert, ExpertRole } from '@domain/expert';
import type { IExpertRepository } from '@infrastructure/repositories/expert.repository';

/**
 * 运行 Expert Repository 契约测试
 * 任何实现 IExpertRepository 的类都应该调用此函数
 */
export function runExpertRepositoryContractTests(
  createRepository: () => IExpertRepository
): void {
  describe('Expert Repository Contract', () => {
    let repository: IExpertRepository;

    beforeEach(() => {
      repository = createRepository();
    });

    describe('save', () => {
      it('应该保存专家并可以通过 ID 找回', async () => {
        const expert = Expert.create({
          name: '测试专家',
          role: ExpertRole.ARCHITECT(),
          systemPrompt: '你是一个架构师',
        });

        await repository.save(expert);
        const found = await repository.findById(expert.id);

        expect(found).toBeDefined();
        expect(found?.id).toBe(expert.id);
        expect(found?.name).toBe('测试专家');
      });

      it('应该更新已存在的专家', async () => {
        const expert = Expert.create({
          name: '原始名称',
          role: ExpertRole.ARCHITECT(),
          systemPrompt: '原始提示词',
        });

        await repository.save(expert);
        expert.updateName('更新名称');
        await repository.save(expert);

        const found = await repository.findById(expert.id);
        expect(found?.name).toBe('更新名称');
      });

      it('应该保存多个专家', async () => {
        const expert1 = Expert.create({
          name: '专家1',
          role: ExpertRole.ARCHITECT(),
          systemPrompt: '提示词1',
        });
        const expert2 = Expert.create({
          name: '专家2',
          role: ExpertRole.FRONTEND(),
          systemPrompt: '提示词2',
        });

        await repository.save(expert1);
        await repository.save(expert2);

        const all = await repository.findAll();
        expect(all).toHaveLength(2);
      });
    });

    describe('findById', () => {
      it('应该返回 null 当专家不存在', async () => {
        const found = await repository.findById('non-existent-id');
        expect(found).toBeNull();
      });

      it('应该返回正确的专家类型', async () => {
        const expert = Expert.create({
          name: '类型测试',
          role: ExpertRole.BACKEND(),
          systemPrompt: '后端专家',
        });

        await repository.save(expert);
        const found = await repository.findById(expert.id);

        expect(found).toBeInstanceOf(Expert);
        expect(found?.role.code).toBe('BACKEND');
      });
    });

    describe('findAll', () => {
      it('应该返回空数组当没有专家', async () => {
        const all = await repository.findAll();
        expect(all).toEqual([]);
      });

      it('应该返回所有已保存的专家', async () => {
        const expert1 = Expert.create({
          name: '专家A',
          role: ExpertRole.ARCHITECT(),
          systemPrompt: '提示词A',
        });
        const expert2 = Expert.create({
          name: '专家B',
          role: ExpertRole.QA(),
          systemPrompt: '提示词B',
        });

        await repository.save(expert1);
        await repository.save(expert2);

        const all = await repository.findAll();
        expect(all).toHaveLength(2);
        expect(all.map((e) => e.name)).toContain('专家A');
        expect(all.map((e) => e.name)).toContain('专家B');
      });
    });

    describe('delete', () => {
      it('应该删除专家', async () => {
        const expert = Expert.create({
          name: '待删除',
          role: ExpertRole.SECURITY(),
          systemPrompt: '安全专家',
        });

        await repository.save(expert);
        await repository.delete(expert.id);

        const found = await repository.findById(expert.id);
        expect(found).toBeNull();
      });

      it('删除不存在的专家不应该报错', async () => {
        await expect(
          repository.delete('non-existent-id')
        ).resolves.not.toThrow();
      });
    });

    describe('findByName', () => {
      it('应该通过名称搜索专家', async () => {
        const expert = Expert.create({
          name: '架构师专家',
          role: ExpertRole.ARCHITECT(),
          systemPrompt: '架构师',
        });

        await repository.save(expert);
        const results = await repository.findByName('架构师');

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('架构师专家');
      });

      it('应该支持模糊搜索', async () => {
        const expert1 = Expert.create({
          name: '前端开发专家',
          role: ExpertRole.FRONTEND(),
          systemPrompt: '前端',
        });
        const expert2 = Expert.create({
          name: '后端开发专家',
          role: ExpertRole.BACKEND(),
          systemPrompt: '后端',
        });

        await repository.save(expert1);
        await repository.save(expert2);

        const results = await repository.findByName('开发');
        expect(results).toHaveLength(2);
      });

      it('应该返回空数组当没有匹配', async () => {
        const results = await repository.findByName('不存在');
        expect(results).toEqual([]);
      });
    });

    describe('findByTags', () => {
      it('应该通过标签搜索专家', async () => {
        const expert = Expert.create({
          name: '标签测试',
          role: ExpertRole.CODE_REVIEWER(),
          systemPrompt: '代码审查',
          tags: ['代码审查', '性能'],
        });

        await repository.save(expert);
        const results = await repository.findByTags(['代码审查']);

        expect(results).toHaveLength(1);
      });

      it('应该支持多标签搜索', async () => {
        const expert1 = Expert.create({
          name: '专家1',
          role: ExpertRole.ARCHITECT(),
          systemPrompt: '架构',
          tags: ['架构', '设计'],
        });
        const expert2 = Expert.create({
          name: '专家2',
          role: ExpertRole.SECURITY(),
          systemPrompt: '安全',
          tags: ['安全', '审计'],
        });

        await repository.save(expert1);
        await repository.save(expert2);

        const results = await repository.findByTags(['架构', '安全']);
        expect(results).toHaveLength(2);
      });
    });
  });
}
