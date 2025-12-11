/**
 * RAG 职业匹配测试脚本
 * 运行: npx ts-node scripts/test_rag_matching.ts
 */

import { smartRetrieval, RetrievalResult } from '../lib/occupationMatcher';

// 测试用例
const testCases = [
  { query: '叉车', expected: '堆高机' },
  { query: '开叉车的', expected: '堆高机' },
  { query: '村委会', expected: '村委会' },
  { query: '村里帮忙处理文件的', expected: '村委会' },
  { query: '工地焊工', expected: '焊工' },
  { query: '快递员', expected: '快递' },
  { query: '送外卖的', expected: '配送' },
  { query: '会计', expected: '内勤' },
  { query: '货车司机', expected: '司机' },
  { query: '建筑工人', expected: '建筑' },
  { query: '电工', expected: '电工' },
  { query: '厨师', expected: '厨师' },
  { query: '保安', expected: '保安' },
  { query: '挖掘机', expected: '机械操作' },
];

function printResult(result: RetrievalResult) {
  console.log('\n📊 查询分析:');
  console.log(`  关键词: ${result.queryAnalysis.extractedKeywords.join(', ')}`);
  console.log(`  扩展词: ${result.queryAnalysis.expandedTerms.slice(0, 8).join(', ')}`);
  console.log(`  行业: ${result.queryAnalysis.possibleIndustries.join(', ') || '未识别'}`);
  
  console.log('\n📋 候选结果:');
  result.candidates.slice(0, 5).forEach((c, i) => {
    const risk = c.occupation.category === 0 ? '❌拒保' : `${c.occupation.category}类`;
    console.log(`  ${i + 1}. [${c.occupation.code}] ${c.occupation.name}`);
    console.log(`     ${c.occupation.industry} > ${c.occupation.group}`);
    console.log(`     风险: ${risk} | 分数: ${c.score.toFixed(1)} | ${c.matchReason}`);
  });
}

function runTests() {
  console.log('🚀 RAG 职业匹配测试\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    console.log(`\n🔍 测试: "${tc.query}" (期望包含: ${tc.expected})`);
    console.log('-'.repeat(50));

    const result = smartRetrieval(tc.query, 5);
    
    // 检查是否有匹配
    const hasMatch = result.candidates.some(c => 
      c.occupation.name.includes(tc.expected) || 
      c.occupation.group.includes(tc.expected)
    );

    if (hasMatch) {
      console.log('✅ 通过');
      passed++;
    } else {
      console.log('❌ 失败 - 未找到期望的匹配');
      failed++;
    }

    printResult(result);
    console.log('='.repeat(60));
  }

  console.log(`\n📈 测试结果: ${passed}/${testCases.length} 通过, ${failed} 失败`);
}

// 运行测试
runTests();
