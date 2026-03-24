/**
 * 冲突解决领域模型
 *
 * 处理多专家意见冲突的检测、分析和解决
 */

/**
 * 专家意见
 */
export interface ExpertOpinion {
  expertId: string;
  expertName: string;
  category: string;
  content: string;
  confidence: number;
  pros?: string[];
  cons?: string[];
}

/**
 * 冲突严重程度
 */
export type ConflictSeverity = '严重' | '警告' | '建议';

/**
 * 冲突状态
 */
export type ConflictStatus = 'pending' | 'resolved' | 'dismissed';

/**
 * 冲突
 */
export interface Conflict {
  id: string;
  type: string;
  severity: ConflictSeverity;
  category: string;
  participants: ExpertOpinion[];
  summary: string;
  recommendation?: string;
  status: ConflictStatus;
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: {
    chosenExpertId: string;
    reason: string;
  };
}

/**
 * 意见对比结果
 */
export interface ComparisonResult {
  hasConflict: boolean;
  similarity: number;
  divergencePoints: string[];
  commonPoints: string[];
}

/**
 * 检测专家意见中的冲突
 */
export function detectConflicts(opinions: ExpertOpinion[]): Conflict[] {
  const conflicts: Conflict[] = [];

  if (opinions.length < 2) return conflicts;

  // 按领域分组
  const categoryGroups = groupByCategory(opinions);

  // 在每个领域内检测冲突
  for (const [category, categoryOpinions] of Object.entries(categoryGroups)) {
    if (!categoryOpinions || categoryOpinions.length < 2) continue;

    // 两两比较检测冲突
    for (let i = 0; i < categoryOpinions.length; i++) {
      for (let j = i + 1; j < categoryOpinions.length; j++) {
        const opinion1 = categoryOpinions[i];
        const opinion2 = categoryOpinions[j];
        if (!opinion1 || !opinion2) continue;

        const comparison = compareExpertOpinions(opinion1, opinion2);

        if (comparison.hasConflict) {
          const conflict = createConflict(
            opinion1,
            opinion2,
            comparison,
            category
          );
          conflicts.push(conflict);
        }
      }
    }
  }

  return conflicts;
}

/**
 * 按领域分组
 */
function groupByCategory(opinions: ExpertOpinion[]): Record<string, ExpertOpinion[]> {
  return opinions.reduce((groups, opinion) => {
    const category = opinion.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(opinion);
    return groups;
  }, {} as Record<string, ExpertOpinion[]>);
}

/**
 * 创建冲突对象
 */
function createConflict(
  opinion1: ExpertOpinion,
  opinion2: ExpertOpinion,
  comparison: ComparisonResult,
  category: string
): Conflict {
  const avgConfidence = (opinion1.confidence + opinion2.confidence) / 2;
  const severity = analyzeConflictSeverity(category, avgConfidence, comparison.similarity);

  return {
    id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: `${category}分歧`,
    severity,
    category,
    participants: [opinion1, opinion2],
    summary: generateSummary(opinion1, opinion2, comparison),
    recommendation: generateRecommendation(opinion1, opinion2, severity),
    status: 'pending',
    detectedAt: new Date(),
  };
}

/**
 * 分析冲突严重程度
 */
export function analyzeConflictSeverity(
  category: string,
  confidence: number,
  similarity: number
): ConflictSeverity {
  // 架构和安全冲突通常是严重的
  const criticalCategories = ['架构', '安全', '数据库'];
  const isCriticalCategory = criticalCategories.includes(category);

  // 高置信度 + 低相似度 = 严重冲突
  if (isCriticalCategory && confidence > 0.7 && similarity < 0.5) {
    return '严重';
  }

  // 对于架构/安全，即使相似度稍高，只要有明显分歧也是警告
  if (isCriticalCategory && confidence > 0.7) {
    return '严重';
  }

  // 中等置信度或中等相似度 = 警告
  if (confidence > 0.5 && similarity < 0.7) {
    return '警告';
  }

  return '建议';
}

/**
 * 比较两个专家意见
 */
export function compareExpertOpinions(
  opinion1: ExpertOpinion,
  opinion2: ExpertOpinion
): ComparisonResult {
  const text1 = opinion1.content.toLowerCase();
  const text2 = opinion2.content.toLowerCase();

  // 提取关键词
  const keywords1 = extractKeywords(text1);
  const keywords2 = extractKeywords(text2);

  // 计算相似度
  const similarity = calculateSimilarity(keywords1, keywords2);

  // 检测语义相反
  const hasOpposite = detectOppositeMeaning(text1, text2);

  // 查找分歧点 - 从关键词中提取
  const divergencePoints = findDivergencePoints(keywords1, keywords2);

  // 查找共同点
  const commonPoints = findCommonPoints(keywords1, keywords2);

  // 对于相似度很高的观点，不算冲突
  if (similarity >= 0.7 && !hasOpposite) {
    return {
      hasConflict: false,
      similarity,
      divergencePoints,
      commonPoints,
    };
  }

  return {
    hasConflict: hasOpposite || (similarity < 0.5 && divergencePoints.length > 0),
    similarity,
    divergencePoints,
    commonPoints,
  };
}

/**
 * 提取关键词
 */
function extractKeywords(text: string): string[] {
  // 提取名词和技术术语
  const words = text.split(/[\s,.!?;:，。！？；：]/);
  const stopWords = new Set([
    '是', '的', '了', '在', '有', '和', 'the', 'is', 'a', 'an', 'and', 'or', 'but',
    '建议', '使用', '推荐', '采用', '进行', '应该', '不应该'
  ]);

  const keywords = words
    .filter((word) => word.length >= 2)
    .filter((word) => !stopWords.has(word))
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 0);

  // 提取技术术语（如"微服务", "OAuth2"等）
  const techTerms = extractTechTerms(text);

  return [...new Set([...keywords, ...techTerms])];
}

/**
 * 提取技术术语
 */
function extractTechTerms(text: string): string[] {
  const lowerText = text.toLowerCase();
  // 常见的技术术语模式
  const techTerms = [
    '微服务', 'oauth2', 'oauth', 'jwt', 'restful', 'api',
    '单体', '架构', '认证', '身份验证', '授权'
  ];

  return techTerms.filter(term => lowerText.includes(term.toLowerCase()));
}

/**
 * 计算相似度 - 考虑同义词
 */
function calculateSimilarity(keywords1: string[], keywords2: string[]): number {
  const normalized1 = keywords1.map(k => normalizeKeyword(k));
  const normalized2 = keywords2.map(k => normalizeKeyword(k));

  const set1 = new Set(normalized1);
  const set2 = new Set(normalized2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 1;

  return intersection.size / union.size;
}

/**
 * 关键词归一化 - 处理同义词
 */
function normalizeKeyword(keyword: string): string {
  const synonyms: Record<string, string> = {
    '认证': 'auth',
    '身份验证': 'auth',
    'authorization': 'auth',
    'oauth2': 'oauth',
    'oauth': 'oauth',
  };

  return synonyms[keyword.toLowerCase()] || keyword.toLowerCase();
}

/**
 * 检测相反语义
 */
function detectOppositeMeaning(text1: string, text2: string): boolean {
  const oppositePairs: [string, string][] = [
    ['应该', '不应该'],
    ['建议', '不建议'],
    ['使用', '避免使用'],
    ['推荐', '不推荐'],
    ['需要', '不需要'],
    ['应该', '不必'],
    ['should', 'should not'],
    ['recommend', 'not recommend'],
    ['use', 'avoid'],
    ['need', 'no need'],
  ];

  for (const [word1, word2] of oppositePairs) {
    if ((text1.includes(word1) && text2.includes(word2)) ||
        (text1.includes(word2) && text2.includes(word1))) {
      return true;
    }
  }

  return false;
}

/**
 * 查找分歧点
 */
function findDivergencePoints(keywords1: string[], keywords2: string[]): string[] {
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);

  const onlyIn1 = [...set1].filter((x) => !set2.has(x));
  const onlyIn2 = [...set2].filter((x) => !set1.has(x));

  return [...onlyIn1.slice(0, 3), ...onlyIn2.slice(0, 3)];
}

/**
 * 查找共同点
 */
function findCommonPoints(keywords1: string[], keywords2: string[]): string[] {
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);

  return [...set1].filter((x) => set2.has(x)).slice(0, 5);
}

/**
 * 生成冲突摘要
 */
function generateSummary(
  opinion1: ExpertOpinion,
  opinion2: ExpertOpinion,
  comparison: ComparisonResult
): string {
  const keyPoint = comparison.divergencePoints[0] || '核心观点';
  return `${opinion1.expertName}与${opinion2.expertName}在${keyPoint}上存在分歧`;
}

/**
 * 生成决策建议
 */
function generateRecommendation(
  opinion1: ExpertOpinion,
  opinion2: ExpertOpinion,
  severity: ConflictSeverity
): string {
  if (severity === '严重') {
    return '建议综合考虑双方观点，根据项目实际情况权衡利弊后决策';
  } else if (severity === '警告') {
    return '建议优先参考置信度更高的方案，同时兼顾另一方建议';
  }
  return '建议采用更简洁的方案，非核心问题不必过度纠结';
}

/**
 * 解决冲突
 */
export function resolveConflict(
  conflict: Conflict,
  chosenExpertId: string,
  reason: string
): Conflict {
  return {
    ...conflict,
    status: 'resolved',
    resolvedAt: new Date(),
    resolution: {
      chosenExpertId,
      reason,
    },
  };
}

/**
 * 忽略冲突
 */
export function dismissConflict(conflict: Conflict): Conflict {
  return {
    ...conflict,
    status: 'dismissed',
    resolvedAt: new Date(),
  };
}
