#!/bin/bash

# 测试 AI 职业匹配 API

BASE_URL="http://localhost:3000/api/classify-occupation"

echo "🧪 测试 AI 职业匹配 API"
echo "================================"

# 测试用例
test_cases=(
  "叉车"
  "会计"
  "快递"
  "司机"
  "医生"
  "教师"
  "保安"
  "清洁工"
  "外卖"
  "工人"
)

for query in "${test_cases[@]}"; do
  echo ""
  echo "📝 查询: \"$query\""
  echo "---"
  
  response=$(curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$query\"}")
  
  # 检查响应
  if echo "$response" | grep -q "standardName"; then
    count=$(echo "$response" | grep -o "standardName" | wc -l)
    echo "✅ 找到 $count 条匹配结果"
    
    # 显示前两个结果
    echo "$response" | jq '.[:2] | .[] | "\(.standardName) (\(.code)) - \(.category)类"' 2>/dev/null || echo "$response" | head -c 200
  else
    echo "❌ 未找到匹配结果"
    echo "$response" | head -c 200
  fi
done

echo ""
echo "================================"
echo "✅ 测试完成"
