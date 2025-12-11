# InsureMate Pro - Next.js 版本

企业团体意外险保费计算和建议书生成系统，已迁移至 Next.js 架构。

## 功能特性

- 🔍 **职业智能匹配**：基于 OpenRouter AI 的职业分类和风险定级
- 💰 **保费实时计算**：支持多职业、多人数的保费组合计算
- 📄 **建议书生成**：自动生成专业的投保建议书
- 🌐 **本地搜索**：1616 条职业数据本地快速搜索
- 🤖 **AI 增强**：支持 OpenRouter 多模型调用

## 环境配置

### 必需的环境变量

在 `.env.local` 文件中配置：

```env
# OpenRouter API Key
OPENROUTER_API_KEY=your_openrouter_api_key_here

# OpenRouter 模型（可选，默认: openai/gpt-4-turbo）
OPENROUTER_MODEL=google/gemini-2.5-flash

# Proxy 配置（可选）
HTTP_PROXY=http://localhost:58591
HTTPS_PROXY=http://localhost:58591
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式运行

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

### 3. 生产构建

```bash
npm run build
npm start
```

## 项目结构

```
.
├── app/
│   ├── api/
│   │   ├── classify-occupation/    # 职业分类 API
│   │   └── gemini-proxy/           # Gemini 代理 API
│   ├── components/                 # React 组件
│   ├── layout.tsx                  # 根布局
│   ├── page.tsx                    # 主页面
│   └── globals.css                 # 全局样式
├── lib/
│   └── geminiClient.ts             # Gemini 客户端配置
├── data/
│   └── occupationData.ts           # 职业数据库
├── constants.ts                    # 常量定义
├── types.ts                        # TypeScript 类型定义
└── package.json
```

## API 端点

### POST `/api/classify-occupation`

职业分类和风险定级

**请求体：**
```json
{
  "query": "叉车"
}
```

**响应：**
```json
[
  {
    "code": "F01031",
    "industry": "交通运输业",
    "standardName": "堆高机司机（非航运）",
    "category": 3,
    "description": "用户输入'叉车'匹配到标准职业'堆高机司机'",
    "confidenceScore": 0.95
  }
]
```

### POST `/api/gemini-proxy`

直接代理 Gemini API 请求（支持 proxy）

**请求体：** Gemini API 标准请求格式

**响应：** Gemini API 标准响应格式

## Proxy 支持

项目支持通过 HTTP/HTTPS proxy 调用 Gemini API。配置方式：

1. **环境变量配置**：
   ```env
   HTTP_PROXY=http://proxy-server:port
   HTTPS_PROXY=http://proxy-server:port
   ```

2. **自动应用**：
   - API 路由会自动检测环境变量
   - 所有 Gemini 请求都会通过配置的 proxy 转发

## 技术栈

- **框架**：Next.js 15
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **AI**：OpenRouter（支持多模型）
- **HTTP 客户端**：Axios
- **职业数据**：1616 条本地数据库

## 开发指南

### 添加新的 API 路由

在 `app/api/` 目录下创建新的路由文件：

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // 处理逻辑
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}
```

### 修改职业数据

编辑 `data/occupationData.ts` 中的 `OCCUPATION_DATA` 数组

### 调整费率表

编辑 `constants.ts` 中的 `RATE_TABLE` 对象

## 故障排除

### Gemini API 连接失败

1. 检查 `GEMINI_API_KEY` 是否正确配置
2. 如果使用 proxy，确保 proxy 地址和端口正确
3. 检查网络连接和防火墙设置

### 职业匹配结果不准确

- 尝试使用更具体的职业关键词
- 检查 `OCCUPATION_DATA` 中是否包含相关职业
- 调整 Gemini 提示词以改进匹配准确度

## 许可证

MIT
