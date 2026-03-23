# Multi-Agent 协作平台 - 测试用例

## 文档信息

- **产品名称**: Multi-Agent 协作平台
- **版本**: MVP (v1.0)
- **创建日期**: 2026-03-23
- **测试框架**: Vitest (单元) + Playwright (E2E)

---

## 一、测试策略

```
┌─────────────────────────────────────────────────────────────────┐
│                       测试金字塔                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌─────────┐                                  │
│                    │  E2E    │  (10%) - 关键流程                │
│                    │  Tests  │                                  │
│                   ┌───────────┐                                 │
│                   │ Integration│ (20%) - 模块交互               │
│                   │   Tests   │                                  │
│                  ┌─────────────┐                                │
│                  │    Unit      │ (70%) - 核心逻辑              │
│                  │   Tests      │                                │
│                  └─────────────┘                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 测试类型

1. **单元测试**: 使用 Vitest
   - 工具函数
   - 状态管理
   - 数据处理逻辑

2. **集成测试**: 使用 Vitest + MSW
   - 组件交互
   - 服务层调用
   - IPC 通信

3. **E2E 测试**: 使用 Playwright
   - 用户流程
   - 端到端场景
   - 跨平台验证

---

## 二、单元测试用例

### 2.1 工具函数测试

#### UT-001: Markdown 解析
```typescript
describe('markdownParser', () => {
  it('应该正确解析标题', () => {
    const input = '# 标题';
    expect(parseMarkdown(input)).toContain('<h1>标题</h1>');
  });

  it('应该正确解析代码块', () => {
    const input = '```ts\nconst x = 1;\n```';
    expect(parseMarkdown(input)).toContain('<code');
  });

  it('应该正确解析链接', () => {
    const input = '[链接](https://example.com)';
    expect(parseMarkdown(input)).toContain('<a href=');
  });

  it('应该过滤危险 HTML', () => {
    const input = '<script>alert(1)</script>';
    expect(parseMarkdown(input)).not.toContain('<script>');
  });
});
```

#### UT-002: 时间格式化
```typescript
describe('formatTime', () => {
  it('应该显示"刚刚"', () => {
    const date = new Date();
    expect(formatTime(date)).toBe('刚刚');
  });

  it('应该显示分钟前', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatTime(date)).toBe('5分钟前');
  });

  it('应该显示小时前', () => {
    const date = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatTime(date)).toBe('2小时前');
  });

  it('应该显示日期', () => {
    const date = new Date('2026-01-01');
    expect(formatTime(date)).toBe('2026-01-01');
  });
});
```

#### UT-003: Token 估算
```typescript
describe('estimateTokens', () => {
  it('应该估算英文 token 数', () => {
    const text = 'Hello world';
    expect(estimateTokens(text)).toBeGreaterThan(0);
  });

  it('应该估算中文 token 数', () => {
    const text = '你好世界';
    expect(estimateTokens(text)).toBeGreaterThan(0);
  });

  it('空字符串应该返回 0', () => {
    expect(estimateTokens('')).toBe(0);
  });
});
```

---

### 2.2 状态管理测试 (Zustand)

#### UT-004: 会话状态管理
```typescript
describe('conversationStore', () => {
  beforeEach(() => {
    useConversationStore.setState({ conversations: [], currentId: null });
  });

  it('应该添加新会话', () => {
    const store = useConversationStore.getState();
    store.addConversation({ id: '1', name: '测试' });
    expect(store.conversations).toHaveLength(1);
  });

  it('应该设置当前会话', () => {
    const store = useConversationStore.getState();
    store.setCurrentId('1');
    expect(store.currentId).toBe('1');
  });

  it('应该更新会话名称', () => {
    const store = useConversationStore.getState();
    store.addConversation({ id: '1', name: '旧名称' });
    store.renameConversation('1', '新名称');
    expect(store.conversations[0].name).toBe('新名称');
  });

  it('应该删除会话', () => {
    const store = useConversationStore.getState();
    store.addConversation({ id: '1', name: '测试' });
    store.deleteConversation('1');
    expect(store.conversations).toHaveLength(0);
  });
});
```

#### UT-005: 消息状态管理
```typescript
describe('messageStore', () => {
  it('应该添加消息', () => {
    const store = useMessageStore.getState();
    store.addMessage({ id: '1', content: '测试', expertId: 'expert1' });
    expect(store.messages).toHaveLength(1);
  });

  it('应该追加流式内容', () => {
    const store = useMessageStore.getState();
    store.addMessage({ id: '1', content: 'Hello', expertId: 'expert1' });
    store.appendContent('1', ' World');
    expect(store.messages[0].content).toBe('Hello World');
  });

  it('应该按会话筛选消息', () => {
    const store = useMessageStore.getState();
    store.addMessage({ id: '1', conversationId: 'conv1', content: 'A' });
    store.addMessage({ id: '2', conversationId: 'conv2', content: 'B' });
    const conv1Messages = store.getMessagesByConversation('conv1');
    expect(conv1Messages).toHaveLength(1);
    expect(conv1Messages[0].content).toBe('A');
  });
});
```

---

### 2.3 专家管理测试

#### UT-006: 专家 CRUD
```typescript
describe('expertService', () => {
  it('应该创建专家', async () => {
    const expert = await createExpert({ name: '测试专家', systemPrompt: 'prompt' });
    expect(expert.name).toBe('测试专家');
    expect(expert.id).toBeDefined();
  });

  it('应该更新专家提示词', async () => {
    const expert = await createExpert({ name: '测试', systemPrompt: 'old' });
    const updated = await updateExpert(expert.id, { systemPrompt: 'new' });
    expect(updated.systemPrompt).toBe('new');
  });

  it('应该克隆专家', async () => {
    const original = await createExpert({ name: '原始', systemPrompt: 'prompt' });
    const cloned = await cloneExpert(original.id);
    expect(cloned.name).toContain('副本');
    expect(cloned.systemPrompt).toBe(original.systemPrompt);
  });
});
```

---

## 三、组件测试 (React Testing Library)

### 3.1 消息输入组件

#### CT-001: MessageInput
```typescript
describe('MessageInput', () => {
  it('应该渲染输入框', () => {
    render(<MessageInput onSend={vi.fn()} />);
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('应该触发发送', async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('输入消息...');
    await userEvent.type(input, 'Hello');
    await userEvent.click(screen.getByRole('button', { name: '发送' }));

    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('应该支持@提及', async () => {
    render(<MessageInput onSend={vi.fn()} experts={[{ id: '1', name: 'Expert' }]} />);

    const input = screen.getByPlaceholderText('输入消息...');
    await userEvent.type(input, '@Ex');

    expect(screen.getByText('Expert')).toBeInTheDocument();
  });

  it('应该禁用空消息发送', async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);

    await userEvent.click(screen.getByRole('button', { name: '发送' }));
    expect(onSend).not.toHaveBeenCalled();
  });
});
```

### 3.2 会话列表组件

#### CT-002: ConversationList
```typescript
describe('ConversationList', () => {
  const mockConversations = [
    { id: '1', name: '会话A', lastMessage: '最后消息', unreadCount: 2 },
    { id: '2', name: '会话B', lastMessage: '已读消息', unreadCount: 0 },
  ];

  it('应该渲染会话列表', () => {
    render(<ConversationList conversations={mockConversations} />);
    expect(screen.getByText('会话A')).toBeInTheDocument();
    expect(screen.getByText('会话B')).toBeInTheDocument();
  });

  it('应该显示未读徽章', () => {
    render(<ConversationList conversations={mockConversations} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('应该触发会话选择', async () => {
    const onSelect = vi.fn();
    render(<ConversationList conversations={mockConversations} onSelect={onSelect} />);

    await userEvent.click(screen.getByText('会话A'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

### 3.3 专家卡片组件

#### CT-003: ExpertCard
```typescript
describe('ExpertCard', () => {
  const expert = {
    id: '1',
    name: '安全专家',
    avatar: 'avatar.png',
    description: '安全审查专家',
    tags: ['安全', '代码审查'],
  };

  it('应该渲染专家信息', () => {
    render(<ExpertCard expert={expert} />);
    expect(screen.getByText('安全专家')).toBeInTheDocument();
    expect(screen.getByText('安全审查专家')).toBeInTheDocument();
  });

  it('应该显示标签', () => {
    render(<ExpertCard expert={expert} />);
    expect(screen.getByText('安全')).toBeInTheDocument();
    expect(screen.getByText('代码审查')).toBeInTheDocument();
  });

  it('应该触发双击事件', async () => {
    const onDoubleClick = vi.fn();
    render(<ExpertCard expert={expert} onDoubleClick={onDoubleClick} />);

    await userEvent.dblClick(screen.getByText('安全专家'));
    expect(onDoubleClick).toHaveBeenCalledWith('1');
  });
});
```

---

## 四、E2E 测试 (Playwright)

### 4.1 关键用户流程

#### E2E-001: 首次启动配置流程
```typescript
test.describe('首次启动', () => {
  test('应该完成欢迎引导', async ({ page }) => {
    // 首次启动显示欢迎页
    await page.goto('/');
    await expect(page.getByText('欢迎使用 Multi-Agent')).toBeVisible();

    // 点击下一步
    await page.getByRole('button', { name: '下一步' }).click();
    await expect(page.getByText('发现专家团队')).toBeVisible();

    // 完成引导
    await page.getByRole('button', { name: '开始使用' }).click();
    await expect(page.getByText('专家团队')).toBeVisible();
  });

  test('应该配置 API Key', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('button', { name: '添加提供商' }).click();

    // 选择提供商
    await page.getByText('Anthropic').click();

    // 输入 API Key
    await page.getByLabel('API Key').fill('test-api-key');

    // 验证连接
    await page.getByRole('button', { name: '验证' }).click();
    await expect(page.getByText('验证成功')).toBeVisible();
  });
});
```

#### E2E-002: 创建会话并发送消息
```typescript
test.describe('会话流程', () => {
  test('应该创建单聊会话', async ({ page }) => {
    await page.goto('/experts');

    // 双击专家
    await page.getByText('架构师').dblClick();

    // 验证会话创建
    await expect(page.getByText('与 架构师 的对话')).toBeVisible();

    // 发送消息
    await page.getByPlaceholder('输入消息...').fill('Hello');
    await page.getByRole('button', { name: '发送' }).click();

    // 验证消息显示
    await expect(page.getByText('Hello')).toBeVisible();
  });

  test('应该创建群聊会话', async ({ page }) => {
    await page.goto('/experts');

    // 选择多个专家
    await page.getByText('架构师').click({ modifiers: ['Control'] });
    await page.getByText('前端专家').click({ modifiers: ['Control'] });

    // 创建群聊
    await page.getByRole('button', { name: '创建群聊' }).click();
    await page.getByLabel('群名称').fill('技术评审');
    await page.getByRole('button', { name: '确认' }).click();

    // 验证群聊创建
    await expect(page.getByText('技术评审')).toBeVisible();
  });
});
```

#### E2E-003: 多专家并行响应
```typescript
test.describe('并行对话', () => {
  test('应该同时显示多个专家回复', async ({ page }) => {
    await page.goto('/chat/1');

    // 发送消息到群聊
    await page.getByPlaceholder('输入消息...').fill('如何优化性能？');
    await page.getByRole('button', { name: '发送' }).click();

    // 验证多个专家正在思考
    await expect(page.getByText('架构师 正在思考...')).toBeVisible();
    await expect(page.getByText('前端专家 正在思考...')).toBeVisible();

    // 等待回复 (mock)
    await page.waitForTimeout(2000);

    // 验证多个回复显示
    await expect(page.getByTestId('expert-response-architect')).toBeVisible();
    await expect(page.getByTestId('expert-response-frontend')).toBeVisible();
  });

  test('应该支持@提及', async ({ page }) => {
    await page.goto('/chat/1');

    // 输入@提及
    await page.getByPlaceholder('输入消息...').fill('@架构师 请详细说明');
    await page.getByRole('button', { name: '发送' }).click();

    // 验证只有被@的专家响应
    await expect(page.getByText('架构师 正在思考...')).toBeVisible();
    await expect(page.getByText('前端专家 正在思考...')).not.toBeVisible();
  });
});
```

#### E2E-004: 代码审查流程
```typescript
test.describe('代码审查', () => {
  test('应该完成代码审查', async ({ page }) => {
    await page.goto('/code-review');

    // 粘贴代码
    await page.getByRole('textbox').fill('function add(a, b) { return a + b; }');

    // 开始审查
    await page.getByRole('button', { name: '开始审查' }).click();

    // 验证审查结果
    await expect(page.getByText('代码规范')).toBeVisible();
    await expect(page.getByText('性能优化')).toBeVisible();

    // 查看详细问题
    await page.getByText('严重').first().click();
    await expect(page.getByText('问题详情')).toBeVisible();
  });
});
```

#### E2E-005: Dashboard 查看
```typescript
test.describe('Dashboard', () => {
  test('应该显示统计数据', async ({ page }) => {
    await page.goto('/dashboard');

    // 验证统计卡片
    await expect(page.getByText('节省时间')).toBeVisible();
    await expect(page.getByText('Token用量')).toBeVisible();
    await expect(page.getByText('任务完成')).toBeVisible();

    // 验证图表
    await expect(page.getByTestId('activity-chart')).toBeVisible();
    await expect(page.getByTestId('expert-matrix')).toBeVisible();
  });

  test('应该切换时间范围', async ({ page }) => {
    await page.goto('/dashboard');

    // 切换时间范围
    await page.getByRole('button', { name: '30天' }).click();

    // 验证数据更新
    await expect(page.getByTestId('activity-chart')).toHaveAttribute('data-range', '30d');
  });
});
```

---

## 五、性能测试

### 5.1 加载性能

```typescript
describe('Performance', () => {
  it('首屏加载时间 < 3s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });

  it('消息列表滚动流畅', async ({ page }) => {
    await page.goto('/chat/1');

    // 测量滚动帧率
    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        const measure = () => {
          frames++;
          if (performance.now() - start < 1000) {
            requestAnimationFrame(measure);
          } else {
            resolve(frames);
          }
        };
        requestAnimationFrame(measure);
      });
    });

    expect(fps).toBeGreaterThan(30);
  });
});
```

---

## 六、测试文件结构

```
tests/
├── unit/
│   ├── utils/
│   │   ├── markdown.test.ts
│   │   ├── time.test.ts
│   │   └── tokens.test.ts
│   ├── stores/
│   │   ├── conversation.test.ts
│   │   └── message.test.ts
│   └── services/
│       └── expert.test.ts
├── integration/
│   ├── components/
│   │   ├── MessageInput.test.tsx
│   │   ├── ConversationList.test.tsx
│   │   └── ExpertCard.test.tsx
│   └── ipc/
│       └── commands.test.ts
├── e2e/
│   ├── onboarding.spec.ts
│   ├── conversation.spec.ts
│   ├── chat.spec.ts
│   ├── code-review.spec.ts
│   └── dashboard.spec.ts
└── fixtures/
    ├── experts.json
    ├── conversations.json
    └── messages.json
```

---

## 七、测试执行计划

| 阶段 | 测试类型 | 频率 | 目标 |
|------|---------|------|------|
| 开发期 | 单元测试 | 每次提交 | > 80% 覆盖率 |
| 开发期 | 组件测试 | 每次提交 | 核心组件覆盖 |
| 集成期 | 集成测试 | 每日构建 | 模块交互正确 |
| 发布前 | E2E 测试 | 每次发布 | 关键流程通过 |
| 回归期 | 全量测试 | 每周 | 无回归 Bug |

---

## 八、测试覆盖率目标

```
┌─────────────────────────────────────────────────────────────────┐
│                       覆盖率目标                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  模块                  单元测试    集成测试    E2E              │
│  ─────────────────────────────────────────────────────────────  │
│  Utils                 90%        -          -                  │
│  Stores                85%        -          -                  │
│  Components            70%        80%        -                  │
│  Services              80%        75%        -                  │
│  IPC Commands          70%        80%        100%               │
│  User Flows            -          -          100%               │
│                                                                 │
│  整体目标: > 80%                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 九、Mock 数据

### Mock LLM 响应

```typescript
// tests/mocks/llm.ts
export const mockLLMResponse = {
  id: 'msg-1',
  content: '这是一个测试回复',
  expertId: 'expert-1',
  latency: 1200,
  tokensUsed: 150,
};

export const mockStreamResponse = [
  { type: 'start', expertId: 'expert-1' },
  { type: 'delta', expertId: 'expert-1', content: '这是' },
  { type: 'delta', expertId: 'expert-1', content: '一个' },
  { type: 'delta', expertId: 'expert-1', content: '回复' },
  { type: 'complete', expertId: 'expert-1' },
];
```

---

**文档版本**: v1.0
**更新日期**: 2026-03-23
