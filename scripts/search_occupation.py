#!/usr/bin/env python3
"""
快速搜索职业数据
用法: python3 scripts/search_occupation.py "搜索关键词"
"""

import sys
import re

def load_occupation_data():
    """从 TypeScript 文件加载职业数据"""
    occupations = []
    
    with open('data/occupationData.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 使用正则表达式提取职业数据
    pattern = r'\{\s*industry:\s*"([^"]+)",\s*group:\s*"([^"]+)",\s*code:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*category:\s*(\d+)\s*\}'
    
    for match in re.finditer(pattern, content):
        industry, group, code, name, category = match.groups()
        occupations.append({
            'industry': industry,
            'group': group,
            'code': code,
            'name': name,
            'category': int(category)
        })
    
    return occupations

def format_category(cat):
    """格式化分类"""
    if cat == 0:
        return '拒保'
    else:
        return f'{cat}类'

def search(keyword, occupations):
    """搜索职业"""
    results = []
    
    keyword_lower = keyword.lower()
    
    for occ in occupations:
        if (keyword_lower in occ['name'].lower() or 
            keyword_lower in occ['code'].lower() or
            keyword_lower in occ['industry'].lower() or
            keyword_lower in occ['group'].lower()):
            results.append(occ)
    
    return results

def main():
    if len(sys.argv) < 2:
        print("用法: python3 scripts/search_occupation.py \"搜索关键词\"")
        print("示例: python3 scripts/search_occupation.py \"司机\"")
        sys.exit(1)
    
    keyword = sys.argv[1]
    
    print(f"🔍 正在搜索: \"{keyword}\"\n")
    
    occupations = load_occupation_data()
    results = search(keyword, occupations)
    
    if not results:
        print(f"❌ 未找到匹配的职业")
        sys.exit(1)
    
    print(f"✓ 找到 {len(results)} 条记录\n")
    
    # 按分类分组显示
    by_category = {}
    for occ in results:
        cat = occ['category']
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(occ)
    
    for cat in sorted(by_category.keys()):
        print(f"【{format_category(cat)}】")
        for occ in by_category[cat]:
            print(f"  {occ['code']} | {occ['name']}")
            print(f"    行业: {occ['industry']} / {occ['group']}")
        print()

if __name__ == '__main__':
    main()
