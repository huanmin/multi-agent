/**
 * Tauri IPC Service
 *
 * 前端与 Tauri 后端通信的服务封装
 */

import { invoke } from '@tauri-apps/api/core';

// ==================== Expert Types ====================

export interface ExpertRequest {
  name: string;
  role_code: string;
  system_prompt: string;
  tags?: string[];
  avatar?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface UpdateExpertRequest {
  name?: string;
  system_prompt?: string;
  tags?: string[];
  temperature?: number;
  max_tokens?: number;
}

export interface Expert {
  id: string;
  name: string;
  role_code: string;
  system_prompt: string;
  tags: string[];
  avatar?: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== Conversation Types ====================

export interface CreateConversationRequest {
  name?: string;
  expert_ids: string[];
  conversation_type: string;
}

export interface SendMessageRequest {
  content: string;
  mentions?: string[];
}

export interface Conversation {
  id: string;
  name: string;
  conversation_type: string;
  expert_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  expert_id?: string;
  mentions: string[];
  created_at: string;
}

// ==================== Expert Service ====================

export class TauriExpertService {
  /**
   * 获取所有专家
   */
  async getExperts(): Promise<Expert[]> {
    try {
      return await invoke<Expert[]>('get_experts');
    } catch (error) {
      throw new Error(`Failed to get experts: ${error}`);
    }
  }

  /**
   * 创建专家
   */
  async createExpert(request: ExpertRequest): Promise<Expert> {
    try {
      return await invoke<Expert>('create_expert', { request });
    } catch (error) {
      throw new Error(`Failed to create expert: ${error}`);
    }
  }

  /**
   * 更新专家
   */
  async updateExpert(id: string, request: UpdateExpertRequest): Promise<Expert> {
    try {
      return await invoke<Expert>('update_expert', { id, request });
    } catch (error) {
      throw new Error(`Failed to update expert: ${error}`);
    }
  }

  /**
   * 删除专家
   */
  async deleteExpert(id: string): Promise<void> {
    try {
      await invoke<void>('delete_expert', { id });
    } catch (error) {
      throw new Error(`Failed to delete expert: ${error}`);
    }
  }

  /**
   * 克隆专家
   */
  async cloneExpert(id: string): Promise<Expert> {
    try {
      return await invoke<Expert>('clone_expert', { id });
    } catch (error) {
      throw new Error(`Failed to clone expert: ${error}`);
    }
  }

  /**
   * 搜索专家
   */
  async searchExperts(keyword: string): Promise<Expert[]> {
    try {
      return await invoke<Expert[]>('search_experts', { keyword });
    } catch (error) {
      throw new Error(`Failed to search experts: ${error}`);
    }
  }
}

// ==================== Conversation Service ====================

export class TauriConversationService {
  /**
   * 获取所有对话
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      return await invoke<Conversation[]>('get_conversations');
    } catch (error) {
      throw new Error(`Failed to get conversations: ${error}`);
    }
  }

  /**
   * 创建对话
   */
  async createConversation(request: CreateConversationRequest): Promise<Conversation> {
    try {
      return await invoke<Conversation>('create_conversation', { request });
    } catch (error) {
      throw new Error(`Failed to create conversation: ${error}`);
    }
  }

  /**
   * 删除对话
   */
  async deleteConversation(id: string): Promise<void> {
    try {
      await invoke<void>('delete_conversation', { id });
    } catch (error) {
      throw new Error(`Failed to delete conversation: ${error}`);
    }
  }

  /**
   * 重命名对话
   */
  async renameConversation(id: string, name: string): Promise<Conversation> {
    try {
      return await invoke<Conversation>('rename_conversation', { id, name });
    } catch (error) {
      throw new Error(`Failed to rename conversation: ${error}`);
    }
  }

  /**
   * 获取消息列表
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      return await invoke<Message[]>('get_messages', { conversationId });
    } catch (error) {
      throw new Error(`Failed to get messages: ${error}`);
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(conversationId: string, request: SendMessageRequest): Promise<Message> {
    try {
      return await invoke<Message>('send_message', { conversationId, request });
    } catch (error) {
      throw new Error(`Failed to send message: ${error}`);
    }
  }
}

// ==================== Singleton Exports ====================

export const tauriExpertService = new TauriExpertService();
export const tauriConversationService = new TauriConversationService();
