/**
 * Expert 用例
 *
 * 应用层协调领域逻辑，实现业务用例
 */

import { Expert, ExpertRole } from '@domain/expert';
import type { IExpertRepository } from '@infrastructure/repositories/expert.repository';

/**
 * 用例结果封装
 */
export interface UseCaseResult<T = unknown> {
  success: boolean;
  data?: T;
  expert?: Expert;
  error?: string;
}

/**
 * 创建专家输入
 */
export interface CreateExpertInput {
  name: string;
  roleCode: string;
  systemPrompt: string;
  avatar?: string;
  tags?: string[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * 创建专家用例
 */
export class CreateExpertUseCase {
  constructor(private readonly repository: IExpertRepository) {}

  async execute(input: CreateExpertInput): Promise<UseCaseResult<Expert>> {
    try {
      // 验证输入
      if (!input.name?.trim()) {
        return { success: false, error: '专家名称不能为空' };
      }
      if (!input.systemPrompt?.trim()) {
        return { success: false, error: '系统提示词不能为空' };
      }

      // 创建角色
      const role = this.resolveRole(input.roleCode);

      // 创建专家
      const expert = Expert.create({
        name: input.name.trim(),
        role,
        systemPrompt: input.systemPrompt.trim(),
        avatar: input.avatar,
        tags: input.tags,
        temperature: input.temperature,
        maxTokens: input.maxTokens,
      });

      // 保存
      await this.repository.save(expert);

      return { success: true, expert };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建专家失败',
      };
    }
  }

  private resolveRole(roleCode: string): ExpertRole {
    switch (roleCode.toUpperCase()) {
      case 'ARCHITECT':
        return ExpertRole.ARCHITECT();
      case 'FRONTEND':
        return ExpertRole.FRONTEND();
      case 'BACKEND':
        return ExpertRole.BACKEND();
      case 'SECURITY':
        return ExpertRole.SECURITY();
      case 'CODE_REVIEWER':
        return ExpertRole.CODE_REVIEWER();
      case 'QA':
        return ExpertRole.QA();
      default:
        return ExpertRole.CUSTOM();
    }
  }
}

/**
 * 更新专家输入
 */
export interface UpdateExpertInput {
  expertId: string;
  name?: string;
  systemPrompt?: string;
  tags?: string[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * 更新专家用例
 */
export class UpdateExpertUseCase {
  constructor(private readonly repository: IExpertRepository) {}

  async execute(input: UpdateExpertInput): Promise<UseCaseResult<Expert>> {
    try {
      // 查找专家
      const expert = await this.repository.findById(input.expertId);
      if (!expert) {
        return { success: false, error: `找不到 ID 为 ${input.expertId} 的专家` };
      }

      // 更新字段
      if (input.name !== undefined) {
        expert.updateName(input.name);
      }
      if (input.systemPrompt !== undefined) {
        expert.updateSystemPrompt(input.systemPrompt);
      }
      if (input.tags !== undefined) {
        // 清除旧标签，添加新标签
        const currentTags = [...expert.tags];
        currentTags.forEach(tag => expert.removeTag(tag));
        input.tags.forEach(tag => expert.addTag(tag));
      }

      // 保存
      await this.repository.save(expert);

      return { success: true, expert };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新专家失败',
      };
    }
  }
}

/**
 * 克隆专家输入
 */
export interface CloneExpertInput {
  expertId: string;
}

/**
 * 克隆专家用例
 */
export class CloneExpertUseCase {
  constructor(private readonly repository: IExpertRepository) {}

  async execute(input: CloneExpertInput): Promise<UseCaseResult<Expert>> {
    try {
      // 查找专家
      const expert = await this.repository.findById(input.expertId);
      if (!expert) {
        return { success: false, error: `找不到 ID 为 ${input.expertId} 的专家` };
      }

      // 克隆
      const cloned = expert.clone();

      // 保存克隆
      await this.repository.save(cloned);

      return { success: true, expert: cloned };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '克隆专家失败',
      };
    }
  }
}

/**
 * 获取专家列表用例
 */
export class GetExpertsUseCase {
  constructor(private readonly repository: IExpertRepository) {}

  async execute(): Promise<UseCaseResult<Expert[]>> {
    try {
      const experts = await this.repository.findAll();
      return { success: true, data: experts };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取专家列表失败',
      };
    }
  }
}

/**
 * 搜索专家用例
 */
export class SearchExpertsUseCase {
  constructor(private readonly repository: IExpertRepository) {}

  async execute(keyword: string): Promise<UseCaseResult<Expert[]>> {
    try {
      const experts = await this.repository.findByName(keyword);
      return { success: true, data: experts };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '搜索专家失败',
      };
    }
  }
}
