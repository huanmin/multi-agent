import { describe, it, expect, beforeEach } from 'vitest';
import { createMessageStore } from '@infrastructure/stores/message.store';

describe('messageStore', () => {
  let store: ReturnType<typeof createMessageStore>;

  beforeEach(() => {
    store = createMessageStore();
  });

  it('应该添加消息', () => {
    store.addMessage({ id: '1', content: '测试', expertId: 'expert1' });
    expect(store.messages).toHaveLength(1);
  });

  it('应该自动生成消息ID', () => {
    store.addMessage({ content: '测试', expertId: 'expert1' });
    expect(store.messages[0].id).toBeDefined();
    expect(store.messages[0].id).toMatch(/^msg_/);
  });

  it('应该追加流式内容', () => {
    store.addMessage({ id: '1', content: 'Hello', expertId: 'expert1' });
    store.appendContent('1', ' World');
    expect(store.messages[0].content).toBe('Hello World');
  });

  it('应该按会话筛选消息', () => {
    store.addMessage({ id: '1', conversationId: 'conv1', content: 'A', expertId: 'expert1' });
    store.addMessage({ id: '2', conversationId: 'conv2', content: 'B', expertId: 'expert2' });
    const conv1Messages = store.getMessagesByConversation('conv1');
    expect(conv1Messages).toHaveLength(1);
    expect(conv1Messages[0].content).toBe('A');
  });

  it('应该更新消息 token 使用', () => {
    store.addMessage({ id: '1', content: 'test', expertId: 'expert1' });
    store.updateTokenUsage('1', 100, 50);
    expect(store.messages[0].inputTokens).toBe(100);
    expect(store.messages[0].outputTokens).toBe(50);
  });

  it('应该更新消息延迟', () => {
    store.addMessage({ id: '1', content: 'test', expertId: 'expert1' });
    store.updateLatency('1', 1500);
    expect(store.messages[0].latencyMs).toBe(1500);
  });

  it('应该清除会话消息', () => {
    store.addMessage({ id: '1', conversationId: 'conv1', content: 'A', expertId: 'expert1' });
    store.addMessage({ id: '2', conversationId: 'conv1', content: 'B', expertId: 'expert2' });
    store.addMessage({ id: '3', conversationId: 'conv2', content: 'C', expertId: 'expert3' });

    store.clearConversationMessages('conv1');
    expect(store.messages).toHaveLength(1);
    expect(store.messages[0].id).toBe('3');
  });

  it('应该清除所有消息', () => {
    store.addMessage({ id: '1', content: 'A', expertId: 'expert1' });
    store.addMessage({ id: '2', content: 'B', expertId: 'expert2' });

    store.clearAllMessages();
    expect(store.messages).toHaveLength(0);
  });

  it('应该重置store', () => {
    store.addMessage({ id: '1', content: 'A', expertId: 'expert1' });
    store.reset();
    expect(store.messages).toHaveLength(0);
  });

  it('应该通过ID获取消息', () => {
    store.addMessage({ id: '1', content: 'A', expertId: 'expert1' });
    const message = store.getMessageById('1');
    expect(message?.content).toBe('A');
  });

  it('获取不存在消息应该返回undefined', () => {
    const message = store.getMessageById('non-existent');
    expect(message).toBeUndefined();
  });
});
