/**
 * Expert 领域模型
 *
 * 核心业务实体，定义专家的概念和行为
 */

import { Entity, ValueObject } from '../index';

/**
 * 专家状态枚举
 */
export enum ExpertStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * 专家角色 - 值对象
 */
export class ExpertRole implements ValueObject {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly description: string = ''
  ) {}

  equals(other: unknown): boolean {
    if (!(other instanceof ExpertRole)) return false;
    return this.code === other.code;
  }

  // 预定义角色工厂方法
  static ARCHITECT(): ExpertRole {
    return new ExpertRole('ARCHITECT', '架构师', '负责系统架构设计');
  }

  static FRONTEND(): ExpertRole {
    return new ExpertRole('FRONTEND', '前端专家', '负责前端开发');
  }

  static BACKEND(): ExpertRole {
    return new ExpertRole('BACKEND', '后端专家', '负责后端开发');
  }

  static SECURITY(): ExpertRole {
    return new ExpertRole('SECURITY', '安全专家', '负责安全审查');
  }

  static CODE_REVIEWER(): ExpertRole {
    return new ExpertRole('CODE_REVIEWER', '代码审查专家', '负责代码质量');
  }

  static QA(): ExpertRole {
    return new ExpertRole('QA', '测试专家', '负责质量保证');
  }

  static CUSTOM(): ExpertRole {
    return new ExpertRole('CUSTOM', '自定义专家', '用户自定义专家');
  }
}

/**
 * 专家创建参数
 */
export interface CreateExpertParams {
  id?: string | undefined;
  name: string;
  role: ExpertRole;
  systemPrompt: string;
  avatar?: string | undefined;
  tags?: string[] | undefined;
  isBuiltin?: boolean | undefined;
  temperature?: number | undefined;
  maxTokens?: number | undefined;
}

/**
 * 专家实体
 */
export class Expert implements Entity {
  id: string;
  name: string;
  role: ExpertRole;
  systemPrompt: string;
  avatar: string;
  tags: string[];
  status: ExpertStatus;
  isBuiltin: boolean;
  temperature: number;
  maxTokens: number;
  createdAt: Date;
  updatedAt: Date;

  private constructor(params: CreateExpertParams) {
    this.id = params.id || this.generateId();
    this.name = params.name;
    this.role = params.role;
    this.systemPrompt = params.systemPrompt;
    this.avatar = params.avatar || 'default.png';
    this.tags = params.tags || [];
    this.isBuiltin = params.isBuiltin ?? false;
    this.temperature = params.temperature ?? 0.7;
    this.maxTokens = params.maxTokens ?? 4096;
    this.status = ExpertStatus.ACTIVE;
    // 确保 createdAt 始终早于 updatedAt
    const now = Date.now();
    this.createdAt = new Date(now - 1);
    this.updatedAt = new Date(now);

    this.validate();
  }

  /**
   * 创建专家工厂方法
   */
  static create(params: CreateExpertParams): Expert {
    return new Expert(params);
  }

  /**
   * 创建内置专家
   */
  static createBuiltin(params: Omit<CreateExpertParams, 'isBuiltin'>): Expert {
    return new Expert({ ...params, isBuiltin: true });
  }

  /**
   * 创建自定义专家
   */
  static createCustom(params: Omit<CreateExpertParams, 'isBuiltin'>): Expert {
    return new Expert({ ...params, isBuiltin: false });
  }

  /**
   * 从 JSON 恢复专家
   */
  static fromJSON(json: Record<string, unknown>): Expert {
    const roleData = json.role as Record<string, string | undefined>;
    return new Expert({
      id: json.id as string | undefined,
      name: json.name as string,
      role: new ExpertRole(
        roleData.code || '',
        roleData.name || '',
        roleData.description || ''
      ),
      systemPrompt: json.systemPrompt as string,
      avatar: json.avatar as string | undefined,
      tags: json.tags as string[] | undefined,
      isBuiltin: json.isBuiltin as boolean | undefined,
      temperature: json.temperature as number | undefined,
      maxTokens: json.maxTokens as number | undefined,
    });
  }

  /**
   * 验证专家数据有效性
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('专家名称不能为空');
    }
    if (!this.systemPrompt || this.systemPrompt.trim().length === 0) {
      throw new Error('系统提示词不能为空');
    }
    if (!this.role) {
      throw new Error('专家角色不能为空');
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `expert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 更新系统提示词
   */
  updateSystemPrompt(prompt: string): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('系统提示词不能为空');
    }
    this.systemPrompt = prompt;
    this.touch();
  }

  /**
   * 更新名称
   */
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('专家名称不能为空');
    }
    this.name = name;
    this.touch();
  }

  /**
   * 克隆专家
   */
  clone(): Expert {
    return new Expert({
      name: `${this.name} 副本`,
      role: this.role,
      systemPrompt: this.systemPrompt,
      avatar: this.avatar,
      tags: [...this.tags],
      isBuiltin: false,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    });
  }

  /**
   * 添加标签
   */
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.touch();
    }
  }

  /**
   * 移除标签
   */
  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
      this.touch();
    }
  }

  /**
   * 停用专家
   */
  deactivate(): void {
    this.status = ExpertStatus.INACTIVE;
    this.touch();
  }

  /**
   * 激活专家
   */
  activate(): void {
    this.status = ExpertStatus.ACTIVE;
    this.touch();
  }

  /**
   * 更新修改时间
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * 转换为 JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      role: {
        code: this.role.code,
        name: this.role.name,
        description: this.role.description,
      },
      systemPrompt: this.systemPrompt,
      avatar: this.avatar,
      tags: this.tags,
      status: this.status,
      isBuiltin: this.isBuiltin,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * 检查专家是否激活
   */
  isActive(): boolean {
    return this.status === ExpertStatus.ACTIVE;
  }

  /**
   * 检查是否有某个标签
   */
  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }
}
