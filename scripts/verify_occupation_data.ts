/**
 * 验证职业数据的完整性和准确性
 */

import { OCCUPATION_DATA } from '../data/occupationData';

interface Stats {
  total: number;
  byCategory: Record<number, number>;
  byIndustry: Record<string, number>;
  byGroup: Record<string, number>;
  duplicateCodes: string[];
}

function verifyData(): Stats {
  const stats: Stats = {
    total: OCCUPATION_DATA.length,
    byCategory: {},
    byIndustry: {},
    byGroup: {},
    duplicateCodes: [],
  };

  const seenCodes = new Set<string>();

  for (const occ of OCCUPATION_DATA) {
    // 检查重复代码
    if (seenCodes.has(occ.code)) {
      stats.duplicateCodes.push(occ.code);
    }
    seenCodes.add(occ.code);

    // 统计分类
    stats.byCategory[occ.category] = (stats.byCategory[occ.category] || 0) + 1;

    // 统计行业
    stats.byIndustry[occ.industry] = (stats.byIndustry[occ.industry] || 0) + 1;

    // 统计职业类别
    stats.byGroup[occ.group] = (stats.byGroup[occ.group] || 0) + 1;

    // 验证数据完整性
    if (!occ.code || !occ.name || !occ.industry || occ.category === undefined) {
      console.error(`❌ 数据不完整: ${JSON.stringify(occ)}`);
    }
  }

  return stats;
}

function main() {
  console.log('🔍 正在验证职业数据...\n');

  const stats = verifyData();

  console.log(`✓ 总记录数: ${stats.total}`);
  console.log('\n📊 按风险分类统计:');
  Object.keys(stats.byCategory)
    .sort()
    .forEach(cat => {
      const label =
        cat === '0'
          ? '拒保'
          : `${cat}类`;
      console.log(`  ${label}: ${stats.byCategory[parseInt(cat)]}`);
    });

  console.log('\n🏢 行业分布 (前10):');
  Object.entries(stats.byIndustry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([industry, count]) => {
      console.log(`  ${industry}: ${count}`);
    });

  console.log('\n📂 职业类别分布 (前10):');
  Object.entries(stats.byGroup)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([group, count]) => {
      console.log(`  ${group}: ${count}`);
    });

  if (stats.duplicateCodes.length > 0) {
    console.log(`\n⚠️  发现 ${stats.duplicateCodes.length} 个重复代码:`);
    stats.duplicateCodes.forEach(code => {
      console.log(`  - ${code}`);
    });
  } else {
    console.log('\n✓ 没有发现重复代码');
  }

  // 测试搜索功能
  console.log('\n🔎 测试搜索功能:');
  const testQueries = ['司机', '工人', '经理', '医生', '教师'];
  testQueries.forEach(query => {
    const matches = OCCUPATION_DATA.filter(o =>
      o.name.includes(query) || o.code.includes(query)
    );
    console.log(`  "${query}": 找到 ${matches.length} 条记录`);
  });

  console.log('\n✅ 验证完成!');
}

main();
