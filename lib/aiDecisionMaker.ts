import { callOpenRouterAI } from './geminiClient';
import { OccupationDefinition } from '@/data/occupationData';
import { MatchResult, RetrievalResult } from './occupationMatcher';

/**
 * AI 决策结果
 */
export interface AIDecisionResult {
  selectedOccupation: OccupationDefinition | null;
  confidence: number; // 0-100
  reasoning: string;
  needMoreInfo: boolean;
  suggestedQuestions?: string[];
  alternativeMatches?: Array<{
    occupation: OccupationDefinition;
    reason: string;
  }>;
}

/**
 * 风险等级描述
 */
function getRiskDescription(category: number): string {
  const descriptions: Record<number, string> = {
    0: '拒保（高危职业）',
    1: '1类（低风险，如办公室工作）',
    2: '2类（较低风险）',
    3: '3类（中等风险）',
    4: '4类（较高风险）',
    5: '5类（高风险）',
    6: '6类（极高风险）',
  };
  return descriptions[category] || `${category}类`;
}

/**
 * 构建 AI 决策 Prompt
 * 这是 RAG 架构的核心 - 让 AI 做"开卷考试"
 */
function buildDecisionPrompt(
  userQuery: string,
  candidates: MatchResult[],
  queryAnalysis: RetrievalResult['queryAnalysis']
): string {
  // 构建候选列表
  const candidateList = candidates
    .slice(0, 8) // 最多给 AI 8 个候选
    .map((c, i) => {
      const occ = c.occupation;
      return `${i + 1}. [代码: ${occ.code}] ${occ.name}
   - 行业: ${occ.industry} > ${occ.group}
   - 风险等级: ${getRiskDescription(occ.category)}
   - 匹配原因: ${c.matchReason}`;
    })
    .join('\n\n');

  return `你是京东安联保险的资深核保专家，精通职业分类和风险评估。

## 任务
用户输入了一个职业描述，请从【候选职业列表】中选出最精准匹配的职业。

## 用户输入
"${userQuery}"

## 查询分析
- 提取的关键词: ${queryAnalysis.extractedKeywords.join(', ') || '无'}
- 扩展的同义词: ${queryAnalysis.expandedTerms.slice(0, 10).join(', ')}
- 可能的行业: ${queryAnalysis.possibleIndustries.join(', ') || '未识别'}
- 排除约束: ${queryAnalysis.negativeConstraints.join(', ') || '无'}

## 候选职业列表
${candidateList}

## 决策要求
1. **理解用户真实意图**：
   - "叉车" 通常指操作叉车的工人，不是办公人员
   - "村委会" 指村委会工作人员
   - 注意区分"参与作业"和"不参与作业"的区别

2. **选择最精准的匹配**：
   - 优先选择职业名称与用户描述最接近的
   - 考虑行业背景是否合理
   - 注意风险等级是否符合职业特点

3. **置信度评估**：
   - 90-100: 非常确定，用户描述与职业完全匹配
   - 70-89: 较为确定，但可能有细微差异
   - 50-69: 有一定把握，但需要确认
   - <50: 不确定，需要用户提供更多信息

4. **如果无法确定**：
   - 设置 needMoreInfo 为 true
   - 提供 1-2 个追问问题帮助澄清

## 输出格式（严格 JSON）
\`\`\`json
{
  "selectedCode": "选中的职业代码，如 F01031，如果无法确定则为 null",
  "confidence": 85,
  "reasoning": "选择理由的简要说明",
  "needMoreInfo": false,
  "suggestedQuestions": ["如果需要追问，在这里列出问题"],
  "alternativeCodes": ["备选职业代码1", "备选职业代码2"]
}
\`\`\`

请直接输出 JSON，不要有其他内容。`;
}

/**
 * 解析 AI 响应
 */
function parseAIResponse(
  responseText: string,
  candidates: MatchResult[]
): AIDecisionResult {
  try {
    // 提取 JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // 查找选中的职业
    let selectedOccupation: OccupationDefinition | null = null;
    if (parsed.selectedCode) {
      const found = candidates.find(c => c.occupation.code === parsed.selectedCode);
      if (found) {
        selectedOccupation = found.occupation;
      }
    }

    // 查找备选职业
    const alternativeMatches: AIDecisionResult['alternativeMatches'] = [];
    if (parsed.alternativeCodes && Array.isArray(parsed.alternativeCodes)) {
      for (const code of parsed.alternativeCodes) {
        const found = candidates.find(c => c.occupation.code === code);
        if (found && found.occupation.code !== parsed.selectedCode) {
          alternativeMatches.push({
            occupation: found.occupation,
            reason: found.matchReason,
          });
        }
      }
    }

    return {
      selectedOccupation,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 50,
      reasoning: parsed.reasoning || '无',
      needMoreInfo: parsed.needMoreInfo === true,
      suggestedQuestions: parsed.suggestedQuestions,
      alternativeMatches: alternativeMatches.length > 0 ? alternativeMatches : undefined,
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    
    // 降级：返回第一个候选
    if (candidates.length > 0) {
      return {
        selectedOccupation: candidates[0].occupation,
        confidence: 60,
        reasoning: 'AI 解析失败，返回最佳匹配候选',
        needMoreInfo: false,
      };
    }

    return {
      selectedOccupation: null,
      confidence: 0,
      reasoning: '无法解析 AI 响应',
      needMoreInfo: true,
      suggestedQuestions: ['请提供更详细的职业描述'],
    };
  }
}

/**
 * AI 精排决策
 * 这是 RAG 架构的"生成/决策"阶段
 */
export async function aiDecision(
  userQuery: string,
  retrievalResult: RetrievalResult
): Promise<AIDecisionResult> {
  const { candidates, queryAnalysis } = retrievalResult;

  // 如果没有候选，直接返回
  if (candidates.length === 0) {
    return {
      selectedOccupation: null,
      confidence: 0,
      reasoning: '未找到匹配的职业',
      needMoreInfo: true,
      suggestedQuestions: [
        '请提供更具体的职业名称或工作内容描述',
        '您从事的是哪个行业？',
      ],
    };
  }

  // 如果只有一个高分候选，直接返回
  if (candidates.length === 1 && candidates[0].score >= 90) {
    return {
      selectedOccupation: candidates[0].occupation,
      confidence: 95,
      reasoning: `精确匹配: ${candidates[0].matchReason}`,
      needMoreInfo: false,
    };
  }

  // 构建 prompt 并调用 AI
  const prompt = buildDecisionPrompt(userQuery, candidates, queryAnalysis);
  
  try {
    const responseText = await callOpenRouterAI(prompt);
    return parseAIResponse(responseText, candidates);
  } catch (error) {
    console.error('AI Decision Error:', error);
    
    // 降级：返回最高分候选
    return {
      selectedOccupation: candidates[0].occupation,
      confidence: Math.min(candidates[0].score, 70),
      reasoning: `AI 调用失败，返回最佳匹配: ${candidates[0].matchReason}`,
      needMoreInfo: candidates[0].score < 70,
    };
  }
}

/**
 * Few-Shot 示例增强版 AI 决策
 * 通过提供示例来提高 AI 的对齐精度
 */
export async function aiDecisionWithExamples(
  userQuery: string,
  retrievalResult: RetrievalResult
): Promise<AIDecisionResult> {
  const { candidates, queryAnalysis } = retrievalResult;

  if (candidates.length === 0) {
    return {
      selectedOccupation: null,
      confidence: 0,
      reasoning: '未找到匹配的职业',
      needMoreInfo: true,
      suggestedQuestions: ['请提供更具体的职业名称'],
    };
  }

  // Few-shot 示例
  const fewShotExamples = `
## 参考示例（Few-Shot）

### 示例1
用户输入: "开叉车的"
正确选择: F01031 - 堆高机司机（非航运）
理由: "叉车"在保险行业标准术语中对应"堆高机"，用户描述的是操作叉车的工人

### 示例2
用户输入: "村里帮忙处理文件的"
正确选择: A01006 - 村委会/居委会人员
理由: 用户描述的是村委会的行政工作，属于低风险办公类职业

### 示例3
用户输入: "工地上焊钢筋的"
正确选择: H05014 - 建筑焊工（室外/高空）
理由: 工地焊接属于室外高空作业，风险较高

### 示例4
用户输入: "送外卖的骑手"
正确选择: 应选择快递/配送相关职业
理由: 外卖骑手属于配送人员，需要注意交通风险
`;

  const basePrompt = buildDecisionPrompt(userQuery, candidates, queryAnalysis);
  const enhancedPrompt = basePrompt.replace('## 决策要求', fewShotExamples + '\n\n## 决策要求');

  try {
    const responseText = await callOpenRouterAI(enhancedPrompt);
    return parseAIResponse(responseText, candidates);
  } catch (error) {
    console.error('AI Decision Error:', error);
    return {
      selectedOccupation: candidates[0].occupation,
      confidence: Math.min(candidates[0].score, 70),
      reasoning: `AI 调用失败，返回最佳匹配`,
      needMoreInfo: candidates[0].score < 70,
    };
  }
}
