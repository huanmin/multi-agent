import { describe, it, expect, beforeEach } from 'vitest';
import { Expert, ExpertRole, ExpertStatus } from '@domain/expert';

describe('Expert Domain Model', () => {
  describe('ExpertRole Value Object', () => {
    it('应该创建有效的 ExpertRole', () => {
      const role = new ExpertRole('ARCHITECT', '架构师', '负责系统架构设计');

      expect(role.code).toBe('ARCHITECT');
      expect(role.name).toBe('架构师');
      expect(role.description).toBe('负责系统架构设计');
    });

    it('应该正确比较两个 ExpertRole', () => {
      const role1 = new ExpertRole('ARCHITECT', '架构师', '');
      const role2 = new ExpertRole('ARCHITECT', '架构师', '');
      const role3 = new ExpertRole('FRONTEND', '前端', '');

      expect(role1.equals(role2)).toBe(true);
      expect(role1.equals(role3)).toBe(false);
    });

    it('预定义角色应该正确创建', () => {
      const architect = ExpertRole.ARCHITECT();
      expect(architect.code).toBe('ARCHITECT');
      expect(architect.name).toBe('架构师');
    });
  });

  describe('Expert Entity', () => {
    let expert: Expert;

    beforeEach(() => {
      expert = Expert.create({
        name: '安全专家',
        role: ExpertRole.SECURITY(),
        systemPrompt: '你是一个安全专家...',
        avatar: 'security.png',
        tags: ['安全', '代码审查'],
      });
    });

    it('应该创建具有有效属性的 Expert', () => {
      expect(expert.id).toBeDefined();
      expect(expert.name).toBe('安全专家');
      expect(expert.role.code).toBe('SECURITY');
      expect(expert.systemPrompt).toBe('你是一个安全专家...');
      expect(expert.status).toBe(ExpertStatus.ACTIVE);
    });

    it('应该自动生成 createdAt 和 updatedAt', () => {
      expect(expert.createdAt).toBeInstanceOf(Date);
      expect(expert.updatedAt).toBeInstanceOf(Date);
    });

    it('应该支持更新系统提示词', () => {
      const newPrompt = '更新后的提示词';
      expert.updateSystemPrompt(newPrompt);

      expect(expert.systemPrompt).toBe(newPrompt);
      expect(expert.updatedAt.getTime()).toBeGreaterThan(expert.createdAt.getTime());
    });

    it('应该支持更新名称', () => {
      expert.updateName('资深安全专家');
      expect(expert.name).toBe('资深安全专家');
    });

    it('应该支持克隆', () => {
      const cloned = expert.clone();

      expect(cloned.id).not.toBe(expert.id);
      expect(cloned.name).toContain('副本');
      expect(cloned.systemPrompt).toBe(expert.systemPrompt);
      expect(cloned.role.equals(expert.role)).toBe(true);
    });

    it('应该支持添加标签', () => {
      expert.addTag('AI');
      expect(expert.tags).toContain('AI');
    });

    it('不应该添加重复标签', () => {
      expert.addTag('安全');
      expect(expert.tags.filter(t => t === '安全').length).toBe(1);
    });

    it('应该支持移除标签', () => {
      expert.removeTag('安全');
      expect(expert.tags).not.toContain('安全');
    });

    it('应该支持停用', () => {
      expert.deactivate();
      expect(expert.status).toBe(ExpertStatus.INACTIVE);
    });

    it('应该支持重新激活', () => {
      expert.deactivate();
      expert.activate();
      expect(expert.status).toBe(ExpertStatus.ACTIVE);
    });

    it('应该验证系统提示词不能为空', () => {
      expect(() => {
        expert.updateSystemPrompt('');
      }).toThrow('系统提示词不能为空');
    });

    it('应该验证名称不能为空', () => {
      expect(() => {
        expert.updateName('');
      }).toThrow('专家名称不能为空');
    });
  });

  describe('Expert Factory Methods', () => {
    it('应该创建内置专家', () => {
      const builtin = Expert.createBuiltin({
        name: '代码审查专家',
        role: ExpertRole.CODE_REVIEWER(),
        systemPrompt: '审查代码...',
      });

      expect(builtin.isBuiltin).toBe(true);
    });

    it('应该创建自定义专家', () => {
      const custom = Expert.createCustom({
        name: '我的专家',
        role: ExpertRole.CUSTOM(),
        systemPrompt: '自定义提示词',
      });

      expect(custom.isBuiltin).toBe(false);
    });
  });

  describe('Expert toJSON/fromJSON', () => {
    it('应该正确序列化和反序列化', () => {
      const expert = Expert.create({
        name: '测试专家',
        role: ExpertRole.ARCHITECT(),
        systemPrompt: '测试',
      });

      const json = expert.toJSON();
      const restored = Expert.fromJSON(json);

      expect(restored.id).toBe(expert.id);
      expect(restored.name).toBe(expert.name);
      expect(restored.systemPrompt).toBe(expert.systemPrompt);
    });
  });
});
