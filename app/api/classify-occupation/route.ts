import { NextRequest, NextResponse } from 'next/server';
import { smartRetrieval, simpleMatch } from '@/lib/occupationMatcher';
import { aiDecisionWithExamples } from '@/lib/aiDecisionMaker';
import { OccupationResult } from '@/types';

/**
 * 职业分类 API - RAG 架构实现
 * 
 * 流程：
 * 1. 智能检索（Retrieval）：多维度召回候选职业
 * 2. AI 精排（Generation）：让 AI 从候选中做最终决策
 * 3. 置信度评估：低置信度时提示需要补充信息
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query?.trim();
    const useAI = body.useAI !== false; // 默认使用 AI

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: '请输入职业描述' },
        { status: 400 }
      );
    }

    console.log(`\n========== 职业分类请求 ==========`);
    console.log(`[Query] "${query}"`);

    // Step 1: 智能检索 - 召回候选职业
    const retrievalResult = smartRetrieval(query, 10);
    
    console.log(`[Retrieval] 分析结果:`);
    console.log(`  - 关键词: ${retrievalResult.queryAnalysis.extractedKeywords.join(', ')}`);
    console.log(`  - 扩展词: ${retrievalResult.queryAnalysis.expandedTerms.slice(0, 5).join(', ')}...`);
    console.log(`  - 行业: ${retrievalResult.queryAnalysis.possibleIndustries.join(', ') || '未识别'}`);
    console.log(`  - 候选数: ${retrievalResult.candidates.length}`);

    // 如果没有候选，返回空结果
    if (retrievalResult.candidates.length === 0) {
      console.log(`[Result] 未找到匹配`);
      return NextResponse.json({
        results: [],
        message: '未找到匹配的职业，请尝试更具体的描述',
        queryAnalysis: retrievalResult.queryAnalysis,
      });
    }

    // 检查是否有 AI 能力
    const hasAI = !!process.env.OPENROUTER_API_KEY && useAI;

    if (hasAI) {
      // Step 2: AI 精排决策
      console.log(`[AI] 开始精排决策...`);
      
      try {
        const aiResult = await aiDecisionWithExamples(query, retrievalResult);
        
        console.log(`[AI] 决策结果:`);
        console.log(`  - 选中: ${aiResult.selectedOccupation?.code || 'null'} - ${aiResult.selectedOccupation?.name || '无'}`);
        console.log(`  - 置信度: ${aiResult.confidence}%`);
        console.log(`  - 理由: ${aiResult.reasoning}`);
        console.log(`  - 需要更多信息: ${aiResult.needMoreInfo}`);

        // 构建返回结果
        const results: OccupationResult[] = [];

        // 添加 AI 选中的职业（如果有）
        if (aiResult.selectedOccupation) {
          results.push({
            code: aiResult.selectedOccupation.code,
            industry: aiResult.selectedOccupation.industry,
            standardName: aiResult.selectedOccupation.name,
            category: aiResult.selectedOccupation.category,
            description: `AI推荐 (${aiResult.confidence}%): ${aiResult.reasoning}`,
            confidenceScore: aiResult.confidence / 100,
          });
        }

        // 添加备选职业
        if (aiResult.alternativeMatches) {
          for (const alt of aiResult.alternativeMatches.slice(0, 2)) {
            results.push({
              code: alt.occupation.code,
              industry: alt.occupation.industry,
              standardName: alt.occupation.name,
              category: alt.occupation.category,
              description: `备选: ${alt.reason}`,
              confidenceScore: 0.6,
            });
          }
        }

        // 如果 AI 没有选中，添加检索结果
        if (results.length === 0) {
          for (const candidate of retrievalResult.candidates.slice(0, 5)) {
            results.push({
              code: candidate.occupation.code,
              industry: candidate.occupation.industry,
              standardName: candidate.occupation.name,
              category: candidate.occupation.category,
              description: `检索匹配: ${candidate.matchReason}`,
              confidenceScore: candidate.score / 100,
            });
          }
        }

        // 补充更多候选（如果结果太少）
        if (results.length < 3) {
          const existingCodes = new Set(results.map(r => r.code));
          for (const candidate of retrievalResult.candidates) {
            if (!existingCodes.has(candidate.occupation.code)) {
              results.push({
                code: candidate.occupation.code,
                industry: candidate.occupation.industry,
                standardName: candidate.occupation.name,
                category: candidate.occupation.category,
                description: `其他匹配: ${candidate.matchReason}`,
                confidenceScore: candidate.score / 100,
              });
              if (results.length >= 5) break;
            }
          }
        }

        return NextResponse.json({
          results,
          aiDecision: {
            confidence: aiResult.confidence,
            reasoning: aiResult.reasoning,
            needMoreInfo: aiResult.needMoreInfo,
            suggestedQuestions: aiResult.suggestedQuestions,
          },
          queryAnalysis: retrievalResult.queryAnalysis,
        });

      } catch (aiError: any) {
        console.warn(`[AI] 调用失败: ${aiError.message}`);
        // 继续使用本地检索结果
      }
    }

    // 降级方案：只使用检索结果
    console.log(`[Fallback] 使用本地检索结果`);
    
    const results: OccupationResult[] = retrievalResult.candidates
      .slice(0, 5)
      .map(candidate => ({
        code: candidate.occupation.code,
        industry: candidate.occupation.industry,
        standardName: candidate.occupation.name,
        category: candidate.occupation.category,
        description: `本地匹配: ${candidate.matchReason}`,
        confidenceScore: candidate.score / 100,
      }));

    return NextResponse.json({
      results,
      queryAnalysis: retrievalResult.queryAnalysis,
      message: hasAI ? 'AI 调用失败，使用本地匹配' : '本地匹配结果',
    });

  } catch (error: any) {
    console.error('[Error]', error);
    return NextResponse.json(
      { error: '分类失败', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET 方法 - 简单查询
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: '请提供查询参数 q' },
      { status: 400 }
    );
  }

  // 使用简单匹配
  const matches = simpleMatch(query, 5);
  
  return NextResponse.json({
    results: matches.map(m => ({
      code: m.occupation.code,
      industry: m.occupation.industry,
      standardName: m.occupation.name,
      category: m.occupation.category,
      description: m.matchReason,
      confidenceScore: m.score / 100,
    })),
  });
}
