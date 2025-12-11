#!/usr/bin/env python3
"""
解析京东安联职业分类表 markdown 文件，生成 TypeScript 数据结构
"""

import re
import sys

def parse_markdown_table(file_path):
    """解析 markdown 表格"""
    occupations = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # 跳过表头和分隔符
    in_table = False
    for line in lines:
        line = line.strip()
        
        # 检测表格开始
        if line.startswith('|') and '行业名称' in line:
            in_table = True
            continue
        
        # 检测分隔符行
        if line.startswith('|') and ':' in line and '-' in line:
            continue
        
        # 解析数据行
        if in_table and line.startswith('|'):
            parts = [p.strip() for p in line.split('|')]
            # 过滤空部分
            parts = [p for p in parts if p]
            
            if len(parts) >= 5:
                industry = parts[0]
                group = parts[1]
                code = parts[2]
                name = parts[3]
                category_str = parts[4]
                
                # 转换分类
                if '拒保' in category_str:
                    category = 0
                else:
                    try:
                        category = int(category_str)
                    except ValueError:
                        continue
                
                occupations.append({
                    'industry': industry,
                    'group': group,
                    'code': code,
                    'name': name,
                    'category': category
                })
    
    return occupations

def generate_typescript(occupations):
    """生成 TypeScript 代码"""
    
    ts_code = '''import { RiskCategory } from '@/types';

export interface OccupationDefinition {
  industry: string;
  group: string;
  code: string;
  name: string;
  category: RiskCategory;
}

export const OCCUPATION_DATA: OccupationDefinition[] = [
'''
    
    for occ in occupations:
        category_value = occ['category']
        ts_code += f'''  {{ industry: "{occ['industry']}", group: "{occ['group']}", code: "{occ['code']}", name: "{occ['name']}", category: {category_value} }},
'''
    
    ts_code += '''];

export const getFullOccupationText = () => {
  return OCCUPATION_DATA.map(o => `${o.code} | ${o.name} | ${o.industry} | ${o.category === 0 ? '拒保' : o.category + '类'}`).join('\\n');
};
'''
    
    return ts_code

def main():
    input_file = '京东安联职业分类表.md'
    output_file = 'data/occupationData.ts'
    
    print(f"正在解析 {input_file}...")
    occupations = parse_markdown_table(input_file)
    
    print(f"找到 {len(occupations)} 条职业记录")
    
    if occupations:
        ts_code = generate_typescript(occupations)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(ts_code)
        
        print(f"✓ 已生成 {output_file}")
        print(f"  - 总记录数: {len(occupations)}")
        print(f"  - 1类: {sum(1 for o in occupations if o['category'] == 1)}")
        print(f"  - 2类: {sum(1 for o in occupations if o['category'] == 2)}")
        print(f"  - 3类: {sum(1 for o in occupations if o['category'] == 3)}")
        print(f"  - 4类: {sum(1 for o in occupations if o['category'] == 4)}")
        print(f"  - 5类: {sum(1 for o in occupations if o['category'] == 5)}")
        print(f"  - 6类: {sum(1 for o in occupations if o['category'] == 6)}")
        print(f"  - 拒保: {sum(1 for o in occupations if o['category'] == 0)}")
    else:
        print("✗ 未找到任何职业记录")
        sys.exit(1)

if __name__ == '__main__':
    main()
