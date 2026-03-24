import { describe, it, expect, beforeEach } from 'vitest';
import { createConversationStore } from '@infrastructure/stores/conversation.store';

describe('conversationStore', () => {
  let store: ReturnType<typeof createConversationStore>;

  beforeEach(() => {
    store = createConversationStore();
  });

  it('应该添加新会话', () => {
    store.addConversation({ id: '1', name: '测试' });
    expect(store.conversations).toHaveLength(1);
  });

  it('应该设置当前会话', () => {
    store.setCurrentId('1');
    expect(store.currentId).toBe('1');
  });

  it('应该更新会话名称', () => {
    store.addConversation({ id: '1', name: '旧名称' });
    store.renameConversation('1', '新名称');
    expect(store.conversations[0].name).toBe('新名称');
  });

  it('应该删除会话', () => {
    store.addConversation({ id: '1', name: '测试' });
    store.deleteConversation('1');
    expect(store.conversations).toHaveLength(0);
  });

  it('应该获取当前会话', () => {
    store.addConversation({ id: '1', name: '测试' });
    store.setCurrentId('1');
    const current = store.getCurrentConversation();
    expect(current?.name).toBe('测试');
  });

  it('应该置顶会话', () => {
    store.addConversation({ id: '1', name: '普通' });
    store.addConversation({ id: '2', name: '置顶' });
    store.pinConversation('2');

    const sorted = store.getSortedConversations();
    expect(sorted[0].id).toBe('2');
    expect(sorted[0].isPinned).toBe(true);
  });

  it('应该取消置顶会话', () => {
    store.addConversation({ id: '1', name: '测试' });
    store.pinConversation('1');
    expect(store.conversations[0].isPinned).toBe(true);

    store.unpinConversation('1');
    expect(store.conversations[0].isPinned).toBe(false);
  });

  it('应该更新未读消息数', () => {
    store.addConversation({ id: '1', name: '测试' });
    store.updateUnreadCount('1', 5);
    expect(store.conversations[0].unreadCount).toBe(5);
  });

  it('应该更新最后消息', () => {
    store.addConversation({ id: '1', name: '测试' });
    store.updateLastMessage('1', '最后一条消息');
    expect(store.conversations[0].lastMessage).toBe('最后一条消息');
    expect(store.conversations[0].updatedAt).toBeDefined();
  });

  it('应该重置store', () => {
    store.addConversation({ id: '1', name: '测试' });
    store.setCurrentId('1');
    expect(store.conversations).toHaveLength(1);

    store.reset();
    expect(store.conversations).toHaveLength(0);
    expect(store.currentId).toBeNull();
  });

  it('排序时应该按时间倒序', () => {
    store.addConversation({ id: '1', name: '第一个', updatedAt: new Date('2024-01-01') });
    store.addConversation({ id: '2', name: '第二个', updatedAt: new Date('2024-01-02') });

    const sorted = store.getSortedConversations();
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
  });

  it('没有当前会话时getCurrentConversation应该返回undefined', () => {
    store.addConversation({ id: '1', name: '测试' });
    const current = store.getCurrentConversation();
    expect(current).toBeUndefined();
  });
});
