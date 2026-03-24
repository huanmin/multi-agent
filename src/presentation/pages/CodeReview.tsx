/**
 * 代码审查页面
 *
 * 提交代码进行多专家审查
 */

import { useState } from 'react';

interface ReviewResult {
  id: string;
  category: '代码规范' | '性能优化' | '安全漏洞' | '最佳实践';
  severity: '严重' | '警告' | '建议';
  description: string;
  line?: number;
}

export function CodeReview() {
  const [code, setCode] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);

  const handleStartReview = async () => {
    if (!code.trim()) return;

    setIsReviewing(true);
    setResults([]);

    // 模拟审查延迟
    setTimeout(() => {
      const mockResults: ReviewResult[] = [
        {
          id: '1',
          category: '代码规范',
          severity: '警告',
          description: '函数命名应该使用 camelCase',
          line: 1,
        },
        {
          id: '2',
          category: '性能优化',
          severity: '建议',
          description: '建议使用严格相等 === 而不是 ==',
          line: 2,
        },
        {
          id: '3',
          category: '安全漏洞',
          severity: '严重',
          description: '未验证的输入可能导致安全问题',
          line: 3,
        },
        {
          id: '4',
          category: '最佳实践',
          severity: '建议',
          description: '建议添加 JSDoc 注释',
          line: 1,
        },
      ];
      setResults(mockResults);
      setIsReviewing(false);
    }, 1500);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '严重':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case '警告':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case '建议':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* 头部 */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <h1 className="text-xl font-bold text-white">代码审查</h1>
      </header>

      <div className="p-6 grid grid-cols-2 gap-6">
        {/* 左侧代码输入 */}
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-100">输入代码</h2>
              <button
                onClick={() => setCode('')}
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                清空
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="在此粘贴您的代码..."
              className="w-full h-96 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500 resize-none"
              spellCheck={false}
            />
            <button
              onClick={handleStartReview}
              disabled={!code.trim() || isReviewing}
              className="w-full mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {isReviewing ? '审查中...' : '开始审查'}
            </button>
          </div>
        </div>

        {/* 右侧审查结果 */}
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">审查结果</h2>

            {results.length === 0 && !isReviewing && (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-4">🔍</div>
                <p>提交代码开始审查</p>
              </div>
            )}

            {isReviewing && (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2 text-slate-400">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span>多专家正在审查中...</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(result.severity)}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-current/20">
                      {result.severity}
                    </span>
                    <span className="text-sm font-medium">{result.category}</span>
                    {result.line && (
                      <span className="text-xs text-slate-500">第 {result.line} 行</span>
                    )}
                  </div>
                  <p className="text-slate-200">{result.description}</p>
                </div>
              ))}
            </div>

            {/* 分类统计 */}
            {results.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="grid grid-cols-4 gap-4">
                  {['代码规范', '性能优化', '安全漏洞', '最佳实践'].map((category) => {
                    const count = results.filter((r) => r.category === category).length;
                    return (
                      <div key={category} className="text-center">
                        <div className="text-2xl font-bold text-cyan-400">{count}</div>
                        <div className="text-xs text-slate-400">{category}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
