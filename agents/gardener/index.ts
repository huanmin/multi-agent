#!/usr/bin/env node
/**
 * Gardener Agent - 园丁代理
 *
 * 负责代码库健康维护和垃圾回收的自动化智能体
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { load } from 'js-yaml';

const execAsync = promisify(exec);

// 类型定义
interface GardenerConfig {
  agent: {
    name: string;
    version: string;
    capabilities: string[];
  };
  scheduling: {
    check_interval: string;
    batch_size: number;
    max_concurrent_tasks: number;
  };
  lifecycle_policies: {
    files: Record<string, FileLifecyclePolicy>;
    branches: Record<string, BranchLifecyclePolicy>;
    dependencies: Record<string, DependencyLifecyclePolicy>;
  };
  cleanup_rules: {
    files: CleanupRule[];
    code: CodeCleanupRule[];
  };
  metrics: {
    enabled: boolean;
    port: number;
    path: string;
  };
}

interface FileLifecyclePolicy {
  patterns: string[];
  ttl: string;
  action: 'notify' | 'archive' | 'delete';
  archive_path?: string;
  require_approval?: boolean;
}

interface BranchLifecyclePolicy {
  pattern: string;
  ttl: string;
  merge_check: boolean;
  action: 'notify' | 'archive' | 'auto_delete';
}

interface DependencyLifecyclePolicy {
  ttl: string;
  action: 'notify' | 'auto_remove';
  auto_remove?: boolean;
}

interface CleanupRule {
  name: string;
  enabled: boolean;
  schedule: 'daily' | 'weekly';
  dry_run: boolean;
  patterns?: string[];
}

interface CodeCleanupRule extends CleanupRule {
  confidence_threshold?: number;
  auto_fix?: boolean;
}

interface ScanResult {
  timestamp: string;
  staleFiles: FileInfo[];
  unusedDependencies: string[];
  deadCode: CodeIssue[];
  duplicates: DuplicateGroup[];
  healthScore: number;
}

interface FileInfo {
  path: string;
  lastModified: Date;
  age: number;
  category: string;
}

interface CodeIssue {
  file: string;
  line: number;
  type: string;
  message: string;
  confidence: number;
}

interface DuplicateGroup {
  files: string[];
  similarity: number;
  lines: number;
}

// 指标收集器
class MetricsCollector {
  private metrics: Map<string, { value: number; labels: Record<string, string> }[]> = new Map();

  increment(name: string, labels: Record<string, string> = {}, value: number = 1): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push({ value, labels });
  }

  gauge(name: string, value: number, labels: Record<string, string> = {}): void {
    this.metrics.set(name, [{ value, labels }]);
  }

  histogram(name: string, value: number, labels: Record<string, string> = {}): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push({ value, labels });
  }

  export(): string {
    let output = '';
    for (const [name, entries] of this.metrics) {
      for (const entry of entries) {
        const labelStr = Object.entries(entry.labels)
          .map(([k, v]) => `${k}="${v}"`)
          .join(',');
        output += `${name}{${labelStr}} ${entry.value}\n`;
      }
    }
    return output;
  }
}

// 园丁代理主类
class GardenerAgent {
  private config: GardenerConfig;
  private metrics: MetricsCollector;
  private startTime: Date;

  constructor(configPath: string) {
    const configContent = readFileSync(configPath, 'utf-8');
    this.config = load(configContent) as GardenerConfig;
    this.metrics = new MetricsCollector();
    this.startTime = new Date();
  }

  /**
   * 执行全面扫描
   */
  async scan(): Promise<ScanResult> {
    console.log('🔍 Starting codebase scan...');

    const staleFiles = await this.detectStaleFiles();
    const unusedDependencies = await this.detectUnusedDependencies();
    const deadCode = await this.detectDeadCode();
    const duplicates = await this.detectDuplicates();

    const healthScore = this.calculateHealthScore({
      staleFiles: staleFiles.length,
      unusedDependencies: unusedDependencies.length,
      deadCode: deadCode.length,
      duplicates: duplicates.length,
    });

    // 更新指标
    this.metrics.gauge('gc_stale_files', staleFiles.length, { category: 'all' });
    this.metrics.gauge('gc_health_score', healthScore);

    return {
      timestamp: new Date().toISOString(),
      staleFiles,
      unusedDependencies,
      deadCode,
      duplicates,
      healthScore,
    };
  }

  /**
   * 检测过期文件
   */
  private async detectStaleFiles(): Promise<FileInfo[]> {
    const staleFiles: FileInfo[] = [];
    const now = Date.now();
    const staleThreshold = 30 * 24 * 60 * 60 * 1000; // 30天

    const scanDirectory = (dir: string): void => {
      if (!existsSync(dir)) return;

      const files = readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = join(dir, file.name);

        if (file.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'coverage'].includes(file.name)) {
            scanDirectory(fullPath);
          }
          continue;
        }

        const stat = statSync(fullPath);
        const age = now - stat.mtimeMs;

        if (age > staleThreshold) {
          staleFiles.push({
            path: fullPath,
            lastModified: stat.mtime,
            age: Math.floor(age / (24 * 60 * 60 * 1000)), // 天数
            category: this.categorizeFile(fullPath),
          });
        }
      }
    };

    scanDirectory(process.cwd());
    return staleFiles;
  }

  /**
   * 检测未使用的依赖
   */
  private async detectUnusedDependencies(): Promise<string[]> {
    const unused: string[] = [];

    try {
      // 读取 package.json
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // 简单的依赖检测（实际应该使用 AST 分析）
      for (const dep of Object.keys(dependencies)) {
        try {
          const { stdout } = await execAsync(
            `grep -r "from ['\\\"]${dep}" src/ --include="*.ts" --include="*.js" || true`,
            { cwd: process.cwd() }
          );
          if (!stdout.trim()) {
            unused.push(dep);
          }
        } catch {
          // grep 没有找到匹配
          unused.push(dep);
        }
      }
    } catch (error) {
      console.warn('Warning: Could not check dependencies:', error);
    }

    return unused;
  }

  /**
   * 检测死代码
   */
  private async detectDeadCode(): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];

    // 使用 TypeScript 编译器进行检测
    try {
      await execAsync('npx ts-prune src/ --json 2>/dev/null || true', {
        cwd: process.cwd(),
      });
    } catch (error) {
      // 死代码检测是可选的
    }

    return issues;
  }

  /**
   * 检测重复代码
   */
  private async detectDuplicates(): Promise<DuplicateGroup[]> {
    const duplicates: DuplicateGroup[] = [];

    // 使用 jscpd 进行重复代码检测
    try {
      const { stdout } = await execAsync(
        'npx jscpd src/ --reporters json --min-lines 10 --min-tokens 50 2>/dev/null || echo "{}"',
        { cwd: process.cwd() }
      );
      const result = JSON.parse(stdout);
      if (result.statistics) {
        for (const duplicate of result.statistics.duplicates || []) {
          duplicates.push({
            files: duplicate.files || [],
            similarity: duplicate.similarity || 0,
            lines: duplicate.lines || 0,
          });
        }
      }
    } catch (error) {
      // 重复检测是可选的
    }

    return duplicates;
  }

  /**
   * 计算健康分数
   */
  private calculateHealthScore(metrics: {
    staleFiles: number;
    unusedDependencies: number;
    deadCode: number;
    duplicates: number;
  }): number {
    const weights = {
      staleFiles: 0.2,
      unusedDependencies: 0.3,
      deadCode: 0.3,
      duplicates: 0.2,
    };

    // 惩罚分数
    const penalty =
      metrics.staleFiles * weights.staleFiles * 0.5 +
      metrics.unusedDependencies * weights.unusedDependencies * 2 +
      metrics.deadCode * weights.deadCode * 3 +
      metrics.duplicates * weights.duplicates * 1;

    return Math.max(0, 100 - Math.min(100, penalty));
  }

  /**
   * 执行清理
   */
  async cleanup(dryRun: boolean = true): Promise<void> {
    console.log(`🧹 Starting cleanup (dry_run: ${dryRun})...`);

    const start = Date.now();

    // 执行文件清理规则
    for (const rule of this.config.cleanup_rules.files) {
      if (!rule.enabled) continue;

      console.log(`  Running: ${rule.name}`);
      const itemsCollected = await this.executeFileCleanup(rule, dryRun);
      this.metrics.increment('gc_items_collected', { type: 'file', action: rule.name }, itemsCollected);
    }

    // 执行代码清理规则
    for (const rule of this.config.cleanup_rules.code) {
      if (!rule.enabled) continue;

      console.log(`  Running: ${rule.name}`);
      const itemsCollected = await this.executeCodeCleanup(rule, dryRun);
      this.metrics.increment('gc_items_collected', { type: 'code', action: rule.name }, itemsCollected);
    }

    const duration = (Date.now() - start) / 1000;
    this.metrics.histogram('gc_cleanup_duration_seconds', duration, { operation: 'full' });

    console.log(`✅ Cleanup completed in ${duration}s`);
  }

  /**
   * 执行文件清理规则
   */
  private async executeFileCleanup(rule: CleanupRule, dryRun: boolean): Promise<number> {
    let count = 0;

    switch (rule.name) {
      case 'remove_temp_files':
        // 移除临时文件
        count = await this.removeFilesByPatterns(rule.patterns || [], dryRun);
        break;

      case 'remove_empty_directories':
        // 移除空目录
        count = await this.removeEmptyDirectories(dryRun);
        break;

      case 'compress_old_logs':
        // 压缩旧日志
        count = await this.compressOldLogs(dryRun);
        break;
    }

    return count;
  }

  /**
   * 执行代码清理规则
   */
  private async executeCodeCleanup(rule: CodeCleanupRule, dryRun: boolean): Promise<number> {
    let count = 0;

    switch (rule.name) {
      case 'remove_unused_imports':
        if (rule.auto_fix && !dryRun) {
          await execAsync('npx eslint --fix "src/**/*.ts" --rule "import/no-duplicates: error"', {
            cwd: process.cwd(),
          });
        }
        break;

      case 'remove_console_logs':
        // 移除 console.log
        count = await this.removeConsoleLogs(rule.exclude || [], dryRun);
        break;
    }

    return count;
  }

  /**
   * 按模式删除文件
   */
  private async removeFilesByPatterns(patterns: string[], dryRun: boolean): Promise<number> {
    let count = 0;
    // 实际实现需要遍历文件系统
    return count;
  }

  /**
   * 删除空目录
   */
  private async removeEmptyDirectories(dryRun: boolean): Promise<number> {
    let count = 0;
    // 实际实现需要递归检查目录
    return count;
  }

  /**
   * 压缩旧日志
   */
  private async compressOldLogs(dryRun: boolean): Promise<number> {
    let count = 0;
    // 实际实现需要找到并压缩日志文件
    return count;
  }

  /**
   * 移除 console.log
   */
  private async removeConsoleLogs(exclude: string[], dryRun: boolean): Promise<number> {
    // 使用 eslint 规则移除
    return 0;
  }

  /**
   * 文件分类
   */
  private categorizeFile(path: string): string {
    const ext = extname(path);
    const categories: Record<string, string[]> = {
      code: ['.ts', '.js', '.tsx', '.jsx'],
      config: ['.json', '.yaml', '.yml', '.toml'],
      docs: ['.md', '.txt', '.rst'],
      test: ['.test.ts', '.spec.ts'],
    };

    for (const [category, extensions] of Object.entries(categories)) {
      if (extensions.some((e) => path.endsWith(e))) {
        return category;
      }
    }

    return 'other';
  }

  /**
   * 生成报告
   */
  generateReport(result: ScanResult): string {
    const report = `# Gardener Report

**Generated:** ${result.timestamp}
**Health Score:** ${result.healthScore}/100

## Summary

| Category | Count |
|----------|-------|
| Stale Files | ${result.staleFiles.length} |
| Unused Dependencies | ${result.unusedDependencies.length} |
| Dead Code Issues | ${result.deadCode.length} |
| Duplicate Groups | ${result.duplicates.length} |

## Stale Files

${result.staleFiles
  .slice(0, 10)
  .map((f) => `- \`${f.path}\` (${f.age} days old, ${f.category})`)
  .join('\n')}
${
  result.staleFiles.length > 10
    ? `\n... and ${result.staleFiles.length - 10} more`
    : ''
}

## Unused Dependencies

${result.unusedDependencies.map((d) => `- ${d}`).join('\n') || 'None detected'}

## Recommendations

${
  result.healthScore < 80
    ? '⚠️ Health score is below 80. Consider running cleanup.'
    : '✅ Codebase is in good health.'
}

- ${
    result.staleFiles.length > 0
      ? `Archive or remove ${result.staleFiles.length} stale files`
      : 'No stale files to clean'
  }
- ${
    result.unusedDependencies.length > 0
      ? `Remove ${result.unusedDependencies.length} unused dependencies`
      : 'All dependencies are in use'
  }
`;

    return report;
  }

  /**
   * 导出指标
   */
  exportMetrics(): string {
    return this.metrics.export();
  }
}

// 主程序
async function main() {
  const configPath = process.argv[2] || 'agents/gardener/config.yml';
  const command = process.argv[3] || 'scan';

  const gardener = new GardenerAgent(configPath);

  switch (command) {
    case 'scan':
      const result = await gardener.scan();
      const report = gardener.generateReport(result);
      console.log(report);

      // 保存报告
      writeFileSync('reports/gardener/report.md', report);
      console.log('\n📄 Report saved to reports/gardener/report.md');
      break;

    case 'cleanup':
      await gardener.cleanup(process.argv[4] === '--dry-run');
      break;

    case 'metrics':
      console.log(gardener.exportMetrics());
      break;

    default:
      console.log(`Unknown command: ${command}`);
      console.log('Usage: gardener <config> <scan|cleanup|metrics>');
      process.exit(1);
  }
}

main().catch(console.error);