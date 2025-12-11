import { OCCUPATION_DATA, OccupationDefinition } from '@/data/occupationData';

/**
 * 扩展的同义词/关联词映射表
 * 包含口语化表达、行业术语、常见别称
 */
const SYNONYM_MAP: Record<string, string[]> = {
  // 车辆操作类
  '叉车': ['堆高机', '堆高', '铲车', '叉车司机', '堆高机司机', '铲车司机', '仓库叉车'],
  '堆高机': ['叉车', '铲车', '堆高'],
  '铲车': ['叉车', '堆高机', '装载机'],
  '司机': ['驾驶员', '驾驶', '开车'],
  '货车': ['卡车', '货运', '运输车', '大车', '货车司机', '营运货车'],
  '大车': ['货车', '卡车', '重型车', '营运货车'],
  '货运': ['货车', '运输', '物流'],
  '挖掘机': ['挖机', '勾机', '挖土机', '施工机械'],
  '推土机': ['铲土机', '推机', '施工机械'],
  '吊车': ['起重机', '塔吊', '行车'],
  
  // 办公/行政类
  '会计': ['财务', '出纳', '账务', '内勤'],
  '内勤': ['文员', '行政', '办公室', '内勤人员'],
  '前台': ['接待', '迎宾'],
  '文员': ['内勤', '办公室人员', '行政人员'],
  '村委会': ['居委会', '村干部', '村官', '社区', '村里'],
  '居委会': ['村委会', '社区', '街道'],
  '村里': ['村委会', '居委会', '村干部'],
  '文件': ['文书', '行政', '办公', '内勤'],
  '处理文件': ['内勤', '行政', '办公'],
  
  // 建筑/工程类
  '工地': ['建筑工地', '施工现场', '工程', '建筑'],
  '建筑': ['工地', '施工', '土木', '建筑工程'],
  '建筑工人': ['工地工人', '施工人员', '建筑工'],
  '电工': ['电气工', '电力工人', '电气'],
  '焊工': ['电焊工', '焊接工', '氩弧焊', '焊接', '建筑焊工'],
  '焊接': ['焊工', '电焊', '焊'],
  '木工': ['木匠', '木作'],
  '泥工': ['泥瓦工', '瓦工', '砌墙'],
  '油漆工': ['喷漆工', '涂装工', '油漆'],
  '水电工': ['水暖工', '管道工'],
  '高空': ['高空作业', '登高', '架子工', '室外'],
  '装修': ['装潢', '装饰', '室内装修', '装璜'],
  
  // 服务类
  '快递': ['快递员', '送货', '配送', '收派', '收货', '送货员'],
  '外卖': ['送餐', '骑手', '配送员', '配送', '送货'],
  '送外卖': ['外卖', '骑手', '配送', '送餐'],
  '骑手': ['外卖', '配送', '送餐'],
  '配送': ['快递', '送货', '外卖', '收货'],
  '保安': ['安保', '保卫', '警卫', '门卫', '安全'],
  '清洁': ['保洁', '清扫', '卫生'],
  '保姆': ['家政', '月嫂', '护工'],
  
  // 医疗类
  '医生': ['医师', '大夫', '主治'],
  '护士': ['护理', '护工'],
  
  // 教育类
  '老师': ['教师', '教员', '讲师'],
  '教师': ['老师', '教员'],
  
  // 餐饮类
  '厨师': ['厨子', '炒菜', '后厨'],
  '服务员': ['服务生', '餐厅服务'],
  
  // 工厂/制造类
  '工人': ['工作人员', '操作员', '技工', '普工'],
  '操作工': ['操作员', '机台工', '生产工'],
  '质检': ['质检员', '品检', 'QC'],
  '仓库': ['仓管', '库管', '仓储'],
  '搬运': ['搬运工', '装卸', '装卸工'],
};

/**
 * 行业关键词映射 - 帮助识别用户描述的行业
 */
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  '一般行业': ['办公', '内勤', '文员', '行政', '机关', '公司', '企业', '村委会', '居委会', '村里'],
  '农牧业': ['农业', '农民', '种植', '养殖', '畜牧', '农场', '果园'],
  '渔业': ['渔业', '捕鱼', '养鱼', '水产', '渔船'],
  '林业': ['林业', '森林', '伐木', '护林', '造林'],
  '矿业': ['矿业', '采矿', '矿工', '煤矿', '矿山'],
  '交通运输业': ['运输', '物流', '司机', '驾驶', '快递', '货运', '客运', '铁路', '航空', '货车', '外卖', '配送', '骑手'],
  '餐旅业': ['餐饮', '酒店', '旅游', '厨师', '服务员', '导游'],
  '建筑工程业': ['建筑', '工地', '施工', '装修', '工程', '土木', '焊工', '电工', '木工', '泥工'],
  '生产制造业': ['工厂', '制造', '生产', '车间', '流水线', '加工'],
};

/**
 * 负面词识别 - 用于排除不相关的匹配
 */
const NEGATIVE_KEYWORDS = ['不', '非', '除了', '不是', '不做', '不参与', '不涉及'];

export interface MatchResult {
  occupation: OccupationDefinition;
  score: number;
  matchType: 'exact' | 'code' | 'synonym' | 'keyword' | 'industry' | 'fuzzy';
  matchReason: string;
}

export interface RetrievalResult {
  candidates: MatchResult[];
  queryAnalysis: {
    originalQuery: string;
    extractedKeywords: string[];
    expandedTerms: string[];
    possibleIndustries: string[];
    negativeConstraints: string[];
  };
}

/**
 * 口语化表达到标准词的映射
 */
const COLLOQUIAL_MAP: Record<string, string[]> = {
  '送': ['配送', '快递', '送货'],
  '做': ['从事', '工作'],
  '帮忙': ['工作', '人员'],
  '弄': ['处理', '工作'],
  '干': ['从事', '工作'],
};

/**
 * 关键词提取结果
 */
interface KeywordExtractionResult {
  keywords: string[];           // 原始关键词
  priorityKeywords: string[];   // 高优先级关键词（特殊处理识别的）
}

/**
 * 提取查询中的关键词
 */
function extractKeywords(query: string): KeywordExtractionResult {
  // 移除标点符号，分词
  const cleaned = query.replace(/[，。、！？：；""''（）\[\]【】的是在]/g, ' ');
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  
  // 提取有意义的词（长度>=2 或者是特定单字）
  const meaningfulWords = words.filter(w => 
    w.length >= 2 || ['工', '员', '师', '手'].includes(w)
  );
  
  // 处理口语化表达（这些是低优先级的扩展）
  const expanded = new Set<string>(meaningfulWords);
  for (const word of meaningfulWords) {
    for (const [colloquial, standards] of Object.entries(COLLOQUIAL_MAP)) {
      if (word.includes(colloquial)) {
        standards.forEach(s => expanded.add(s));
      }
    }
  }
  
  // 高优先级关键词（特殊处理识别的核心职业）
  const priorityKeywords: string[] = [];
  
  // 特殊处理：识别"村里"相关描述
  if (query.includes('村') || query.includes('村里') || query.includes('村委')) {
    priorityKeywords.push('村委会', '居委会');
    expanded.add('村委会');
    expanded.add('居委会');
  }
  
  // 特殊处理：识别"外卖"相关描述
  if (query.includes('外卖') || query.includes('送餐') || query.includes('骑手')) {
    priorityKeywords.push('快递', '配送', '送货');
    expanded.add('配送');
    expanded.add('快递');
    expanded.add('收货');
    expanded.add('送货');
  }
  
  // 特殊处理：识别"货车"相关描述
  if (query.includes('货车') || query.includes('卡车') || query.includes('大车')) {
    priorityKeywords.push('货车', '货运', '客货');
    expanded.add('货车');
    expanded.add('货运');
    expanded.add('营运');
    expanded.add('客货');
  }
  
  // 特殊处理：识别"开XX"的模式（开叉车、开挖机等）
  const drivePattern = query.match(/开(.{1,4})/);
  if (drivePattern) {
    const vehicle = drivePattern[1].replace(/的$/, '');
    expanded.add(vehicle);
    priorityKeywords.push(vehicle);
    // 如果是叉车，添加堆高机
    if (vehicle.includes('叉车')) {
      priorityKeywords.push('堆高机', '堆高');
      expanded.add('堆高机');
      expanded.add('堆高');
    }
  }
  
  return {
    keywords: [...expanded],
    priorityKeywords,
  };
}

/**
 * 扩展同义词
 */
function expandSynonyms(keywords: string[]): string[] {
  const expanded = new Set<string>(keywords);
  
  for (const keyword of keywords) {
    // 直接匹配
    if (SYNONYM_MAP[keyword]) {
      SYNONYM_MAP[keyword].forEach(syn => expanded.add(syn));
    }
    
    // 部分匹配（关键词包含在同义词key中，或反过来）
    for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
      if (keyword.includes(key) || key.includes(keyword)) {
        expanded.add(key);
        synonyms.forEach(syn => expanded.add(syn));
      }
    }
  }
  
  return [...expanded];
}

/**
 * 识别可能的行业
 */
function identifyIndustries(keywords: string[]): string[] {
  const industries: string[] = [];
  
  for (const [industry, industryKeywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (industryKeywords.some(ik => keyword.includes(ik) || ik.includes(keyword))) {
        industries.push(industry);
        break;
      }
    }
  }
  
  return industries;
}

/**
 * 提取负面约束
 */
function extractNegativeConstraints(query: string): string[] {
  const constraints: string[] = [];
  
  for (const neg of NEGATIVE_KEYWORDS) {
    const idx = query.indexOf(neg);
    if (idx !== -1) {
      // 提取负面词后面的内容
      const after = query.substring(idx + neg.length, idx + neg.length + 10);
      const match = after.match(/^[\u4e00-\u9fa5]+/);
      if (match) {
        constraints.push(match[0]);
      }
    }
  }
  
  return constraints;
}

/**
 * 计算字符串相似度（优化版 Levenshtein）
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;
  
  const len1 = str1.length;
  const len2 = str2.length;
  
  // 长度差异太大，直接返回低分
  if (Math.abs(len1 - len2) > Math.max(len1, len2) * 0.5) {
    return 0.3;
  }
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2[i - 1] === str1[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const distance = matrix[len2][len1];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

/**
 * 智能检索 - 多维度召回候选职业
 * 这是 RAG 架构的"检索"阶段
 */
export function smartRetrieval(query: string, limit: number = 10): RetrievalResult {
  const queryLower = query.toLowerCase().trim();
  const { keywords, priorityKeywords } = extractKeywords(query);
  const expandedTerms = expandSynonyms(keywords);
  const possibleIndustries = identifyIndustries(expandedTerms);
  const negativeConstraints = extractNegativeConstraints(query);
  
  const results: MatchResult[] = [];
  const seen = new Set<string>();
  
  // 辅助函数：添加结果（去重）
  const addResult = (occ: OccupationDefinition, score: number, matchType: MatchResult['matchType'], reason: string) => {
    if (seen.has(occ.code)) return;
    
    // 检查负面约束
    for (const constraint of negativeConstraints) {
      if (occ.name.includes(constraint)) {
        return; // 排除包含负面约束的职业
      }
    }
    
    seen.add(occ.code);
    results.push({ occupation: occ, score, matchType, matchReason: reason });
  };
  
  // 1. 精确匹配（代码或名称）
  for (const occ of OCCUPATION_DATA) {
    if (occ.code.toLowerCase() === queryLower) {
      addResult(occ, 100, 'exact', `代码精确匹配: ${occ.code}`);
    } else if (occ.name.toLowerCase() === queryLower) {
      addResult(occ, 100, 'exact', `名称精确匹配: ${occ.name}`);
    }
  }
  
  // 1.5 高优先级关键词匹配（特殊处理识别的核心职业）
  for (const term of priorityKeywords) {
    if (term.length < 2) continue;
    
    for (const occ of OCCUPATION_DATA) {
      if (occ.name.includes(term)) {
        addResult(occ, 90, 'keyword', `核心关键词匹配: "${term}" in "${occ.name}"`);
      }
    }
  }
  
  // 2. 关键词匹配（名称包含关键词）
  for (const term of expandedTerms) {
    if (term.length < 2) continue;
    
    for (const occ of OCCUPATION_DATA) {
      // 检查名称、行业、组别是否包含关键词
      const nameMatch = occ.name.includes(term);
      const groupMatch = occ.group.includes(term);
      
      if (nameMatch || groupMatch) {
        const isPriorityKeyword = priorityKeywords.includes(term);
        const isOriginalKeyword = keywords.includes(term);
        
        // 高优先级关键词已经在上面处理过了
        if (isPriorityKeyword && nameMatch) continue;
        
        const score = nameMatch 
          ? (isOriginalKeyword ? 85 : 75)
          : (isOriginalKeyword ? 70 : 60);
        const type = isOriginalKeyword ? 'keyword' : 'synonym';
        const matchLocation = nameMatch ? '名称' : '组别';
        addResult(occ, score, type, `${isOriginalKeyword ? '关键词' : '同义词'}匹配: "${term}" in ${matchLocation}`);
      }
    }
  }
  
  // 2.5 特殊职业直接匹配（处理常见但容易遗漏的职业）
  const specialMatches: Record<string, string[]> = {
    '焊工': ['焊工', '焊接', '电焊'],
    '货车': ['客货', '货运', '运输'],
    '建筑工': ['建筑', '施工', '工地'],
  };
  
  for (const [key, searchTerms] of Object.entries(specialMatches)) {
    if (expandedTerms.some(t => t.includes(key) || key.includes(t))) {
      for (const occ of OCCUPATION_DATA) {
        if (searchTerms.some(st => occ.name.includes(st))) {
          addResult(occ, 80, 'keyword', `特殊匹配: "${key}" → "${occ.name}"`);
        }
      }
    }
  }
  
  // 3. 行业+组别匹配
  if (possibleIndustries.length > 0) {
    for (const occ of OCCUPATION_DATA) {
      if (possibleIndustries.includes(occ.industry)) {
        // 检查组别或名称是否包含任何关键词
        for (const term of expandedTerms) {
          if (occ.group.includes(term) || occ.name.includes(term)) {
            addResult(occ, 70, 'industry', `行业匹配: ${occ.industry} - ${occ.group}`);
            break;
          }
        }
      }
    }
  }
  
  // 4. 模糊相似度匹配
  for (const occ of OCCUPATION_DATA) {
    if (seen.has(occ.code)) continue;
    
    // 计算与原始查询的相似度
    const nameSimilarity = calculateSimilarity(queryLower, occ.name.toLowerCase());
    
    // 计算与关键词的最大相似度
    let maxKeywordSimilarity = 0;
    for (const keyword of keywords) {
      const sim = calculateSimilarity(keyword, occ.name.toLowerCase());
      maxKeywordSimilarity = Math.max(maxKeywordSimilarity, sim);
    }
    
    const bestSimilarity = Math.max(nameSimilarity, maxKeywordSimilarity);
    
    if (bestSimilarity > 0.5) {
      addResult(occ, bestSimilarity * 60, 'fuzzy', `相似度匹配: ${(bestSimilarity * 100).toFixed(0)}%`);
    }
  }
  
  // 按分数排序
  results.sort((a, b) => b.score - a.score);
  
  return {
    candidates: results.slice(0, limit),
    queryAnalysis: {
      originalQuery: query,
      extractedKeywords: keywords,
      expandedTerms,
      possibleIndustries,
      negativeConstraints,
    },
  };
}

/**
 * 简单匹配（用于本地降级）
 */
export function simpleMatch(query: string, limit: number = 5): MatchResult[] {
  const result = smartRetrieval(query, limit);
  return result.candidates;
}

/**
 * 获取匹配说明
 */
export function getMatchDescription(matchType: string): string {
  const descriptions: Record<string, string> = {
    exact: '精确匹配',
    code: '代码匹配',
    synonym: '同义词匹配',
    keyword: '关键词匹配',
    industry: '行业匹配',
    fuzzy: '相似度匹配',
  };
  return descriptions[matchType] || '数据库匹配';
}

// 保持向后兼容
export function matchOccupations(query: string, limit: number = 5): MatchResult[] {
  return simpleMatch(query, limit);
}
