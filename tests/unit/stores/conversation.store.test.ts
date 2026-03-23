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
});
