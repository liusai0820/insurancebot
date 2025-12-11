#!/bin/bash

# RAG 职业匹配测试脚本
# 使用方法: 先启动服务 npm run dev, 然后运行 ./scripts/test_matching.sh

API_URL="http://localhost:3000/api/classify-occupation"

echo "🚀 RAG 职业匹配测试"
echo "========================================"

test_query() {
  local query="$1"
  local expected="$2"
  
  echo ""
  echo "🔍 测试: \"$query\" (期望: $expected)"
  echo "----------------------------------------"
  
  response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$query\"}")
  
  # 提取结果
  echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    results = data.get('results', [])
    ai_decision = data.get('aiDecision', {})
    
    if ai_decision:
        print(f\"  AI置信度: {ai_decision.get('confidence', 'N/A')}%\")
        print(f\"  AI理由: {ai_decision.get('reasoning', 'N/A')}\")
    
    print(f\"  匹配结果 ({len(results)}个):\")
    for i, r in enumerate(results[:3]):
        risk = '拒保' if r['category'] == 0 else f\"{r['category']}类\"
        score = r.get('confidenceScore', 0) * 100
        print(f\"    {i+1}. [{r['code']}] {r['standardName']}\")
        print(f\"       {r['industry']} | 风险:{risk} | 分数:{score:.0f}%\")
except Exception as e:
    print(f'解析错误: {e}')
    print(sys.stdin.read())
"
}

# 测试用例
test_query "叉车" "堆高机司机"
test_query "开叉车的" "堆高机司机"
test_query "村委会" "村委会人员"
test_query "村里帮忙处理文件的" "村委会人员"
test_query "工地焊工" "建筑焊工"
test_query "快递员" "快递人员"
test_query "送外卖的" "配送员"
test_query "货车司机" "货车司机"
test_query "建筑工人" "建筑工人"
test_query "电工" "电工"
test_query "厨师" "厨师"
test_query "保安" "保安人员"
test_query "挖掘机" "机械操作"
test_query "高空作业" "高空作业"

echo ""
echo "========================================"
echo "✅ 测试完成"
