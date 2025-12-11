#!/bin/bash

# 快速测试 API

echo "🧪 快速测试职业匹配 API"
echo "================================"
echo ""

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 2

# 测试用例
queries=("叉车" "会计" "快递")

for query in "${queries[@]}"; do
  echo "📝 查询: \"$query\""
  
  response=$(curl -s -X POST "http://localhost:3000/api/classify-occupation" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$query\"}")
  
  # 检查是否有结果
  if echo "$response" | grep -q "standardName"; then
    echo "✅ 成功"
    echo "$response" | jq '.[:1] | .[] | "  \(.standardName) (\(.code)) - \(.category)类"' 2>/dev/null || echo "  (结果已返回)"
  else
    echo "❌ 失败"
    echo "$response" | head -c 100
  fi
  echo ""
done

echo "================================"
echo "✅ 测试完成"
