/**
 * Tauri IPC Service 测试
 *
 * 测试前端与 Tauri 后端的 IPC 通信
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TauriExpertService, TauriConversationService } from '@infrastructure/services/tauri/tauri.ipc.service';

// Mock Tauri API
const mockInvoke = vi.fn();

vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: unknown[]) => mockInvoke(...args),
}));

describe('TauriExpertService', () => {
  let service: TauriExpertService;

  beforeEach(() => {
    service = new TauriExpertService();
    mockInvoke.mockClear();
  });

  describe('getExperts', () => {
    it('应该调用 get_experts 命令', async () => {
      const mockExperts = [
        { id: '1', name: '架构师', role_code: 'ARCHITECT' },
        { id: '2', name: '前端专家', role_code: 'FRONTEND' },
      ];
      mockInvoke.mockResolvedValueOnce(mockExperts);

      const result = await service.getExperts();

      expect(mockInvoke).toHaveBeenCalledWith('get_experts');
      expect(result).toEqual(mockExperts);
    });

    it('应该在错误时抛出', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.getExperts()).rejects.toThrow('Failed to get experts');
    });
  });

  describe('createExpert', () => {
    it('应该调用 create_expert 命令', async () => {
      const request = {
        name: '新专家',
        role_code: 'BACKEND',
        system_prompt: '你是一个后端专家',
        tags: ['API', '数据库'],
      };
      const mockExpert = { id: '3', ...request };
      mockInvoke.mockResolvedValueOnce(mockExpert);

      const result = await service.createExpert(request);

      expect(mockInvoke).toHaveBeenCalledWith('create_expert', { request });
      expect(result).toEqual(mockExpert);
    });
  });

  describe('updateExpert', () => {
    it('应该调用 update_expert 命令', async () => {
      const id = '1';
      const request = { name: '更新名称' };
      const mockExpert = { id, name: '更新名称', role_code: 'ARCHITECT' };
      mockInvoke.mockResolvedValueOnce(mockExpert);

      const result = await service.updateExpert(id, request);

      expect(mockInvoke).toHaveBeenCalledWith('update_expert', { id, request });
      expect(result).toEqual(mockExpert);
    });
  });

  describe('deleteExpert', () => {
    it('应该调用 delete_expert 命令', async () => {
      mockInvoke.mockResolvedValueOnce(undefined);

      await service.deleteExpert('1');

      expect(mockInvoke).toHaveBeenCalledWith('delete_expert', { id: '1' });
    });
  });

  describe('cloneExpert', () => {
    it('应该调用 clone_expert 命令', async () => {
      const mockExpert = { id: 'clone-1', name: '架构师 (副本)', role_code: 'ARCHITECT' };
      mockInvoke.mockResolvedValueOnce(mockExpert);

      const result = await service.cloneExpert('1');

      expect(mockInvoke).toHaveBeenCalledWith('clone_expert', { id: '1' });
      expect(result).toEqual(mockExpert);
    });
  });

  describe('searchExperts', () => {
    it('应该调用 search_experts 命令', async () => {
      const mockExperts = [{ id: '1', name: '架构师', role_code: 'ARCHITECT' }];
      mockInvoke.mockResolvedValueOnce(mockExperts);

      const result = await service.searchExperts('架构');

      expect(mockInvoke).toHaveBeenCalledWith('search_experts', { keyword: '架构' });
      expect(result).toEqual(mockExperts);
    });
  });
});

describe('TauriConversationService', () => {
  let service: TauriConversationService;

  beforeEach(() => {
    service = new TauriConversationService();
    mockInvoke.mockClear();
  });

  describe('getConversations', () => {
    it('应该调用 get_conversations 命令', async () => {
      const mockConversations = [
        { id: '1', name: '对话1', expert_ids: ['1'] },
        { id: '2', name: '对话2', expert_ids: ['2'] },
      ];
      mockInvoke.mockResolvedValueOnce(mockConversations);

      const result = await service.getConversations();

      expect(mockInvoke).toHaveBeenCalledWith('get_conversations');
      expect(result).toEqual(mockConversations);
    });
  });

  describe('createConversation', () => {
    it('应该调用 create_conversation 命令', async () => {
      const request = {
        name: '新对话',
        expert_ids: ['1', '2'],
        conversation_type: 'single',
      };
      const mockConversation = { id: '3', ...request };
      mockInvoke.mockResolvedValueOnce(mockConversation);

      const result = await service.createConversation(request);

      expect(mockInvoke).toHaveBeenCalledWith('create_conversation', { request });
      expect(result).toEqual(mockConversation);
    });
  });

  describe('deleteConversation', () => {
    it('应该调用 delete_conversation 命令', async () => {
      mockInvoke.mockResolvedValueOnce(undefined);

      await service.deleteConversation('1');

      expect(mockInvoke).toHaveBeenCalledWith('delete_conversation', { id: '1' });
    });
  });

  describe('getMessages', () => {
    it('应该调用 get_messages 命令', async () => {
      const mockMessages = [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi!' },
      ];
      mockInvoke.mockResolvedValueOnce(mockMessages);

      const result = await service.getMessages('conv-1');

      expect(mockInvoke).toHaveBeenCalledWith('get_messages', { conversationId: 'conv-1' });
      expect(result).toEqual(mockMessages);
    });
  });

  describe('sendMessage', () => {
    it('应该调用 send_message 命令', async () => {
      const request = { content: 'Hello', mentions: [] };
      const mockMessage = { id: '3', role: 'user', content: 'Hello' };
      mockInvoke.mockResolvedValueOnce(mockMessage);

      const result = await service.sendMessage('conv-1', request);

      expect(mockInvoke).toHaveBeenCalledWith('send_message', {
        conversationId: 'conv-1',
        request,
      });
      expect(result).toEqual(mockMessage);
    });
  });
});
