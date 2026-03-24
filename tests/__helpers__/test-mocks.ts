/**
 * 测试 Mock 工具
 *
 * 提供共享的 mock 设置和工具函数
 */

import { vi } from 'vitest';

/**
 * 设置全局 URL mock
 */
export function setupURLMock() {
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();
}

/**
 * 设置 window.confirm mock
 */
export function setupConfirmMock(returnValue = true) {
  Object.defineProperty(window, 'confirm', {
    writable: true,
    value: vi.fn(() => returnValue),
  });
}

/**
 * 设置 window.alert mock
 */
export function setupAlertMock() {
  Object.defineProperty(window, 'alert', {
    writable: true,
    value: vi.fn(),
  });
}

/**
 * 创建 Settings Store Mock
 */
export function createSettingsStoreMock(overrides = {}) {
  return {
    providers: [],
    defaultProviderId: null,
    theme: 'dark',
    language: 'zh',
    dataPath: '',
    autoBackup: false,
    addProvider: vi.fn(),
    updateProvider: vi.fn(),
    removeProvider: vi.fn(),
    setDefaultProvider: vi.fn(),
    validateProvider: vi.fn(),
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    setLanguage: vi.fn(),
    setDataPath: vi.fn(),
    setAutoBackup: vi.fn(),
    exportSettings: vi.fn(),
    importSettings: vi.fn(),
    resetToDefaults: vi.fn(),
    ...overrides,
  };
}

/**
 * 创建 Message Store Mock
 */
export function createMessageStoreMock(overrides = {}) {
  return {
    messages: [],
    addMessage: vi.fn(),
    appendContent: vi.fn(),
    updateTokenUsage: vi.fn(),
    updateLatency: vi.fn(),
    clearConversationMessages: vi.fn(),
    clearAllMessages: vi.fn(),
    reset: vi.fn(),
    getMessagesByConversation: vi.fn(() => []),
    getMessageById: vi.fn(),
    ...overrides,
  };
}

/**
 * 创建 Export Utils Mock
 */
export function createExportUtilsMock() {
  return {
    exportMessagesToMarkdown: vi.fn(() => '# 导出内容'),
    exportMessagesToJSON: vi.fn(() => '[{}]'),
    exportMessagesToText: vi.fn(() => '导出内容'),
    formatMessagesForExport: vi.fn(() => '导出内容'),
    filterMessagesByDateRange: vi.fn((msgs) => msgs),
    getExportFileName: vi.fn(() => 'conversation.md'),
    getMimeType: vi.fn(() => 'text/markdown'),
  };
}

/**
 * 创建 Conflict Utils Mock
 */
export function createConflictUtilsMock() {
  return {
    detectConflicts: vi.fn(() => []),
    analyzeConflictSeverity: vi.fn(() => '警告'),
    compareExpertOpinions: vi.fn(() => ({
      hasConflict: false,
      similarity: 0.8,
      divergencePoints: [],
      commonPoints: [],
    })),
    resolveConflict: vi.fn((conflict) => ({ ...conflict, status: 'resolved' })),
    dismissConflict: vi.fn((conflict) => ({ ...conflict, status: 'dismissed' })),
  };
}

/**
 * 设置所有常用全局 mock
 */
export function setupGlobalMocks(options: {
  url?: boolean;
  confirm?: boolean;
  alert?: boolean;
} = {}) {
  const { url = true, confirm = true, alert = true } = options;

  if (url) setupURLMock();
  if (confirm) setupConfirmMock();
  if (alert) setupAlertMock();
}

/**
 * 清除所有 mock
 */
export function clearAllMocks() {
  vi.clearAllMocks();
}
